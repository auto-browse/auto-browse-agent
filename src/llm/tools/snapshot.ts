/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'path';
import os from 'os';

import { z } from 'zod';

import { sanitizeForFilePath } from './utils';
//import { generateLocator } from '../context';
import * as javascript from '../javascript';

import type { ScreenshotOptions } from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";
import { defineTool } from './tool';
import type { ImageContent } from '../context';

const snapshot = defineTool({
    capability: 'core',
    schema: {
        name: 'browser_snapshot',
        description: 'Capture accessibility snapshot of the current page, this is better than screenshot',
        inputSchema: z.object({}),
    },

    handle: async context => {
        const tab = await context.ensureTab();
        await tab.captureSnapshot();
        const snapshot = tab.snapshotOrDie();

        return {
            code: [`// Captured accessibility snapshot`],
            captureSnapshot: false,  // We already captured it
            waitForNetwork: false,
            resultOverride: {
                content: [{
                    type: 'text',
                    text: snapshot.text()
                }]
            }
        };
    },
});

const elementSchema = z.object({
    element: z.string().describe('Human-readable element description used to obtain permission to interact with the element'),
    ref: z.string().describe('Exact target element reference from the page snapshot'),
});

const click = defineTool({
    capability: 'core',
    schema: {
        name: 'browser_click',
        description: 'Perform click on a web page',
        inputSchema: elementSchema,
    },

    handle: async (context, params) => {
        const tab = context.currentTabOrDie();
        const locator = tab.snapshotOrDie().refLocator(params.ref);

        const code = [
            `// Click ${params.element}`
        ];

        return {
            code,
            action: async () => {
                const element = await locator;
                await element.click();
            },
            captureSnapshot: true,
            waitForNetwork: true,
        };
    },
});

const drag = defineTool({
    capability: 'core',
    schema: {
        name: 'browser_drag',
        description: 'Perform drag and drop between two elements',
        inputSchema: z.object({
            startElement: z.string().describe('Human-readable source element description used to obtain the permission to interact with the element'),
            startRef: z.string().describe('Exact source element reference from the page snapshot'),
            endElement: z.string().describe('Human-readable target element description used to obtain the permission to interact with the element'),
            endRef: z.string().describe('Exact target element reference from the page snapshot'),
        }),
    },

    handle: async (context, params) => {
        const snapshot = context.currentTabOrDie().snapshotOrDie();
        const startLocator = snapshot.refLocator(params.startRef);
        const endLocator = snapshot.refLocator(params.endRef);

        const code = [
            `// Drag ${params.startElement} to ${params.endElement}`
        ];

        return {
            code,
            action: async () => {
                const startElement = await startLocator;
                const endElement = await endLocator;
                // Use drag and drop simulation since Puppeteer doesn't have dragTo
                await startElement.evaluate((el, endEl) => {
                    const dragStart = new DragEvent('dragstart');
                    const drop = new DragEvent('drop');
                    el.dispatchEvent(dragStart);
                    endEl.dispatchEvent(drop);
                }, endElement);
            },
            captureSnapshot: true,
            waitForNetwork: true,
        };
    },
});

const hover = defineTool({
    capability: 'core',
    schema: {
        name: 'browser_hover',
        description: 'Hover over element on page',
        inputSchema: elementSchema,
    },

    handle: async (context, params) => {
        const snapshot = context.currentTabOrDie().snapshotOrDie();
        const locator = snapshot.refLocator(params.ref);

        const code = [
            `// Hover over ${params.element}`
        ];

        return {
            code,
            action: async () => {
                const element = await locator;
                await element.hover();
            },
            captureSnapshot: true,
            waitForNetwork: true,
        };
    },
});

const typeSchema = elementSchema.extend({
    text: z.string().describe('Text to type into the element'),
    submit: z.boolean().optional().describe('Whether to submit entered text (press Enter after)'),
    slowly: z.boolean().optional().describe('Whether to type one character at a time. Useful for triggering key handlers in the page. By default entire text is filled in at once.'),
});

const type = defineTool({
    capability: 'core',
    schema: {
        name: 'browser_type',
        description: 'Type text into editable element',
        inputSchema: typeSchema,
    },

    handle: async (context, params) => {
        const snapshot = context.currentTabOrDie().snapshotOrDie();
        const locator = snapshot.refLocator(params.ref);

        const code = [
            `// Type "${params.text}" into "${params.element}"`
        ];

        return {
            code,
            action: async () => {
                const element = await locator;
                if (params.slowly)
                {
                    await element.evaluate(el => (el as HTMLInputElement | HTMLTextAreaElement).value = '');
                    for (const char of params.text)
                    {
                        await element.type(char);
                        await new Promise(r => setTimeout(r, 100));
                    }
                } else
                {
                    await element.evaluate((el, text) => (el as HTMLInputElement | HTMLTextAreaElement).value = text, params.text);
                }

                if (params.submit)
                {
                    await element.press('Enter');
                }
            },
            captureSnapshot: true,
            waitForNetwork: true,
        };
    },
});

const selectOptionSchema = elementSchema.extend({
    values: z.array(z.string()).describe('Array of values to select in the dropdown. This can be a single value or multiple values.'),
});

const selectOption = defineTool({
    capability: 'core',
    schema: {
        name: 'browser_select_option',
        description: 'Select an option in a dropdown',
        inputSchema: selectOptionSchema,
    },

    handle: async (context, params) => {
        const snapshot = context.currentTabOrDie().snapshotOrDie();
        const locator = snapshot.refLocator(params.ref);

        const code = [
            `// Select options [${params.values.join(', ')}] in ${params.element}`
        ];

        return {
            code,
            action: async () => {
                const element = await locator;
                await element.evaluate((el, values) => {
                    const select = el as HTMLSelectElement;
                    if (select.tagName === 'SELECT')
                    {
                        Array.from(select.options).forEach(option => {
                            option.selected = values.includes(option.value);
                        });
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }, params.values);
            },
            captureSnapshot: true,
            waitForNetwork: true,
        };
    },
});

const screenshotSchema = z.object({
    raw: z.boolean().optional().describe('Whether to return without compression (in PNG format). Default is false, which returns a JPEG image.'),
    element: z.string().optional().describe('Human-readable element description used to obtain permission to screenshot the element. If not provided, the screenshot will be taken of viewport. If element is provided, ref must be provided too.'),
    ref: z.string().optional().describe('Exact target element reference from the page snapshot. If not provided, the screenshot will be taken of viewport. If ref is provided, element must be provided too.'),
}).refine(data => {
    return !!data.element === !!data.ref;
}, {
    message: 'Both element and ref must be provided or neither.',
    path: ['ref', 'element']
});

const screenshot = defineTool({
    capability: 'core',
    schema: {
        name: 'browser_take_screenshot',
        description: `Take a screenshot of the current page. You can't perform actions based on the screenshot, use browser_snapshot for actions.`,
        inputSchema: screenshotSchema,
    },

    handle: async (context, params) => {
        const tab = context.currentTabOrDie();
        const snapshot = tab.snapshotOrDie();
        const fileType = params.raw ? 'png' : 'jpeg';
        const fileName = path.join(os.tmpdir(), sanitizeForFilePath(`page-${new Date().toISOString()}`)) + `.${fileType}`;
        const options: ScreenshotOptions = { type: fileType, quality: fileType === 'png' ? undefined : 50, path: fileName };
        const isElementScreenshot = params.element && params.ref;

        const code = [
            `// Screenshot ${isElementScreenshot ? params.element : 'viewport'} and save it as ${fileName}`,
        ];

        const locator = params.ref ? snapshot.refLocator(params.ref) : null;

        if (locator)
            code.push(`// Take screenshot of element`);
        else
            code.push(`await page.screenshot(${javascript.formatObject(options)});`);

        const action = async () => {
            let screenshot;
            if (locator)
            {
                const element = await locator;
                // Convert element to clip parameters
                const box = await element.boundingBox();
                if (!box) throw new Error('Element not visible');

                screenshot = await tab.page.screenshot({
                    path: fileName,
                    type: fileType as 'jpeg' | 'png',
                    quality: fileType === 'png' ? undefined : 50,
                    clip: {
                        x: box.x,
                        y: box.y,
                        width: box.width,
                        height: box.height
                    }
                });
            } else
            {
                screenshot = await tab.page.screenshot({
                    path: fileName,
                    type: fileType as 'jpeg' | 'png',
                    quality: fileType === 'png' ? undefined : 50
                });
            }

            const content: ImageContent[] = [{
                type: 'image' as const,
                base64: Buffer.from(screenshot).toString('base64'),
                contentType: fileType === 'png' ? 'image/png' : 'image/jpeg'
            }];
            return { content };
        };

        return {
            code,
            action,
            captureSnapshot: true,
            waitForNetwork: false,
        };
    }
});


export default [
    snapshot,
    click,
    drag,
    hover,
    type,
    selectOption,
    screenshot,
];

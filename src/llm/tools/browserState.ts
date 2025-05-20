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

import { z } from 'zod';
import { defineTool } from './tool';

const browserState = defineTool({
    capability: 'core', // Assuming 'core' capability is appropriate
    schema: {
        name: 'browser_state',
        description: 'Returns the current page URL, title, and accessibility snapshot.',
        inputSchema: z.object({}), // No input required
    },

    handle: async context => {
        const tab = await context.ensureTab();

        // Capture snapshot first
        await tab.captureSnapshot();
        const snapshotData = tab.snapshotOrDie();
        const snapshotText = snapshotData.text();

        // Get URL and Title from the Puppeteer page object
        const currentUrl = tab.page.url();
        const pageTitle = await tab.page.title();

        // Prepare the result object
        const result = {
            url: currentUrl,
            title: pageTitle,
            snapshot: snapshotText, // Embed the snapshot text directly
        };

        // Return the combined state using resultOverride
        return {
            code: [`// Retrieved browser state (URL, Title, Snapshot)`],
            captureSnapshot: false, // Snapshot already captured
            waitForNetwork: false,
            resultOverride: {
                content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2) // Stringify the result object
                }]
            }
        };
    },
});

// Export the tool in an array, similar to snapshot.ts
export default [
    browserState,
];

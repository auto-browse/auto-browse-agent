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

import {
    type Frame,
    type Page,
    type HTTPRequest as Request
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";
import type { Context } from '../context';

export async function waitForCompletion<R>(context: Context, page: Page, callback: () => Promise<R>): Promise<R> {
    const requests = new Set<Request>();
    let frameNavigated = false;
    let waitCallback: () => void = () => { };
    const waitBarrier = new Promise<void>(f => { waitCallback = f; });

    const requestListener = (request: Request) => requests.add(request);
    const requestFinishedListener = (request: Request) => {
        requests.delete(request);
        if (!requests.size)
            waitCallback();
    };

    const frameNavigateListener = (frame: Frame) => {
        if (frame.parentFrame())
            return;
        frameNavigated = true;
        dispose();
        clearTimeout(timeout);
        void page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            waitCallback();
        });
    };

    const onTimeout = () => {
        dispose();
        waitCallback();
    };

    page.on('request', requestListener);
    page.on('requestfinished', requestFinishedListener);
    page.on('framenavigated', frameNavigateListener);
    const timeout = setTimeout(onTimeout, 10000);

    const dispose = () => {
        page.off('request', requestListener);
        page.off('requestfinished', requestFinishedListener);
        page.off('framenavigated', frameNavigateListener);
        clearTimeout(timeout);
    };

    try
    {
        const result = await callback();
        if (!requests.size && !frameNavigated)
            waitCallback();
        await waitBarrier;
        await context.waitForTimeout(1000);
        return result;
    } finally
    {
        dispose();
    }
}

export function sanitizeForFilePath(s: string) {
    return s.replace(/[\x00-\x2C\x2E-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]+/g, '-');
}

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

import { generateAriaTree, renderAriaTree } from './ariaSnapshot';
import { builtins } from './isomorphic/builtins';
import type { AriaNode } from './ariaSnapshot';

export type AriaSnapshot = {
    root: AriaNode;
    elements: Map<number, Element>;
    generation: number;
    ids: Map<Element, number>;
};

export class InjectedScript {
    readonly utils = {
        builtins: builtins(),
    };

    private _lastAriaSnapshot: AriaSnapshot | undefined;
    readonly window: Window & typeof globalThis;
    readonly document: Document;

    constructor(window: Window & typeof globalThis, isUnderTest: boolean) {
        this.window = window;
        this.document = window.document;
        this.utils.builtins = builtins(window);

        if (isUnderTest)
            (this.window as any).__injectedScript = this;
    }

    ariaSnapshot(node: Node, options?: { mode?: 'raw' | 'regex', ref?: boolean; }): string {
        if (node.nodeType !== Node.ELEMENT_NODE)
            throw this.createStacklessError('Can only capture aria snapshot of Element nodes.');
        const generation = (this._lastAriaSnapshot?.generation || 0) + 1;
        this._lastAriaSnapshot = generateAriaTree(node as Element, generation);
        return renderAriaTree(this._lastAriaSnapshot, options);
    }

    ariaSnapshotElement(snapshot: AriaSnapshot, elementId: number): Element | null {
        return snapshot.elements.get(elementId) || null;
    }

    private createStacklessError(message: string): Error {
        const error = new Error(message);
        delete error.stack;
        return error;
    }
}

// Top-level function to be exported and called directly in the page context
export function createAriaSnapshot(element: Element, options?: { mode?: 'raw' | 'regex', ref?: boolean; }): string {
    const injectedScript = new InjectedScript(window, false);
    return injectedScript.ariaSnapshot(element, options);
}

// Make available in the global scope when running in the browser
if (typeof window !== 'undefined')
{
    (window as any).InjectedScript = InjectedScript;
    (window as any).createAriaSnapshot = createAriaSnapshot;
}

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

    constructor(window: Window & typeof globalThis) { // Removed isUnderTest parameter
        this.window = window;
        this.document = window.document;
        this.utils.builtins = builtins(window);

        // Always attach the instance to the window for consistent access
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

    /**
     * Finds an element based on its aria ref identifier (s<generation>e<elementId>).
     * This method should be called within the browser context (e.g., using page.evaluate).
     * @param selector The aria ref selector string.
     * @returns The matching Element or null if not found or stale.
     */
    getElementByAriaRef(selector: string): Element | null {
        const match = selector.match(/^s(\d+)e(\d+)$/);
        if (!match)
        {
            console.error('Invalid aria-ref selector format. Expected s<number>e<number>, got:', selector);
            return null; // Or throw error, depending on desired behavior
        }

        const [, generationStr, elementIdStr] = match;
        const generation = parseInt(generationStr, 10);
        const elementId = parseInt(elementIdStr, 10);

        if (!this._lastAriaSnapshot)
        {
            console.error('No aria snapshot available to resolve ref:', selector);
            return null;
        }

        if (this._lastAriaSnapshot.generation !== generation)
        {
            console.warn(`Stale aria-ref: Snapshot generation is ${this._lastAriaSnapshot.generation}, but selector used generation ${generation}. Ref: ${selector}`);
            // Decide if stale refs should return null or throw
            return null;
        }

        const element = this._lastAriaSnapshot.elements?.get(elementId);

        if (!element)
        {
            console.warn(`Aria-ref element not found in snapshot: ${selector}`);
            return null;
        }

        if (!element.isConnected)
        {
            console.warn(`Aria-ref element is no longer connected to the DOM: ${selector}`);
            return null; // Element exists but is detached
        }

        return element;
    }
}

// Ensure a single instance is created or reused
function getOrCreateInjectedScript(): InjectedScript {
    if (!(window as any).__injectedScript)
    {
        new InjectedScript(window); // Constructor now attaches the instance to window.__injectedScript
    }
    return (window as any).__injectedScript;
}

// Top-level function to be exported and called directly in the page context
export function createAriaSnapshot(element: Element, options?: { mode?: 'raw' | 'regex', ref?: boolean; }): string {
    const injectedScript = getOrCreateInjectedScript(); // Use the shared instance
    return injectedScript.ariaSnapshot(element, options);
}

// Make available in the global scope when running in the browser
if (typeof window !== 'undefined')
{
    (window as any).InjectedScript = InjectedScript;
    (window as any).createAriaSnapshot = createAriaSnapshot;
}

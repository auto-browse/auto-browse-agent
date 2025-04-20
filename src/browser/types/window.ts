export { };

declare global {
    interface Window {
        /**
         * Creates an accessibility snapshot of the given element
         */
        createAriaSnapshot: (element: Element, options?: { mode?: 'raw' | 'regex', ref?: boolean; }) => string;

        /**
         * InjectedScript class constructor
         */
        InjectedScript: any;
    }
}

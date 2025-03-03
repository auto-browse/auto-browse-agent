export const domTraversalScript = `(() => {
    try {
        window.domCapture = {
            highlightIndex: 0,

            getXPath(element, stopAtBoundary = true) {
                const segments = [];
                let currentElement = element;

                while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
                    // Stop if we hit a shadow root or iframe
                    if (
                        stopAtBoundary &&
                        (currentElement.parentNode instanceof ShadowRoot ||
                            currentElement.parentNode instanceof HTMLIFrameElement)
                    ) {
                        break;
                    }

                    let index = 0;
                    let sibling = currentElement.previousSibling;
                    while (sibling) {
                        if (
                            sibling.nodeType === Node.ELEMENT_NODE &&
                            sibling.nodeName === currentElement.nodeName
                        ) {
                            index++;
                        }
                        sibling = sibling.previousSibling;
                    }

                    const tagName = currentElement.nodeName.toLowerCase();
                    const xpathIndex = index > 0 ? '[' + (index + 1) + ']' : '';
                    segments.unshift(tagName + xpathIndex);

                    currentElement = currentElement.parentNode;
                }

                return segments.join("/");
            },

            isElementVisible(element) {
                if (!element) return false;
                const style = window.getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                return (
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0' &&
                    rect.width > 0 &&
                    rect.height > 0
                );
            },

            isInteractive(element) {
                if (!element || element.nodeType !== Node.ELEMENT_NODE) {
                    return false;
                }

                // Special handling for cookie banner elements
                const isCookieBannerElement =
                    typeof element.closest === "function" &&
                    (element.closest('[id*="onetrust"]') ||
                        element.closest('[class*="onetrust"]') ||
                        element.closest('[data-nosnippet="true"]') ||
                        element.closest('[aria-label*="cookie"]'));

                if (isCookieBannerElement) {
                    // Check if it's a button or interactive element within the banner
                    if (
                        element.tagName.toLowerCase() === "button" ||
                        element.getAttribute("role") === "button" ||
                        element.onclick ||
                        element.getAttribute("onclick") ||
                        (element.classList &&
                            (element.classList.contains("ot-sdk-button") ||
                                element.classList.contains("accept-button") ||
                                element.classList.contains("reject-button"))) ||
                        element.getAttribute("aria-label")?.toLowerCase().includes("accept") ||
                        element.getAttribute("aria-label")?.toLowerCase().includes("reject")
                    ) {
                        return true;
                    }
                }

                // Base interactive elements and roles
                const interactiveElements = new Set([
                    'a', 'button', 'input', 'select', 'textarea', 'summary',
                    'details', 'video', 'audio',
                    "embed", "menu", "menuitem",
                    "object", "canvas", "dialog",
                    "banner"
                ]);

                const interactiveRoles = new Set([
                    'a-button-inner', 'a-button-text',
                    'a-dropdown-button','alert','button','button-icon','button-icon-only',
                    'button-text','button-text-icon-only','checkbox','click', 'combobox',
                    'dialog', 'dropdown', 'grid', 'link', 'listbox', 'menu', 'menuitem',
                    'menuitemcheckbox', 'menuitemradio', 'option', 'progressbar', "presentation",
                    'radio', 'region', 'scrollbar', 'searchbox', 'slider', 'spinbutton',
                    'switch', 'tab', 'tabpanel', 'textbox', 'tooltip', 'tree', 'treeitem'
                ]);

                const tagName = element.tagName.toLowerCase();
                const role = element.getAttribute("role");
                const ariaRole = element.getAttribute("aria-role");
                const tabIndex = element.getAttribute("tabindex");

                // Add check for specific class
                const hasAddressInputClass =
                    element.classList &&
                    (element.classList.contains("address-input__container__input") ||
                        element.classList.contains("nav-btn") ||
                        element.classList.contains("pull-left"));

                // Added enhancement to capture dropdown interactive elements
                if (
                    element.classList &&
                    (element.classList.contains("dropdown-toggle") ||
                        element.getAttribute("data-toggle") === "dropdown" ||
                        element.getAttribute("aria-haspopup") === "true")
                ) {
                    return true;
                }

                // Basic role/attribute checks
                const hasInteractiveRole =
                    hasAddressInputClass ||
                    interactiveElements.has(tagName) ||
                    interactiveRoles.has(role) ||
                    interactiveRoles.has(ariaRole) ||
                    (tabIndex !== null &&
                        tabIndex !== "-1" &&
                        element.parentElement?.tagName.toLowerCase() !== "body") ||
                    element.getAttribute("data-action") === "a-dropdown-select" ||
                    element.getAttribute("data-action") === "a-dropdown-button";

                if (hasInteractiveRole) return true;

                // Additional checks for cookie banners and consent UI
                const isCookieBanner =
                    element.id?.toLowerCase().includes("cookie") ||
                    element.id?.toLowerCase().includes("consent") ||
                    element.id?.toLowerCase().includes("notice") ||
                    (element.classList &&
                        (element.classList.contains("otCenterRounded") ||
                            element.classList.contains("ot-sdk-container"))) ||
                    element.getAttribute("data-nosnippet") === "true" ||
                    element.getAttribute("aria-label")?.toLowerCase().includes("cookie") ||
                    element.getAttribute("aria-label")?.toLowerCase().includes("consent") ||
                    (element.tagName.toLowerCase() === "div" &&
                        (element.id?.includes("onetrust") ||
                            (element.classList &&
                                (element.classList.contains("onetrust") ||
                                    element.classList.contains("cookie") ||
                                    element.classList.contains("consent")))));

                if (isCookieBanner) return true;

                // Additional check for buttons in cookie banners
                const isInCookieBanner =
                    typeof element.closest === "function" &&
                    element.closest(
                        '[id*="cookie"],[id*="consent"],[class*="cookie"],[class*="consent"],[id*="onetrust"]'
                    );

                if (
                    isInCookieBanner &&
                    (element.tagName.toLowerCase() === "button" ||
                        element.getAttribute("role") === "button" ||
                        (element.classList && element.classList.contains("button")) ||
                        element.onclick ||
                        element.getAttribute("onclick"))
                ) {
                    return true;
                }

                // Get computed style
                const style = window.getComputedStyle(element);

                // Check for event listeners
                const hasClickHandler =
                    element.onclick !== null ||
                    element.getAttribute("onclick") !== null ||
                    element.hasAttribute("ng-click") ||
                    element.hasAttribute("@click") ||
                    element.hasAttribute("v-on:click");

                // Helper function to safely get event listeners
                function getEventListeners(el) {
                    try {
                        return window.getEventListeners?.(el) || {};
                    } catch (e) {
                        const listeners = {};
                        const eventTypes = [
                            "click",
                            "mousedown",
                            "mouseup",
                            "touchstart",
                            "touchend",
                            "keydown",
                            "keyup",
                            "focus",
                            "blur"
                        ];

                        for (const type of eventTypes) {
                            const handler = el['on' + type];
                            if (handler) {
                                listeners[type] = [{ listener: handler, useCapture: false }];
                            }
                        }
                        return listeners;
                    }
                }

                // Check for click-related events
                const listeners = getEventListeners(element);
                const hasClickListeners =
                    listeners &&
                    (listeners.click?.length > 0 ||
                        listeners.mousedown?.length > 0 ||
                        listeners.mouseup?.length > 0 ||
                        listeners.touchstart?.length > 0 ||
                        listeners.touchend?.length > 0);

                // Check for ARIA properties
                const hasAriaProps =
                    element.hasAttribute("aria-expanded") ||
                    element.hasAttribute("aria-pressed") ||
                    element.hasAttribute("aria-selected") ||
                    element.hasAttribute("aria-checked");

                const isContentEditable =
                    element.getAttribute("contenteditable") === "true" ||
                    element.isContentEditable ||
                    element.id === "tinymce" ||
                    element.classList.contains("mce-content-body") ||
                    (element.tagName.toLowerCase() === "body" &&
                        element.getAttribute("data-id")?.startsWith("mce_"));

                // Check if element is draggable
                const isDraggable =
                    element.draggable || element.getAttribute("draggable") === "true";

                return (
                    hasAriaProps ||
                    hasClickHandler ||
                    hasClickListeners ||
                    isDraggable ||
                    isContentEditable
                );
            },

            isFileInput(element) {
                return element.tagName.toLowerCase() === 'input' &&
                    element.getAttribute('type') === 'file';
            },

            processShadowRoot(shadowRoot, options) {
                if (!shadowRoot) return [];
                const children = [];
                for (const child of shadowRoot.children) {
                    const childData = this.buildDomTree(child, options);
                    if (childData) children.push(childData);
                }
                return children;
            },

            processIframe(iframe, options) {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc) return null;

                    const children = [];
                    for (const child of iframeDoc.body.children) {
                        const childData = this.buildDomTree(child, options);
                        if (childData) children.push(childData);
                    }
                    return children;
                } catch (e) {
                    console.warn('Failed to access iframe content:', e);
                    return null;
                }
            },

            buildDomTree(node, {
                highlightElements = true,
                focusHighlightIndex = -1,
                viewportExpansion = 0,
            } = {}) {
                if (!node) return null;

                if (node.nodeName.toLowerCase() === 'script' ||
                    node.nodeName.toLowerCase() === 'style') {
                    return null;
                }

                // Handle text nodes
                if (node.nodeType === 3) {
                    const text = node.textContent.trim();
                    if (!text) return null;
                    return {
                        type: 'TEXT_NODE',
                        text: text,
                        isVisible: this.isElementVisible(node.parentElement),
                    };
                }

                if (node.nodeType !== 1) return null;

                const isVisible = this.isElementVisible(node);
                const rect = node.getBoundingClientRect();
                const viewport = {
                    top: -viewportExpansion,
                    bottom: window.innerHeight + viewportExpansion,
                    left: 0,
                    right: window.innerWidth,
                };

                // Check if this is a shadow host
                const isShadowHost = !!node.shadowRoot;

                // Always include shadow hosts and interactive/visible elements
                if (!isShadowHost && !isVisible && !this.isInteractive(node)) {
                    return null;
                }
                if (!isShadowHost && rect.bottom < viewport.top || rect.top > viewport.bottom) {
                    return null;
                }

                const nodeData = {
                    tagName: node.nodeName.toLowerCase(),
                    xpath: this.getXPath(node),
                    attributes: {},
                    isVisible: isVisible,
                    isInteractive: this.isInteractive(node),
                    children: [],
                    shadowRoot: isShadowHost,
                };

                // Collect attributes
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    nodeData.attributes[attr.name] = attr.value;
                }

                // Handle shadow DOM
                if (node.shadowRoot) {
                    const shadowChildren = this.processShadowRoot(node.shadowRoot, {
                        highlightElements,
                        focusHighlightIndex,
                        viewportExpansion,
                    });
                    nodeData.children.push(...shadowChildren);
                }

                // Handle iframes
                if (node.nodeName.toLowerCase() === 'iframe') {
                    const iframeChildren = this.processIframe(node, {
                        highlightElements,
                        focusHighlightIndex,
                        viewportExpansion,
                    });
                    if (iframeChildren) {
                        nodeData.children.push(...iframeChildren);
                    }
                }

                // Process regular children
                for (const child of node.childNodes) {
                    const childData = this.buildDomTree(child, {
                        highlightElements,
                        focusHighlightIndex,
                        viewportExpansion,
                    });
                    if (childData) nodeData.children.push(childData);
                }

                if (highlightElements && this.isInteractive(node)) {
                    nodeData.highlightIndex = this.highlightIndex++;
                    if (nodeData.highlightIndex === focusHighlightIndex) {
                        nodeData.isTopElement = true;
                    }
                    node.setAttribute(
                        'browser-user-highlight-id',
                        \`playwright-highlight-\${nodeData.highlightIndex}\`
                    );
                }

                return nodeData;
            },

            captureState(options = {}) {
                const existingContainer = document.getElementById('playwright-highlight-container');
                if (existingContainer) {
                    existingContainer.remove();
                }

                this.highlightIndex = 0;

                return this.buildDomTree(document.documentElement, options);
            }
        };

        return window.domCapture.captureState({
            highlightElements: true,
            focusHighlightIndex: -1,
            viewportExpansion: 0,
        });
    } catch (error) {
        console.error('Error in domCapture:', error);
        return null;
    }
})();
`;

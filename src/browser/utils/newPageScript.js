export const newPageScriptDomTreeScript = `(() => {
  window.MultimodalWebSurfer = window.MultimodalWebSurfer || (() => {
    // Performance tracking and caching
    const PERF_METRICS = window.debugMode ? {
      cacheMetrics: {
        boundingRectCacheHits: 0,
        boundingRectCacheMisses: 0,
        computedStyleCacheHits: 0,
        computedStyleCacheMisses: 0,
        cursorStyleCacheHits: 0,
        cursorStyleCacheMisses: 0
      }
    } : null;

    const DOM_CACHE = {
      boundingRects: new WeakMap(),
      computedStyles: new WeakMap(),
      cursorStyles: new WeakMap(),
      clearCache: () => {
        DOM_CACHE.boundingRects = new WeakMap();
        DOM_CACHE.computedStyles = new WeakMap();
        DOM_CACHE.cursorStyles = new WeakMap();
      }
    };

    // Role mappings from page_script.js
    const roleMapping = {
      a: "link",
      area: "link",
      button: "button",
      "input, type=button": "button",
      "input, type=checkbox": "checkbox",
      "input, type=email": "textbox",
      "input, type=number": "spinbutton",
      "input, type=radio": "radio",
      "input, type=range": "slider",
      "input, type=reset": "button",
      "input, type=search": "searchbox",
      "input, type=submit": "button",
      "input, type=tel": "textbox",
      "input, type=text": "textbox",
      "input, type=url": "textbox",
      search: "search",
      select: "combobox",
      option: "option",
      textarea: "textbox",
      presentation: "textbox"
    };

    // Cache helper functions
    function getCachedBoundingRect(element) {
      if (!element) return null;

      if (DOM_CACHE.boundingRects.has(element)) {
        if (window.debugMode && PERF_METRICS) {
          PERF_METRICS.cacheMetrics.boundingRectCacheHits++;
        }
        return DOM_CACHE.boundingRects.get(element);
      }

      if (window.debugMode && PERF_METRICS) {
        PERF_METRICS.cacheMetrics.boundingRectCacheMisses++;
      }

      const rect = element.getBoundingClientRect();
      if (rect) {
        DOM_CACHE.boundingRects.set(element, rect);
      }
      return rect;
    }

    function getCachedComputedStyle(element) {
      if (!element) return null;

      if (DOM_CACHE.computedStyles.has(element)) {
        if (window.debugMode && PERF_METRICS) {
          PERF_METRICS.cacheMetrics.computedStyleCacheHits++;
        }
        return DOM_CACHE.computedStyles.get(element);
      }

      if (window.debugMode && PERF_METRICS) {
        PERF_METRICS.cacheMetrics.computedStyleCacheMisses++;
      }

      const style = window.getComputedStyle(element);
      if (style) {
        DOM_CACHE.computedStyles.set(element, style);
      }
      return style;
    }

    function getCachedCursorStyle(element) {
      if (!element) return null;

      if (DOM_CACHE.cursorStyles.has(element)) {
        if (window.debugMode && PERF_METRICS) {
          PERF_METRICS.cacheMetrics.cursorStyleCacheHits++;
        }
        return DOM_CACHE.cursorStyles.get(element);
      }

      if (window.debugMode && PERF_METRICS) {
        PERF_METRICS.cacheMetrics.cursorStyleCacheMisses++;
      }

      const cursor = window.getComputedStyle(element)["cursor"];
      DOM_CACHE.cursorStyles.set(element, cursor);
      return cursor;
    }

    // Enhanced interactive element detection
    function isInteractiveElement(element) {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return false;
      }

      const tagName = element.tagName.toLowerCase();

      // Fast-path for common interactive elements
      const interactiveElements = new Set([
        "a", "button", "input", "select", "textarea", "details", "summary",
        "embed", "menu", "menuitem", "object", "canvas", "dialog", "banner"
      ]);

      if (interactiveElements.has(tagName)) return true;

      // Cursor-based detection (from page_script.js)
      const inertCursors = ["auto", "default", "none", "text", "vertical-text", "not-allowed", "no-drop"];
      const cursor = getCachedCursorStyle(element);
      if (inertCursors.indexOf(cursor) < 0) return true;

      // Combined role detection from both files
      const interactiveRoles = new Set([
        "button-icon", "dialog", "button-text-icon-only", "treeitem",
        "alert", "grid", "progressbar", "radio", "checkbox", "menuitem",
        "option", "switch", "dropdown", "scrollbar", "combobox",
        "a-button-text", "button", "region", "textbox", "tabpanel",
        "tab", "click", "button-text", "spinbutton", "a-button-inner",
        "link", "menu", "slider", "listbox", "a-dropdown-button",
        "button-icon-only", "searchbox", "menuitemradio", "tooltip",
        "tree", "menuitemcheckbox", "widget"
      ]);

      const role = element.getAttribute("role");
      const ariaRole = element.getAttribute("aria-role");

      if (interactiveRoles.has(role) || interactiveRoles.has(ariaRole)) return true;

      // Enhanced attribute detection
      const hasInteractiveAttributes =
        element.hasAttribute("onclick") ||
        element.hasAttribute("ng-click") ||
        element.hasAttribute("@click") ||
        element.hasAttribute("v-on:click") ||
        element.hasAttribute("tabindex") ||
        element.hasAttribute("contenteditable") ||
        element.hasAttribute("aria-expanded") ||
        element.hasAttribute("aria-pressed") ||
        element.hasAttribute("aria-selected") ||
        element.hasAttribute("aria-checked") ||
        element.hasAttribute("data-action") ||
        element.draggable;

      if (hasInteractiveAttributes) return true;

      // Cookie banner and consent UI detection
      const isCookieBanner =
        element.id?.toLowerCase().includes("cookie") ||
        element.id?.toLowerCase().includes("consent") ||
        element.closest('[id*="onetrust"]') ||
        element.closest('[class*="onetrust"]') ||
        element.closest('[data-nosnippet="true"]') ||
        element.getAttribute("aria-label")?.toLowerCase().includes("cookie");

      return isCookieBanner;
    }

    function isElementVisible(element) {
      if (!element) return false;
      const style = getCachedComputedStyle(element);
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        style.opacity !== "0"
      );
    }

    function isTopElement(element) {
      const rect = getCachedBoundingRect(element);
      if (!rect) return false;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      try {
        const topEl = document.elementFromPoint(centerX, centerY);
        if (!topEl) return false;

        let current = topEl;
        while (current && current !== document.documentElement) {
          if (current === element) return true;
          current = current.parentElement;
        }
        return false;
      } catch (e) {
        return true;
      }
    }

    let nextLabel = 10;

    function labelElements(elements) {
      for (let i = 0; i < elements.length; i++) {
        if (!elements[i].hasAttribute("__elementId")) {
          elements[i].setAttribute("__elementId", "" + nextLabel++);
        }
      }
    }

    function getInteractiveElements() {
      const results = [];

      // Get main interactive elements
      const nodeList = document.querySelectorAll(
        "input, select, textarea, button, [href], [onclick], [contenteditable], [tabindex]:not([tabindex='-1'])"
      );
      results.push(...Array.from(nodeList));

      // Add elements with interactive roles
      const roleElements = document.querySelectorAll("[role]");
      for (const element of roleElements) {
        if (!results.includes(element) && isInteractiveElement(element)) {
          results.push(element);
        }
      }

      // Add elements with non-inert cursors
      const allElements = document.querySelectorAll("*");
      for (const element of allElements) {
        if (!results.includes(element)) {
          const cursor = getCachedCursorStyle(element);
          const inertCursors = ["auto", "default", "none", "text", "vertical-text", "not-allowed", "no-drop"];
          if (!inertCursors.includes(cursor)) {
            results.push(element);
          }
        }
      }

      return results;
    }

    function getInteractiveRects() {
      labelElements(getInteractiveElements());
      const elements = document.querySelectorAll("[__elementId]");
      const results = {};

      for (const element of elements) {
        const key = element.getAttribute("__elementId");
        const rects = element.getClientRects();

        const record = {
          tag_name: element.tagName.toLowerCase(),
          role: element.getAttribute("role") || roleMapping[element.tagName.toLowerCase()],
          "aria-name": getApproximateAriaName(element),
          "v-scrollable": element.scrollHeight - element.clientHeight >= 1,
          "xpath": getXPathTree(element),
          "attributes": getImportantAttributes(element),
          "is_visible": isElementVisible(element),
          "is_interactive": isInteractiveElement(element),
          "in_viewport": isInViewport(element),
          rects: []
        };

        for (const rect of rects) {
          if (isTopElement(element)) {
            record.rects.push(JSON.parse(JSON.stringify(rect)));
          }
        }

        if (record.rects.length > 0) {
          results[key] = record;
        }
      }

      return results;
    }

    // Helper functions from both files
    function getXPathTree(element) {
      if (!element) return '';

      if (element.id) {
        return '//*[@id="' + element.id + '"]';
      }

      const paths = [];
      while (element && element.nodeType === Node.ELEMENT_NODE) {
        let index = 0;
        let sibling = element;
        while (sibling) {
          if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
            index++;
          }
          sibling = sibling.previousSibling;
        }
        const tagName = element.tagName.toLowerCase();
        const pathIndex = (index > 1) ? '[' + index + ']' : '';
        paths.unshift(tagName + pathIndex);
        element = element.parentNode;
      }
      return '/' + paths.join('/');
    }

    function getImportantAttributes(element) {
      const result = {};
      const attributesToCapture = [
        'id', 'name', 'class', 'href', 'value', 'type',
        'placeholder', 'for', 'src', 'alt', 'title', 'role',
        'aria-label', 'aria-labelledby', 'tabindex'
      ];

      for (const attr of attributesToCapture) {
        if (element.hasAttribute(attr)) {
          result[attr] = element.getAttribute(attr);
        }
      }

      for (const attr of element.getAttributeNames()) {
        if (attr.startsWith('data-') || attr.startsWith('aria-')) {
          result[attr] = element.getAttribute(attr);
        }
      }

      return result;
    }

    function isInViewport(element) {
      const rect = getCachedBoundingRect(element);
      return rect && (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    function getApproximateAriaName(element) {
      if (element.hasAttribute("aria-labelledby")) {
        const ids = element.getAttribute("aria-labelledby").split(" ");
        const labels = ids
          .map(id => document.getElementById(id)?.innerText?.trim())
          .filter(Boolean);
        if (labels.length) return labels.join(" ");
      }

      if (element.hasAttribute("aria-label")) {
        return element.getAttribute("aria-label");
      }

      if (element.hasAttribute("id")) {
        const labels = document.querySelectorAll(\`label[for="\${element.id}"]\`);
        const labelTexts = Array.from(labels)
          .map(label => label.innerText?.trim())
          .filter(Boolean);
        if (labelTexts.length) return labelTexts.join(" ");
      }

      if (element.hasAttribute("alt")) return element.getAttribute("alt");
      if (element.hasAttribute("title")) return element.getAttribute("title");

      return element.innerText?.trim() || "";
    }

    // Clear cache before returning
    DOM_CACHE.clearCache();

    return {
      getInteractiveRects,
      getInteractiveElements,
      isInteractiveElement,
      isElementVisible,
      isTopElement
    };
  })();

  return window.MultimodalWebSurfer.getInteractiveRects();
})();`;

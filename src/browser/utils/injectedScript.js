"use strict";
var InjectedScriptExports = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/browser/snapshot/injectedScript.ts
  var injectedScript_exports = {};
  __export(injectedScript_exports, {
    InjectedScript: () => InjectedScript,
    createAriaSnapshot: () => createAriaSnapshot
  });

  // src/browser/snapshot/isomorphic/builtins.ts
  function builtins(global) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    global = global != null ? global : globalThis;
    if (!global["__playwright_builtins__"]) {
      const builtins2 = {
        setTimeout: (_a = global.setTimeout) == null ? void 0 : _a.bind(global),
        clearTimeout: (_b = global.clearTimeout) == null ? void 0 : _b.bind(global),
        setInterval: (_c = global.setInterval) == null ? void 0 : _c.bind(global),
        clearInterval: (_d = global.clearInterval) == null ? void 0 : _d.bind(global),
        requestAnimationFrame: (_e = global.requestAnimationFrame) == null ? void 0 : _e.bind(global),
        cancelAnimationFrame: (_f = global.cancelAnimationFrame) == null ? void 0 : _f.bind(global),
        requestIdleCallback: (_g = global.requestIdleCallback) == null ? void 0 : _g.bind(global),
        cancelIdleCallback: (_h = global.cancelIdleCallback) == null ? void 0 : _h.bind(global),
        performance: global.performance,
        eval: (_i = global.eval) == null ? void 0 : _i.bind(global),
        Intl: global.Intl,
        Date: global.Date,
        Map: global.Map,
        Set: global.Set
      };
      Object.defineProperty(global, "__playwright_builtins__", { value: builtins2, configurable: false, enumerable: false, writable: false });
    }
    return global["__playwright_builtins__"];
  }
  var instance = builtins();
  var setTimeout = instance.setTimeout;
  var clearTimeout = instance.clearTimeout;
  var setInterval = instance.setInterval;
  var clearInterval = instance.clearInterval;
  var requestAnimationFrame = instance.requestAnimationFrame;
  var cancelAnimationFrame = instance.cancelAnimationFrame;
  var requestIdleCallback = instance.requestIdleCallback;
  var cancelIdleCallback = instance.cancelIdleCallback;
  var performance = instance.performance;
  var Intl = instance.Intl;
  var Date = instance.Date;
  var Map = instance.Map;
  var Set = instance.Set;

  // src/browser/snapshot/isomorphic/stringUtils.ts
  var normalizedWhitespaceCache;
  function normalizeWhiteSpace(text) {
    let result = normalizedWhitespaceCache == null ? void 0 : normalizedWhitespaceCache.get(text);
    if (result === void 0) {
      result = text.replace(/[\u200b\u00ad]/g, "").trim().replace(/\s+/g, " ");
      normalizedWhitespaceCache == null ? void 0 : normalizedWhitespaceCache.set(text, result);
    }
    return result;
  }
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function longestCommonSubstring(s1, s2) {
    const n = s1.length;
    const m = s2.length;
    let maxLen = 0;
    let endingIndex = 0;
    const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          if (dp[i][j] > maxLen) {
            maxLen = dp[i][j];
            endingIndex = i;
          }
        }
      }
    }
    return s1.slice(endingIndex - maxLen, endingIndex);
  }

  // src/browser/snapshot/domUtils.ts
  var globalOptions = {};
  function getGlobalOptions() {
    return globalOptions;
  }
  function parentElementOrShadowHost(element) {
    if (element.parentElement)
      return element.parentElement;
    if (!element.parentNode)
      return;
    if (element.parentNode.nodeType === 11 && element.parentNode.host)
      return element.parentNode.host;
  }
  function enclosingShadowRootOrDocument(element) {
    let node = element;
    while (node.parentNode)
      node = node.parentNode;
    if (node.nodeType === 11 || node.nodeType === 9)
      return node;
  }
  function enclosingShadowHost(element) {
    while (element.parentElement)
      element = element.parentElement;
    return parentElementOrShadowHost(element);
  }
  function closestCrossShadow(element, css, scope) {
    while (element) {
      const closest = element.closest(css);
      if (scope && closest !== scope && (closest == null ? void 0 : closest.contains(scope)))
        return;
      if (closest)
        return closest;
      element = enclosingShadowHost(element);
    }
  }
  function getElementComputedStyle(element, pseudo) {
    return element.ownerDocument && element.ownerDocument.defaultView ? element.ownerDocument.defaultView.getComputedStyle(element, pseudo) : void 0;
  }
  function isElementStyleVisibilityVisible(element, style) {
    style = style != null ? style : getElementComputedStyle(element);
    if (!style)
      return true;
    if (Element.prototype.checkVisibility && globalOptions.browserNameForWorkarounds !== "webkit") {
      if (!element.checkVisibility())
        return false;
    } else {
      const detailsOrSummary = element.closest("details,summary");
      if (detailsOrSummary !== element && (detailsOrSummary == null ? void 0 : detailsOrSummary.nodeName) === "DETAILS" && !detailsOrSummary.open)
        return false;
    }
    if (style.visibility !== "visible")
      return false;
    return true;
  }
  function isVisibleTextNode(node) {
    const range = node.ownerDocument.createRange();
    range.selectNode(node);
    const rect = range.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
  function elementSafeTagName(element) {
    if (element instanceof HTMLFormElement)
      return "FORM";
    return element.tagName.toUpperCase();
  }

  // src/browser/snapshot/roleUtils.ts
  function hasExplicitAccessibleName(e) {
    return e.hasAttribute("aria-label") || e.hasAttribute("aria-labelledby");
  }
  var kAncestorPreventingLandmark = "article:not([role]), aside:not([role]), main:not([role]), nav:not([role]), section:not([role]), [role=article], [role=complementary], [role=main], [role=navigation], [role=region]";
  var kGlobalAriaAttributes = [
    ["aria-atomic", void 0],
    ["aria-busy", void 0],
    ["aria-controls", void 0],
    ["aria-current", void 0],
    ["aria-describedby", void 0],
    ["aria-details", void 0],
    // Global use deprecated in ARIA 1.2
    // ['aria-disabled', undefined],
    ["aria-dropeffect", void 0],
    // Global use deprecated in ARIA 1.2
    // ['aria-errormessage', undefined],
    ["aria-flowto", void 0],
    ["aria-grabbed", void 0],
    // Global use deprecated in ARIA 1.2
    // ['aria-haspopup', undefined],
    ["aria-hidden", void 0],
    // Global use deprecated in ARIA 1.2
    // ['aria-invalid', undefined],
    ["aria-keyshortcuts", void 0],
    ["aria-label", ["caption", "code", "deletion", "emphasis", "generic", "insertion", "paragraph", "presentation", "strong", "subscript", "superscript"]],
    ["aria-labelledby", ["caption", "code", "deletion", "emphasis", "generic", "insertion", "paragraph", "presentation", "strong", "subscript", "superscript"]],
    ["aria-live", void 0],
    ["aria-owns", void 0],
    ["aria-relevant", void 0],
    ["aria-roledescription", ["generic"]]
  ];
  function hasGlobalAriaAttribute(element, forRole) {
    return kGlobalAriaAttributes.some(([attr, prohibited]) => {
      return !(prohibited == null ? void 0 : prohibited.includes(forRole || "")) && element.hasAttribute(attr);
    });
  }
  function hasTabIndex(element) {
    return !Number.isNaN(Number(String(element.getAttribute("tabindex"))));
  }
  function isFocusable(element) {
    return !isNativelyDisabled(element) && (isNativelyFocusable(element) || hasTabIndex(element));
  }
  function isNativelyFocusable(element) {
    const tagName = elementSafeTagName(element);
    if (["BUTTON", "DETAILS", "SELECT", "TEXTAREA"].includes(tagName))
      return true;
    if (tagName === "A" || tagName === "AREA")
      return element.hasAttribute("href");
    if (tagName === "INPUT")
      return !element.hidden;
    return false;
  }
  var kImplicitRoleByTagName = {
    "A": (e) => {
      return e.hasAttribute("href") ? "link" : null;
    },
    "AREA": (e) => {
      return e.hasAttribute("href") ? "link" : null;
    },
    "ARTICLE": () => "article",
    "ASIDE": () => "complementary",
    "BLOCKQUOTE": () => "blockquote",
    "BUTTON": () => "button",
    "CAPTION": () => "caption",
    "CODE": () => "code",
    "DATALIST": () => "listbox",
    "DD": () => "definition",
    "DEL": () => "deletion",
    "DETAILS": () => "group",
    "DFN": () => "term",
    "DIALOG": () => "dialog",
    "DT": () => "term",
    "EM": () => "emphasis",
    "FIELDSET": () => "group",
    "FIGURE": () => "figure",
    "FOOTER": (e) => closestCrossShadow(e, kAncestorPreventingLandmark) ? null : "contentinfo",
    "FORM": (e) => hasExplicitAccessibleName(e) ? "form" : null,
    "H1": () => "heading",
    "H2": () => "heading",
    "H3": () => "heading",
    "H4": () => "heading",
    "H5": () => "heading",
    "H6": () => "heading",
    "HEADER": (e) => closestCrossShadow(e, kAncestorPreventingLandmark) ? null : "banner",
    "HR": () => "separator",
    "HTML": () => "document",
    "IMG": (e) => e.getAttribute("alt") === "" && !e.getAttribute("title") && !hasGlobalAriaAttribute(e) && !hasTabIndex(e) ? "presentation" : "img",
    "INPUT": (e) => {
      const type = e.type.toLowerCase();
      if (type === "search")
        return e.hasAttribute("list") ? "combobox" : "searchbox";
      if (["email", "tel", "text", "url", ""].includes(type)) {
        const list = getIdRefs(e, e.getAttribute("list"))[0];
        return list && elementSafeTagName(list) === "DATALIST" ? "combobox" : "textbox";
      }
      if (type === "hidden")
        return null;
      if (type === "file" && !getGlobalOptions().inputFileRoleTextbox)
        return "button";
      return inputTypeToRole[type] || "textbox";
    },
    "INS": () => "insertion",
    "LI": () => "listitem",
    "MAIN": () => "main",
    "MARK": () => "mark",
    "MATH": () => "math",
    "MENU": () => "list",
    "METER": () => "meter",
    "NAV": () => "navigation",
    "OL": () => "list",
    "OPTGROUP": () => "group",
    "OPTION": () => "option",
    "OUTPUT": () => "status",
    "P": () => "paragraph",
    "PROGRESS": () => "progressbar",
    "SECTION": (e) => hasExplicitAccessibleName(e) ? "region" : null,
    "SELECT": (e) => e.hasAttribute("multiple") || e.size > 1 ? "listbox" : "combobox",
    "STRONG": () => "strong",
    "SUB": () => "subscript",
    "SUP": () => "superscript",
    // For <svg> we default to Chrome behavior:
    // - Chrome reports 'img'.
    // - Firefox reports 'diagram' that is not in official ARIA spec yet.
    // - Safari reports 'no role', but still computes accessible name.
    "SVG": () => "img",
    "TABLE": () => "table",
    "TBODY": () => "rowgroup",
    "TD": (e) => {
      const table = closestCrossShadow(e, "table");
      const role = table ? getExplicitAriaRole(table) : "";
      return role === "grid" || role === "treegrid" ? "gridcell" : "cell";
    },
    "TEXTAREA": () => "textbox",
    "TFOOT": () => "rowgroup",
    "TH": (e) => {
      if (e.getAttribute("scope") === "col")
        return "columnheader";
      if (e.getAttribute("scope") === "row")
        return "rowheader";
      const table = closestCrossShadow(e, "table");
      const role = table ? getExplicitAriaRole(table) : "";
      return role === "grid" || role === "treegrid" ? "gridcell" : "cell";
    },
    "THEAD": () => "rowgroup",
    "TIME": () => "time",
    "TR": () => "row",
    "UL": () => "list"
  };
  var kPresentationInheritanceParents = {
    "DD": ["DL", "DIV"],
    "DIV": ["DL"],
    "DT": ["DL", "DIV"],
    "LI": ["OL", "UL"],
    "TBODY": ["TABLE"],
    "TD": ["TR"],
    "TFOOT": ["TABLE"],
    "TH": ["TR"],
    "THEAD": ["TABLE"],
    "TR": ["THEAD", "TBODY", "TFOOT", "TABLE"]
  };
  function getImplicitAriaRole(element) {
    var _a;
    const implicitRole = ((_a = kImplicitRoleByTagName[elementSafeTagName(element)]) == null ? void 0 : _a.call(kImplicitRoleByTagName, element)) || "";
    if (!implicitRole)
      return null;
    let ancestor = element;
    while (ancestor) {
      const parent = parentElementOrShadowHost(ancestor);
      const parents = kPresentationInheritanceParents[elementSafeTagName(ancestor)];
      if (!parents || !parent || !parents.includes(elementSafeTagName(parent)))
        break;
      const parentExplicitRole = getExplicitAriaRole(parent);
      if ((parentExplicitRole === "none" || parentExplicitRole === "presentation") && !hasPresentationConflictResolution(parent, parentExplicitRole))
        return parentExplicitRole;
      ancestor = parent;
    }
    return implicitRole;
  }
  var validRoles = [
    "alert",
    "alertdialog",
    "application",
    "article",
    "banner",
    "blockquote",
    "button",
    "caption",
    "cell",
    "checkbox",
    "code",
    "columnheader",
    "combobox",
    "complementary",
    "contentinfo",
    "definition",
    "deletion",
    "dialog",
    "directory",
    "document",
    "emphasis",
    "feed",
    "figure",
    "form",
    "generic",
    "grid",
    "gridcell",
    "group",
    "heading",
    "img",
    "insertion",
    "link",
    "list",
    "listbox",
    "listitem",
    "log",
    "main",
    "mark",
    "marquee",
    "math",
    "meter",
    "menu",
    "menubar",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "navigation",
    "none",
    "note",
    "option",
    "paragraph",
    "presentation",
    "progressbar",
    "radio",
    "radiogroup",
    "region",
    "row",
    "rowgroup",
    "rowheader",
    "scrollbar",
    "search",
    "searchbox",
    "separator",
    "slider",
    "spinbutton",
    "status",
    "strong",
    "subscript",
    "superscript",
    "switch",
    "tab",
    "table",
    "tablist",
    "tabpanel",
    "term",
    "textbox",
    "time",
    "timer",
    "toolbar",
    "tooltip",
    "tree",
    "treegrid",
    "treeitem"
  ];
  function getExplicitAriaRole(element) {
    const roles = (element.getAttribute("role") || "").split(" ").map((role) => role.trim());
    return roles.find((role) => validRoles.includes(role)) || null;
  }
  function hasPresentationConflictResolution(element, role) {
    return hasGlobalAriaAttribute(element, role) || isFocusable(element);
  }
  function getAriaRole(element) {
    const explicitRole = getExplicitAriaRole(element);
    if (!explicitRole)
      return getImplicitAriaRole(element);
    if (explicitRole === "none" || explicitRole === "presentation") {
      const implicitRole = getImplicitAriaRole(element);
      if (hasPresentationConflictResolution(element, implicitRole))
        return implicitRole;
    }
    return explicitRole;
  }
  function getAriaBoolean(attr) {
    return attr === null ? void 0 : attr.toLowerCase() === "true";
  }
  function isElementIgnoredForAria(element) {
    return ["STYLE", "SCRIPT", "NOSCRIPT", "TEMPLATE"].includes(elementSafeTagName(element));
  }
  function isElementHiddenForAria(element) {
    if (isElementIgnoredForAria(element))
      return true;
    const style = getElementComputedStyle(element);
    const isSlot = element.nodeName === "SLOT";
    if ((style == null ? void 0 : style.display) === "contents" && !isSlot) {
      for (let child = element.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === 1 && !isElementHiddenForAria(child))
          return false;
        if (child.nodeType === 3 && isVisibleTextNode(child))
          return false;
      }
      return true;
    }
    const isOptionInsideSelect = element.nodeName === "OPTION" && !!element.closest("select");
    if (!isOptionInsideSelect && !isSlot && !isElementStyleVisibilityVisible(element, style))
      return true;
    return belongsToDisplayNoneOrAriaHiddenOrNonSlotted(element);
  }
  function belongsToDisplayNoneOrAriaHiddenOrNonSlotted(element) {
    let hidden = cacheIsHidden == null ? void 0 : cacheIsHidden.get(element);
    if (hidden === void 0) {
      hidden = false;
      if (element.parentElement && element.parentElement.shadowRoot && !element.assignedSlot)
        hidden = true;
      if (!hidden) {
        const style = getElementComputedStyle(element);
        hidden = !style || style.display === "none" || getAriaBoolean(element.getAttribute("aria-hidden")) === true;
      }
      if (!hidden) {
        const parent = parentElementOrShadowHost(element);
        if (parent)
          hidden = belongsToDisplayNoneOrAriaHiddenOrNonSlotted(parent);
      }
      cacheIsHidden == null ? void 0 : cacheIsHidden.set(element, hidden);
    }
    return hidden;
  }
  function getIdRefs(element, ref) {
    if (!ref)
      return [];
    const root = enclosingShadowRootOrDocument(element);
    if (!root)
      return [];
    try {
      const ids = ref.split(" ").filter((id) => !!id);
      const result = [];
      for (const id of ids) {
        const firstElement = root.querySelector("#" + CSS.escape(id));
        if (firstElement && !result.includes(firstElement))
          result.push(firstElement);
      }
      return result;
    } catch (e) {
      return [];
    }
  }
  function trimFlatString(s) {
    return s.trim();
  }
  function asFlatString(s) {
    return s.split("\xA0").map((chunk) => chunk.replace(/\r\n/g, "\n").replace(/[\u200b\u00ad]/g, "").replace(/\s\s*/g, " ")).join("\xA0").trim();
  }
  function queryInAriaOwned(element, selector) {
    const result = [...element.querySelectorAll(selector)];
    for (const owned of getIdRefs(element, element.getAttribute("aria-owns"))) {
      if (owned.matches(selector))
        result.push(owned);
      result.push(...owned.querySelectorAll(selector));
    }
    return result;
  }
  function getPseudoContent(element, pseudo) {
    const cache = pseudo === "::before" ? cachePseudoContentBefore : cachePseudoContentAfter;
    if (cache == null ? void 0 : cache.has(element))
      return (cache == null ? void 0 : cache.get(element)) || "";
    const pseudoStyle = getElementComputedStyle(element, pseudo);
    const content = getPseudoContentImpl(element, pseudoStyle);
    if (cache)
      cache.set(element, content);
    return content;
  }
  function getPseudoContentImpl(element, pseudoStyle) {
    if (!pseudoStyle || pseudoStyle.display === "none" || pseudoStyle.visibility === "hidden")
      return "";
    const content = pseudoStyle.content;
    let resolvedContent;
    if (content[0] === "'" && content[content.length - 1] === "'" || content[0] === '"' && content[content.length - 1] === '"') {
      resolvedContent = content.substring(1, content.length - 1);
    } else if (content.startsWith("attr(") && content.endsWith(")")) {
      const attrName = content.substring("attr(".length, content.length - 1).trim();
      resolvedContent = element.getAttribute(attrName) || "";
    }
    if (resolvedContent !== void 0) {
      const display = pseudoStyle.display || "inline";
      if (display !== "inline")
        return " " + resolvedContent + " ";
      return resolvedContent;
    }
    return "";
  }
  function getAriaLabelledByElements(element) {
    const ref = element.getAttribute("aria-labelledby");
    if (ref === null)
      return null;
    const refs = getIdRefs(element, ref);
    return refs.length ? refs : null;
  }
  function allowsNameFromContent(role, targetDescendant) {
    const alwaysAllowsNameFromContent = ["button", "cell", "checkbox", "columnheader", "gridcell", "heading", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "row", "rowheader", "switch", "tab", "tooltip", "treeitem"].includes(role);
    const descendantAllowsNameFromContent = targetDescendant && ["", "caption", "code", "contentinfo", "definition", "deletion", "emphasis", "insertion", "list", "listitem", "mark", "none", "paragraph", "presentation", "region", "row", "rowgroup", "section", "strong", "subscript", "superscript", "table", "term", "time"].includes(role);
    return alwaysAllowsNameFromContent || descendantAllowsNameFromContent;
  }
  function getElementAccessibleName(element, includeHidden) {
    const cache = includeHidden ? cacheAccessibleNameHidden : cacheAccessibleName;
    let accessibleName = cache == null ? void 0 : cache.get(element);
    if (accessibleName === void 0) {
      accessibleName = "";
      const elementProhibitsNaming = ["caption", "code", "definition", "deletion", "emphasis", "generic", "insertion", "mark", "paragraph", "presentation", "strong", "subscript", "suggestion", "superscript", "term", "time"].includes(getAriaRole(element) || "");
      if (!elementProhibitsNaming) {
        accessibleName = asFlatString(getTextAlternativeInternal(element, {
          includeHidden,
          visitedElements: new Set(),
          embeddedInTargetElement: "self"
        }));
      }
      cache == null ? void 0 : cache.set(element, accessibleName);
    }
    return accessibleName;
  }
  function getTextAlternativeInternal(element, options) {
    var _a, _b, _c, _d;
    if (options.visitedElements.has(element))
      return "";
    const childOptions = {
      ...options,
      embeddedInTargetElement: options.embeddedInTargetElement === "self" ? "descendant" : options.embeddedInTargetElement
    };
    if (!options.includeHidden) {
      const isEmbeddedInHiddenReferenceTraversal = !!((_a = options.embeddedInLabelledBy) == null ? void 0 : _a.hidden) || !!((_b = options.embeddedInDescribedBy) == null ? void 0 : _b.hidden) || !!((_c = options.embeddedInNativeTextAlternative) == null ? void 0 : _c.hidden) || !!((_d = options.embeddedInLabel) == null ? void 0 : _d.hidden);
      if (isElementIgnoredForAria(element) || !isEmbeddedInHiddenReferenceTraversal && isElementHiddenForAria(element)) {
        options.visitedElements.add(element);
        return "";
      }
    }
    const labelledBy = getAriaLabelledByElements(element);
    if (!options.embeddedInLabelledBy) {
      const accessibleName = (labelledBy || []).map((ref) => getTextAlternativeInternal(ref, {
        ...options,
        embeddedInLabelledBy: { element: ref, hidden: isElementHiddenForAria(ref) },
        embeddedInDescribedBy: void 0,
        embeddedInTargetElement: void 0,
        embeddedInLabel: void 0,
        embeddedInNativeTextAlternative: void 0
      })).join(" ");
      if (accessibleName)
        return accessibleName;
    }
    const role = getAriaRole(element) || "";
    const tagName = elementSafeTagName(element);
    if (!!options.embeddedInLabel || !!options.embeddedInLabelledBy || options.embeddedInTargetElement === "descendant") {
      const isOwnLabel = [...element.labels || []].includes(element);
      const isOwnLabelledBy = (labelledBy || []).includes(element);
      if (!isOwnLabel && !isOwnLabelledBy) {
        if (role === "textbox") {
          options.visitedElements.add(element);
          if (tagName === "INPUT" || tagName === "TEXTAREA")
            return element.value;
          return element.textContent || "";
        }
        if (["combobox", "listbox"].includes(role)) {
          options.visitedElements.add(element);
          let selectedOptions;
          if (tagName === "SELECT") {
            selectedOptions = [...element.selectedOptions];
            if (!selectedOptions.length && element.options.length)
              selectedOptions.push(element.options[0]);
          } else {
            const listbox = role === "combobox" ? queryInAriaOwned(element, "*").find((e) => getAriaRole(e) === "listbox") : element;
            selectedOptions = listbox ? queryInAriaOwned(listbox, '[aria-selected="true"]').filter((e) => getAriaRole(e) === "option") : [];
          }
          if (!selectedOptions.length && tagName === "INPUT") {
            return element.value;
          }
          return selectedOptions.map((option) => getTextAlternativeInternal(option, childOptions)).join(" ");
        }
        if (["progressbar", "scrollbar", "slider", "spinbutton", "meter"].includes(role)) {
          options.visitedElements.add(element);
          if (element.hasAttribute("aria-valuetext"))
            return element.getAttribute("aria-valuetext") || "";
          if (element.hasAttribute("aria-valuenow"))
            return element.getAttribute("aria-valuenow") || "";
          return element.getAttribute("value") || "";
        }
        if (["menu"].includes(role)) {
          options.visitedElements.add(element);
          return "";
        }
      }
    }
    const ariaLabel = element.getAttribute("aria-label") || "";
    if (trimFlatString(ariaLabel)) {
      options.visitedElements.add(element);
      return ariaLabel;
    }
    if (!["presentation", "none"].includes(role)) {
      if (tagName === "INPUT" && ["button", "submit", "reset"].includes(element.type)) {
        options.visitedElements.add(element);
        const value = element.value || "";
        if (trimFlatString(value))
          return value;
        if (element.type === "submit")
          return "Submit";
        if (element.type === "reset")
          return "Reset";
        const title = element.getAttribute("title") || "";
        return title;
      }
      if (!getGlobalOptions().inputFileRoleTextbox && tagName === "INPUT" && element.type === "file") {
        options.visitedElements.add(element);
        const labels = element.labels || [];
        if (labels.length && !options.embeddedInLabelledBy)
          return getAccessibleNameFromAssociatedLabels(labels, options);
        return "Choose File";
      }
      if (tagName === "INPUT" && element.type === "image") {
        options.visitedElements.add(element);
        const labels = element.labels || [];
        if (labels.length && !options.embeddedInLabelledBy)
          return getAccessibleNameFromAssociatedLabels(labels, options);
        const alt = element.getAttribute("alt") || "";
        if (trimFlatString(alt))
          return alt;
        const title = element.getAttribute("title") || "";
        if (trimFlatString(title))
          return title;
        return "Submit";
      }
      if (!labelledBy && tagName === "BUTTON") {
        options.visitedElements.add(element);
        const labels = element.labels || [];
        if (labels.length)
          return getAccessibleNameFromAssociatedLabels(labels, options);
      }
      if (!labelledBy && tagName === "OUTPUT") {
        options.visitedElements.add(element);
        const labels = element.labels || [];
        if (labels.length)
          return getAccessibleNameFromAssociatedLabels(labels, options);
        return element.getAttribute("title") || "";
      }
      if (!labelledBy && (tagName === "TEXTAREA" || tagName === "SELECT" || tagName === "INPUT")) {
        options.visitedElements.add(element);
        const labels = element.labels || [];
        if (labels.length)
          return getAccessibleNameFromAssociatedLabels(labels, options);
        const usePlaceholder = tagName === "INPUT" && ["text", "password", "search", "tel", "email", "url"].includes(element.type) || tagName === "TEXTAREA";
        const placeholder = element.getAttribute("placeholder") || "";
        const title = element.getAttribute("title") || "";
        if (!usePlaceholder || title)
          return title;
        return placeholder;
      }
      if (!labelledBy && tagName === "FIELDSET") {
        options.visitedElements.add(element);
        for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
          if (elementSafeTagName(child) === "LEGEND") {
            return getTextAlternativeInternal(child, {
              ...childOptions,
              embeddedInNativeTextAlternative: { element: child, hidden: isElementHiddenForAria(child) }
            });
          }
        }
        const title = element.getAttribute("title") || "";
        return title;
      }
      if (!labelledBy && tagName === "FIGURE") {
        options.visitedElements.add(element);
        for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
          if (elementSafeTagName(child) === "FIGCAPTION") {
            return getTextAlternativeInternal(child, {
              ...childOptions,
              embeddedInNativeTextAlternative: { element: child, hidden: isElementHiddenForAria(child) }
            });
          }
        }
        const title = element.getAttribute("title") || "";
        return title;
      }
      if (tagName === "IMG") {
        options.visitedElements.add(element);
        const alt = element.getAttribute("alt") || "";
        if (trimFlatString(alt))
          return alt;
        const title = element.getAttribute("title") || "";
        return title;
      }
      if (tagName === "TABLE") {
        options.visitedElements.add(element);
        for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
          if (elementSafeTagName(child) === "CAPTION") {
            return getTextAlternativeInternal(child, {
              ...childOptions,
              embeddedInNativeTextAlternative: { element: child, hidden: isElementHiddenForAria(child) }
            });
          }
        }
        const summary = element.getAttribute("summary") || "";
        if (summary)
          return summary;
      }
      if (tagName === "AREA") {
        options.visitedElements.add(element);
        const alt = element.getAttribute("alt") || "";
        if (trimFlatString(alt))
          return alt;
        const title = element.getAttribute("title") || "";
        return title;
      }
      if (tagName === "SVG" || element.ownerSVGElement) {
        options.visitedElements.add(element);
        for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
          if (elementSafeTagName(child) === "TITLE" && child.ownerSVGElement) {
            return getTextAlternativeInternal(child, {
              ...childOptions,
              embeddedInLabelledBy: { element: child, hidden: isElementHiddenForAria(child) }
            });
          }
        }
      }
      if (element.ownerSVGElement && tagName === "A") {
        const title = element.getAttribute("xlink:title") || "";
        if (trimFlatString(title)) {
          options.visitedElements.add(element);
          return title;
        }
      }
    }
    const shouldNameFromContentForSummary = tagName === "SUMMARY" && !["presentation", "none"].includes(role);
    if (allowsNameFromContent(role, options.embeddedInTargetElement === "descendant") || shouldNameFromContentForSummary || !!options.embeddedInLabelledBy || !!options.embeddedInDescribedBy || !!options.embeddedInLabel || !!options.embeddedInNativeTextAlternative) {
      options.visitedElements.add(element);
      const accessibleName = innerAccumulatedElementText(element, childOptions);
      const maybeTrimmedAccessibleName = options.embeddedInTargetElement === "self" ? trimFlatString(accessibleName) : accessibleName;
      if (maybeTrimmedAccessibleName)
        return accessibleName;
    }
    if (!["presentation", "none"].includes(role) || tagName === "IFRAME") {
      options.visitedElements.add(element);
      const title = element.getAttribute("title") || "";
      if (trimFlatString(title))
        return title;
    }
    options.visitedElements.add(element);
    return "";
  }
  function innerAccumulatedElementText(element, options) {
    const tokens = [];
    const visit = (node, skipSlotted) => {
      var _a;
      if (skipSlotted && node.assignedSlot)
        return;
      if (node.nodeType === 1) {
        const display = ((_a = getElementComputedStyle(node)) == null ? void 0 : _a.display) || "inline";
        let token = getTextAlternativeInternal(node, options);
        if (display !== "inline" || node.nodeName === "BR")
          token = " " + token + " ";
        tokens.push(token);
      } else if (node.nodeType === 3) {
        tokens.push(node.textContent || "");
      }
    };
    tokens.push(getPseudoContent(element, "::before"));
    const assignedNodes = element.nodeName === "SLOT" ? element.assignedNodes() : [];
    if (assignedNodes.length) {
      for (const child of assignedNodes)
        visit(child, false);
    } else {
      for (let child = element.firstChild; child; child = child.nextSibling)
        visit(child, true);
      if (element.shadowRoot) {
        for (let child = element.shadowRoot.firstChild; child; child = child.nextSibling)
          visit(child, true);
      }
      for (const owned of getIdRefs(element, element.getAttribute("aria-owns")))
        visit(owned, true);
    }
    tokens.push(getPseudoContent(element, "::after"));
    return tokens.join("");
  }
  var kAriaSelectedRoles = ["gridcell", "option", "row", "tab", "rowheader", "columnheader", "treeitem"];
  function getAriaSelected(element) {
    if (elementSafeTagName(element) === "OPTION")
      return element.selected;
    if (kAriaSelectedRoles.includes(getAriaRole(element) || ""))
      return getAriaBoolean(element.getAttribute("aria-selected")) === true;
    return false;
  }
  var kAriaCheckedRoles = ["checkbox", "menuitemcheckbox", "option", "radio", "switch", "menuitemradio", "treeitem"];
  function getAriaChecked(element) {
    const result = getChecked(element, true);
    return result === "error" ? false : result;
  }
  function getChecked(element, allowMixed) {
    const tagName = elementSafeTagName(element);
    if (allowMixed && tagName === "INPUT" && element.indeterminate)
      return "mixed";
    if (tagName === "INPUT" && ["checkbox", "radio"].includes(element.type))
      return element.checked;
    if (kAriaCheckedRoles.includes(getAriaRole(element) || "")) {
      const checked = element.getAttribute("aria-checked");
      if (checked === "true")
        return true;
      if (allowMixed && checked === "mixed")
        return "mixed";
      return false;
    }
    return "error";
  }
  var kAriaPressedRoles = ["button"];
  function getAriaPressed(element) {
    if (kAriaPressedRoles.includes(getAriaRole(element) || "")) {
      const pressed = element.getAttribute("aria-pressed");
      if (pressed === "true")
        return true;
      if (pressed === "mixed")
        return "mixed";
    }
    return false;
  }
  var kAriaExpandedRoles = ["application", "button", "checkbox", "combobox", "gridcell", "link", "listbox", "menuitem", "row", "rowheader", "tab", "treeitem", "columnheader", "menuitemcheckbox", "menuitemradio", "rowheader", "switch"];
  function getAriaExpanded(element) {
    if (elementSafeTagName(element) === "DETAILS")
      return element.open;
    if (kAriaExpandedRoles.includes(getAriaRole(element) || "")) {
      const expanded = element.getAttribute("aria-expanded");
      if (expanded === null)
        return void 0;
      if (expanded === "true")
        return true;
      return false;
    }
    return void 0;
  }
  var kAriaLevelRoles = ["heading", "listitem", "row", "treeitem"];
  function getAriaLevel(element) {
    const native = { "H1": 1, "H2": 2, "H3": 3, "H4": 4, "H5": 5, "H6": 6 }[elementSafeTagName(element)];
    if (native)
      return native;
    if (kAriaLevelRoles.includes(getAriaRole(element) || "")) {
      const attr = element.getAttribute("aria-level");
      const value = attr === null ? Number.NaN : Number(attr);
      if (Number.isInteger(value) && value >= 1)
        return value;
    }
    return 0;
  }
  var kAriaDisabledRoles = ["application", "button", "composite", "gridcell", "group", "input", "link", "menuitem", "scrollbar", "separator", "tab", "checkbox", "columnheader", "combobox", "grid", "listbox", "menu", "menubar", "menuitemcheckbox", "menuitemradio", "option", "radio", "radiogroup", "row", "rowheader", "searchbox", "select", "slider", "spinbutton", "switch", "tablist", "textbox", "toolbar", "tree", "treegrid", "treeitem"];
  function getAriaDisabled(element) {
    return isNativelyDisabled(element) || hasExplicitAriaDisabled(element);
  }
  function isNativelyDisabled(element) {
    const isNativeFormControl = ["BUTTON", "INPUT", "SELECT", "TEXTAREA", "OPTION", "OPTGROUP"].includes(element.tagName);
    return isNativeFormControl && (element.hasAttribute("disabled") || belongsToDisabledFieldSet(element));
  }
  function belongsToDisabledFieldSet(element) {
    const fieldSetElement = element == null ? void 0 : element.closest("FIELDSET[DISABLED]");
    if (!fieldSetElement)
      return false;
    const legendElement = fieldSetElement.querySelector(":scope > LEGEND");
    return !legendElement || !legendElement.contains(element);
  }
  function hasExplicitAriaDisabled(element, isAncestor = false) {
    if (!element)
      return false;
    if (isAncestor || kAriaDisabledRoles.includes(getAriaRole(element) || "")) {
      const attribute = (element.getAttribute("aria-disabled") || "").toLowerCase();
      if (attribute === "true")
        return true;
      if (attribute === "false")
        return false;
      return hasExplicitAriaDisabled(parentElementOrShadowHost(element), true);
    }
    return false;
  }
  function getAccessibleNameFromAssociatedLabels(labels, options) {
    return [...labels].map((label) => getTextAlternativeInternal(label, {
      ...options,
      embeddedInLabel: { element: label, hidden: isElementHiddenForAria(label) },
      embeddedInNativeTextAlternative: void 0,
      embeddedInLabelledBy: void 0,
      embeddedInDescribedBy: void 0,
      embeddedInTargetElement: void 0
    })).filter((accessibleName) => !!accessibleName).join(" ");
  }
  var cacheAccessibleName;
  var cacheAccessibleNameHidden;
  var cacheAccessibleDescription;
  var cacheAccessibleDescriptionHidden;
  var cacheAccessibleErrorMessage;
  var cacheIsHidden;
  var cachePseudoContentBefore;
  var cachePseudoContentAfter;
  var cachesCounter = 0;
  function beginAriaCaches() {
    ++cachesCounter;
    cacheAccessibleName != null ? cacheAccessibleName : cacheAccessibleName = new Map();
    cacheAccessibleNameHidden != null ? cacheAccessibleNameHidden : cacheAccessibleNameHidden = new Map();
    cacheAccessibleDescription != null ? cacheAccessibleDescription : cacheAccessibleDescription = new Map();
    cacheAccessibleDescriptionHidden != null ? cacheAccessibleDescriptionHidden : cacheAccessibleDescriptionHidden = new Map();
    cacheAccessibleErrorMessage != null ? cacheAccessibleErrorMessage : cacheAccessibleErrorMessage = new Map();
    cacheIsHidden != null ? cacheIsHidden : cacheIsHidden = new Map();
    cachePseudoContentBefore != null ? cachePseudoContentBefore : cachePseudoContentBefore = new Map();
    cachePseudoContentAfter != null ? cachePseudoContentAfter : cachePseudoContentAfter = new Map();
  }
  function endAriaCaches() {
    if (!--cachesCounter) {
      cacheAccessibleName = void 0;
      cacheAccessibleNameHidden = void 0;
      cacheAccessibleDescription = void 0;
      cacheAccessibleDescriptionHidden = void 0;
      cacheAccessibleErrorMessage = void 0;
      cacheIsHidden = void 0;
      cachePseudoContentBefore = void 0;
      cachePseudoContentAfter = void 0;
    }
  }
  var inputTypeToRole = {
    "button": "button",
    "checkbox": "checkbox",
    "image": "button",
    "number": "spinbutton",
    "radio": "radio",
    "range": "slider",
    "reset": "button",
    "submit": "button"
  };

  // src/browser/snapshot/yaml.ts
  function yamlEscapeKeyIfNeeded(str) {
    if (!yamlStringNeedsQuotes(str))
      return str;
    return `'` + str.replace(/'/g, `''`) + `'`;
  }
  function yamlEscapeValueIfNeeded(str) {
    if (!yamlStringNeedsQuotes(str))
      return str;
    return '"' + str.replace(/[\\"\x00-\x1f\x7f-\x9f]/g, (c) => {
      switch (c) {
        case "\\":
          return "\\\\";
        case '"':
          return '\\"';
        case "\b":
          return "\\b";
        case "\f":
          return "\\f";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "	":
          return "\\t";
        default:
          const code = c.charCodeAt(0);
          return "\\x" + code.toString(16).padStart(2, "0");
      }
    }) + '"';
  }
  function yamlStringNeedsQuotes(str) {
    if (str.length === 0)
      return true;
    if (/^\s|\s$/.test(str))
      return true;
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(str))
      return true;
    if (/^-/.test(str))
      return true;
    if (/[\n:](\s|$)/.test(str))
      return true;
    if (/\s#/.test(str))
      return true;
    if (/[\n\r]/.test(str))
      return true;
    if (/^[&*\],?!>|@"'#%]/.test(str))
      return true;
    if (/[{}`]/.test(str))
      return true;
    if (/^\[/.test(str))
      return true;
    if (!isNaN(Number(str)) || ["y", "n", "yes", "no", "true", "false", "on", "off", "null"].includes(str.toLowerCase()))
      return true;
    return false;
  }

  // src/browser/snapshot/ariaSnapshot.ts
  function generateAriaTree(rootElement, generation) {
    const visited = new Set();
    const snapshot = {
      root: { role: "fragment", name: "", children: [], element: rootElement, props: {} },
      elements: new Map(),
      generation,
      ids: new Map()
    };
    const addElement = (element) => {
      const id = snapshot.elements.size + 1;
      snapshot.elements.set(id, element);
      snapshot.ids.set(element, id);
    };
    addElement(rootElement);
    const visit = (ariaNode, node) => {
      if (visited.has(node))
        return;
      visited.add(node);
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
        const text = node.nodeValue;
        if (ariaNode.role !== "textbox" && text)
          ariaNode.children.push(node.nodeValue || "");
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE)
        return;
      const element = node;
      if (isElementHiddenForAria(element))
        return;
      const ariaChildren = [];
      if (element.hasAttribute("aria-owns")) {
        const ids = element.getAttribute("aria-owns").split(/\s+/);
        for (const id of ids) {
          const ownedElement = rootElement.ownerDocument.getElementById(id);
          if (ownedElement)
            ariaChildren.push(ownedElement);
        }
      }
      addElement(element);
      const childAriaNode = toAriaNode(element);
      if (childAriaNode)
        ariaNode.children.push(childAriaNode);
      processElement(childAriaNode || ariaNode, element, ariaChildren);
    };
    function processElement(ariaNode, element, ariaChildren = []) {
      var _a;
      const display = ((_a = getElementComputedStyle(element)) == null ? void 0 : _a.display) || "inline";
      const treatAsBlock = display !== "inline" || element.nodeName === "BR" ? " " : "";
      if (treatAsBlock)
        ariaNode.children.push(treatAsBlock);
      ariaNode.children.push(getPseudoContent(element, "::before"));
      const assignedNodes = element.nodeName === "SLOT" ? element.assignedNodes() : [];
      if (assignedNodes.length) {
        for (const child of assignedNodes)
          visit(ariaNode, child);
      } else {
        for (let child = element.firstChild; child; child = child.nextSibling) {
          if (!child.assignedSlot)
            visit(ariaNode, child);
        }
        if (element.shadowRoot) {
          for (let child = element.shadowRoot.firstChild; child; child = child.nextSibling)
            visit(ariaNode, child);
        }
      }
      for (const child of ariaChildren)
        visit(ariaNode, child);
      ariaNode.children.push(getPseudoContent(element, "::after"));
      if (treatAsBlock)
        ariaNode.children.push(treatAsBlock);
      if (ariaNode.children.length === 1 && ariaNode.name === ariaNode.children[0])
        ariaNode.children = [];
      if (ariaNode.role === "link" && element.hasAttribute("href")) {
        const href = element.getAttribute("href");
        ariaNode.props["url"] = href;
      }
    }
    beginAriaCaches();
    try {
      visit(snapshot.root, rootElement);
    } finally {
      endAriaCaches();
    }
    normalizeStringChildren(snapshot.root);
    return snapshot;
  }
  function toAriaNode(element) {
    if (element.nodeName === "IFRAME")
      return { role: "iframe", name: "", children: [], props: {}, element };
    const role = getAriaRole(element);
    if (!role || role === "presentation" || role === "none")
      return null;
    const name = normalizeWhiteSpace(getElementAccessibleName(element, false) || "");
    const result = { role, name, children: [], props: {}, element };
    if (kAriaCheckedRoles.includes(role))
      result.checked = getAriaChecked(element);
    if (kAriaDisabledRoles.includes(role))
      result.disabled = getAriaDisabled(element);
    if (kAriaExpandedRoles.includes(role))
      result.expanded = getAriaExpanded(element);
    if (kAriaLevelRoles.includes(role))
      result.level = getAriaLevel(element);
    if (kAriaPressedRoles.includes(role))
      result.pressed = getAriaPressed(element);
    if (kAriaSelectedRoles.includes(role))
      result.selected = getAriaSelected(element);
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      if (element.type !== "checkbox" && element.type !== "radio" && (element.type !== "file" || getGlobalOptions().inputFileRoleTextbox))
        result.children = [element.value];
    }
    return result;
  }
  function normalizeStringChildren(rootA11yNode) {
    const flushChildren = (buffer, normalizedChildren) => {
      if (!buffer.length)
        return;
      const text = normalizeWhiteSpace(buffer.join(""));
      if (text)
        normalizedChildren.push(text);
      buffer.length = 0;
    };
    const visit = (ariaNode) => {
      const normalizedChildren = [];
      const buffer = [];
      for (const child of ariaNode.children || []) {
        if (typeof child === "string") {
          buffer.push(child);
        } else {
          flushChildren(buffer, normalizedChildren);
          visit(child);
          normalizedChildren.push(child);
        }
      }
      flushChildren(buffer, normalizedChildren);
      ariaNode.children = normalizedChildren.length ? normalizedChildren : [];
      if (ariaNode.children.length === 1 && ariaNode.children[0] === ariaNode.name)
        ariaNode.children = [];
    };
    visit(rootA11yNode);
  }
  function renderAriaTree(ariaSnapshot, options) {
    const lines = [];
    const includeText = (options == null ? void 0 : options.mode) === "regex" ? textContributesInfo : () => true;
    const renderString = (options == null ? void 0 : options.mode) === "regex" ? convertToBestGuessRegex : (str) => str;
    const visit = (ariaNode2, parentAriaNode, indent) => {
      if (typeof ariaNode2 === "string") {
        if (parentAriaNode && !includeText(parentAriaNode, ariaNode2))
          return;
        const text = yamlEscapeValueIfNeeded(renderString(ariaNode2));
        if (text)
          lines.push(indent + "- text: " + text);
        return;
      }
      let key = ariaNode2.role;
      if (ariaNode2.name && ariaNode2.name.length <= 900) {
        const name = renderString(ariaNode2.name);
        if (name) {
          const stringifiedName = name.startsWith("/") && name.endsWith("/") ? name : JSON.stringify(name);
          key += " " + stringifiedName;
        }
      }
      if (ariaNode2.checked === "mixed")
        key += ` [checked=mixed]`;
      if (ariaNode2.checked === true)
        key += ` [checked]`;
      if (ariaNode2.disabled)
        key += ` [disabled]`;
      if (ariaNode2.expanded)
        key += ` [expanded]`;
      if (ariaNode2.level)
        key += ` [level=${ariaNode2.level}]`;
      if (ariaNode2.pressed === "mixed")
        key += ` [pressed=mixed]`;
      if (ariaNode2.pressed === true)
        key += ` [pressed]`;
      if (ariaNode2.selected === true)
        key += ` [selected]`;
      if (options == null ? void 0 : options.ref) {
        const id = ariaSnapshot.ids.get(ariaNode2.element);
        if (id)
          key += ` [ref=s${ariaSnapshot.generation}e${id}]`;
      }
      const escapedKey = indent + "- " + yamlEscapeKeyIfNeeded(key);
      const hasProps = !!Object.keys(ariaNode2.props).length;
      if (!ariaNode2.children.length && !hasProps) {
        lines.push(escapedKey);
      } else if (ariaNode2.children.length === 1 && typeof ariaNode2.children[0] === "string" && !hasProps) {
        const text = includeText(ariaNode2, ariaNode2.children[0]) ? renderString(ariaNode2.children[0]) : null;
        if (text)
          lines.push(escapedKey + ": " + yamlEscapeValueIfNeeded(text));
        else
          lines.push(escapedKey);
      } else {
        lines.push(escapedKey + ":");
        for (const [name, value] of Object.entries(ariaNode2.props))
          lines.push(indent + "  - /" + name + ": " + yamlEscapeValueIfNeeded(value));
        for (const child of ariaNode2.children || [])
          visit(child, ariaNode2, indent + "  ");
      }
    };
    const ariaNode = ariaSnapshot.root;
    if (ariaNode.role === "fragment") {
      for (const child of ariaNode.children || [])
        visit(child, ariaNode, "");
    } else {
      visit(ariaNode, null, "");
    }
    return lines.join("\n");
  }
  function convertToBestGuessRegex(text) {
    const dynamicContent = [
      // 2mb
      { regex: /\b[\d,.]+[bkmBKM]+\b/, replacement: "[\\d,.]+[bkmBKM]+" },
      // 2ms, 20s
      { regex: /\b\d+[hmsp]+\b/, replacement: "\\d+[hmsp]+" },
      { regex: /\b[\d,.]+[hmsp]+\b/, replacement: "[\\d,.]+[hmsp]+" },
      // Do not replace single digits with regex by default.
      // 2+ digits: [Issue 22, 22.3, 2.33, 2,333]
      { regex: /\b\d+,\d+\b/, replacement: "\\d+,\\d+" },
      { regex: /\b\d+\.\d{2,}\b/, replacement: "\\d+\\.\\d+" },
      { regex: /\b\d{2,}\.\d+\b/, replacement: "\\d+\\.\\d+" },
      { regex: /\b\d{2,}\b/, replacement: "\\d+" }
    ];
    let pattern = "";
    let lastIndex = 0;
    const combinedRegex = new RegExp(dynamicContent.map((r) => "(" + r.regex.source + ")").join("|"), "g");
    text.replace(combinedRegex, (match, ...args) => {
      const offset = args[args.length - 2];
      const groups = args.slice(0, -2);
      pattern += escapeRegExp(text.slice(lastIndex, offset));
      for (let i = 0; i < groups.length; i++) {
        if (groups[i]) {
          const { replacement } = dynamicContent[i];
          pattern += replacement;
          break;
        }
      }
      lastIndex = offset + match.length;
      return match;
    });
    if (!pattern)
      return text;
    pattern += escapeRegExp(text.slice(lastIndex));
    return String(new RegExp(pattern));
  }
  function textContributesInfo(node, text) {
    if (!text.length)
      return false;
    if (!node.name)
      return true;
    if (node.name.length > text.length)
      return false;
    const substr = text.length <= 200 && node.name.length <= 200 ? longestCommonSubstring(text, node.name) : "";
    let filtered = text;
    while (substr && filtered.includes(substr))
      filtered = filtered.replace(substr, "");
    return filtered.trim().length / text.length > 0.1;
  }

  // src/browser/snapshot/injectedScript.ts
  var InjectedScript = class {
    constructor(window2) {
      __publicField(this, "utils", {
        builtins: builtins()
      });
      __publicField(this, "_lastAriaSnapshot");
      __publicField(this, "window");
      __publicField(this, "document");
      this.window = window2;
      this.document = window2.document;
      this.utils.builtins = builtins(window2);
      this.window.__injectedScript = this;
    }
    ariaSnapshot(node, options) {
      var _a;
      if (node.nodeType !== Node.ELEMENT_NODE)
        throw this.createStacklessError("Can only capture aria snapshot of Element nodes.");
      const generation = (((_a = this._lastAriaSnapshot) == null ? void 0 : _a.generation) || 0) + 1;
      this._lastAriaSnapshot = generateAriaTree(node, generation);
      return renderAriaTree(this._lastAriaSnapshot, options);
    }
    ariaSnapshotElement(snapshot, elementId) {
      return snapshot.elements.get(elementId) || null;
    }
    createStacklessError(message) {
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
    getElementByAriaRef(selector) {
      var _a;
      const match = selector.match(/^s(\d+)e(\d+)$/);
      if (!match) {
        console.error("Invalid aria-ref selector format. Expected s<number>e<number>, got:", selector);
        return null;
      }
      const [, generationStr, elementIdStr] = match;
      const generation = parseInt(generationStr, 10);
      const elementId = parseInt(elementIdStr, 10);
      if (!this._lastAriaSnapshot) {
        console.error("No aria snapshot available to resolve ref:", selector);
        return null;
      }
      if (this._lastAriaSnapshot.generation !== generation) {
        console.warn(`Stale aria-ref: Snapshot generation is ${this._lastAriaSnapshot.generation}, but selector used generation ${generation}. Ref: ${selector}`);
        return null;
      }
      const element = (_a = this._lastAriaSnapshot.elements) == null ? void 0 : _a.get(elementId);
      if (!element) {
        console.warn(`Aria-ref element not found in snapshot: ${selector}`);
        return null;
      }
      if (!element.isConnected) {
        console.warn(`Aria-ref element is no longer connected to the DOM: ${selector}`);
        return null;
      }
      return element;
    }
  };
  function getOrCreateInjectedScript() {
    if (!window.__injectedScript) {
      new InjectedScript(window);
    }
    return window.__injectedScript;
  }
  function createAriaSnapshot(element, options) {
    const injectedScript = getOrCreateInjectedScript();
    return injectedScript.ariaSnapshot(element, options);
  }
  if (typeof window !== "undefined") {
    window.InjectedScript = InjectedScript;
    window.createAriaSnapshot = createAriaSnapshot;
  }
  return __toCommonJS(injectedScript_exports);
})();

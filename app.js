/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 291:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "createFocusTrap": () => (/* binding */ createFocusTrap)
});

;// CONCATENATED MODULE: ./node_modules/tabbable/dist/index.esm.js
/*!
* tabbable 5.3.3
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
var candidateSelectors = ['input', 'select', 'textarea', 'a[href]', 'button', '[tabindex]:not(slot)', 'audio[controls]', 'video[controls]', '[contenteditable]:not([contenteditable="false"])', 'details>summary:first-of-type', 'details'];
var candidateSelector = /* #__PURE__ */candidateSelectors.join(',');
var NoElement = typeof Element === 'undefined';
var matches = NoElement ? function () {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
var getRootNode = !NoElement && Element.prototype.getRootNode ? function (element) {
  return element.getRootNode();
} : function (element) {
  return element.ownerDocument;
};
/**
 * @param {Element} el container to check in
 * @param {boolean} includeContainer add container to check
 * @param {(node: Element) => boolean} filter filter candidates
 * @returns {Element[]}
 */

var getCandidates = function getCandidates(el, includeContainer, filter) {
  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));

  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }

  candidates = candidates.filter(filter);
  return candidates;
};
/**
 * @callback GetShadowRoot
 * @param {Element} element to check for shadow root
 * @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
 */

/**
 * @callback ShadowRootFilter
 * @param {Element} shadowHostNode the element which contains shadow content
 * @returns {boolean} true if a shadow root could potentially contain valid candidates.
 */

/**
 * @typedef {Object} CandidatesScope
 * @property {Element} scope contains inner candidates
 * @property {Element[]} candidates
 */

/**
 * @typedef {Object} IterativeOptions
 * @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
 *  if a function, implies shadow support is enabled and either returns the shadow root of an element
 *  or a boolean stating if it has an undisclosed shadow root
 * @property {(node: Element) => boolean} filter filter candidates
 * @property {boolean} flatten if true then result will flatten any CandidatesScope into the returned list
 * @property {ShadowRootFilter} shadowRootFilter filter shadow roots;
 */

/**
 * @param {Element[]} elements list of element containers to match candidates from
 * @param {boolean} includeContainer add container list to check
 * @param {IterativeOptions} options
 * @returns {Array.<Element|CandidatesScope>}
 */


var getCandidatesIteratively = function getCandidatesIteratively(elements, includeContainer, options) {
  var candidates = [];
  var elementsToCheck = Array.from(elements);

  while (elementsToCheck.length) {
    var element = elementsToCheck.shift();

    if (element.tagName === 'SLOT') {
      // add shadow dom slot scope (slot itself cannot be focusable)
      var assigned = element.assignedElements();
      var content = assigned.length ? assigned : element.children;
      var nestedCandidates = getCandidatesIteratively(content, true, options);

      if (options.flatten) {
        candidates.push.apply(candidates, nestedCandidates);
      } else {
        candidates.push({
          scope: element,
          candidates: nestedCandidates
        });
      }
    } else {
      // check candidate element
      var validCandidate = matches.call(element, candidateSelector);

      if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
        candidates.push(element);
      } // iterate over shadow content if possible


      var shadowRoot = element.shadowRoot || // check for an undisclosed shadow
      typeof options.getShadowRoot === 'function' && options.getShadowRoot(element);
      var validShadowRoot = !options.shadowRootFilter || options.shadowRootFilter(element);

      if (shadowRoot && validShadowRoot) {
        // add shadow dom scope IIF a shadow root node was given; otherwise, an undisclosed
        //  shadow exists, so look at light dom children as fallback BUT create a scope for any
        //  child candidates found because they're likely slotted elements (elements that are
        //  children of the web component element (which has the shadow), in the light dom, but
        //  slotted somewhere _inside_ the undisclosed shadow) -- the scope is created below,
        //  _after_ we return from this recursive call
        var _nestedCandidates = getCandidatesIteratively(shadowRoot === true ? element.children : shadowRoot.children, true, options);

        if (options.flatten) {
          candidates.push.apply(candidates, _nestedCandidates);
        } else {
          candidates.push({
            scope: element,
            candidates: _nestedCandidates
          });
        }
      } else {
        // there's not shadow so just dig into the element's (light dom) children
        //  __without__ giving the element special scope treatment
        elementsToCheck.unshift.apply(elementsToCheck, element.children);
      }
    }
  }

  return candidates;
};

var getTabindex = function getTabindex(node, isScope) {
  if (node.tabIndex < 0) {
    // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
    // `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
    // yet they are still part of the regular tab order; in FF, they get a default
    // `tabIndex` of 0; since Chrome still puts those elements in the regular tab
    // order, consider their tab index to be 0.
    // Also browsers do not return `tabIndex` correctly for contentEditable nodes;
    // so if they don't have a tabindex attribute specifically set, assume it's 0.
    //
    // isScope is positive for custom element with shadow root or slot that by default
    // have tabIndex -1, but need to be sorted by document order in order for their
    // content to be inserted in the correct position
    if ((isScope || /^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || node.isContentEditable) && isNaN(parseInt(node.getAttribute('tabindex'), 10))) {
      return 0;
    }
  }

  return node.tabIndex;
};

var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};

var isInput = function isInput(node) {
  return node.tagName === 'INPUT';
};

var isHiddenInput = function isHiddenInput(node) {
  return isInput(node) && node.type === 'hidden';
};

var isDetailsWithSummary = function isDetailsWithSummary(node) {
  var r = node.tagName === 'DETAILS' && Array.prototype.slice.apply(node.children).some(function (child) {
    return child.tagName === 'SUMMARY';
  });
  return r;
};

var getCheckedRadio = function getCheckedRadio(nodes, form) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};

var isTabbableRadio = function isTabbableRadio(node) {
  if (!node.name) {
    return true;
  }

  var radioScope = node.form || getRootNode(node);

  var queryRadios = function queryRadios(name) {
    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
  };

  var radioSet;

  if (typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function') {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s', err.message);
      return false;
    }
  }

  var checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};

var isRadio = function isRadio(node) {
  return isInput(node) && node.type === 'radio';
};

var isNonTabbableRadio = function isNonTabbableRadio(node) {
  return isRadio(node) && !isTabbableRadio(node);
};

var isZeroArea = function isZeroArea(node) {
  var _node$getBoundingClie = node.getBoundingClientRect(),
      width = _node$getBoundingClie.width,
      height = _node$getBoundingClie.height;

  return width === 0 && height === 0;
};

var isHidden = function isHidden(node, _ref) {
  var displayCheck = _ref.displayCheck,
      getShadowRoot = _ref.getShadowRoot;

  // NOTE: visibility will be `undefined` if node is detached from the document
  //  (see notes about this further down), which means we will consider it visible
  //  (this is legacy behavior from a very long way back)
  // NOTE: we check this regardless of `displayCheck="none"` because this is a
  //  _visibility_ check, not a _display_ check
  if (getComputedStyle(node).visibility === 'hidden') {
    return true;
  }

  var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;

  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
    return true;
  } // The root node is the shadow root if the node is in a shadow DOM; some document otherwise
  //  (but NOT _the_ document; see second 'If' comment below for more).
  // If rootNode is shadow root, it'll have a host, which is the element to which the shadow
  //  is attached, and the one we need to check if it's in the document or not (because the
  //  shadow, and all nodes it contains, is never considered in the document since shadows
  //  behave like self-contained DOMs; but if the shadow's HOST, which is part of the document,
  //  is hidden, or is not in the document itself but is detached, it will affect the shadow's
  //  visibility, including all the nodes it contains). The host could be any normal node,
  //  or a custom element (i.e. web component). Either way, that's the one that is considered
  //  part of the document, not the shadow root, nor any of its children (i.e. the node being
  //  tested).
  // If rootNode is not a shadow root, it won't have a host, and so rootNode should be the
  //  document (per the docs) and while it's a Document-type object, that document does not
  //  appear to be the same as the node's `ownerDocument` for some reason, so it's safer
  //  to ignore the rootNode at this point, and use `node.ownerDocument`. Otherwise,
  //  using `rootNode.contains(node)` will _always_ be true we'll get false-positives when
  //  node is actually detached.


  var nodeRootHost = getRootNode(node).host;
  var nodeIsAttached = (nodeRootHost === null || nodeRootHost === void 0 ? void 0 : nodeRootHost.ownerDocument.contains(nodeRootHost)) || node.ownerDocument.contains(node);

  if (!displayCheck || displayCheck === 'full') {
    if (typeof getShadowRoot === 'function') {
      // figure out if we should consider the node to be in an undisclosed shadow and use the
      //  'non-zero-area' fallback
      var originalNode = node;

      while (node) {
        var parentElement = node.parentElement;
        var rootNode = getRootNode(node);

        if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true // check if there's an undisclosed shadow
        ) {
          // node has an undisclosed shadow which means we can only treat it as a black box, so we
          //  fall back to a non-zero-area test
          return isZeroArea(node);
        } else if (node.assignedSlot) {
          // iterate up slot
          node = node.assignedSlot;
        } else if (!parentElement && rootNode !== node.ownerDocument) {
          // cross shadow boundary
          node = rootNode.host;
        } else {
          // iterate up normal dom
          node = parentElement;
        }
      }

      node = originalNode;
    } // else, `getShadowRoot` might be true, but all that does is enable shadow DOM support
    //  (i.e. it does not also presume that all nodes might have undisclosed shadows); or
    //  it might be a falsy value, which means shadow DOM support is disabled
    // Since we didn't find it sitting in an undisclosed shadow (or shadows are disabled)
    //  now we can just test to see if it would normally be visible or not, provided it's
    //  attached to the main document.
    // NOTE: We must consider case where node is inside a shadow DOM and given directly to
    //  `isTabbable()` or `isFocusable()` -- regardless of `getShadowRoot` option setting.


    if (nodeIsAttached) {
      // this works wherever the node is: if there's at least one client rect, it's
      //  somehow displayed; it also covers the CSS 'display: contents' case where the
      //  node itself is hidden in place of its contents; and there's no need to search
      //  up the hierarchy either
      return !node.getClientRects().length;
    } // Else, the node isn't attached to the document, which means the `getClientRects()`
    //  API will __always__ return zero rects (this can happen, for example, if React
    //  is used to render nodes onto a detached tree, as confirmed in this thread:
    //  https://github.com/facebook/react/issues/9117#issuecomment-284228870)
    //
    // It also means that even window.getComputedStyle(node).display will return `undefined`
    //  because styles are only computed for nodes that are in the document.
    //
    // NOTE: THIS HAS BEEN THE CASE FOR YEARS. It is not new, nor is it caused by tabbable
    //  somehow. Though it was never stated officially, anyone who has ever used tabbable
    //  APIs on nodes in detached containers has actually implicitly used tabbable in what
    //  was later (as of v5.2.0 on Apr 9, 2021) called `displayCheck="none"` mode -- essentially
    //  considering __everything__ to be visible because of the innability to determine styles.

  } else if (displayCheck === 'non-zero-area') {
    // NOTE: Even though this tests that the node's client rect is non-zero to determine
    //  whether it's displayed, and that a detached node will __always__ have a zero-area
    //  client rect, we don't special-case for whether the node is attached or not. In
    //  this mode, we do want to consider nodes that have a zero area to be hidden at all
    //  times, and that includes attached or not.
    return isZeroArea(node);
  } // visible, as far as we can tell, or per current `displayCheck` mode


  return false;
}; // form fields (nested) inside a disabled fieldset are not focusable/tabbable
//  unless they are in the _first_ <legend> element of the top-most disabled
//  fieldset


var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
    var parentNode = node.parentElement; // check if `node` is contained in a disabled <fieldset>

    while (parentNode) {
      if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
        // look for the first <legend> among the children of the disabled <fieldset>
        for (var i = 0; i < parentNode.children.length; i++) {
          var child = parentNode.children.item(i); // when the first <legend> (in document order) is found

          if (child.tagName === 'LEGEND') {
            // if its parent <fieldset> is not nested in another disabled <fieldset>,
            // return whether `node` is a descendant of its first <legend>
            return matches.call(parentNode, 'fieldset[disabled] *') ? true : !child.contains(node);
          }
        } // the disabled <fieldset> containing `node` has no <legend>


        return true;
      }

      parentNode = parentNode.parentElement;
    }
  } // else, node's tabbable/focusable state should not be affected by a fieldset's
  //  enabled/disabled state


  return false;
};

var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
  if (node.disabled || isHiddenInput(node) || isHidden(node, options) || // For a details element with a summary, the summary element gets the focus
  isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
    return false;
  }

  return true;
};

var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
  if (isNonTabbableRadio(node) || getTabindex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
    return false;
  }

  return true;
};

var isValidShadowRootTabbable = function isValidShadowRootTabbable(shadowHostNode) {
  var tabIndex = parseInt(shadowHostNode.getAttribute('tabindex'), 10);

  if (isNaN(tabIndex) || tabIndex >= 0) {
    return true;
  } // If a custom element has an explicit negative tabindex,
  // browsers will not allow tab targeting said element's children.


  return false;
};
/**
 * @param {Array.<Element|CandidatesScope>} candidates
 * @returns Element[]
 */


var sortByOrder = function sortByOrder(candidates) {
  var regularTabbables = [];
  var orderedTabbables = [];
  candidates.forEach(function (item, i) {
    var isScope = !!item.scope;
    var element = isScope ? item.scope : item;
    var candidateTabindex = getTabindex(element, isScope);
    var elements = isScope ? sortByOrder(item.candidates) : element;

    if (candidateTabindex === 0) {
      isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        item: item,
        isScope: isScope,
        content: elements
      });
    }
  });
  return orderedTabbables.sort(sortOrderedTabbables).reduce(function (acc, sortable) {
    sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
    return acc;
  }, []).concat(regularTabbables);
};

var tabbable = function tabbable(el, options) {
  options = options || {};
  var candidates;

  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([el], options.includeContainer, {
      filter: isNodeMatchingSelectorTabbable.bind(null, options),
      flatten: false,
      getShadowRoot: options.getShadowRoot,
      shadowRootFilter: isValidShadowRootTabbable
    });
  } else {
    candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
  }

  return sortByOrder(candidates);
};

var focusable = function focusable(el, options) {
  options = options || {};
  var candidates;

  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([el], options.includeContainer, {
      filter: isNodeMatchingSelectorFocusable.bind(null, options),
      flatten: true,
      getShadowRoot: options.getShadowRoot
    });
  } else {
    candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
  }

  return candidates;
};

var isTabbable = function isTabbable(node, options) {
  options = options || {};

  if (!node) {
    throw new Error('No node provided');
  }

  if (matches.call(node, candidateSelector) === false) {
    return false;
  }

  return isNodeMatchingSelectorTabbable(options, node);
};

var focusableCandidateSelector = /* #__PURE__ */candidateSelectors.concat('iframe').join(',');

var isFocusable = function isFocusable(node, options) {
  options = options || {};

  if (!node) {
    throw new Error('No node provided');
  }

  if (matches.call(node, focusableCandidateSelector) === false) {
    return false;
  }

  return isNodeMatchingSelectorFocusable(options, node);
};


//# sourceMappingURL=index.esm.js.map

;// CONCATENATED MODULE: ./node_modules/focus-trap/dist/focus-trap.esm.js
/*!
* focus-trap 6.9.4
* @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
*/


function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var activeFocusTraps = function () {
  var trapQueue = [];
  return {
    activateTrap: function activateTrap(trap) {
      if (trapQueue.length > 0) {
        var activeTrap = trapQueue[trapQueue.length - 1];

        if (activeTrap !== trap) {
          activeTrap.pause();
        }
      }

      var trapIndex = trapQueue.indexOf(trap);

      if (trapIndex === -1) {
        trapQueue.push(trap);
      } else {
        // move this existing trap to the front of the queue
        trapQueue.splice(trapIndex, 1);
        trapQueue.push(trap);
      }
    },
    deactivateTrap: function deactivateTrap(trap) {
      var trapIndex = trapQueue.indexOf(trap);

      if (trapIndex !== -1) {
        trapQueue.splice(trapIndex, 1);
      }

      if (trapQueue.length > 0) {
        trapQueue[trapQueue.length - 1].unpause();
      }
    }
  };
}();

var isSelectableInput = function isSelectableInput(node) {
  return node.tagName && node.tagName.toLowerCase() === 'input' && typeof node.select === 'function';
};

var isEscapeEvent = function isEscapeEvent(e) {
  return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
};

var isTabEvent = function isTabEvent(e) {
  return e.key === 'Tab' || e.keyCode === 9;
};

var delay = function delay(fn) {
  return setTimeout(fn, 0);
}; // Array.find/findIndex() are not supported on IE; this replicates enough
//  of Array.findIndex() for our needs


var findIndex = function findIndex(arr, fn) {
  var idx = -1;
  arr.every(function (value, i) {
    if (fn(value)) {
      idx = i;
      return false; // break
    }

    return true; // next
  });
  return idx;
};
/**
 * Get an option's value when it could be a plain value, or a handler that provides
 *  the value.
 * @param {*} value Option's value to check.
 * @param {...*} [params] Any parameters to pass to the handler, if `value` is a function.
 * @returns {*} The `value`, or the handler's returned value.
 */


var valueOrHandler = function valueOrHandler(value) {
  for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }

  return typeof value === 'function' ? value.apply(void 0, params) : value;
};

var getActualTarget = function getActualTarget(event) {
  // NOTE: If the trap is _inside_ a shadow DOM, event.target will always be the
  //  shadow host. However, event.target.composedPath() will be an array of
  //  nodes "clicked" from inner-most (the actual element inside the shadow) to
  //  outer-most (the host HTML document). If we have access to composedPath(),
  //  then use its first element; otherwise, fall back to event.target (and
  //  this only works for an _open_ shadow DOM; otherwise,
  //  composedPath()[0] === event.target always).
  return event.target.shadowRoot && typeof event.composedPath === 'function' ? event.composedPath()[0] : event.target;
};

var createFocusTrap = function createFocusTrap(elements, userOptions) {
  // SSR: a live trap shouldn't be created in this type of environment so this
  //  should be safe code to execute if the `document` option isn't specified
  var doc = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;

  var config = _objectSpread2({
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    delayInitialFocus: true
  }, userOptions);

  var state = {
    // containers given to createFocusTrap()
    // @type {Array<HTMLElement>}
    containers: [],
    // list of objects identifying tabbable nodes in `containers` in the trap
    // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
    //  is active, but the trap should never get to a state where there isn't at least one group
    //  with at least one tabbable node in it (that would lead to an error condition that would
    //  result in an error being thrown)
    // @type {Array<{
    //   container: HTMLElement,
    //   tabbableNodes: Array<HTMLElement>, // empty if none
    //   focusableNodes: Array<HTMLElement>, // empty if none
    //   firstTabbableNode: HTMLElement|null,
    //   lastTabbableNode: HTMLElement|null,
    //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
    // }>}
    containerGroups: [],
    // same order/length as `containers` list
    // references to objects in `containerGroups`, but only those that actually have
    //  tabbable nodes in them
    // NOTE: same order as `containers` and `containerGroups`, but __not necessarily__
    //  the same length
    tabbableGroups: [],
    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: false,
    paused: false,
    // timer ID for when delayInitialFocus is true and initial focus in this trap
    //  has been delayed during activation
    delayInitialFocusTimer: undefined
  };
  var trap; // eslint-disable-line prefer-const -- some private functions reference it, and its methods reference private functions, so we must declare here and define later

  /**
   * Gets a configuration option value.
   * @param {Object|undefined} configOverrideOptions If true, and option is defined in this set,
   *  value will be taken from this object. Otherwise, value will be taken from base configuration.
   * @param {string} optionName Name of the option whose value is sought.
   * @param {string|undefined} [configOptionName] Name of option to use __instead of__ `optionName`
   *  IIF `configOverrideOptions` is not defined. Otherwise, `optionName` is used.
   */

  var getOption = function getOption(configOverrideOptions, optionName, configOptionName) {
    return configOverrideOptions && configOverrideOptions[optionName] !== undefined ? configOverrideOptions[optionName] : config[configOptionName || optionName];
  };
  /**
   * Finds the index of the container that contains the element.
   * @param {HTMLElement} element
   * @returns {number} Index of the container in either `state.containers` or
   *  `state.containerGroups` (the order/length of these lists are the same); -1
   *  if the element isn't found.
   */


  var findContainerIndex = function findContainerIndex(element) {
    // NOTE: search `containerGroups` because it's possible a group contains no tabbable
    //  nodes, but still contains focusable nodes (e.g. if they all have `tabindex=-1`)
    //  and we still need to find the element in there
    return state.containerGroups.findIndex(function (_ref) {
      var container = _ref.container,
          tabbableNodes = _ref.tabbableNodes;
      return container.contains(element) || // fall back to explicit tabbable search which will take into consideration any
      //  web components if the `tabbableOptions.getShadowRoot` option was used for
      //  the trap, enabling shadow DOM support in tabbable (`Node.contains()` doesn't
      //  look inside web components even if open)
      tabbableNodes.find(function (node) {
        return node === element;
      });
    });
  };
  /**
   * Gets the node for the given option, which is expected to be an option that
   *  can be either a DOM node, a string that is a selector to get a node, `false`
   *  (if a node is explicitly NOT given), or a function that returns any of these
   *  values.
   * @param {string} optionName
   * @returns {undefined | false | HTMLElement | SVGElement} Returns
   *  `undefined` if the option is not specified; `false` if the option
   *  resolved to `false` (node explicitly not given); otherwise, the resolved
   *  DOM node.
   * @throws {Error} If the option is set, not `false`, and is not, or does not
   *  resolve to a node.
   */


  var getNodeForOption = function getNodeForOption(optionName) {
    var optionValue = config[optionName];

    if (typeof optionValue === 'function') {
      for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
      }

      optionValue = optionValue.apply(void 0, params);
    }

    if (optionValue === true) {
      optionValue = undefined; // use default value
    }

    if (!optionValue) {
      if (optionValue === undefined || optionValue === false) {
        return optionValue;
      } // else, empty string (invalid), null (invalid), 0 (invalid)


      throw new Error("`".concat(optionName, "` was specified but was not a node, or did not return a node"));
    }

    var node = optionValue; // could be HTMLElement, SVGElement, or non-empty string at this point

    if (typeof optionValue === 'string') {
      node = doc.querySelector(optionValue); // resolve to node, or null if fails

      if (!node) {
        throw new Error("`".concat(optionName, "` as selector refers to no known node"));
      }
    }

    return node;
  };

  var getInitialFocusNode = function getInitialFocusNode() {
    var node = getNodeForOption('initialFocus'); // false explicitly indicates we want no initialFocus at all

    if (node === false) {
      return false;
    }

    if (node === undefined) {
      // option not specified: use fallback options
      if (findContainerIndex(doc.activeElement) >= 0) {
        node = doc.activeElement;
      } else {
        var firstTabbableGroup = state.tabbableGroups[0];
        var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode; // NOTE: `fallbackFocus` option function cannot return `false` (not supported)

        node = firstTabbableNode || getNodeForOption('fallbackFocus');
      }
    }

    if (!node) {
      throw new Error('Your focus-trap needs to have at least one focusable element');
    }

    return node;
  };

  var updateTabbableNodes = function updateTabbableNodes() {
    state.containerGroups = state.containers.map(function (container) {
      var tabbableNodes = tabbable(container, config.tabbableOptions); // NOTE: if we have tabbable nodes, we must have focusable nodes; focusable nodes
      //  are a superset of tabbable nodes

      var focusableNodes = focusable(container, config.tabbableOptions);
      return {
        container: container,
        tabbableNodes: tabbableNodes,
        focusableNodes: focusableNodes,
        firstTabbableNode: tabbableNodes.length > 0 ? tabbableNodes[0] : null,
        lastTabbableNode: tabbableNodes.length > 0 ? tabbableNodes[tabbableNodes.length - 1] : null,

        /**
         * Finds the __tabbable__ node that follows the given node in the specified direction,
         *  in this container, if any.
         * @param {HTMLElement} node
         * @param {boolean} [forward] True if going in forward tab order; false if going
         *  in reverse.
         * @returns {HTMLElement|undefined} The next tabbable node, if any.
         */
        nextTabbableNode: function nextTabbableNode(node) {
          var forward = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
          // NOTE: If tabindex is positive (in order to manipulate the tab order separate
          //  from the DOM order), this __will not work__ because the list of focusableNodes,
          //  while it contains tabbable nodes, does not sort its nodes in any order other
          //  than DOM order, because it can't: Where would you place focusable (but not
          //  tabbable) nodes in that order? They have no order, because they aren't tabbale...
          // Support for positive tabindex is already broken and hard to manage (possibly
          //  not supportable, TBD), so this isn't going to make things worse than they
          //  already are, and at least makes things better for the majority of cases where
          //  tabindex is either 0/unset or negative.
          // FYI, positive tabindex issue: https://github.com/focus-trap/focus-trap/issues/375
          var nodeIdx = focusableNodes.findIndex(function (n) {
            return n === node;
          });

          if (nodeIdx < 0) {
            return undefined;
          }

          if (forward) {
            return focusableNodes.slice(nodeIdx + 1).find(function (n) {
              return isTabbable(n, config.tabbableOptions);
            });
          }

          return focusableNodes.slice(0, nodeIdx).reverse().find(function (n) {
            return isTabbable(n, config.tabbableOptions);
          });
        }
      };
    });
    state.tabbableGroups = state.containerGroups.filter(function (group) {
      return group.tabbableNodes.length > 0;
    }); // throw if no groups have tabbable nodes and we don't have a fallback focus node either

    if (state.tabbableGroups.length <= 0 && !getNodeForOption('fallbackFocus') // returning false not supported for this option
    ) {
      throw new Error('Your focus-trap must have at least one container with at least one tabbable node in it at all times');
    }
  };

  var tryFocus = function tryFocus(node) {
    if (node === false) {
      return;
    }

    if (node === doc.activeElement) {
      return;
    }

    if (!node || !node.focus) {
      tryFocus(getInitialFocusNode());
      return;
    }

    node.focus({
      preventScroll: !!config.preventScroll
    });
    state.mostRecentlyFocusedNode = node;

    if (isSelectableInput(node)) {
      node.select();
    }
  };

  var getReturnFocusNode = function getReturnFocusNode(previousActiveElement) {
    var node = getNodeForOption('setReturnFocus', previousActiveElement);
    return node ? node : node === false ? false : previousActiveElement;
  }; // This needs to be done on mousedown and touchstart instead of click
  // so that it precedes the focus event.


  var checkPointerDown = function checkPointerDown(e) {
    var target = getActualTarget(e);

    if (findContainerIndex(target) >= 0) {
      // allow the click since it ocurred inside the trap
      return;
    }

    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      // immediately deactivate the trap
      trap.deactivate({
        // if, on deactivation, we should return focus to the node originally-focused
        //  when the trap was activated (or the configured `setReturnFocus` node),
        //  then assume it's also OK to return focus to the outside node that was
        //  just clicked, causing deactivation, as long as that node is focusable;
        //  if it isn't focusable, then return focus to the original node focused
        //  on activation (or the configured `setReturnFocus` node)
        // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
        //  which will result in the outside click setting focus to the node
        //  that was clicked, whether it's focusable or not; by setting
        //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
        //  on activation (or the configured `setReturnFocus` node)
        returnFocus: config.returnFocusOnDeactivate && !isFocusable(target, config.tabbableOptions)
      });
      return;
    } // This is needed for mobile devices.
    // (If we'll only let `click` events through,
    // then on mobile they will be blocked anyways if `touchstart` is blocked.)


    if (valueOrHandler(config.allowOutsideClick, e)) {
      // allow the click outside the trap to take place
      return;
    } // otherwise, prevent the click


    e.preventDefault();
  }; // In case focus escapes the trap for some strange reason, pull it back in.


  var checkFocusIn = function checkFocusIn(e) {
    var target = getActualTarget(e);
    var targetContained = findContainerIndex(target) >= 0; // In Firefox when you Tab out of an iframe the Document is briefly focused.

    if (targetContained || target instanceof Document) {
      if (targetContained) {
        state.mostRecentlyFocusedNode = target;
      }
    } else {
      // escaped! pull it back in to where it just left
      e.stopImmediatePropagation();
      tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
    }
  }; // Hijack Tab events on the first and last focusable nodes of the trap,
  // in order to prevent focus from escaping. If it escapes for even a
  // moment it can end up scrolling the page and causing confusion so we
  // kind of need to capture the action at the keydown phase.


  var checkTab = function checkTab(e) {
    var target = getActualTarget(e);
    updateTabbableNodes();
    var destinationNode = null;

    if (state.tabbableGroups.length > 0) {
      // make sure the target is actually contained in a group
      // NOTE: the target may also be the container itself if it's focusable
      //  with tabIndex='-1' and was given initial focus
      var containerIndex = findContainerIndex(target);
      var containerGroup = containerIndex >= 0 ? state.containerGroups[containerIndex] : undefined;

      if (containerIndex < 0) {
        // target not found in any group: quite possible focus has escaped the trap,
        //  so bring it back in to...
        if (e.shiftKey) {
          // ...the last node in the last group
          destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
        } else {
          // ...the first node in the first group
          destinationNode = state.tabbableGroups[0].firstTabbableNode;
        }
      } else if (e.shiftKey) {
        // REVERSE
        // is the target the first tabbable node in a group?
        var startOfGroupIndex = findIndex(state.tabbableGroups, function (_ref2) {
          var firstTabbableNode = _ref2.firstTabbableNode;
          return target === firstTabbableNode;
        });

        if (startOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target, false))) {
          // an exception case where the target is either the container itself, or
          //  a non-tabbable node that was given focus (i.e. tabindex is negative
          //  and user clicked on it or node was programmatically given focus)
          //  and is not followed by any other tabbable node, in which
          //  case, we should handle shift+tab as if focus were on the container's
          //  first tabbable node, and go to the last tabbable node of the LAST group
          startOfGroupIndex = containerIndex;
        }

        if (startOfGroupIndex >= 0) {
          // YES: then shift+tab should go to the last tabbable node in the
          //  previous group (and wrap around to the last tabbable node of
          //  the LAST group if it's the first tabbable node of the FIRST group)
          var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
          var destinationGroup = state.tabbableGroups[destinationGroupIndex];
          destinationNode = destinationGroup.lastTabbableNode;
        }
      } else {
        // FORWARD
        // is the target the last tabbable node in a group?
        var lastOfGroupIndex = findIndex(state.tabbableGroups, function (_ref3) {
          var lastTabbableNode = _ref3.lastTabbableNode;
          return target === lastTabbableNode;
        });

        if (lastOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target))) {
          // an exception case where the target is the container itself, or
          //  a non-tabbable node that was given focus (i.e. tabindex is negative
          //  and user clicked on it or node was programmatically given focus)
          //  and is not followed by any other tabbable node, in which
          //  case, we should handle tab as if focus were on the container's
          //  last tabbable node, and go to the first tabbable node of the FIRST group
          lastOfGroupIndex = containerIndex;
        }

        if (lastOfGroupIndex >= 0) {
          // YES: then tab should go to the first tabbable node in the next
          //  group (and wrap around to the first tabbable node of the FIRST
          //  group if it's the last tabbable node of the LAST group)
          var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;

          var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
          destinationNode = _destinationGroup.firstTabbableNode;
        }
      }
    } else {
      // NOTE: the fallbackFocus option does not support returning false to opt-out
      destinationNode = getNodeForOption('fallbackFocus');
    }

    if (destinationNode) {
      e.preventDefault();
      tryFocus(destinationNode);
    } // else, let the browser take care of [shift+]tab and move the focus

  };

  var checkKey = function checkKey(e) {
    if (isEscapeEvent(e) && valueOrHandler(config.escapeDeactivates, e) !== false) {
      e.preventDefault();
      trap.deactivate();
      return;
    }

    if (isTabEvent(e)) {
      checkTab(e);
      return;
    }
  };

  var checkClick = function checkClick(e) {
    var target = getActualTarget(e);

    if (findContainerIndex(target) >= 0) {
      return;
    }

    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      return;
    }

    if (valueOrHandler(config.allowOutsideClick, e)) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
  }; //
  // EVENT LISTENERS
  //


  var addListeners = function addListeners() {
    if (!state.active) {
      return;
    } // There can be only one listening focus trap at a time


    activeFocusTraps.activateTrap(trap); // Delay ensures that the focused element doesn't capture the event
    // that caused the focus trap activation.

    state.delayInitialFocusTimer = config.delayInitialFocus ? delay(function () {
      tryFocus(getInitialFocusNode());
    }) : tryFocus(getInitialFocusNode());
    doc.addEventListener('focusin', checkFocusIn, true);
    doc.addEventListener('mousedown', checkPointerDown, {
      capture: true,
      passive: false
    });
    doc.addEventListener('touchstart', checkPointerDown, {
      capture: true,
      passive: false
    });
    doc.addEventListener('click', checkClick, {
      capture: true,
      passive: false
    });
    doc.addEventListener('keydown', checkKey, {
      capture: true,
      passive: false
    });
    return trap;
  };

  var removeListeners = function removeListeners() {
    if (!state.active) {
      return;
    }

    doc.removeEventListener('focusin', checkFocusIn, true);
    doc.removeEventListener('mousedown', checkPointerDown, true);
    doc.removeEventListener('touchstart', checkPointerDown, true);
    doc.removeEventListener('click', checkClick, true);
    doc.removeEventListener('keydown', checkKey, true);
    return trap;
  }; //
  // TRAP DEFINITION
  //


  trap = {
    get active() {
      return state.active;
    },

    get paused() {
      return state.paused;
    },

    activate: function activate(activateOptions) {
      if (state.active) {
        return this;
      }

      var onActivate = getOption(activateOptions, 'onActivate');
      var onPostActivate = getOption(activateOptions, 'onPostActivate');
      var checkCanFocusTrap = getOption(activateOptions, 'checkCanFocusTrap');

      if (!checkCanFocusTrap) {
        updateTabbableNodes();
      }

      state.active = true;
      state.paused = false;
      state.nodeFocusedBeforeActivation = doc.activeElement;

      if (onActivate) {
        onActivate();
      }

      var finishActivation = function finishActivation() {
        if (checkCanFocusTrap) {
          updateTabbableNodes();
        }

        addListeners();

        if (onPostActivate) {
          onPostActivate();
        }
      };

      if (checkCanFocusTrap) {
        checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
        return this;
      }

      finishActivation();
      return this;
    },
    deactivate: function deactivate(deactivateOptions) {
      if (!state.active) {
        return this;
      }

      var options = _objectSpread2({
        onDeactivate: config.onDeactivate,
        onPostDeactivate: config.onPostDeactivate,
        checkCanReturnFocus: config.checkCanReturnFocus
      }, deactivateOptions);

      clearTimeout(state.delayInitialFocusTimer); // noop if undefined

      state.delayInitialFocusTimer = undefined;
      removeListeners();
      state.active = false;
      state.paused = false;
      activeFocusTraps.deactivateTrap(trap);
      var onDeactivate = getOption(options, 'onDeactivate');
      var onPostDeactivate = getOption(options, 'onPostDeactivate');
      var checkCanReturnFocus = getOption(options, 'checkCanReturnFocus');
      var returnFocus = getOption(options, 'returnFocus', 'returnFocusOnDeactivate');

      if (onDeactivate) {
        onDeactivate();
      }

      var finishDeactivation = function finishDeactivation() {
        delay(function () {
          if (returnFocus) {
            tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
          }

          if (onPostDeactivate) {
            onPostDeactivate();
          }
        });
      };

      if (returnFocus && checkCanReturnFocus) {
        checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
        return this;
      }

      finishDeactivation();
      return this;
    },
    pause: function pause() {
      if (state.paused || !state.active) {
        return this;
      }

      state.paused = true;
      removeListeners();
      return this;
    },
    unpause: function unpause() {
      if (!state.paused || !state.active) {
        return this;
      }

      state.paused = false;
      updateTabbableNodes();
      addListeners();
      return this;
    },
    updateContainerElements: function updateContainerElements(containerElements) {
      var elementsAsArray = [].concat(containerElements).filter(Boolean);
      state.containers = elementsAsArray.map(function (element) {
        return typeof element === 'string' ? doc.querySelector(element) : element;
      });

      if (state.active) {
        updateTabbableNodes();
      }

      return this;
    }
  }; // initialize container elements

  trap.updateContainerElements(elements);
  return trap;
};


//# sourceMappingURL=focus-trap.esm.js.map


/***/ }),

/***/ 731:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.FORMAT_PLAIN = exports.FORMAT_HTML = exports.FORMATS = void 0;
var FORMAT_HTML = "html";
exports.FORMAT_HTML = FORMAT_HTML;
var FORMAT_PLAIN = "plain";
exports.FORMAT_PLAIN = FORMAT_PLAIN;
var FORMATS = [FORMAT_HTML, FORMAT_PLAIN];
exports.FORMATS = FORMATS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGT1JNQVRfSFRNTCIsIkZPUk1BVF9QTEFJTiIsIkZPUk1BVFMiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uc3RhbnRzL2Zvcm1hdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IEZPUk1BVF9IVE1MID0gXCJodG1sXCI7XHJcbmV4cG9ydCBjb25zdCBGT1JNQVRfUExBSU4gPSBcInBsYWluXCI7XHJcbmV4cG9ydCBjb25zdCBGT1JNQVRTID0gW0ZPUk1BVF9IVE1MLCBGT1JNQVRfUExBSU5dO1xyXG5leHBvcnQgdHlwZSBMb3JlbUZvcm1hdCA9IFwicGxhaW5cIiB8IFwiaHRtbFwiO1xyXG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLElBQU1BLFdBQVcsR0FBRyxNQUFwQjs7QUFDQSxJQUFNQyxZQUFZLEdBQUcsT0FBckI7O0FBQ0EsSUFBTUMsT0FBTyxHQUFHLENBQUNGLFdBQUQsRUFBY0MsWUFBZCxDQUFoQiJ9

/***/ }),

/***/ 670:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.LINE_ENDINGS = void 0;
var LINE_ENDINGS = {
  POSIX: "\n",
  WIN32: "\r\n"
};
exports.LINE_ENDINGS = LINE_ENDINGS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMSU5FX0VORElOR1MiLCJQT1NJWCIsIldJTjMyIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnN0YW50cy9saW5lRW5kaW5ncy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgTElORV9FTkRJTkdTID0ge1xyXG4gIFBPU0lYOiBcIlxcblwiLFxyXG4gIFdJTjMyOiBcIlxcclxcblwiLFxyXG59O1xyXG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLElBQU1BLFlBQVksR0FBRztFQUMxQkMsS0FBSyxFQUFFLElBRG1CO0VBRTFCQyxLQUFLLEVBQUU7QUFGbUIsQ0FBckIifQ==

/***/ }),

/***/ 3:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.SUPPORTED_PLATFORMS = void 0;
var SUPPORTED_PLATFORMS = {
  DARWIN: "darwin",
  LINUX: "linux",
  WIN32: "win32"
};
exports.SUPPORTED_PLATFORMS = SUPPORTED_PLATFORMS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTVVBQT1JURURfUExBVEZPUk1TIiwiREFSV0lOIiwiTElOVVgiLCJXSU4zMiJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25zdGFudHMvcGxhdGZvcm1zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBTVVBQT1JURURfUExBVEZPUk1TID0ge1xyXG4gIERBUldJTjogXCJkYXJ3aW5cIixcclxuICBMSU5VWDogXCJsaW51eFwiLFxyXG4gIFdJTjMyOiBcIndpbjMyXCIsXHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQU8sSUFBTUEsbUJBQW1CLEdBQUc7RUFDakNDLE1BQU0sRUFBRSxRQUR5QjtFQUVqQ0MsS0FBSyxFQUFFLE9BRjBCO0VBR2pDQyxLQUFLLEVBQUU7QUFIMEIsQ0FBNUIifQ==

/***/ }),

/***/ 755:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.UNIT_WORDS = exports.UNIT_WORD = exports.UNIT_SENTENCES = exports.UNIT_SENTENCE = exports.UNIT_PARAGRAPHS = exports.UNIT_PARAGRAPH = exports.UNITS = void 0;
var UNIT_WORDS = "words";
exports.UNIT_WORDS = UNIT_WORDS;
var UNIT_WORD = "word";
exports.UNIT_WORD = UNIT_WORD;
var UNIT_SENTENCES = "sentences";
exports.UNIT_SENTENCES = UNIT_SENTENCES;
var UNIT_SENTENCE = "sentence";
exports.UNIT_SENTENCE = UNIT_SENTENCE;
var UNIT_PARAGRAPHS = "paragraphs";
exports.UNIT_PARAGRAPHS = UNIT_PARAGRAPHS;
var UNIT_PARAGRAPH = "paragraph";
exports.UNIT_PARAGRAPH = UNIT_PARAGRAPH;
var UNITS = [UNIT_WORDS, UNIT_WORD, UNIT_SENTENCES, UNIT_SENTENCE, UNIT_PARAGRAPHS, UNIT_PARAGRAPH];
exports.UNITS = UNITS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVTklUX1dPUkRTIiwiVU5JVF9XT1JEIiwiVU5JVF9TRU5URU5DRVMiLCJVTklUX1NFTlRFTkNFIiwiVU5JVF9QQVJBR1JBUEhTIiwiVU5JVF9QQVJBR1JBUEgiLCJVTklUUyJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25zdGFudHMvdW5pdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IFVOSVRfV09SRFMgPSBcIndvcmRzXCI7XG5leHBvcnQgY29uc3QgVU5JVF9XT1JEID0gXCJ3b3JkXCI7XG5leHBvcnQgY29uc3QgVU5JVF9TRU5URU5DRVMgPSBcInNlbnRlbmNlc1wiO1xuZXhwb3J0IGNvbnN0IFVOSVRfU0VOVEVOQ0UgPSBcInNlbnRlbmNlXCI7XG5leHBvcnQgY29uc3QgVU5JVF9QQVJBR1JBUEhTID0gXCJwYXJhZ3JhcGhzXCI7XG5leHBvcnQgY29uc3QgVU5JVF9QQVJBR1JBUEggPSBcInBhcmFncmFwaFwiO1xuZXhwb3J0IGNvbnN0IFVOSVRTID0gW1xuICBVTklUX1dPUkRTLFxuICBVTklUX1dPUkQsXG4gIFVOSVRfU0VOVEVOQ0VTLFxuICBVTklUX1NFTlRFTkNFLFxuICBVTklUX1BBUkFHUkFQSFMsXG4gIFVOSVRfUEFSQUdSQVBILFxuXTtcbmV4cG9ydCB0eXBlIExvcmVtVW5pdCA9IFwid29yZHNcIiB8IFwid29yZFwiIHwgXCJzZW50ZW5jZXNcIiB8IFwic2VudGVuY2VcIiB8IFwicGFyYWdyYXBoc1wiIHwgXCJwYXJhZ3JhcGhcIjtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQU8sSUFBTUEsVUFBVSxHQUFHLE9BQW5COztBQUNBLElBQU1DLFNBQVMsR0FBRyxNQUFsQjs7QUFDQSxJQUFNQyxjQUFjLEdBQUcsV0FBdkI7O0FBQ0EsSUFBTUMsYUFBYSxHQUFHLFVBQXRCOztBQUNBLElBQU1DLGVBQWUsR0FBRyxZQUF4Qjs7QUFDQSxJQUFNQyxjQUFjLEdBQUcsV0FBdkI7O0FBQ0EsSUFBTUMsS0FBSyxHQUFHLENBQ25CTixVQURtQixFQUVuQkMsU0FGbUIsRUFHbkJDLGNBSG1CLEVBSW5CQyxhQUptQixFQUtuQkMsZUFMbUIsRUFNbkJDLGNBTm1CLENBQWQifQ==

/***/ }),

/***/ 749:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.WORDS = void 0;
var WORDS = ["ad", "adipisicing", "aliqua", "aliquip", "amet", "anim", "aute", "cillum", "commodo", "consectetur", "consequat", "culpa", "cupidatat", "deserunt", "do", "dolor", "dolore", "duis", "ea", "eiusmod", "elit", "enim", "esse", "est", "et", "eu", "ex", "excepteur", "exercitation", "fugiat", "id", "in", "incididunt", "ipsum", "irure", "labore", "laboris", "laborum", "Lorem", "magna", "minim", "mollit", "nisi", "non", "nostrud", "nulla", "occaecat", "officia", "pariatur", "proident", "qui", "quis", "reprehenderit", "sint", "sit", "sunt", "tempor", "ullamco", "ut", "velit", "veniam", "voluptate"];
exports.WORDS = WORDS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJXT1JEUyJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25zdGFudHMvd29yZHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IFdPUkRTID0gW1xyXG4gIFwiYWRcIixcclxuICBcImFkaXBpc2ljaW5nXCIsXHJcbiAgXCJhbGlxdWFcIixcclxuICBcImFsaXF1aXBcIixcclxuICBcImFtZXRcIixcclxuICBcImFuaW1cIixcclxuICBcImF1dGVcIixcclxuICBcImNpbGx1bVwiLFxyXG4gIFwiY29tbW9kb1wiLFxyXG4gIFwiY29uc2VjdGV0dXJcIixcclxuICBcImNvbnNlcXVhdFwiLFxyXG4gIFwiY3VscGFcIixcclxuICBcImN1cGlkYXRhdFwiLFxyXG4gIFwiZGVzZXJ1bnRcIixcclxuICBcImRvXCIsXHJcbiAgXCJkb2xvclwiLFxyXG4gIFwiZG9sb3JlXCIsXHJcbiAgXCJkdWlzXCIsXHJcbiAgXCJlYVwiLFxyXG4gIFwiZWl1c21vZFwiLFxyXG4gIFwiZWxpdFwiLFxyXG4gIFwiZW5pbVwiLFxyXG4gIFwiZXNzZVwiLFxyXG4gIFwiZXN0XCIsXHJcbiAgXCJldFwiLFxyXG4gIFwiZXVcIixcclxuICBcImV4XCIsXHJcbiAgXCJleGNlcHRldXJcIixcclxuICBcImV4ZXJjaXRhdGlvblwiLFxyXG4gIFwiZnVnaWF0XCIsXHJcbiAgXCJpZFwiLFxyXG4gIFwiaW5cIixcclxuICBcImluY2lkaWR1bnRcIixcclxuICBcImlwc3VtXCIsXHJcbiAgXCJpcnVyZVwiLFxyXG4gIFwibGFib3JlXCIsXHJcbiAgXCJsYWJvcmlzXCIsXHJcbiAgXCJsYWJvcnVtXCIsXHJcbiAgXCJMb3JlbVwiLFxyXG4gIFwibWFnbmFcIixcclxuICBcIm1pbmltXCIsXHJcbiAgXCJtb2xsaXRcIixcclxuICBcIm5pc2lcIixcclxuICBcIm5vblwiLFxyXG4gIFwibm9zdHJ1ZFwiLFxyXG4gIFwibnVsbGFcIixcclxuICBcIm9jY2FlY2F0XCIsXHJcbiAgXCJvZmZpY2lhXCIsXHJcbiAgXCJwYXJpYXR1clwiLFxyXG4gIFwicHJvaWRlbnRcIixcclxuICBcInF1aVwiLFxyXG4gIFwicXVpc1wiLFxyXG4gIFwicmVwcmVoZW5kZXJpdFwiLFxyXG4gIFwic2ludFwiLFxyXG4gIFwic2l0XCIsXHJcbiAgXCJzdW50XCIsXHJcbiAgXCJ0ZW1wb3JcIixcclxuICBcInVsbGFtY29cIixcclxuICBcInV0XCIsXHJcbiAgXCJ2ZWxpdFwiLFxyXG4gIFwidmVuaWFtXCIsXHJcbiAgXCJ2b2x1cHRhdGVcIixcclxuXTtcclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBTyxJQUFNQSxLQUFLLEdBQUcsQ0FDbkIsSUFEbUIsRUFFbkIsYUFGbUIsRUFHbkIsUUFIbUIsRUFJbkIsU0FKbUIsRUFLbkIsTUFMbUIsRUFNbkIsTUFObUIsRUFPbkIsTUFQbUIsRUFRbkIsUUFSbUIsRUFTbkIsU0FUbUIsRUFVbkIsYUFWbUIsRUFXbkIsV0FYbUIsRUFZbkIsT0FabUIsRUFhbkIsV0FibUIsRUFjbkIsVUFkbUIsRUFlbkIsSUFmbUIsRUFnQm5CLE9BaEJtQixFQWlCbkIsUUFqQm1CLEVBa0JuQixNQWxCbUIsRUFtQm5CLElBbkJtQixFQW9CbkIsU0FwQm1CLEVBcUJuQixNQXJCbUIsRUFzQm5CLE1BdEJtQixFQXVCbkIsTUF2Qm1CLEVBd0JuQixLQXhCbUIsRUF5Qm5CLElBekJtQixFQTBCbkIsSUExQm1CLEVBMkJuQixJQTNCbUIsRUE0Qm5CLFdBNUJtQixFQTZCbkIsY0E3Qm1CLEVBOEJuQixRQTlCbUIsRUErQm5CLElBL0JtQixFQWdDbkIsSUFoQ21CLEVBaUNuQixZQWpDbUIsRUFrQ25CLE9BbENtQixFQW1DbkIsT0FuQ21CLEVBb0NuQixRQXBDbUIsRUFxQ25CLFNBckNtQixFQXNDbkIsU0F0Q21CLEVBdUNuQixPQXZDbUIsRUF3Q25CLE9BeENtQixFQXlDbkIsT0F6Q21CLEVBMENuQixRQTFDbUIsRUEyQ25CLE1BM0NtQixFQTRDbkIsS0E1Q21CLEVBNkNuQixTQTdDbUIsRUE4Q25CLE9BOUNtQixFQStDbkIsVUEvQ21CLEVBZ0RuQixTQWhEbUIsRUFpRG5CLFVBakRtQixFQWtEbkIsVUFsRG1CLEVBbURuQixLQW5EbUIsRUFvRG5CLE1BcERtQixFQXFEbkIsZUFyRG1CLEVBc0RuQixNQXREbUIsRUF1RG5CLEtBdkRtQixFQXdEbkIsTUF4RG1CLEVBeURuQixRQXpEbUIsRUEwRG5CLFNBMURtQixFQTJEbkIsSUEzRG1CLEVBNERuQixPQTVEbUIsRUE2RG5CLFFBN0RtQixFQThEbkIsV0E5RG1CLENBQWQifQ==

/***/ }),

/***/ 380:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "LoremIpsum", ({
  enumerable: true,
  get: function get() {
    return _LoremIpsum["default"];
  }
}));
exports.loremIpsum = void 0;

var _formats = __webpack_require__(731);

var _units = __webpack_require__(755);

var _words = __webpack_require__(749);

var _LoremIpsum = _interopRequireDefault(__webpack_require__(935));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var loremIpsum = function loremIpsum() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$count = _ref.count,
      count = _ref$count === void 0 ? 1 : _ref$count,
      _ref$format = _ref.format,
      format = _ref$format === void 0 ? _formats.FORMAT_PLAIN : _ref$format,
      _ref$paragraphLowerBo = _ref.paragraphLowerBound,
      paragraphLowerBound = _ref$paragraphLowerBo === void 0 ? 3 : _ref$paragraphLowerBo,
      _ref$paragraphUpperBo = _ref.paragraphUpperBound,
      paragraphUpperBound = _ref$paragraphUpperBo === void 0 ? 7 : _ref$paragraphUpperBo,
      random = _ref.random,
      _ref$sentenceLowerBou = _ref.sentenceLowerBound,
      sentenceLowerBound = _ref$sentenceLowerBou === void 0 ? 5 : _ref$sentenceLowerBou,
      _ref$sentenceUpperBou = _ref.sentenceUpperBound,
      sentenceUpperBound = _ref$sentenceUpperBou === void 0 ? 15 : _ref$sentenceUpperBou,
      _ref$units = _ref.units,
      units = _ref$units === void 0 ? _units.UNIT_SENTENCES : _ref$units,
      _ref$words = _ref.words,
      words = _ref$words === void 0 ? _words.WORDS : _ref$words,
      _ref$suffix = _ref.suffix,
      suffix = _ref$suffix === void 0 ? "" : _ref$suffix;

  var options = {
    random: random,
    sentencesPerParagraph: {
      max: paragraphUpperBound,
      min: paragraphLowerBound
    },
    words: words,
    wordsPerSentence: {
      max: sentenceUpperBound,
      min: sentenceLowerBound
    }
  };
  var lorem = new _LoremIpsum["default"](options, format, suffix);

  switch (units) {
    case _units.UNIT_PARAGRAPHS:
    case _units.UNIT_PARAGRAPH:
      return lorem.generateParagraphs(count);

    case _units.UNIT_SENTENCES:
    case _units.UNIT_SENTENCE:
      return lorem.generateSentences(count);

    case _units.UNIT_WORDS:
    case _units.UNIT_WORD:
      return lorem.generateWords(count);

    default:
      return "";
  }
};

exports.loremIpsum = loremIpsum;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb3JlbUlwc3VtIiwiY291bnQiLCJmb3JtYXQiLCJGT1JNQVRfUExBSU4iLCJwYXJhZ3JhcGhMb3dlckJvdW5kIiwicGFyYWdyYXBoVXBwZXJCb3VuZCIsInJhbmRvbSIsInNlbnRlbmNlTG93ZXJCb3VuZCIsInNlbnRlbmNlVXBwZXJCb3VuZCIsInVuaXRzIiwiVU5JVF9TRU5URU5DRVMiLCJ3b3JkcyIsIldPUkRTIiwic3VmZml4Iiwib3B0aW9ucyIsInNlbnRlbmNlc1BlclBhcmFncmFwaCIsIm1heCIsIm1pbiIsIndvcmRzUGVyU2VudGVuY2UiLCJsb3JlbSIsIkxvcmVtSXBzdW0iLCJVTklUX1BBUkFHUkFQSFMiLCJVTklUX1BBUkFHUkFQSCIsImdlbmVyYXRlUGFyYWdyYXBocyIsIlVOSVRfU0VOVEVOQ0UiLCJnZW5lcmF0ZVNlbnRlbmNlcyIsIlVOSVRfV09SRFMiLCJVTklUX1dPUkQiLCJnZW5lcmF0ZVdvcmRzIl0sInNvdXJjZXMiOlsiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvcmVtRm9ybWF0LCBGT1JNQVRfUExBSU4gfSBmcm9tIFwiLi9jb25zdGFudHMvZm9ybWF0c1wiO1xyXG5pbXBvcnQge1xyXG4gIExvcmVtVW5pdCxcclxuICBVTklUX1BBUkFHUkFQSCxcclxuICBVTklUX1BBUkFHUkFQSFMsXHJcbiAgVU5JVF9TRU5URU5DRVMsXHJcbiAgVU5JVF9TRU5URU5DRSxcclxuICBVTklUX1dPUkRTLFxyXG4gIFVOSVRfV09SRCxcclxufSBmcm9tIFwiLi9jb25zdGFudHMvdW5pdHNcIjtcclxuaW1wb3J0IHsgV09SRFMgfSBmcm9tIFwiLi9jb25zdGFudHMvd29yZHNcIjtcclxuaW1wb3J0IHsgSVBybmcgfSBmcm9tIFwiLi9saWIvZ2VuZXJhdG9yXCI7XHJcbmltcG9ydCBMb3JlbUlwc3VtIGZyb20gXCIuL2xpYi9Mb3JlbUlwc3VtXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElMb3JlbUlwc3VtUGFyYW1zIHtcclxuICBjb3VudD86IG51bWJlcjtcclxuICBmb3JtYXQ/OiBMb3JlbUZvcm1hdDtcclxuICBwYXJhZ3JhcGhMb3dlckJvdW5kPzogbnVtYmVyO1xyXG4gIHBhcmFncmFwaFVwcGVyQm91bmQ/OiBudW1iZXI7XHJcbiAgcmFuZG9tPzogSVBybmc7XHJcbiAgc2VudGVuY2VMb3dlckJvdW5kPzogbnVtYmVyO1xyXG4gIHNlbnRlbmNlVXBwZXJCb3VuZD86IG51bWJlcjtcclxuICB1bml0cz86IExvcmVtVW5pdDtcclxuICB3b3Jkcz86IHN0cmluZ1tdO1xyXG4gIHN1ZmZpeD86IHN0cmluZztcclxufVxyXG5cclxuY29uc3QgbG9yZW1JcHN1bSA9ICh7XHJcbiAgY291bnQgPSAxLFxyXG4gIGZvcm1hdCA9IEZPUk1BVF9QTEFJTixcclxuICBwYXJhZ3JhcGhMb3dlckJvdW5kID0gMyxcclxuICBwYXJhZ3JhcGhVcHBlckJvdW5kID0gNyxcclxuICByYW5kb20sXHJcbiAgc2VudGVuY2VMb3dlckJvdW5kID0gNSxcclxuICBzZW50ZW5jZVVwcGVyQm91bmQgPSAxNSxcclxuICB1bml0cyA9IFVOSVRfU0VOVEVOQ0VTLFxyXG4gIHdvcmRzID0gV09SRFMsXHJcbiAgc3VmZml4ID0gXCJcIixcclxufTogSUxvcmVtSXBzdW1QYXJhbXMgPSB7fSk6IHN0cmluZyA9PiB7XHJcbiAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgIHJhbmRvbSxcclxuICAgIHNlbnRlbmNlc1BlclBhcmFncmFwaDoge1xyXG4gICAgICBtYXg6IHBhcmFncmFwaFVwcGVyQm91bmQsXHJcbiAgICAgIG1pbjogcGFyYWdyYXBoTG93ZXJCb3VuZCxcclxuICAgIH0sXHJcbiAgICB3b3JkcyxcclxuICAgIHdvcmRzUGVyU2VudGVuY2U6IHtcclxuICAgICAgbWF4OiBzZW50ZW5jZVVwcGVyQm91bmQsXHJcbiAgICAgIG1pbjogc2VudGVuY2VMb3dlckJvdW5kLFxyXG4gICAgfSxcclxuICB9O1xyXG5cclxuICBjb25zdCBsb3JlbTogTG9yZW1JcHN1bSA9IG5ldyBMb3JlbUlwc3VtKG9wdGlvbnMsIGZvcm1hdCwgc3VmZml4KTtcclxuXHJcbiAgc3dpdGNoICh1bml0cykge1xyXG4gICAgY2FzZSBVTklUX1BBUkFHUkFQSFM6XHJcbiAgICBjYXNlIFVOSVRfUEFSQUdSQVBIOlxyXG4gICAgICByZXR1cm4gbG9yZW0uZ2VuZXJhdGVQYXJhZ3JhcGhzKGNvdW50KTtcclxuICAgIGNhc2UgVU5JVF9TRU5URU5DRVM6XHJcbiAgICBjYXNlIFVOSVRfU0VOVEVOQ0U6XHJcbiAgICAgIHJldHVybiBsb3JlbS5nZW5lcmF0ZVNlbnRlbmNlcyhjb3VudCk7XHJcbiAgICBjYXNlIFVOSVRfV09SRFM6XHJcbiAgICBjYXNlIFVOSVRfV09SRDpcclxuICAgICAgcmV0dXJuIGxvcmVtLmdlbmVyYXRlV29yZHMoY291bnQpO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IHsgbG9yZW1JcHN1bSwgTG9yZW1JcHN1bSB9O1xyXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFTQTs7QUFFQTs7OztBQWVBLElBQU1BLFVBQVUsR0FBRyxTQUFiQSxVQUFhLEdBV21CO0VBQUEsK0VBQWYsRUFBZTtFQUFBLHNCQVZwQ0MsS0FVb0M7RUFBQSxJQVZwQ0EsS0FVb0MsMkJBVjVCLENBVTRCO0VBQUEsdUJBVHBDQyxNQVNvQztFQUFBLElBVHBDQSxNQVNvQyw0QkFUM0JDLHFCQVMyQjtFQUFBLGlDQVJwQ0MsbUJBUW9DO0VBQUEsSUFScENBLG1CQVFvQyxzQ0FSZCxDQVFjO0VBQUEsaUNBUHBDQyxtQkFPb0M7RUFBQSxJQVBwQ0EsbUJBT29DLHNDQVBkLENBT2M7RUFBQSxJQU5wQ0MsTUFNb0MsUUFOcENBLE1BTW9DO0VBQUEsaUNBTHBDQyxrQkFLb0M7RUFBQSxJQUxwQ0Esa0JBS29DLHNDQUxmLENBS2U7RUFBQSxpQ0FKcENDLGtCQUlvQztFQUFBLElBSnBDQSxrQkFJb0Msc0NBSmYsRUFJZTtFQUFBLHNCQUhwQ0MsS0FHb0M7RUFBQSxJQUhwQ0EsS0FHb0MsMkJBSDVCQyxxQkFHNEI7RUFBQSxzQkFGcENDLEtBRW9DO0VBQUEsSUFGcENBLEtBRW9DLDJCQUY1QkMsWUFFNEI7RUFBQSx1QkFEcENDLE1BQ29DO0VBQUEsSUFEcENBLE1BQ29DLDRCQUQzQixFQUMyQjs7RUFDcEMsSUFBTUMsT0FBTyxHQUFHO0lBQ2RSLE1BQU0sRUFBTkEsTUFEYztJQUVkUyxxQkFBcUIsRUFBRTtNQUNyQkMsR0FBRyxFQUFFWCxtQkFEZ0I7TUFFckJZLEdBQUcsRUFBRWI7SUFGZ0IsQ0FGVDtJQU1kTyxLQUFLLEVBQUxBLEtBTmM7SUFPZE8sZ0JBQWdCLEVBQUU7TUFDaEJGLEdBQUcsRUFBRVIsa0JBRFc7TUFFaEJTLEdBQUcsRUFBRVY7SUFGVztFQVBKLENBQWhCO0VBYUEsSUFBTVksS0FBaUIsR0FBRyxJQUFJQyxzQkFBSixDQUFlTixPQUFmLEVBQXdCWixNQUF4QixFQUFnQ1csTUFBaEMsQ0FBMUI7O0VBRUEsUUFBUUosS0FBUjtJQUNFLEtBQUtZLHNCQUFMO0lBQ0EsS0FBS0MscUJBQUw7TUFDRSxPQUFPSCxLQUFLLENBQUNJLGtCQUFOLENBQXlCdEIsS0FBekIsQ0FBUDs7SUFDRixLQUFLUyxxQkFBTDtJQUNBLEtBQUtjLG9CQUFMO01BQ0UsT0FBT0wsS0FBSyxDQUFDTSxpQkFBTixDQUF3QnhCLEtBQXhCLENBQVA7O0lBQ0YsS0FBS3lCLGlCQUFMO0lBQ0EsS0FBS0MsZ0JBQUw7TUFDRSxPQUFPUixLQUFLLENBQUNTLGFBQU4sQ0FBb0IzQixLQUFwQixDQUFQOztJQUNGO01BQ0UsT0FBTyxFQUFQO0VBWEo7QUFhRCxDQXhDRCJ9

/***/ }),

/***/ 935:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _formats = __webpack_require__(731);

var _lineEndings = __webpack_require__(670);

var _generator = _interopRequireDefault(__webpack_require__(140));

var _util = __webpack_require__(270);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LoremIpsum = /*#__PURE__*/function () {
  function LoremIpsum() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _formats.FORMAT_PLAIN;
    var suffix = arguments.length > 2 ? arguments[2] : undefined;

    _classCallCheck(this, LoremIpsum);

    this.format = format;
    this.suffix = suffix;

    _defineProperty(this, "generator", void 0);

    if (_formats.FORMATS.indexOf(format.toLowerCase()) === -1) {
      throw new Error("".concat(format, " is an invalid format. Please use ").concat(_formats.FORMATS.join(" or "), "."));
    }

    this.generator = new _generator["default"](options);
  }

  _createClass(LoremIpsum, [{
    key: "getLineEnding",
    value: function getLineEnding() {
      if (this.suffix) {
        return this.suffix;
      }

      if (!(0, _util.isReactNative)() && (0, _util.isNode)() && (0, _util.isWindows)()) {
        return _lineEndings.LINE_ENDINGS.WIN32;
      }

      return _lineEndings.LINE_ENDINGS.POSIX;
    }
  }, {
    key: "formatString",
    value: function formatString(str) {
      if (this.format === _formats.FORMAT_HTML) {
        return "<p>".concat(str, "</p>");
      }

      return str;
    }
  }, {
    key: "formatStrings",
    value: function formatStrings(strings) {
      var _this = this;

      return strings.map(function (str) {
        return _this.formatString(str);
      });
    }
  }, {
    key: "generateWords",
    value: function generateWords(num) {
      return this.formatString(this.generator.generateRandomWords(num));
    }
  }, {
    key: "generateSentences",
    value: function generateSentences(num) {
      return this.formatString(this.generator.generateRandomParagraph(num));
    }
  }, {
    key: "generateParagraphs",
    value: function generateParagraphs(num) {
      var makeString = this.generator.generateRandomParagraph.bind(this.generator);
      return this.formatStrings((0, _util.makeArrayOfStrings)(num, makeString)).join(this.getLineEnding());
    }
  }]);

  return LoremIpsum;
}();

var _default = LoremIpsum;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMb3JlbUlwc3VtIiwib3B0aW9ucyIsImZvcm1hdCIsIkZPUk1BVF9QTEFJTiIsInN1ZmZpeCIsIkZPUk1BVFMiLCJpbmRleE9mIiwidG9Mb3dlckNhc2UiLCJFcnJvciIsImpvaW4iLCJnZW5lcmF0b3IiLCJHZW5lcmF0b3IiLCJpc1JlYWN0TmF0aXZlIiwiaXNOb2RlIiwiaXNXaW5kb3dzIiwiTElORV9FTkRJTkdTIiwiV0lOMzIiLCJQT1NJWCIsInN0ciIsIkZPUk1BVF9IVE1MIiwic3RyaW5ncyIsIm1hcCIsImZvcm1hdFN0cmluZyIsIm51bSIsImdlbmVyYXRlUmFuZG9tV29yZHMiLCJnZW5lcmF0ZVJhbmRvbVBhcmFncmFwaCIsIm1ha2VTdHJpbmciLCJiaW5kIiwiZm9ybWF0U3RyaW5ncyIsIm1ha2VBcnJheU9mU3RyaW5ncyIsImdldExpbmVFbmRpbmciXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL0xvcmVtSXBzdW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRk9STUFUX0hUTUwsIEZPUk1BVF9QTEFJTiwgRk9STUFUUywgTG9yZW1Gb3JtYXQgfSBmcm9tIFwiLi4vY29uc3RhbnRzL2Zvcm1hdHNcIjtcclxuaW1wb3J0IHsgTElORV9FTkRJTkdTIH0gZnJvbSBcIi4uL2NvbnN0YW50cy9saW5lRW5kaW5nc1wiO1xyXG5pbXBvcnQgR2VuZXJhdG9yLCB7IElHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSBcIi4uL2xpYi9nZW5lcmF0b3JcIjtcclxuaW1wb3J0IHsgaXNOb2RlLCBpc1JlYWN0TmF0aXZlLCBpc1dpbmRvd3MsIG1ha2VBcnJheU9mU3RyaW5ncyB9IGZyb20gXCIuLi91dGlsXCI7XHJcblxyXG5jbGFzcyBMb3JlbUlwc3VtIHtcclxuICBwdWJsaWMgZ2VuZXJhdG9yOiBHZW5lcmF0b3I7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgb3B0aW9uczogSUdlbmVyYXRvck9wdGlvbnMgPSB7fSxcclxuICAgIHB1YmxpYyBmb3JtYXQ6IExvcmVtRm9ybWF0ID0gRk9STUFUX1BMQUlOLFxyXG4gICAgcHVibGljIHN1ZmZpeD86IHN0cmluZyxcclxuICApIHtcclxuICAgIGlmIChGT1JNQVRTLmluZGV4T2YoZm9ybWF0LnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgYCR7Zm9ybWF0fSBpcyBhbiBpbnZhbGlkIGZvcm1hdC4gUGxlYXNlIHVzZSAke0ZPUk1BVFMuam9pbihcIiBvciBcIil9LmAsXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3Iob3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0TGluZUVuZGluZygpIHtcclxuICAgIGlmICh0aGlzLnN1ZmZpeCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdWZmaXg7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc1JlYWN0TmF0aXZlKCkgJiYgaXNOb2RlKCkgJiYgaXNXaW5kb3dzKCkpIHtcclxuICAgICAgcmV0dXJuIExJTkVfRU5ESU5HUy5XSU4zMjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gTElORV9FTkRJTkdTLlBPU0lYO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZvcm1hdFN0cmluZyhzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5mb3JtYXQgPT09IEZPUk1BVF9IVE1MKSB7XHJcbiAgICAgIHJldHVybiBgPHA+JHtzdHJ9PC9wPmA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZvcm1hdFN0cmluZ3Moc3RyaW5nczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XHJcbiAgICByZXR1cm4gc3RyaW5ncy5tYXAoKHN0cikgPT4gdGhpcy5mb3JtYXRTdHJpbmcoc3RyKSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2VuZXJhdGVXb3JkcyhudW0/OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0U3RyaW5nKHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlUmFuZG9tV29yZHMobnVtKSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2VuZXJhdGVTZW50ZW5jZXMobnVtPzogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLmZvcm1hdFN0cmluZyh0aGlzLmdlbmVyYXRvci5nZW5lcmF0ZVJhbmRvbVBhcmFncmFwaChudW0pKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZW5lcmF0ZVBhcmFncmFwaHMobnVtOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgbWFrZVN0cmluZyA9IHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlUmFuZG9tUGFyYWdyYXBoLmJpbmQoXHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yLFxyXG4gICAgKTtcclxuICAgIHJldHVybiB0aGlzLmZvcm1hdFN0cmluZ3MobWFrZUFycmF5T2ZTdHJpbmdzKG51bSwgbWFrZVN0cmluZykpLmpvaW4oXHJcbiAgICAgIHRoaXMuZ2V0TGluZUVuZGluZygpLFxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExvcmVtSXBzdW07XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7SUFFTUEsVTtFQUdKLHNCQUlFO0lBQUEsSUFIQUMsT0FHQSx1RUFINkIsRUFHN0I7SUFBQSxJQUZPQyxNQUVQLHVFQUY2QkMscUJBRTdCO0lBQUEsSUFET0MsTUFDUDs7SUFBQTs7SUFBQSxLQUZPRixNQUVQLEdBRk9BLE1BRVA7SUFBQSxLQURPRSxNQUNQLEdBRE9BLE1BQ1A7O0lBQUE7O0lBQ0EsSUFBSUMsZ0JBQUEsQ0FBUUMsT0FBUixDQUFnQkosTUFBTSxDQUFDSyxXQUFQLEVBQWhCLE1BQTBDLENBQUMsQ0FBL0MsRUFBa0Q7TUFDaEQsTUFBTSxJQUFJQyxLQUFKLFdBQ0ROLE1BREMsK0NBQzBDRyxnQkFBQSxDQUFRSSxJQUFSLENBQWEsTUFBYixDQUQxQyxPQUFOO0lBR0Q7O0lBQ0QsS0FBS0MsU0FBTCxHQUFpQixJQUFJQyxxQkFBSixDQUFjVixPQUFkLENBQWpCO0VBQ0Q7Ozs7V0FFRCx5QkFBdUI7TUFDckIsSUFBSSxLQUFLRyxNQUFULEVBQWlCO1FBQ2YsT0FBTyxLQUFLQSxNQUFaO01BQ0Q7O01BRUQsSUFBSSxDQUFDLElBQUFRLG1CQUFBLEdBQUQsSUFBb0IsSUFBQUMsWUFBQSxHQUFwQixJQUFnQyxJQUFBQyxlQUFBLEdBQXBDLEVBQWlEO1FBQy9DLE9BQU9DLHlCQUFBLENBQWFDLEtBQXBCO01BQ0Q7O01BRUQsT0FBT0QseUJBQUEsQ0FBYUUsS0FBcEI7SUFDRDs7O1dBRUQsc0JBQW9CQyxHQUFwQixFQUF5QztNQUN2QyxJQUFJLEtBQUtoQixNQUFMLEtBQWdCaUIsb0JBQXBCLEVBQWlDO1FBQy9CLG9CQUFhRCxHQUFiO01BQ0Q7O01BQ0QsT0FBT0EsR0FBUDtJQUNEOzs7V0FFRCx1QkFBcUJFLE9BQXJCLEVBQWtEO01BQUE7O01BQ2hELE9BQU9BLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFVBQUNILEdBQUQ7UUFBQSxPQUFTLEtBQUksQ0FBQ0ksWUFBTCxDQUFrQkosR0FBbEIsQ0FBVDtNQUFBLENBQVosQ0FBUDtJQUNEOzs7V0FFRCx1QkFBcUJLLEdBQXJCLEVBQTJDO01BQ3pDLE9BQU8sS0FBS0QsWUFBTCxDQUFrQixLQUFLWixTQUFMLENBQWVjLG1CQUFmLENBQW1DRCxHQUFuQyxDQUFsQixDQUFQO0lBQ0Q7OztXQUVELDJCQUF5QkEsR0FBekIsRUFBK0M7TUFDN0MsT0FBTyxLQUFLRCxZQUFMLENBQWtCLEtBQUtaLFNBQUwsQ0FBZWUsdUJBQWYsQ0FBdUNGLEdBQXZDLENBQWxCLENBQVA7SUFDRDs7O1dBRUQsNEJBQTBCQSxHQUExQixFQUErQztNQUM3QyxJQUFNRyxVQUFVLEdBQUcsS0FBS2hCLFNBQUwsQ0FBZWUsdUJBQWYsQ0FBdUNFLElBQXZDLENBQ2pCLEtBQUtqQixTQURZLENBQW5CO01BR0EsT0FBTyxLQUFLa0IsYUFBTCxDQUFtQixJQUFBQyx3QkFBQSxFQUFtQk4sR0FBbkIsRUFBd0JHLFVBQXhCLENBQW5CLEVBQXdEakIsSUFBeEQsQ0FDTCxLQUFLcUIsYUFBTCxFQURLLENBQVA7SUFHRDs7Ozs7O2VBR1k5QixVIn0=

/***/ }),

/***/ 140:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _words = __webpack_require__(749);

var _util = __webpack_require__(270);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Generator = /*#__PURE__*/function () {
  function Generator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$sentencesPerPara = _ref.sentencesPerParagraph,
        sentencesPerParagraph = _ref$sentencesPerPara === void 0 ? {
      max: 7,
      min: 3
    } : _ref$sentencesPerPara,
        _ref$wordsPerSentence = _ref.wordsPerSentence,
        wordsPerSentence = _ref$wordsPerSentence === void 0 ? {
      max: 15,
      min: 5
    } : _ref$wordsPerSentence,
        random = _ref.random,
        seed = _ref.seed,
        _ref$words = _ref.words,
        words = _ref$words === void 0 ? _words.WORDS : _ref$words;

    _classCallCheck(this, Generator);

    _defineProperty(this, "sentencesPerParagraph", void 0);

    _defineProperty(this, "wordsPerSentence", void 0);

    _defineProperty(this, "random", void 0);

    _defineProperty(this, "words", void 0);

    if (sentencesPerParagraph.min > sentencesPerParagraph.max) {
      throw new Error("Minimum number of sentences per paragraph (".concat(sentencesPerParagraph.min, ") cannot exceed maximum (").concat(sentencesPerParagraph.max, ")."));
    }

    if (wordsPerSentence.min > wordsPerSentence.max) {
      throw new Error("Minimum number of words per sentence (".concat(wordsPerSentence.min, ") cannot exceed maximum (").concat(wordsPerSentence.max, ")."));
    }

    this.sentencesPerParagraph = sentencesPerParagraph;
    this.words = words;
    this.wordsPerSentence = wordsPerSentence;
    this.random = random || Math.random;
  }

  _createClass(Generator, [{
    key: "generateRandomInteger",
    value: function generateRandomInteger(min, max) {
      return Math.floor(this.random() * (max - min + 1) + min);
    }
  }, {
    key: "generateRandomWords",
    value: function generateRandomWords(num) {
      var _this = this;

      var _this$wordsPerSentenc = this.wordsPerSentence,
          min = _this$wordsPerSentenc.min,
          max = _this$wordsPerSentenc.max;
      var length = num || this.generateRandomInteger(min, max);
      return (0, _util.makeArrayOfLength)(length).reduce(function (accumulator, index) {
        return "".concat(_this.pluckRandomWord(), " ").concat(accumulator);
      }, "").trim();
    }
  }, {
    key: "generateRandomSentence",
    value: function generateRandomSentence(num) {
      return "".concat((0, _util.capitalize)(this.generateRandomWords(num)), ".");
    }
  }, {
    key: "generateRandomParagraph",
    value: function generateRandomParagraph(num) {
      var _this2 = this;

      var _this$sentencesPerPar = this.sentencesPerParagraph,
          min = _this$sentencesPerPar.min,
          max = _this$sentencesPerPar.max;
      var length = num || this.generateRandomInteger(min, max);
      return (0, _util.makeArrayOfLength)(length).reduce(function (accumulator, index) {
        return "".concat(_this2.generateRandomSentence(), " ").concat(accumulator);
      }, "").trim();
    }
  }, {
    key: "pluckRandomWord",
    value: function pluckRandomWord() {
      var min = 0;
      var max = this.words.length - 1;
      var index = this.generateRandomInteger(min, max);
      return this.words[index];
    }
  }]);

  return Generator;
}();

var _default = Generator;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHZW5lcmF0b3IiLCJzZW50ZW5jZXNQZXJQYXJhZ3JhcGgiLCJtYXgiLCJtaW4iLCJ3b3Jkc1BlclNlbnRlbmNlIiwicmFuZG9tIiwic2VlZCIsIndvcmRzIiwiV09SRFMiLCJFcnJvciIsIk1hdGgiLCJmbG9vciIsIm51bSIsImxlbmd0aCIsImdlbmVyYXRlUmFuZG9tSW50ZWdlciIsIm1ha2VBcnJheU9mTGVuZ3RoIiwicmVkdWNlIiwiYWNjdW11bGF0b3IiLCJpbmRleCIsInBsdWNrUmFuZG9tV29yZCIsInRyaW0iLCJjYXBpdGFsaXplIiwiZ2VuZXJhdGVSYW5kb21Xb3JkcyIsImdlbmVyYXRlUmFuZG9tU2VudGVuY2UiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dlbmVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBXT1JEUyB9IGZyb20gXCIuLi9jb25zdGFudHMvd29yZHNcIjtcclxuaW1wb3J0IHsgY2FwaXRhbGl6ZSwgbWFrZUFycmF5T2ZMZW5ndGggfSBmcm9tIFwiLi4vdXRpbFwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQm91bmRzIHtcclxuICBtaW46IG51bWJlcjtcclxuICBtYXg6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgSVBybmcgPSAoKSA9PiBudW1iZXI7XHJcblxyXG5leHBvcnQgdHlwZSBJU2VlZFJhbmRvbSA9IG5ldyAoc2VlZD86IHN0cmluZykgPT4gSVBybmc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElNYXRoIHtcclxuICBzZWVkcmFuZG9tOiBJU2VlZFJhbmRvbTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJR2VuZXJhdG9yT3B0aW9ucyB7XHJcbiAgc2VudGVuY2VzUGVyUGFyYWdyYXBoPzogSUJvdW5kcztcclxuICB3b3Jkc1BlclNlbnRlbmNlPzogSUJvdW5kcztcclxuICByYW5kb20/OiBJUHJuZztcclxuICBzZWVkPzogc3RyaW5nO1xyXG4gIHdvcmRzPzogc3RyaW5nW107XHJcbn1cclxuXHJcbmNsYXNzIEdlbmVyYXRvciB7XHJcbiAgcHVibGljIHNlbnRlbmNlc1BlclBhcmFncmFwaDogSUJvdW5kcztcclxuICBwdWJsaWMgd29yZHNQZXJTZW50ZW5jZTogSUJvdW5kcztcclxuICBwdWJsaWMgcmFuZG9tOiBJUHJuZztcclxuICBwdWJsaWMgd29yZHM6IHN0cmluZ1tdO1xyXG5cclxuICBjb25zdHJ1Y3Rvcih7XHJcbiAgICBzZW50ZW5jZXNQZXJQYXJhZ3JhcGggPSB7IG1heDogNywgbWluOiAzIH0sXHJcbiAgICB3b3Jkc1BlclNlbnRlbmNlID0geyBtYXg6IDE1LCBtaW46IDUgfSxcclxuICAgIHJhbmRvbSxcclxuICAgIHNlZWQsXHJcbiAgICB3b3JkcyA9IFdPUkRTLFxyXG4gIH06IElHZW5lcmF0b3JPcHRpb25zID0ge30pIHtcclxuICAgIGlmIChzZW50ZW5jZXNQZXJQYXJhZ3JhcGgubWluID4gc2VudGVuY2VzUGVyUGFyYWdyYXBoLm1heCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgYE1pbmltdW0gbnVtYmVyIG9mIHNlbnRlbmNlcyBwZXIgcGFyYWdyYXBoICgke1xyXG4gICAgICAgICAgc2VudGVuY2VzUGVyUGFyYWdyYXBoLm1pblxyXG4gICAgICAgIH0pIGNhbm5vdCBleGNlZWQgbWF4aW11bSAoJHtzZW50ZW5jZXNQZXJQYXJhZ3JhcGgubWF4fSkuYCxcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod29yZHNQZXJTZW50ZW5jZS5taW4gPiB3b3Jkc1BlclNlbnRlbmNlLm1heCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgYE1pbmltdW0gbnVtYmVyIG9mIHdvcmRzIHBlciBzZW50ZW5jZSAoJHtcclxuICAgICAgICAgIHdvcmRzUGVyU2VudGVuY2UubWluXHJcbiAgICAgICAgfSkgY2Fubm90IGV4Y2VlZCBtYXhpbXVtICgke3dvcmRzUGVyU2VudGVuY2UubWF4fSkuYCxcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlbnRlbmNlc1BlclBhcmFncmFwaCA9IHNlbnRlbmNlc1BlclBhcmFncmFwaDtcclxuICAgIHRoaXMud29yZHMgPSB3b3JkcztcclxuICAgIHRoaXMud29yZHNQZXJTZW50ZW5jZSA9IHdvcmRzUGVyU2VudGVuY2U7XHJcbiAgICB0aGlzLnJhbmRvbSA9IHJhbmRvbSB8fCBNYXRoLnJhbmRvbTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZW5lcmF0ZVJhbmRvbUludGVnZXIobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHRoaXMucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdlbmVyYXRlUmFuZG9tV29yZHMobnVtPzogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHsgbWluLCBtYXggfSA9IHRoaXMud29yZHNQZXJTZW50ZW5jZTtcclxuICAgIGNvbnN0IGxlbmd0aCA9IG51bSB8fCB0aGlzLmdlbmVyYXRlUmFuZG9tSW50ZWdlcihtaW4sIG1heCk7XHJcbiAgICByZXR1cm4gbWFrZUFycmF5T2ZMZW5ndGgobGVuZ3RoKVxyXG4gICAgICAucmVkdWNlKChhY2N1bXVsYXRvcjogc3RyaW5nLCBpbmRleDogbnVtYmVyKTogc3RyaW5nID0+IHtcclxuICAgICAgICByZXR1cm4gYCR7dGhpcy5wbHVja1JhbmRvbVdvcmQoKX0gJHthY2N1bXVsYXRvcn1gO1xyXG4gICAgICB9LCBcIlwiKVxyXG4gICAgICAudHJpbSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdlbmVyYXRlUmFuZG9tU2VudGVuY2UobnVtPzogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgJHtjYXBpdGFsaXplKHRoaXMuZ2VuZXJhdGVSYW5kb21Xb3JkcyhudW0pKX0uYDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZW5lcmF0ZVJhbmRvbVBhcmFncmFwaChudW0/OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgeyBtaW4sIG1heCB9ID0gdGhpcy5zZW50ZW5jZXNQZXJQYXJhZ3JhcGg7XHJcbiAgICBjb25zdCBsZW5ndGggPSBudW0gfHwgdGhpcy5nZW5lcmF0ZVJhbmRvbUludGVnZXIobWluLCBtYXgpO1xyXG4gICAgcmV0dXJuIG1ha2VBcnJheU9mTGVuZ3RoKGxlbmd0aClcclxuICAgICAgLnJlZHVjZSgoYWNjdW11bGF0b3I6IHN0cmluZywgaW5kZXg6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2VuZXJhdGVSYW5kb21TZW50ZW5jZSgpfSAke2FjY3VtdWxhdG9yfWA7XHJcbiAgICAgIH0sIFwiXCIpXHJcbiAgICAgIC50cmltKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGx1Y2tSYW5kb21Xb3JkKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBtaW4gPSAwO1xyXG4gICAgY29uc3QgbWF4ID0gdGhpcy53b3Jkcy5sZW5ndGggLSAxO1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmdlbmVyYXRlUmFuZG9tSW50ZWdlcihtaW4sIG1heCk7XHJcbiAgICByZXR1cm4gdGhpcy53b3Jkc1tpbmRleF07XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHZW5lcmF0b3I7XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7Ozs7O0lBdUJNQSxTO0VBTUoscUJBTTJCO0lBQUEsK0VBQUosRUFBSTtJQUFBLGlDQUx6QkMscUJBS3lCO0lBQUEsSUFMekJBLHFCQUt5QixzQ0FMRDtNQUFFQyxHQUFHLEVBQUUsQ0FBUDtNQUFVQyxHQUFHLEVBQUU7SUFBZixDQUtDO0lBQUEsaUNBSnpCQyxnQkFJeUI7SUFBQSxJQUp6QkEsZ0JBSXlCLHNDQUpOO01BQUVGLEdBQUcsRUFBRSxFQUFQO01BQVdDLEdBQUcsRUFBRTtJQUFoQixDQUlNO0lBQUEsSUFIekJFLE1BR3lCLFFBSHpCQSxNQUd5QjtJQUFBLElBRnpCQyxJQUV5QixRQUZ6QkEsSUFFeUI7SUFBQSxzQkFEekJDLEtBQ3lCO0lBQUEsSUFEekJBLEtBQ3lCLDJCQURqQkMsWUFDaUI7O0lBQUE7O0lBQUE7O0lBQUE7O0lBQUE7O0lBQUE7O0lBQ3pCLElBQUlQLHFCQUFxQixDQUFDRSxHQUF0QixHQUE0QkYscUJBQXFCLENBQUNDLEdBQXRELEVBQTJEO01BQ3pELE1BQU0sSUFBSU8sS0FBSixzREFFRlIscUJBQXFCLENBQUNFLEdBRnBCLHNDQUd3QkYscUJBQXFCLENBQUNDLEdBSDlDLFFBQU47SUFLRDs7SUFFRCxJQUFJRSxnQkFBZ0IsQ0FBQ0QsR0FBakIsR0FBdUJDLGdCQUFnQixDQUFDRixHQUE1QyxFQUFpRDtNQUMvQyxNQUFNLElBQUlPLEtBQUosaURBRUZMLGdCQUFnQixDQUFDRCxHQUZmLHNDQUd3QkMsZ0JBQWdCLENBQUNGLEdBSHpDLFFBQU47SUFLRDs7SUFFRCxLQUFLRCxxQkFBTCxHQUE2QkEscUJBQTdCO0lBQ0EsS0FBS00sS0FBTCxHQUFhQSxLQUFiO0lBQ0EsS0FBS0gsZ0JBQUwsR0FBd0JBLGdCQUF4QjtJQUNBLEtBQUtDLE1BQUwsR0FBY0EsTUFBTSxJQUFJSyxJQUFJLENBQUNMLE1BQTdCO0VBQ0Q7Ozs7V0FFRCwrQkFBNkJGLEdBQTdCLEVBQTBDRCxHQUExQyxFQUErRDtNQUM3RCxPQUFPUSxJQUFJLENBQUNDLEtBQUwsQ0FBVyxLQUFLTixNQUFMLE1BQWlCSCxHQUFHLEdBQUdDLEdBQU4sR0FBWSxDQUE3QixJQUFrQ0EsR0FBN0MsQ0FBUDtJQUNEOzs7V0FFRCw2QkFBMkJTLEdBQTNCLEVBQWlEO01BQUE7O01BQy9DLDRCQUFxQixLQUFLUixnQkFBMUI7TUFBQSxJQUFRRCxHQUFSLHlCQUFRQSxHQUFSO01BQUEsSUFBYUQsR0FBYix5QkFBYUEsR0FBYjtNQUNBLElBQU1XLE1BQU0sR0FBR0QsR0FBRyxJQUFJLEtBQUtFLHFCQUFMLENBQTJCWCxHQUEzQixFQUFnQ0QsR0FBaEMsQ0FBdEI7TUFDQSxPQUFPLElBQUFhLHVCQUFBLEVBQWtCRixNQUFsQixFQUNKRyxNQURJLENBQ0csVUFBQ0MsV0FBRCxFQUFzQkMsS0FBdEIsRUFBZ0Q7UUFDdEQsaUJBQVUsS0FBSSxDQUFDQyxlQUFMLEVBQVYsY0FBb0NGLFdBQXBDO01BQ0QsQ0FISSxFQUdGLEVBSEUsRUFJSkcsSUFKSSxFQUFQO0lBS0Q7OztXQUVELGdDQUE4QlIsR0FBOUIsRUFBb0Q7TUFDbEQsaUJBQVUsSUFBQVMsZ0JBQUEsRUFBVyxLQUFLQyxtQkFBTCxDQUF5QlYsR0FBekIsQ0FBWCxDQUFWO0lBQ0Q7OztXQUVELGlDQUErQkEsR0FBL0IsRUFBcUQ7TUFBQTs7TUFDbkQsNEJBQXFCLEtBQUtYLHFCQUExQjtNQUFBLElBQVFFLEdBQVIseUJBQVFBLEdBQVI7TUFBQSxJQUFhRCxHQUFiLHlCQUFhQSxHQUFiO01BQ0EsSUFBTVcsTUFBTSxHQUFHRCxHQUFHLElBQUksS0FBS0UscUJBQUwsQ0FBMkJYLEdBQTNCLEVBQWdDRCxHQUFoQyxDQUF0QjtNQUNBLE9BQU8sSUFBQWEsdUJBQUEsRUFBa0JGLE1BQWxCLEVBQ0pHLE1BREksQ0FDRyxVQUFDQyxXQUFELEVBQXNCQyxLQUF0QixFQUFnRDtRQUN0RCxpQkFBVSxNQUFJLENBQUNLLHNCQUFMLEVBQVYsY0FBMkNOLFdBQTNDO01BQ0QsQ0FISSxFQUdGLEVBSEUsRUFJSkcsSUFKSSxFQUFQO0lBS0Q7OztXQUVELDJCQUFpQztNQUMvQixJQUFNakIsR0FBRyxHQUFHLENBQVo7TUFDQSxJQUFNRCxHQUFHLEdBQUcsS0FBS0ssS0FBTCxDQUFXTSxNQUFYLEdBQW9CLENBQWhDO01BQ0EsSUFBTUssS0FBSyxHQUFHLEtBQUtKLHFCQUFMLENBQTJCWCxHQUEzQixFQUFnQ0QsR0FBaEMsQ0FBZDtNQUNBLE9BQU8sS0FBS0ssS0FBTCxDQUFXVyxLQUFYLENBQVA7SUFDRDs7Ozs7O2VBR1lsQixTIn0=

/***/ }),

/***/ 569:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

/**
 * @param str  A string that may or may not be capitalized.
 * @returns    A capitalized string.
 */
var capitalize = function capitalize(str) {
  var trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

var _default = capitalize;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYXBpdGFsaXplIiwic3RyIiwidHJpbW1lZCIsInRyaW0iLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvY2FwaXRhbGl6ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQHBhcmFtIHN0ciAgQSBzdHJpbmcgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBjYXBpdGFsaXplZC5cclxuICogQHJldHVybnMgICAgQSBjYXBpdGFsaXplZCBzdHJpbmcuXHJcbiAqL1xyXG5jb25zdCBjYXBpdGFsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICBjb25zdCB0cmltbWVkID0gc3RyLnRyaW0oKTtcclxuICByZXR1cm4gdHJpbW1lZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRyaW1tZWQuc2xpY2UoMSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjYXBpdGFsaXplO1xyXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLFVBQVUsR0FBRyxTQUFiQSxVQUFhLENBQUNDLEdBQUQsRUFBeUI7RUFDMUMsSUFBTUMsT0FBTyxHQUFHRCxHQUFHLENBQUNFLElBQUosRUFBaEI7RUFDQSxPQUFPRCxPQUFPLENBQUNFLE1BQVIsQ0FBZSxDQUFmLEVBQWtCQyxXQUFsQixLQUFrQ0gsT0FBTyxDQUFDSSxLQUFSLENBQWMsQ0FBZCxDQUF6QztBQUNELENBSEQ7O2VBS2VOLFUifQ==

/***/ }),

/***/ 270:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "capitalize", ({
  enumerable: true,
  get: function get() {
    return _capitalize["default"];
  }
}));
Object.defineProperty(exports, "isNode", ({
  enumerable: true,
  get: function get() {
    return _isNode["default"];
  }
}));
Object.defineProperty(exports, "isReactNative", ({
  enumerable: true,
  get: function get() {
    return _isReactNative["default"];
  }
}));
Object.defineProperty(exports, "isWindows", ({
  enumerable: true,
  get: function get() {
    return _isWindows["default"];
  }
}));
Object.defineProperty(exports, "makeArrayOfLength", ({
  enumerable: true,
  get: function get() {
    return _makeArrayOfLength["default"];
  }
}));
Object.defineProperty(exports, "makeArrayOfStrings", ({
  enumerable: true,
  get: function get() {
    return _makeArrayOfStrings["default"];
  }
}));

var _capitalize = _interopRequireDefault(__webpack_require__(569));

var _isNode = _interopRequireDefault(__webpack_require__(984));

var _isReactNative = _interopRequireDefault(__webpack_require__(97));

var _isWindows = _interopRequireDefault(__webpack_require__(606));

var _makeArrayOfLength = _interopRequireDefault(__webpack_require__(318));

var _makeArrayOfStrings = _interopRequireDefault(__webpack_require__(490));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNhcGl0YWxpemUgZnJvbSBcIi4vY2FwaXRhbGl6ZVwiO1xyXG5pbXBvcnQgaXNOb2RlIGZyb20gXCIuL2lzTm9kZVwiO1xyXG5pbXBvcnQgaXNSZWFjdE5hdGl2ZSBmcm9tIFwiLi9pc1JlYWN0TmF0aXZlXCI7XHJcbmltcG9ydCBpc1dpbmRvd3MgZnJvbSBcIi4vaXNXaW5kb3dzXCI7XHJcbmltcG9ydCBtYWtlQXJyYXlPZkxlbmd0aCBmcm9tIFwiLi9tYWtlQXJyYXlPZkxlbmd0aFwiO1xyXG5pbXBvcnQgbWFrZUFycmF5T2ZTdHJpbmdzIGZyb20gXCIuL21ha2VBcnJheU9mU3RyaW5nc1wiO1xyXG5cclxuZXhwb3J0IHtcclxuICBjYXBpdGFsaXplLFxyXG4gIGlzTm9kZSxcclxuICBpc1JlYWN0TmF0aXZlLFxyXG4gIGlzV2luZG93cyxcclxuICBtYWtlQXJyYXlPZkxlbmd0aCxcclxuICBtYWtlQXJyYXlPZlN0cmluZ3MsXHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0EifQ==

/***/ }),

/***/ 984:
/***/ ((module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

/**
 * @returns  True if the runtime is NodeJS.
 */
var isNode = function isNode() {
  return  true && !!module.exports;
};

var _default = isNode;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc05vZGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvaXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAcmV0dXJucyAgVHJ1ZSBpZiB0aGUgcnVudGltZSBpcyBOb2RlSlMuXHJcbiAqL1xyXG5jb25zdCBpc05vZGUgPSAoKTogYm9vbGVhbiA9PiB7XHJcbiAgcmV0dXJuIHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgISFtb2R1bGUuZXhwb3J0cztcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGlzTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsTUFBTSxHQUFHLFNBQVRBLE1BQVMsR0FBZTtFQUM1QixPQUFPLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUMsQ0FBQyxDQUFDQSxNQUFNLENBQUNDLE9BQWpEO0FBQ0QsQ0FGRDs7ZUFJZUYsTSJ9

/***/ }),

/***/ 97:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

/**
 * Check if runtime is ReactNative.
 * Solution based on https://github.com/knicklabs/lorem-ipsum.js/pull/52/files
 *
 * @returns  True if runtime is ReactNative.
 */
var isReactNative = function isReactNative() {
  var isReactNativeResult = false;

  try {
    isReactNativeResult = navigator.product === "ReactNative";
  } catch (e) {
    isReactNativeResult = false;
  }

  return isReactNativeResult;
};

var _default = isReactNative;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1JlYWN0TmF0aXZlIiwiaXNSZWFjdE5hdGl2ZVJlc3VsdCIsIm5hdmlnYXRvciIsInByb2R1Y3QiLCJlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvaXNSZWFjdE5hdGl2ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ2hlY2sgaWYgcnVudGltZSBpcyBSZWFjdE5hdGl2ZS5cclxuICogU29sdXRpb24gYmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2tuaWNrbGFicy9sb3JlbS1pcHN1bS5qcy9wdWxsLzUyL2ZpbGVzXHJcbiAqXHJcbiAqIEByZXR1cm5zICBUcnVlIGlmIHJ1bnRpbWUgaXMgUmVhY3ROYXRpdmUuXHJcbiAqL1xyXG5jb25zdCBpc1JlYWN0TmF0aXZlID0gKCk6IGJvb2xlYW4gPT4ge1xyXG4gIGxldCBpc1JlYWN0TmF0aXZlUmVzdWx0OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBpc1JlYWN0TmF0aXZlUmVzdWx0ID0gbmF2aWdhdG9yLnByb2R1Y3QgPT09IFwiUmVhY3ROYXRpdmVcIjtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBpc1JlYWN0TmF0aXZlUmVzdWx0ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gaXNSZWFjdE5hdGl2ZVJlc3VsdDtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGlzUmVhY3ROYXRpdmU7XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLGFBQWEsR0FBRyxTQUFoQkEsYUFBZ0IsR0FBZTtFQUNuQyxJQUFJQyxtQkFBNEIsR0FBRyxLQUFuQzs7RUFFQSxJQUFJO0lBQ0ZBLG1CQUFtQixHQUFHQyxTQUFTLENBQUNDLE9BQVYsS0FBc0IsYUFBNUM7RUFDRCxDQUZELENBRUUsT0FBT0MsQ0FBUCxFQUFVO0lBQ1ZILG1CQUFtQixHQUFHLEtBQXRCO0VBQ0Q7O0VBRUQsT0FBT0EsbUJBQVA7QUFDRCxDQVZEOztlQVllRCxhIn0=

/***/ }),

/***/ 606:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _platforms = __webpack_require__(3);

/**
 * @returns True if process is windows.
 */
var isWindows = function isWindows() {
  var isWindowsResult = false;

  try {
    isWindowsResult = process.platform === _platforms.SUPPORTED_PLATFORMS.WIN32;
  } catch (e) {
    isWindowsResult = false;
  }

  return isWindowsResult;
};

var _default = isWindows;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1dpbmRvd3MiLCJpc1dpbmRvd3NSZXN1bHQiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJTVVBQT1JURURfUExBVEZPUk1TIiwiV0lOMzIiLCJlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvaXNXaW5kb3dzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNVUFBPUlRFRF9QTEFURk9STVMgfSBmcm9tIFwiLi4vY29uc3RhbnRzL3BsYXRmb3Jtc1wiO1xyXG5cclxuLyoqXHJcbiAqIEByZXR1cm5zIFRydWUgaWYgcHJvY2VzcyBpcyB3aW5kb3dzLlxyXG4gKi9cclxuY29uc3QgaXNXaW5kb3dzID0gKCk6IGJvb2xlYW4gPT4ge1xyXG4gIGxldCBpc1dpbmRvd3NSZXN1bHQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICB0cnkge1xyXG4gICAgaXNXaW5kb3dzUmVzdWx0ID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gU1VQUE9SVEVEX1BMQVRGT1JNUy5XSU4zMjtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBpc1dpbmRvd3NSZXN1bHQgPSBmYWxzZTtcclxuICB9XHJcbiAgcmV0dXJuIGlzV2luZG93c1Jlc3VsdDtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGlzV2luZG93cztcclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsU0FBUyxHQUFHLFNBQVpBLFNBQVksR0FBZTtFQUMvQixJQUFJQyxlQUF3QixHQUFHLEtBQS9COztFQUNBLElBQUk7SUFDRkEsZUFBZSxHQUFHQyxPQUFPLENBQUNDLFFBQVIsS0FBcUJDLDhCQUFBLENBQW9CQyxLQUEzRDtFQUNELENBRkQsQ0FFRSxPQUFPQyxDQUFQLEVBQVU7SUFDVkwsZUFBZSxHQUFHLEtBQWxCO0VBQ0Q7O0VBQ0QsT0FBT0EsZUFBUDtBQUNELENBUkQ7O2VBVWVELFMifQ==

/***/ }),

/***/ 318:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

/**
 * @param length Length "x".
 * @returns      An array of indexes of length "x".
 */
var makeArrayOfLength = function makeArrayOfLength() {
  var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return Array.apply(null, Array(length)).map(function (item, index) {
    return index;
  });
};

var _default = makeArrayOfLength;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtYWtlQXJyYXlPZkxlbmd0aCIsImxlbmd0aCIsIkFycmF5IiwiYXBwbHkiLCJtYXAiLCJpdGVtIiwiaW5kZXgiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9tYWtlQXJyYXlPZkxlbmd0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQHBhcmFtIGxlbmd0aCBMZW5ndGggXCJ4XCIuXHJcbiAqIEByZXR1cm5zICAgICAgQW4gYXJyYXkgb2YgaW5kZXhlcyBvZiBsZW5ndGggXCJ4XCIuXHJcbiAqL1xyXG5jb25zdCBtYWtlQXJyYXlPZkxlbmd0aCA9IChsZW5ndGg6IG51bWJlciA9IDApOiBudW1iZXJbXSA9PiB7XHJcbiAgcmV0dXJuIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KGxlbmd0aCkpLm1hcChcclxuICAgIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpOiBudW1iZXIgPT4gaW5kZXgsXHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG1ha2VBcnJheU9mTGVuZ3RoO1xyXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLGlCQUFpQixHQUFHLFNBQXBCQSxpQkFBb0IsR0FBa0M7RUFBQSxJQUFqQ0MsTUFBaUMsdUVBQWhCLENBQWdCO0VBQzFELE9BQU9DLEtBQUssQ0FBQ0MsS0FBTixDQUFZLElBQVosRUFBa0JELEtBQUssQ0FBQ0QsTUFBRCxDQUF2QixFQUFpQ0csR0FBakMsQ0FDTCxVQUFDQyxJQUFELEVBQVlDLEtBQVo7SUFBQSxPQUFzQ0EsS0FBdEM7RUFBQSxDQURLLENBQVA7QUFHRCxDQUpEOztlQU1lTixpQiJ9

/***/ }),

/***/ 490:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _makeArrayOfLength = _interopRequireDefault(__webpack_require__(318));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @param length  Length "x".
 * @returns       An array of strings of length "x".
 */
var makeArrayOfStrings = function makeArrayOfStrings(length, makeString) {
  var arr = (0, _makeArrayOfLength["default"])(length);
  return arr.map(function () {
    return makeString();
  });
};

var _default = makeArrayOfStrings;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtYWtlQXJyYXlPZlN0cmluZ3MiLCJsZW5ndGgiLCJtYWtlU3RyaW5nIiwiYXJyIiwibWFrZUFycmF5T2ZMZW5ndGgiLCJtYXAiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9tYWtlQXJyYXlPZlN0cmluZ3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1ha2VBcnJheU9mTGVuZ3RoIGZyb20gXCIuL21ha2VBcnJheU9mTGVuZ3RoXCI7XHJcbi8qKlxyXG4gKiBAcGFyYW0gbGVuZ3RoICBMZW5ndGggXCJ4XCIuXHJcbiAqIEByZXR1cm5zICAgICAgIEFuIGFycmF5IG9mIHN0cmluZ3Mgb2YgbGVuZ3RoIFwieFwiLlxyXG4gKi9cclxuY29uc3QgbWFrZUFycmF5T2ZTdHJpbmdzID0gKFxyXG4gIGxlbmd0aDogbnVtYmVyLFxyXG4gIG1ha2VTdHJpbmc6ICgpID0+IHN0cmluZyxcclxuKTogc3RyaW5nW10gPT4ge1xyXG4gIGNvbnN0IGFyciA9IG1ha2VBcnJheU9mTGVuZ3RoKGxlbmd0aCk7XHJcbiAgcmV0dXJuIGFyci5tYXAoKCkgPT4gbWFrZVN0cmluZygpKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG1ha2VBcnJheU9mU3RyaW5ncztcclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLGtCQUFrQixHQUFHLFNBQXJCQSxrQkFBcUIsQ0FDekJDLE1BRHlCLEVBRXpCQyxVQUZ5QixFQUdaO0VBQ2IsSUFBTUMsR0FBRyxHQUFHLElBQUFDLDZCQUFBLEVBQWtCSCxNQUFsQixDQUFaO0VBQ0EsT0FBT0UsR0FBRyxDQUFDRSxHQUFKLENBQVE7SUFBQSxPQUFNSCxVQUFVLEVBQWhCO0VBQUEsQ0FBUixDQUFQO0FBQ0QsQ0FORDs7ZUFRZUYsa0IifQ==

/***/ }),

/***/ 396:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ 262:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeAgentStateHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeAgentStateHandlers(adApi) {
    var agentStateInput = document.getElementById('agent_state_input');
    var notReadyReasonInput = document.getElementById('not_ready_reason_input');
    var getAgentStateButton = document.getElementById('get_agent_state_button');
    var setAgentStateButton = document.getElementById('set_agent_state_button');
    var getAgentNotReadyReasonsButton = document.getElementById('get_agent_not_ready_reasons_button');
    helpers_1.setupHoverEffect(getAgentStateButton, []);
    getAgentStateButton.onclick = function () {
        adApi.getAgentState();
    };
    helpers_1.setupHoverEffect(setAgentStateButton, [agentStateInput, notReadyReasonInput]);
    setAgentStateButton.onclick = function () {
        var state = agentStateInput.value;
        var notReadyReason = notReadyReasonInput.value;
        adApi.setAgentState(state, notReadyReason);
    };
    helpers_1.setupHoverEffect(getAgentNotReadyReasonsButton, []);
    getAgentNotReadyReasonsButton.onclick = function () {
        adApi.getAgentNotReadyReasons();
    };
}
exports.initializeAgentStateHandlers = initializeAgentStateHandlers;


/***/ }),

/***/ 890:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeActiveInteractionHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeActiveInteractionHandlers(adApi) {
    var activeInteractionIdInput = document.getElementById('active_interaction_id_input');
    var dtmfInput = document.getElementById('dtmf_input');
    var variableNameInput = document.getElementById('variable_name_input');
    var variableValueInput = document.getElementById('variable_value_input');
    var getVariablesNamesInput = document.getElementById('get_variables_names_input');
    var setVariableButton = document.getElementById('set_variable_button');
    var getVariablesButton = document.getElementById('get_variables_button');
    var switchActiveInteractionButton = document.getElementById('switch_active_interaction_button');
    var acceptInteractionButton = document.getElementById('accept_interaction_button');
    var rejectInteractionButton = document.getElementById('reject_interaction_button');
    var sendDtmfButton = document.getElementById('send_dtmf_button');
    var setCallHoldButton = document.getElementById('set_call_hold_button');
    var callHoldCheckbox = document.getElementById('call_hold_checkbox');
    var setCallRecordingButton = document.getElementById('set_call_recording_button');
    var callRecordingCheckbox = document.getElementById('call_recording_checkbox');
    var setCallMuteButton = document.getElementById('set_call_mute_button');
    var callMuteCheckbox = document.getElementById('call_mute_checkbox');
    helpers_1.setupHoverEffect(switchActiveInteractionButton, [activeInteractionIdInput]);
    switchActiveInteractionButton.onclick = function () {
        var itemId = activeInteractionIdInput.value;
        adApi.switchActiveInteraction(itemId);
    };
    helpers_1.setupHoverEffect(switchActiveInteractionButton, [activeInteractionIdInput]);
    switchActiveInteractionButton.onclick = function () {
        var itemId = activeInteractionIdInput.value;
        adApi.switchActiveInteraction(itemId);
    };
    helpers_1.setupHoverEffect(acceptInteractionButton, [activeInteractionIdInput]);
    acceptInteractionButton.onclick = function () {
        var itemId = activeInteractionIdInput.value;
        adApi.acceptInteraction(itemId);
    };
    helpers_1.setupHoverEffect(rejectInteractionButton, [activeInteractionIdInput]);
    rejectInteractionButton.onclick = function () {
        var itemId = activeInteractionIdInput.value;
        adApi.rejectInteraction(itemId);
    };
    helpers_1.setupHoverEffect(sendDtmfButton, [dtmfInput, activeInteractionIdInput]);
    sendDtmfButton.onclick = function () {
        var dtmf = dtmfInput.value;
        var itemId = activeInteractionIdInput.value;
        adApi.sendDtmf(dtmf, itemId);
    };
    helpers_1.setupHoverEffect(setCallHoldButton, [callHoldCheckbox, activeInteractionIdInput]);
    setCallHoldButton.onclick = function () {
        var holdCall = callHoldCheckbox.checked;
        var itemId = activeInteractionIdInput.value;
        adApi.setCallHold(holdCall, itemId);
    };
    callHoldCheckbox.addEventListener('change', function (evt) {
        var holdCall = evt.target.checked;
        setCallHoldButton.innerHTML = "setCallHold (" + (holdCall ? 'hold' : 'retrieve') + ")";
    });
    helpers_1.setupHoverEffect(setCallRecordingButton, [callRecordingCheckbox, activeInteractionIdInput]);
    setCallRecordingButton.onclick = function () {
        var callRecording = callRecordingCheckbox.checked;
        var itemId = activeInteractionIdInput.value;
        adApi.setCallRecording(callRecording, itemId);
    };
    callRecordingCheckbox.addEventListener('change', function (evt) {
        var callRecording = evt.target.checked;
        setCallRecordingButton.innerHTML = "setCallRecording (" + (callRecording ? 'start' : 'stop') + ")";
    });
    helpers_1.setupHoverEffect(setCallMuteButton, [callMuteCheckbox, activeInteractionIdInput]);
    setCallMuteButton.onclick = function () {
        var muteCall = callMuteCheckbox.checked;
        var itemId = activeInteractionIdInput.value;
        adApi.setCallMute(muteCall, itemId);
    };
    callMuteCheckbox.addEventListener('change', function (evt) {
        var muteCall = evt.target.checked;
        setCallMuteButton.innerHTML = "setCallMute (" + (muteCall ? 'mute' : 'unmute') + ")";
    });
    helpers_1.setupHoverEffect(setVariableButton, [variableNameInput, variableValueInput, activeInteractionIdInput]);
    setVariableButton.onclick = function () {
        var variableName = variableNameInput.value;
        var variableValue = variableValueInput.value;
        var itemId = activeInteractionIdInput.value;
        adApi.setVariable(variableName, variableValue, itemId);
    };
    helpers_1.setupHoverEffect(getVariablesButton, [getVariablesNamesInput, activeInteractionIdInput]);
    getVariablesButton.onclick = function () {
        var variablesNames = getVariablesNamesInput.value.split(',').map(function (str) { return str.trim(); });
        var itemId = activeInteractionIdInput.value;
        adApi.getVariables(variablesNames, itemId);
    };
}
exports.initializeActiveInteractionHandlers = initializeActiveInteractionHandlers;


/***/ }),

/***/ 234:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeAssociatedObjectInteractionHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeAssociatedObjectInteractionHandlers(adApi) {
    var activeAssociatedInteractionIdInput = document.getElementById('active-associated_interaction_id_input');
    var activeScreenTextarea = document.getElementById('active_screen_textarea');
    var activeAssociatedObjectTextarea = document.getElementById('active-associated_object_textarea');
    var setInteractionActiveScreenButton = document.getElementById('set_interaction_active_screen_button');
    var addInteractionAssociatedObjectButton = document.getElementById('add_interaction_associated_object_button');
    helpers_1.setupHoverEffect(addInteractionAssociatedObjectButton, [activeAssociatedObjectTextarea, activeAssociatedInteractionIdInput]);
    addInteractionAssociatedObjectButton.onclick = function () {
        var associatedObject = null;
        try {
            associatedObject = JSON.parse(activeAssociatedObjectTextarea.value);
        }
        catch (e) {
            alert('You have syntax error in the associated object structure. Cannot parse JSON.');
        }
        if (!associatedObject) {
            return;
        }
        var itemId = activeAssociatedInteractionIdInput.value;
        adApi.addInteractionAssociatedObject(associatedObject, itemId);
    };
    helpers_1.setupHoverEffect(setInteractionActiveScreenButton, [activeScreenTextarea, activeAssociatedInteractionIdInput]);
    setInteractionActiveScreenButton.onclick = function () {
        var activeScreenData = null;
        try {
            activeScreenData = JSON.parse(activeScreenTextarea.value);
        }
        catch (e) {
            alert('You have syntax error in the active screen data structure. Cannot parse JSON.');
        }
        if (!activeScreenData) {
            return;
        }
        var itemId = activeAssociatedInteractionIdInput.value;
        adApi.setInteractionActiveScreen(activeScreenData, itemId);
    };
    var btnPasteServiceNowContactObject = document.getElementById('active_associated_object_paste_service_now_contact_object');
    var btnPasteServiceNowTaskObject = document.getElementById('active_associated_object_paste_service_now_task_object');
    var btnPasteSalesforceCaseObject = document.getElementById('active_associated_object_paste_salesforce_case_object');
    var btnPasteSalesforceContactObject = document.getElementById('active_associated_object_paste_salesforce_contact_object');
    btnPasteServiceNowContactObject.addEventListener('click', pasteServiceNowContactObject);
    btnPasteServiceNowTaskObject.addEventListener('click', pasteServiceNowTaskObject);
    btnPasteSalesforceCaseObject.addEventListener('click', pasteSalesforceCaseObject);
    btnPasteSalesforceContactObject.addEventListener('click', pasteSalesforceContactObject);
    function pasteServiceNowContactObject() {
        activeAssociatedObjectTextarea.value = JSON.stringify({
            "id": "1",
            "type": "contact",
            "displayName": "Pavel Karpovich",
            "displayType": "Contact",
            "customFields": {
                "isServiceNowContact": "true"
            }
        }, null, 4);
    }
    function pasteServiceNowTaskObject() {
        activeAssociatedObjectTextarea.value = JSON.stringify({
            "id": "2",
            "type": "task",
            "displayName": "TD-101",
            "displayType": "Task",
            "customFields": {
                "isServiceNowTask": "true"
            }
        }, null, 4);
    }
    function pasteSalesforceCaseObject() {
        activeAssociatedObjectTextarea.value = JSON.stringify({
            "id": "3",
            "type": "case",
            "displayName": "CS-404",
            "displayType": "Case",
            "customFields": {
                "isCase": "true"
            }
        }, null, 4);
    }
    function pasteSalesforceContactObject() {
        activeAssociatedObjectTextarea.value = JSON.stringify({
            "id": "4",
            "type": "contact",
            "displayName": "Nikolai Maslak",
            "displayType": "Contact",
            "customFields": {
                "isContact": "true"
            }
        }, null, 4);
    }
}
exports.initializeAssociatedObjectInteractionHandlers = initializeAssociatedObjectInteractionHandlers;


/***/ }),

/***/ 484:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeChatHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeChatHandlers(adApi) {
    var chatInteractionIdInput = document.getElementById('chat_interaction_id_input');
    var chatMessageInput = document.getElementById('chat_message_input');
    var overwriteMessageCheckbox = document.getElementById('chat_message_overwrite_checkbox');
    var sendChatMessageButton = document.getElementById('send_chat_message_button');
    var suggestChatMessageButton = document.getElementById('suggest_chat_message_button');
    helpers_1.setupHoverEffect(sendChatMessageButton, [chatMessageInput, chatInteractionIdInput]);
    sendChatMessageButton.onclick = function () {
        var chatMessage = chatMessageInput.value;
        var chatItemId = chatInteractionIdInput.value;
        adApi.sendChatMessage(chatMessage, chatItemId);
    };
    helpers_1.setupHoverEffect(suggestChatMessageButton, [chatMessageInput, overwriteMessageCheckbox, chatInteractionIdInput]);
    suggestChatMessageButton.onclick = function () {
        var chatMessage = chatMessageInput.value;
        var overwriteMessage = overwriteMessageCheckbox.checked;
        var chatItemId = chatInteractionIdInput.value;
        adApi.suggestChatMessage(chatMessage, overwriteMessage, chatItemId);
    };
}
exports.initializeChatHandlers = initializeChatHandlers;


/***/ }),

/***/ 198:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeConferenceInteractionHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeConferenceInteractionHandlers(adApi) {
    var conferencePhoneNumberInput = document.getElementById('conference_phone_number_input');
    var partyIdInput = document.getElementById('party_id_input');
    var conferenceInteractionIdInput = document.getElementById('conference_interaction_id_input');
    var conferenceTransferDataTextarea = document.getElementById('conference_transfer_data_textarea');
    var inviteToCallConferenceButton = document.getElementById('add_to_call_conference_button');
    var removeFromCallConferenceButton = document.getElementById('remove_from_call_conference_button');
    var destroyCallConferenceButton = document.getElementById('destroy_call_conference_button');
    var mergeIntoConferenceButton = document.getElementById('merge_into_conference_button');
    var inviteToChatConferenceButton = document.getElementById('invite_to_chat_conference');
    var removeFromChatConferenceButton = document.getElementById('remove_from_chat_conference');
    helpers_1.setupHoverEffect(inviteToCallConferenceButton, [conferencePhoneNumberInput, conferenceTransferDataTextarea, conferenceInteractionIdInput]);
    inviteToCallConferenceButton.onclick = function () {
        var phoneNumber = conferencePhoneNumberInput.value;
        var transferData = undefined;
        try {
            transferData = JSON.parse(conferenceTransferDataTextarea.value);
        }
        catch (e) {
            alert('You have syntax error in the transfer data structure. Cannot parse JSON.');
        }
        var itemId = conferenceInteractionIdInput.value;
        adApi.inviteToCallConference(phoneNumber, transferData, itemId);
    };
    helpers_1.setupHoverEffect(removeFromCallConferenceButton, [partyIdInput, conferenceInteractionIdInput]);
    removeFromCallConferenceButton.onclick = function () {
        var partyId = partyIdInput.value;
        var itemId = conferenceInteractionIdInput.value;
        adApi.removeFromCallConference(partyId, itemId);
    };
    helpers_1.setupHoverEffect(destroyCallConferenceButton, [conferenceInteractionIdInput]);
    destroyCallConferenceButton.onclick = function () {
        var itemId = conferenceInteractionIdInput.value;
        adApi.destroyCallConference(itemId);
    };
    helpers_1.setupHoverEffect(mergeIntoConferenceButton, [conferenceTransferDataTextarea]);
    mergeIntoConferenceButton.onclick = function () {
        var transferData = undefined;
        try {
            transferData = JSON.parse(conferenceTransferDataTextarea.value);
        }
        catch (e) {
            alert('You have syntax error in the transfer data structure. Cannot parse JSON.');
        }
        adApi.mergeAllCallsIntoConference(transferData);
    };
    helpers_1.setupHoverEffect(inviteToChatConferenceButton, [partyIdInput, conferenceInteractionIdInput]);
    inviteToChatConferenceButton.onclick = function () {
        var partyId = partyIdInput.value;
        var itemId = conferenceInteractionIdInput.value;
        adApi.inviteToChatConference(partyId, itemId);
    };
    helpers_1.setupHoverEffect(removeFromChatConferenceButton, [partyIdInput, conferenceInteractionIdInput]);
    removeFromChatConferenceButton.onclick = function () {
        var partyId = partyIdInput.value;
        var itemId = conferenceInteractionIdInput.value;
        adApi.removeFromChatConference(partyId, itemId);
    };
}
exports.initializeConferenceInteractionHandlers = initializeConferenceInteractionHandlers;


/***/ }),

/***/ 999:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeEndInteractionHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeEndInteractionHandlers(adApi) {
    var completeNoteInput = document.getElementById('complete_note_input');
    var completeInteractionIdInput = document.getElementById('complete_interaction_id_input');
    var completeDispositionIdInput = document.getElementById('complete_disposition_id_input');
    var completeDestroyCallConferenceButton = document.getElementById('complete_destroy_call_conference_button');
    var leaveInteractionButton = document.getElementById('leave_interaction_button');
    var completeInteractionButton = document.getElementById('complete_interaction_button');
    var leaveAndCompleteInteractionButton = document.getElementById('leave_and_complete_interaction_button');
    helpers_1.setupHoverEffect(completeDestroyCallConferenceButton, [completeInteractionIdInput]);
    completeDestroyCallConferenceButton.onclick = function () {
        var itemId = completeInteractionIdInput.value;
        adApi.destroyCallConference(itemId);
    };
    helpers_1.setupHoverEffect(leaveInteractionButton, [completeInteractionIdInput]);
    leaveInteractionButton.onclick = function () {
        var itemId = completeInteractionIdInput.value;
        adApi.leaveInteraction(itemId);
    };
    helpers_1.setupHoverEffect(completeInteractionButton, [completeInteractionIdInput]);
    completeInteractionButton.onclick = function () {
        var itemId = completeInteractionIdInput.value;
        adApi.completeInteraction(itemId);
    };
    helpers_1.setupHoverEffect(leaveAndCompleteInteractionButton, [completeDispositionIdInput, completeNoteInput, completeInteractionIdInput]);
    leaveAndCompleteInteractionButton.onclick = function () {
        var dispositionId = completeDispositionIdInput.value;
        var note = completeNoteInput.value;
        var itemId = completeInteractionIdInput.value;
        adApi.leaveAndCompleteInteraction(dispositionId, note, itemId);
    };
}
exports.initializeEndInteractionHandlers = initializeEndInteractionHandlers;


/***/ }),

/***/ 554:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeNotesAndDispositionsHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeNotesAndDispositionsHandlers(adApi) {
    var notesServiceIdInput = document.getElementById('notes_service_id_input');
    var notesInteractionIdInput = document.getElementById('notes_interaction_id_input');
    var noteInput = document.getElementById('note_input');
    var dispositionIdInput = document.getElementById('disposition_id_input');
    var addNoteButton = document.getElementById('add_note_button');
    var updateNoteButton = document.getElementById('update_note_button');
    var replaceNoteButton = document.getElementById('replace_note_button');
    var getDispositionsListButton = document.getElementById('get_dispositions_list_button');
    var setDispositionButton = document.getElementById('set_disposition_button');
    helpers_1.setupHoverEffect(getDispositionsListButton, [notesServiceIdInput, notesInteractionIdInput]);
    getDispositionsListButton.onclick = function () {
        var serviceId = notesServiceIdInput.value;
        var itemId = notesInteractionIdInput.value;
        adApi.getDispositionsList({
            service: serviceId,
            interactionId: itemId,
        });
    };
    helpers_1.setupHoverEffect(setDispositionButton, [dispositionIdInput, notesInteractionIdInput]);
    setDispositionButton.onclick = function () {
        var dispositionId = dispositionIdInput.value;
        var itemId = notesInteractionIdInput.value;
        adApi.setDisposition(dispositionId, itemId);
    };
    helpers_1.setupHoverEffect(addNoteButton, [noteInput, notesInteractionIdInput]);
    addNoteButton.onclick = function () {
        var note = noteInput.value;
        var itemId = notesInteractionIdInput.value;
        adApi.addNote(note, itemId);
    };
    helpers_1.setupHoverEffect(updateNoteButton, [noteInput, notesInteractionIdInput]);
    updateNoteButton.onclick = function () {
        var note = noteInput.value;
        var itemId = notesInteractionIdInput.value;
        adApi.updateNote(note, itemId);
    };
    helpers_1.setupHoverEffect(replaceNoteButton, [noteInput, notesInteractionIdInput]);
    replaceNoteButton.onclick = function () {
        var note = noteInput.value;
        var itemId = notesInteractionIdInput.value;
        adApi.replaceNote(note, itemId);
    };
}
exports.initializeNotesAndDispositionsHandlers = initializeNotesAndDispositionsHandlers;


/***/ }),

/***/ 369:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeStartInteractionHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeStartInteractionHandlers(adApi) {
    var startCallPhoneNumberInput = document.getElementById('start_call_phone_number_input');
    var chatChannelInput = document.getElementById('chat_channel_input');
    var emailAddressInput = document.getElementById('email_address_input');
    var chatAddressInput = document.getElementById('chat_address_input');
    var associatedObjectTextarea = document.getElementById('associated_object_textarea');
    var startChatButton = document.getElementById('start_chat_button');
    var startEmailButton = document.getElementById('start_email_button');
    var startCallButton = document.getElementById('start_call_button');
    helpers_1.setupHoverEffect(startCallButton, [startCallPhoneNumberInput, associatedObjectTextarea]);
    startCallButton.onclick = function () {
        var phone = startCallPhoneNumberInput.value;
        var associatedObject = undefined;
        var associatedObjectStr = associatedObjectTextarea.value;
        if (associatedObjectStr) {
            try {
                associatedObject = JSON.parse(associatedObjectStr);
            }
            catch (e) {
                alert('You have syntax error in the associated object structure. Cannot parse JSON.');
                return;
            }
        }
        adApi.startCall(phone, associatedObject);
    };
    helpers_1.setupHoverEffect(startChatButton, [chatChannelInput, chatAddressInput, associatedObjectTextarea]);
    startChatButton.onclick = function () {
        var chatChannel = chatChannelInput.value;
        var chatAddress = chatAddressInput.value;
        var associatedObject = undefined;
        var associatedObjectStr = associatedObjectTextarea.value;
        if (associatedObjectStr) {
            try {
                associatedObject = JSON.parse(associatedObjectStr);
            }
            catch (e) {
                alert('You have syntax error in the associated object structure. Cannot parse JSON.');
                return;
            }
        }
        adApi.startChat(chatChannel, chatAddress, associatedObject);
    };
    helpers_1.setupHoverEffect(startEmailButton, [emailAddressInput, associatedObjectTextarea]);
    startEmailButton.onclick = function () {
        var emailAddress = emailAddressInput.value;
        var associatedObject = undefined;
        var associatedObjectStr = associatedObjectTextarea.value;
        if (associatedObjectStr) {
            try {
                associatedObject = JSON.parse(associatedObjectStr);
            }
            catch (e) {
                alert('You have syntax error in the associated object structure. Cannot parse JSON.');
                return;
            }
        }
        adApi.startEmail(emailAddress, associatedObject);
    };
}
exports.initializeStartInteractionHandlers = initializeStartInteractionHandlers;


/***/ }),

/***/ 906:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeTransferInteractionHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeTransferInteractionHandlers(adApi) {
    var interactionIdInput = document.getElementById('interaction_id_input');
    var transferPhoneNumberInput = document.getElementById('transfer_phone_number_input');
    var transferDataTextarea = document.getElementById('transfer_data_textarea');
    var consultCallButton = document.getElementById('consult_call_button');
    var blindTransferButton = document.getElementById('blind_transfer_button');
    var transferButton = document.getElementById('transfer_button');
    helpers_1.setupHoverEffect(blindTransferButton, [transferPhoneNumberInput, interactionIdInput, transferDataTextarea]);
    blindTransferButton.onclick = function () {
        var phoneNumber = transferPhoneNumberInput.value;
        var itemId = interactionIdInput.value;
        var transferData = undefined;
        try {
            transferData = JSON.parse(transferDataTextarea.value);
        }
        catch (e) {
            alert('You have syntax error in the transfer data structure. Cannot parse JSON.');
        }
        adApi.blindTransfer(phoneNumber, transferData, itemId);
    };
    helpers_1.setupHoverEffect(consultCallButton, [transferPhoneNumberInput]);
    consultCallButton.onclick = function () {
        var phoneNumber = transferPhoneNumberInput.value;
        adApi.consultCall(phoneNumber);
    };
    helpers_1.setupHoverEffect(transferButton, [transferDataTextarea]);
    transferButton.onclick = function () {
        var transferData = undefined;
        try {
            transferData = JSON.parse(transferDataTextarea.value);
        }
        catch (e) {
            alert('You have syntax error in the transfer data structure. Cannot parse JSON.');
        }
        adApi.transfer(transferData);
    };
    adApi.on('ON_REQUEST_TRANSFER_DATA', function () {
        var transferData = undefined;
        try {
            transferData = JSON.parse(transferDataTextarea.value);
        }
        catch (e) {
            alert('You have syntax error in the transfer data structure. Cannot parse JSON.');
        }
        if (!transferData) {
            return null;
        }
        return transferData;
    });
    adApi.on('ON_LOAD_TRANSFER_DATA', function (itemId, data) {
        console.info("@@@ get transfer data for item " + itemId + ": \n\n" + JSON.stringify(data));
    });
}
exports.initializeTransferInteractionHandlers = initializeTransferInteractionHandlers;


/***/ }),

/***/ 977:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeKnowledgeBaseHandlers = void 0;
var lorem_ipsum_1 = __webpack_require__(380);
var helpers_1 = __webpack_require__(382);
var tree_1 = __webpack_require__(420);
var textGen = new lorem_ipsum_1.LoremIpsum();
function initializeKnowledgeBaseHandlers(adApi) {
    var initialTree = {
        'root_1': {
            type: 'node',
            displayName: 'Common cases',
            id: 'root_1',
            ref: {},
            children: {
                'customers_1': {
                    type: 'node',
                    displayName: 'End users',
                    id: 'customers_1',
                    ref: {},
                    children: {
                        'article_1': {
                            type: 'leaf',
                            displayName: 'Unable to login',
                            id: 'article_1',
                            ref: {
                                content: textGen.generateParagraphs(3),
                            },
                        },
                        'article_2': {
                            type: 'leaf',
                            displayName: 'Service unavailable error',
                            id: 'article_2',
                            ref: {
                                content: textGen.generateParagraphs(3),
                            },
                        },
                        'article_3': {
                            type: 'leaf',
                            displayName: 'Help with registration',
                            id: 'article_3',
                            ref: {
                                content: textGen.generateParagraphs(3),
                            },
                        },
                    },
                },
                'partners_1': {
                    type: 'node',
                    displayName: 'Business partners',
                    id: 'partners_1',
                    ref: {},
                    children: {
                        'article_4': {
                            type: 'leaf',
                            displayName: 'Request for a meeting',
                            id: 'article_4',
                            ref: {
                                content: textGen.generateParagraphs(3),
                            },
                        },
                        'article_5': {
                            type: 'leaf',
                            displayName: 'Contract questions',
                            id: 'article_5',
                            ref: {
                                content: textGen.generateParagraphs(3),
                            },
                        },
                    },
                }
            },
        },
        'root_2': {
            type: 'node',
            displayName: 'Hardware maintenance',
            id: 'root_2',
            ref: {},
            children: {
                'article_6': {
                    type: 'leaf',
                    displayName: 'HTC device malfuction',
                    id: 'article_6',
                    ref: {
                        content: textGen.generateParagraphs(3),
                    },
                },
                'article_7': {
                    type: 'leaf',
                    displayName: 'PU voltage issues',
                    id: 'article_7',
                    ref: {
                        content: textGen.generateParagraphs(3),
                    },
                },
                'article_8': {
                    type: 'leaf',
                    displayName: 'Unable to connect wireless device',
                    id: 'article_8',
                    ref: {
                        content: textGen.generateParagraphs(3),
                    },
                },
            },
        },
        'readme': {
            type: 'leaf',
            displayName: 'KB Reminder',
            id: 'readme',
            ref: {
                content: textGen.generateParagraphs(1),
            },
        }
    };
    var kbTreeRoot = document.getElementById('kb_tree_root');
    helpers_1.assertDefined(kbTreeRoot);
    var kbTree = new tree_1.Tree(initialTree, { mountNode: kbTreeRoot });
    adApi.on('ON_SEARCH_KNOWLEDGE_BASE', function (query, _language, folderId) {
        var currentTree = kbTree.getTree();
        var foundNode = folderId ? helpers_1.findNode(currentTree, folderId) : undefined;
        if (folderId && (!foundNode || foundNode.type !== 'node')) {
            return [];
        }
        var searchRoot = (foundNode === null || foundNode === void 0 ? void 0 : foundNode.type) == 'node' ? foundNode.children : currentTree;
        var allLeafs = helpers_1.flatTree(searchRoot);
        return allLeafs
            .filter(function (leaf) { return leaf.displayName.includes(query) || leaf.ref.content.includes(query); })
            .map(function (leaf) { return ({
            type: 'article',
            id: leaf.id,
            text: leaf.ref.content,
            title: leaf.displayName,
        }); });
    });
    adApi.on('ON_GET_KNOWLEDGE_BASE_ARTICLE', function (articleId) {
        var leaf = helpers_1.flatTree(kbTree.getTree()).find(function (leaf) { return leaf.id === articleId; });
        if (!leaf) {
            return null;
        }
        return {
            id: leaf.id,
            title: leaf.displayName,
            answer: leaf.ref.content,
            keywords: 'none',
            createdByUser: 'unknown',
            lastEditedByUser: 'unknown',
            notes: 'empty',
            language: 'en',
            customFields: [],
        };
    });
    adApi.on('ON_GET_KNOWLEDGE_BASE_FOLDER', function (_a) {
        var folderId = _a.folderId;
        var currentTree = kbTree.getTree();
        var foundNode = folderId ? helpers_1.findNode(currentTree, folderId) : undefined;
        console.log('%%%% foundNode:', foundNode);
        if (folderId && (!foundNode || foundNode.type !== 'node')) {
            return [];
        }
        var requestedRoot = (foundNode === null || foundNode === void 0 ? void 0 : foundNode.type) == 'node' ? foundNode.children : currentTree;
        console.log('%%% requestedRoot:', requestedRoot);
        return Object.values(requestedRoot)
            .map(function (item) {
            if (item.type === 'node') {
                return {
                    type: 'folder',
                    id: item.id,
                    title: item.displayName,
                };
            }
            else {
                return {
                    type: 'article',
                    id: item.id,
                    title: item.displayName,
                    text: item.ref.content,
                };
            }
        });
    });
}
exports.initializeKnowledgeBaseHandlers = initializeKnowledgeBaseHandlers;


/***/ }),

/***/ 851:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializePhoneDeviceHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializePhoneDeviceHandlers(adApi) {
    var phoneDeviceTypeInput = document.getElementById('phone_device_type_input');
    var phoneDeviceNumberInput = document.getElementById('phone_device_number_input');
    var getPhoneDeviceButton = document.getElementById('get_phone_device_button');
    var setPhoneDeviceButton = document.getElementById('set_phone_device_button');
    var getPhoneDevicesListButton = document.getElementById('get_phone_devices_list_button');
    helpers_1.setupHoverEffect(getPhoneDevicesListButton, []);
    getPhoneDevicesListButton.onclick = function () {
        adApi.getPhoneDevicesList();
    };
    helpers_1.setupHoverEffect(getPhoneDeviceButton, []);
    getPhoneDeviceButton.onclick = function () {
        adApi.getPhoneDevice();
    };
    helpers_1.setupHoverEffect(setPhoneDeviceButton, [phoneDeviceTypeInput, phoneDeviceNumberInput]);
    setPhoneDeviceButton.onclick = function () {
        adApi.setPhoneDevice({
            type: phoneDeviceTypeInput.value,
            phone: phoneDeviceNumberInput.value,
        });
    };
}
exports.initializePhoneDeviceHandlers = initializePhoneDeviceHandlers;


/***/ }),

/***/ 114:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeRescheduleHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeRescheduleHandlers(adApi) {
    var fromTimeInput = document.getElementById('from_time_input');
    var untilTimeInput = document.getElementById('until_time_input');
    var timezoneCodeInput = document.getElementById('timezone_code_input');
    var reschedulePhoneNumberInput = document.getElementById('reschedule_phone_number_input');
    var rescheduleInteractionIdInput = document.getElementById('reschedule_interaction_id_input');
    var setRescheduleWindowButton = document.getElementById('set_reschedule_window_button');
    helpers_1.setupHoverEffect(setRescheduleWindowButton, [reschedulePhoneNumberInput, rescheduleInteractionIdInput, fromTimeInput, untilTimeInput, timezoneCodeInput]);
    setRescheduleWindowButton.onclick = function () {
        var phoneNumber = reschedulePhoneNumberInput.value;
        var itemId = rescheduleInteractionIdInput.value;
        var fromTime = fromTimeInput.value;
        var untilTime = untilTimeInput.value;
        var timezoneCode = timezoneCodeInput.value;
        adApi.setRescheduleWindow({ numberToDial: phoneNumber, fromTime: fromTime, untilTime: untilTime, timezoneCode: timezoneCode }, itemId);
    };
}
exports.initializeRescheduleHandlers = initializeRescheduleHandlers;


/***/ }),

/***/ 330:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeResizeButtonHandler = void 0;
function initializeResizeButtonHandler() {
    var resetSizeButton = document.querySelector('.reset_size_button');
    var mainSection = document.querySelector('.content');
    resetSizeButton.addEventListener('click', resetMainSectionSize);
    function resetMainSectionSize() {
        mainSection.removeAttribute('style');
    }
}
exports.initializeResizeButtonHandler = initializeResizeButtonHandler;


/***/ }),

/***/ 25:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeScreenRecordingHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeScreenRecordingHandlers(adApi) {
    var screenRecordingMuteCheckbox = document.getElementById('screen_recording_mute_checkbox');
    var setScreenRecordingMuteButton = document.getElementById('set_screen_recording_mute_button');
    var getScreenRecordingStateButton = document.getElementById('get_screen_recording_state_button');
    helpers_1.setupHoverEffect(setScreenRecordingMuteButton, [screenRecordingMuteCheckbox]);
    setScreenRecordingMuteButton.onclick = function () {
        var muteScreenRecording = screenRecordingMuteCheckbox.checked;
        adApi.setScreenRecordingMute(muteScreenRecording);
    };
    screenRecordingMuteCheckbox.addEventListener('change', function (evt) {
        var screenRecordingMute = evt.target.checked;
        setScreenRecordingMuteButton.innerHTML = "setScreenRecordingMute (" + (screenRecordingMute ? 'mute' : 'unmute') + ")";
    });
    helpers_1.setupHoverEffect(getScreenRecordingStateButton, []);
    getScreenRecordingStateButton.onclick = function () {
        adApi.getScreenRecordingState();
    };
}
exports.initializeScreenRecordingHandlers = initializeScreenRecordingHandlers;


/***/ }),

/***/ 733:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeServicesAndDIDHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeServicesAndDIDHandlers(adApi) {
    var serviceIdInput = document.getElementById('service_id_input');
    var didPhoneInput = document.getElementById('did_phone_input');
    var getServiceButton = document.getElementById('get_service_button');
    var getServicesListButton = document.getElementById('get_services_list_button');
    var setServiceButton = document.getElementById('set_service_button');
    var getDIDNumberButton = document.getElementById('get_did_number_button');
    var getDIDNumbersListButton = document.getElementById('get_did_numbers_list_button');
    var setDIDNumberButton = document.getElementById('set_did_number_button');
    helpers_1.setupHoverEffect(getServiceButton, []);
    getServiceButton.onclick = function () {
        adApi.getService();
    };
    helpers_1.setupHoverEffect(getServicesListButton, []);
    getServicesListButton.onclick = function () {
        adApi.getServicesList();
    };
    helpers_1.setupHoverEffect(setServiceButton, [serviceIdInput]);
    setServiceButton.onclick = function () {
        var serviceId = serviceIdInput.value;
        adApi.setService(serviceId);
    };
    helpers_1.setupHoverEffect(getDIDNumberButton, []);
    getDIDNumberButton.onclick = function () {
        adApi.getDIDNumber();
    };
    helpers_1.setupHoverEffect(getDIDNumbersListButton, []);
    getDIDNumbersListButton.onclick = function () {
        adApi.getDIDNumbersList();
    };
    helpers_1.setupHoverEffect(setDIDNumberButton, [didPhoneInput]);
    setDIDNumberButton.onclick = function () {
        var didPhoneNumber = didPhoneInput.value;
        adApi.setDIDNumber(didPhoneNumber);
    };
}
exports.initializeServicesAndDIDHandlers = initializeServicesAndDIDHandlers;


/***/ }),

/***/ 593:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeSessionHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeSessionHandlers(adApi) {
    console.log("initializeSessionHandlers: adApi");
    var savedLoginData;
    adApi.on('ON_SERVER_ERROR', function (error) {
        console.log("ON_SERVER_ERROR: error=", error);
        if (error.code === 108 && savedLoginData) { // 108= 'user_already_logged_in'
            adApi.login(savedLoginData, true);
        }
        savedLoginData = undefined;
    });
    adApi.on('ON_LOGIN', function (loginState) {
        console.log("ON_LOGIN: loginState=", loginState);
        savedLoginData = undefined;
    });
    var tenantInput = document.getElementById('tenant_input');
    var usernameInput = document.getElementById('username_input');
    var passwordInput = document.getElementById('password_input');
    var loginButton = document.getElementById('login_button');
    var logoutButton = document.getElementById('logout_button');
    var getLoginStateButton = document.getElementById('get_login_state_button');
    helpers_1.setupHoverEffect(getLoginStateButton, []);
    getLoginStateButton.onclick = function () {
        adApi.getLoginState();
    };
    helpers_1.setupHoverEffect(loginButton, [usernameInput, passwordInput, tenantInput]);
    loginButton.onclick = function () {
        var username = usernameInput.value;
        var password = passwordInput.value;
        var tenant = tenantInput.value;
        console.table();
        var loginData = { username: username, password: password, tenant: tenant };
        savedLoginData = loginData;
        adApi.login(loginData);
    };
    helpers_1.setupHoverEffect(logoutButton, []);
    logoutButton.onclick = function () {
        adApi.logout();
    };
}
exports.initializeSessionHandlers = initializeSessionHandlers;


/***/ }),

/***/ 449:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeTeamsHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeTeamsHandlers(adApi) {
    var teamIdInput = document.getElementById('team_id_input');
    var getTeamsButton = document.getElementById('get_teams_button');
    var getTeamMembersButton = document.getElementById('get_team_members_button');
    helpers_1.setupHoverEffect(getTeamsButton, []);
    getTeamsButton.onclick = function () {
        adApi.getTeams();
    };
    helpers_1.setupHoverEffect(getTeamMembersButton, [teamIdInput]);
    getTeamMembersButton.onclick = function () {
        var teamId = teamIdInput.value;
        adApi.getTeamMembers(teamId);
    };
}
exports.initializeTeamsHandlers = initializeTeamsHandlers;


/***/ }),

/***/ 127:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initializeWidgetAndConfigHandlers = void 0;
var helpers_1 = __webpack_require__(382);
function initializeWidgetAndConfigHandlers(adApi) {
    var getConfigButton = document.getElementById('get_config_button');
    var setWidgetMinimizedButton = document.getElementById('set_widget_minimized_button');
    var widgetMinimizedCheckbox = document.getElementById('widget_minimized_checkbox');
    helpers_1.setupHoverEffect(getConfigButton, []);
    getConfigButton.onclick = function () {
        adApi.getConfig();
    };
    helpers_1.setupHoverEffect(setWidgetMinimizedButton, [widgetMinimizedCheckbox]);
    setWidgetMinimizedButton.onclick = function () {
        var widgetMinimized = widgetMinimizedCheckbox.checked;
        adApi.setWidgetMinimized(widgetMinimized);
    };
}
exports.initializeWidgetAndConfigHandlers = initializeWidgetAndConfigHandlers;


/***/ }),

/***/ 382:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.flatTree = exports.findNode = exports.assertDefined = exports.setupHoverEffect = void 0;
function setupHoverEffect(hoverElement, highlightElements) {
    hoverElement.addEventListener('mouseenter', function () {
        highlightElements.forEach(function (element) {
            element.classList.add('highlighted');
        });
    });
    hoverElement.addEventListener('mouseleave', function () {
        highlightElements.forEach(function (element) {
            element.classList.remove('highlighted');
        });
    });
}
exports.setupHoverEffect = setupHoverEffect;
function assertDefined(data, errorMessage) {
    if (typeof data === 'undefined' || data === null) {
        throw new Error(errorMessage !== null && errorMessage !== void 0 ? errorMessage : 'The assertDefined check is not passed. Argument has type undefined');
    }
}
exports.assertDefined = assertDefined;
function findNode(treeRoot, nodeId) {
    function traverse(children) {
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var item = children_1[_i];
            if (item.id === nodeId) {
                return item;
            }
            if (item.type === 'node') {
                var ret = traverse(Object.values(item.children));
                if (ret !== null) {
                    return ret;
                }
            }
        }
        return null;
    }
    return traverse(Object.values(treeRoot));
}
exports.findNode = findNode;
function flatTree(treeRoot) {
    function traverse(acc, node) {
        if (node.type === 'node') {
            return Object.values(node.children).reduce(traverse, acc);
        }
        acc.push(node);
        return acc;
    }
    return Object.values(treeRoot).reduce(traverse, []);
}
exports.flatTree = flatTree;


/***/ }),

/***/ 456:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Hamburger = void 0;
var focusTrap = __importStar(__webpack_require__(291));
var Hamburger = /** @class */ (function () {
    function Hamburger(selectors) {
        var _this = this;
        this.isOpened = function () {
            var _a, _b, _c;
            console.log('this.hamburger.classList-->', (_a = _this === null || _this === void 0 ? void 0 : _this.hamburger) === null || _a === void 0 ? void 0 : _a.classList.contains('expanded'));
            return !!((_c = (_b = _this.hamburger) === null || _b === void 0 ? void 0 : _b.classList) === null || _c === void 0 ? void 0 : _c.contains('expanded'));
        };
        this.toggle = function (evtOrForceShow) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            var forceShow;
            if (typeof evtOrForceShow === 'boolean') {
                forceShow = evtOrForceShow;
            }
            if (forceShow === true) {
                (_b = (_a = _this.hamburger) === null || _a === void 0 ? void 0 : _a.classList) === null || _b === void 0 ? void 0 : _b.add('expanded');
                (_d = (_c = _this.menu) === null || _c === void 0 ? void 0 : _c.classList) === null || _d === void 0 ? void 0 : _d.add('expanded');
                _this.menuFocusTrap.activate();
                return;
            }
            if (forceShow === false) {
                (_f = (_e = _this.hamburger) === null || _e === void 0 ? void 0 : _e.classList) === null || _f === void 0 ? void 0 : _f.remove('expanded');
                (_h = (_g = _this.menu) === null || _g === void 0 ? void 0 : _g.classList) === null || _h === void 0 ? void 0 : _h.remove('expanded');
                _this.menuFocusTrap.deactivate();
                return;
            }
            if ((_k = (_j = _this.hamburger) === null || _j === void 0 ? void 0 : _j.classList) === null || _k === void 0 ? void 0 : _k.contains('expanded')) {
                _this.menuFocusTrap.deactivate();
            }
            else {
                _this.menuFocusTrap.activate();
            }
            (_m = (_l = _this.hamburger) === null || _l === void 0 ? void 0 : _l.classList) === null || _m === void 0 ? void 0 : _m.toggle('expanded');
            (_p = (_o = _this.menu) === null || _o === void 0 ? void 0 : _o.classList) === null || _p === void 0 ? void 0 : _p.toggle('expanded');
        };
        this.initializeEventListener = function () {
            var _a;
            (_a = _this.hamburger) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (evt) {
                evt.stopPropagation();
                _this.toggle();
            });
        };
        this.hamburger = document.querySelector(selectors.hamburger);
        this.menu = document.querySelector(selectors.menu);
        this.menuItemSelector = selectors.menuItem;
        if (!this.menu) {
            throw Error('Invalid selector for menu');
        }
        if (!this.hamburger) {
            throw Error('Invalid selector for hamburger');
        }
        this.menuFocusTrap = focusTrap.createFocusTrap(this.menu, {
            clickOutsideDeactivates: true,
            initialFocus: this.menuItemSelector + '.opened',
            fallbackFocus: this.menuItemSelector,
        });
    }
    return Hamburger;
}());
exports.Hamburger = Hamburger;


/***/ }),

/***/ 641:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Logger = void 0;
var messageClass = {
    'o': 'outgoing',
    'or': 'outgoing-result',
    'i': 'incoming',
    'ir': 'incoming-result',
    'e': 'error',
};
var Logger = /** @class */ (function () {
    function Logger(adApi, logsSelector) {
        var _this = this;
        this.log = function (type, message, content) {
            if (!_this.logsNode) {
                throw new Error('Logs node is not found. Please, provide it to the Logger');
            }
            var logMessageDiv = _this.createLogNode(type, message, content);
            var wasScrolledToBottom = _this.isScrolledToBottom(_this.logsNode);
            _this.addLogMessage(logMessageDiv);
            if (wasScrolledToBottom)
                _this.scrollLogsNodeToBottom(_this.logsNode);
        };
        this.clearLog = function () {
            if (!_this.logsNode) {
                throw new Error('Logs node is not found. Please, provide it to the Logger');
            }
            _this.logsNode.innerText = '';
        };
        this.initializeClearLogOnClick = function (buttonSelector) {
            var button = document.querySelector(buttonSelector);
            if (!button) {
                throw new Error("No button found by this selector: " + buttonSelector);
            }
            button.addEventListener('click', _this.clearLog);
        };
        this.initialize = function () {
            _this.adApi.injectMessageLogger(function (message, data) {
                if (message.startsWith('ON_')) {
                    if (message.endsWith('_RESPONSE')) {
                        _this.log('or', message, data ? JSON.stringify(data) : '');
                    }
                    else {
                        _this.log('i', message, data ? JSON.stringify(data) : '');
                    }
                }
                else {
                    if (message.endsWith('_RESPONSE')) {
                        _this.log(data.status === 'success' ? 'ir' : 'e', message, JSON.stringify(data));
                    }
                    else {
                        _this.log('o', message, data ? JSON.stringify(data) : '');
                    }
                }
            });
        };
        this.logsNode = document.querySelector(logsSelector);
        this.adApi = adApi;
    }
    Logger.prototype.createLogNode = function (type, message, content) {
        var logMessageDiv = document.createElement('div');
        var typeContainerDiv = document.createElement('div');
        var typeDiv = document.createElement('div');
        var dataDiv = document.createElement('div');
        logMessageDiv.classList.add('log-msg');
        logMessageDiv.classList.add(messageClass[type]);
        typeDiv.textContent = message;
        dataDiv.textContent = content;
        typeContainerDiv.appendChild(typeDiv);
        logMessageDiv.appendChild(typeContainerDiv);
        logMessageDiv.appendChild(dataDiv);
        return logMessageDiv;
    };
    Logger.prototype.addLogMessage = function (logMessageDiv) {
        var _a;
        (_a = this.logsNode) === null || _a === void 0 ? void 0 : _a.appendChild(logMessageDiv);
    };
    Logger.prototype.isScrolledToBottom = function (node) {
        return node.scrollHeight - node.clientHeight <= node.scrollTop + 1;
    };
    Logger.prototype.scrollLogsNodeToBottom = function (logsNode) {
        logsNode.scrollTop = logsNode.scrollHeight - logsNode.clientHeight;
    };
    return Logger;
}());
exports.Logger = Logger;


/***/ }),

/***/ 214:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Menu = void 0;
var Menu = /** @class */ (function () {
    function Menu(hamburger, selectors) {
        var _this = this;
        var _a, _b;
        this.multiplySelect = false;
        this.opened = '';
        this.toggle = function (menuItemName) {
            var _a, _b;
            _this.opened = menuItemName;
            var menuItem = Array.from((_a = _this.menuItems) !== null && _a !== void 0 ? _a : []).find(function (menuItemNode) { return menuItemNode.dataset.name === menuItemName; });
            var section = Array.from((_b = _this.sections) !== null && _b !== void 0 ? _b : []).find(function (section) { return section.dataset.name === menuItemName; });
            menuItem === null || menuItem === void 0 ? void 0 : menuItem.classList.toggle('opened');
            section === null || section === void 0 ? void 0 : section.classList.toggle('opened');
        };
        this.toggleSelectMode = function () {
            _this.multiplySelect = !_this.multiplySelect;
        };
        this.open = function (menuItemName) {
            var _a, _b;
            _this.opened = menuItemName;
            _this.hamburger.toggle(false);
            (_a = _this === null || _this === void 0 ? void 0 : _this.menuItems) === null || _a === void 0 ? void 0 : _a.forEach(function (menuItemNode) {
                if (menuItemNode.dataset.name === menuItemName) {
                    menuItemNode.classList.add('opened');
                }
                else {
                    menuItemNode.classList.remove('opened');
                }
            });
            (_b = _this === null || _this === void 0 ? void 0 : _this.sections) === null || _b === void 0 ? void 0 : _b.forEach(function (sectionNode) {
                if (sectionNode.dataset.name === menuItemName) {
                    sectionNode.classList.add('opened');
                }
                else {
                    sectionNode.classList.remove('opened');
                }
            });
        };
        this.getOpened = function () {
            return _this.opened;
        };
        this.initializeEventListeners = function () {
            var _a;
            (_a = _this === null || _this === void 0 ? void 0 : _this.menuItems) === null || _a === void 0 ? void 0 : _a.forEach(function (menuItemNode) {
                var _a;
                var menuItemName = (_a = menuItemNode === null || menuItemNode === void 0 ? void 0 : menuItemNode.dataset) === null || _a === void 0 ? void 0 : _a.name;
                if (!menuItemName) {
                    throw Error('Specify data-name attribute for the .menu-item');
                }
                menuItemNode.addEventListener('click', function () { return _this.multiplySelect ? _this.toggle(menuItemName) : _this.open(menuItemName); });
            });
            _this.initializeCloseOnOutsideClick();
            _this.initializeCloseOnEscape();
            _this.initializeMultipleSelector();
        };
        this.menuSelector = selectors.menu;
        this.menu = document.querySelector(selectors.menu);
        this.sections = document.querySelectorAll(selectors.section);
        this.menuItems = (_a = this.menu) === null || _a === void 0 ? void 0 : _a.querySelectorAll(selectors.menuItems);
        this.multipleSelectCheckbox = (_b = this.menu) === null || _b === void 0 ? void 0 : _b.querySelector(selectors.multipleSelect);
        this.hamburger = hamburger;
    }
    Menu.prototype.initializeCloseOnOutsideClick = function () {
        var _this = this;
        document.addEventListener('click', function (evt) {
            if (!evt.target.closest(_this.menuSelector)) {
                _this.closeMenu();
            }
        });
    };
    Menu.prototype.initializeCloseOnEscape = function () {
        var _this = this;
        document.addEventListener('keydown', function (evt) {
            if (evt.key === 'Escape') {
                _this.closeMenu();
            }
        });
    };
    Menu.prototype.initializeMultipleSelector = function () {
        var _a;
        (_a = this.multipleSelectCheckbox) === null || _a === void 0 ? void 0 : _a.addEventListener('change', this.toggleSelectMode);
    };
    Menu.prototype.closeMenu = function () {
        if (this.hamburger.isOpened()) {
            this.hamburger.toggle(false);
        }
    };
    return Menu;
}());
exports.Menu = Menu;


/***/ }),

/***/ 495:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tab = void 0;
var Tab = /** @class */ (function () {
    function Tab(tabSelector, tabItemSelector, tabContentSelector) {
        var _this = this;
        var _a;
        this.opened = '';
        this.open = function (menuItemName) {
            var _a, _b;
            _this.opened = menuItemName;
            (_a = _this === null || _this === void 0 ? void 0 : _this.tabItems) === null || _a === void 0 ? void 0 : _a.forEach(function (tabItemNode) {
                if (tabItemNode.dataset.name === menuItemName) {
                    tabItemNode.classList.add('active');
                }
                else {
                    tabItemNode.classList.remove('active');
                }
            });
            (_b = _this === null || _this === void 0 ? void 0 : _this.tabContent) === null || _b === void 0 ? void 0 : _b.forEach(function (tabContentNode) {
                if (tabContentNode.dataset.name === menuItemName) {
                    tabContentNode.classList.add('active');
                }
                else {
                    tabContentNode.classList.remove('active');
                }
            });
        };
        this.getOpened = function () {
            return _this.opened;
        };
        this.initializeEventListeners = function () {
            var _a;
            (_a = _this === null || _this === void 0 ? void 0 : _this.tabItems) === null || _a === void 0 ? void 0 : _a.forEach(function (tabItemNode) {
                var _a;
                var menuItemName = (_a = tabItemNode === null || tabItemNode === void 0 ? void 0 : tabItemNode.dataset) === null || _a === void 0 ? void 0 : _a.name;
                if (!menuItemName) {
                    throw Error('Specify data-name attribute for the .menu-item');
                }
                tabItemNode.addEventListener('click', function () {
                    _this.open(menuItemName);
                });
            });
        };
        this.tab = document.querySelector(tabSelector);
        this.tabItems = (_a = this.tab) === null || _a === void 0 ? void 0 : _a.querySelectorAll(tabItemSelector);
        this.tabContent = document.querySelectorAll(tabContentSelector);
    }
    return Tab;
}());
exports.Tab = Tab;


/***/ }),

/***/ 420:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tree = void 0;
var helpers_1 = __webpack_require__(382);
var Tree = /** @class */ (function () {
    function Tree(initialStructure, options) {
        this.tree = initialStructure;
        this.rootElement = options.mountNode;
        this.generateTreeUI();
    }
    Tree.prototype.generateTreeUI = function () {
        var _this = this;
        Object.values(this.tree).map(function (treeItem) {
            helpers_1.assertDefined(treeItem);
            _this.generateItemUI(treeItem, _this.rootElement);
        });
    };
    Tree.prototype.generateItemUI = function (treeItem, parentElement) {
        if (treeItem.type === 'node') {
            this.generateNodeUI(treeItem, parentElement);
        }
        if (treeItem.type === 'leaf') {
            this.generateLeafUI(treeItem, parentElement);
        }
    };
    Tree.prototype.generateNodeUI = function (treeNode, parentElement) {
        var _this = this;
        var wrapper = document.createElement('li');
        wrapper.className = 'tree-item';
        var node = document.createElement('a');
        node.className = 'tree-node';
        node.setAttribute('role', 'button');
        node.href = '#';
        node.innerHTML = "\n            <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"2.5\" stroke=\"currentColor\" class=\"h-4 w-4\">\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8.25 4.5l7.5 7.5-7.5 7.5\" />\n            </svg>" + treeNode.displayName;
        node.dataset.id = treeNode.id;
        var nodeChildren = document.createElement('ul');
        nodeChildren.className = 'hidden';
        node.addEventListener('click', function () {
            nodeChildren.classList.toggle('hidden');
        });
        Object.values(treeNode.children).map(function (treeItem) {
            helpers_1.assertDefined(treeItem);
            _this.generateItemUI(treeItem, nodeChildren);
        });
        wrapper.appendChild(node);
        wrapper.appendChild(nodeChildren);
        parentElement.appendChild(wrapper);
    };
    Tree.prototype.generateLeafUI = function (treeLeaf, parentElement) {
        var leaf = document.createElement('li');
        leaf.className = 'tree-leaf';
        leaf.textContent = treeLeaf.displayName;
        leaf.dataset.id = treeLeaf.id;
        parentElement.appendChild(leaf);
    };
    Tree.prototype.getTree = function () {
        return this.tree;
    };
    return Tree;
}());
exports.Tree = Tree;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
var hamburger_1 = __webpack_require__(456);
var menu_1 = __webpack_require__(214);
var tab_1 = __webpack_require__(495);
var logger_1 = __webpack_require__(641);
var session_1 = __webpack_require__(593);
var phone_device_1 = __webpack_require__(851);
var agent_state_1 = __webpack_require__(262);
var start_interaction_1 = __webpack_require__(369);
var chat_1 = __webpack_require__(484);
var transfer_1 = __webpack_require__(906);
var conference_1 = __webpack_require__(198);
var active_interaction_1 = __webpack_require__(890);
var associatedObject_1 = __webpack_require__(234);
var notes_dispositions_1 = __webpack_require__(554);
var end_interaction_1 = __webpack_require__(999);
var teams_1 = __webpack_require__(449);
var services_did_1 = __webpack_require__(733);
var screen_recording_1 = __webpack_require__(25);
var knowledge_base_1 = __webpack_require__(977);
var reschedule_1 = __webpack_require__(114);
var widget_config_1 = __webpack_require__(127);
var resize_button_1 = __webpack_require__(330);
__webpack_require__(396);
var adcMountNode = document.getElementById('adc_mount_node');
var urlParams = new URLSearchParams(location.search);
var brightpatternDomain = urlParams.get('bpatternDomain') || 'localhost:3000';
var integrationKey = urlParams.get('integrationKey') || 'test-adapter';
loadCommWidgetApi().then(initializeIntegration);
function loadCommWidgetApi() {
    return new Promise(function (resolve, reject) {
        var scriptTag = document.createElement('script');
        scriptTag.addEventListener('load', resolve);
        scriptTag.addEventListener('error', reject);
        scriptTag.type = 'application/javascript';
        scriptTag.src = "https://" + brightpatternDomain + "/agent/communicator/adapters/api.js";
        document.head.appendChild(scriptTag);
    });
}
function initializeIntegration() {
    var adApi = new window.brightpattern.AdApi({
        integrationKey: integrationKey,
        mountRoot: adcMountNode,
        standalone: !!urlParams.get('standalone'),
        disableNewInteractionPopup: !!urlParams.get('no-popup'),
    });
    // @ts-expect-error Add API instance to the global scope so you can access it through the browser console for testing purposes
    window.adApi = adApi;
    var hamburger = new hamburger_1.Hamburger({ hamburger: '.hamburger', menu: '.menu', menuItem: '.menu-item' });
    hamburger.initializeEventListener();
    var menu = new menu_1.Menu(hamburger, {
        menu: '.menu',
        menuItems: '.menu-item',
        section: '.section',
        multipleSelect: '#menu_multiple_select_checkbox'
    });
    menu.initializeEventListeners();
    var tab = new tab_1.Tab('.tab', '.tab-item', '.tab-content');
    tab.initializeEventListeners();
    var logger = new logger_1.Logger(adApi, '#log');
    logger.initialize();
    logger.initializeClearLogOnClick('#clear_log');
    resize_button_1.initializeResizeButtonHandler();
    session_1.initializeSessionHandlers(adApi);
    phone_device_1.initializePhoneDeviceHandlers(adApi);
    agent_state_1.initializeAgentStateHandlers(adApi);
    teams_1.initializeTeamsHandlers(adApi);
    services_did_1.initializeServicesAndDIDHandlers(adApi);
    screen_recording_1.initializeScreenRecordingHandlers(adApi);
    knowledge_base_1.initializeKnowledgeBaseHandlers(adApi);
    reschedule_1.initializeRescheduleHandlers(adApi);
    widget_config_1.initializeWidgetAndConfigHandlers(adApi);
    start_interaction_1.initializeStartInteractionHandlers(adApi);
    chat_1.initializeChatHandlers(adApi);
    transfer_1.initializeTransferInteractionHandlers(adApi);
    conference_1.initializeConferenceInteractionHandlers(adApi);
    active_interaction_1.initializeActiveInteractionHandlers(adApi);
    associatedObject_1.initializeAssociatedObjectInteractionHandlers(adApi);
    notes_dispositions_1.initializeNotesAndDispositionsHandlers(adApi);
    end_interaction_1.initializeEndInteractionHandlers(adApi);
}

})();

/******/ })()
;
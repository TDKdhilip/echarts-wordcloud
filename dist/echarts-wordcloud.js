(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("echarts"));
	else if(typeof define === 'function' && define.amd)
		define(["echarts"], factory);
	else if(typeof exports === 'object')
		exports["echarts-wordcloud"] = factory(require("echarts"));
	else
		root["echarts-wordcloud"] = factory(root["echarts"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var echarts = __webpack_require__(2);
	var layoutUtil = __webpack_require__(3);

	__webpack_require__(13);
	__webpack_require__(24);

	var wordCloudLayoutHelper = __webpack_require__(25);

	if (!wordCloudLayoutHelper.isSupported) {
	    throw new Error('Sorry your browser not support wordCloud');
	}

	// https://github.com/timdream/wordcloud2.js/blob/c236bee60436e048949f9becc4f0f67bd832dc5c/index.js#L233
	function updateCanvasMask(maskCanvas) {
	    var ctx = maskCanvas.getContext('2d');
	    var imageData = ctx.getImageData(
	        0, 0, maskCanvas.width, maskCanvas.height);
	    var newImageData = ctx.createImageData(imageData);

	    var toneSum = 0;
	    var toneCnt = 0;
	    for (var i = 0; i < imageData.data.length; i += 4) {
	        var alpha = imageData.data[i + 3];
	        if (alpha > 128) {
	            var tone = imageData.data[i]
	                + imageData.data[i + 1]
	                + imageData.data[i + 2];
	            toneSum += tone;
	            ++toneCnt;
	        }
	    }
	    var threshold = toneSum / toneCnt;

	    for (var i = 0; i < imageData.data.length; i += 4) {
	        var tone = imageData.data[i]
	            + imageData.data[i + 1]
	            + imageData.data[i + 2];
	        var alpha = imageData.data[i + 3];

	        if (alpha < 128 || tone > threshold) {
	            // Area not to draw
	            newImageData.data[i] = 0;
	            newImageData.data[i + 1] = 0;
	            newImageData.data[i + 2] = 0;
	            newImageData.data[i + 3] = 0;
	        }
	        else {
	            // Area to draw
	            // The color must be same with backgroundColor
	            newImageData.data[i] = 255;
	            newImageData.data[i + 1] = 255;
	            newImageData.data[i + 2] = 255;
	            newImageData.data[i + 3] = 255;
	        }
	    }

	    ctx.putImageData(newImageData, 0, 0);
	}

	echarts.registerLayout(function (ecModel, api) {
	    ecModel.eachSeriesByType('wordCloud', function (seriesModel) {
	        var gridRect = layoutUtil.getLayoutRect(
	            seriesModel.getBoxLayoutParams(), {
	                width: api.getWidth(),
	                height: api.getHeight()
	            }
	        );
	        var data = seriesModel.getData();

	        var canvas = document.createElement('canvas');
	        canvas.width = gridRect.width;
	        canvas.height = gridRect.height;

	        var ctx = canvas.getContext('2d');
	        var maskImage = seriesModel.get('maskImage');
	        if (maskImage) {
	            try {
	                ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
	                updateCanvasMask(canvas);
	            }
	            catch (e) {
	                console.error('Invalid mask image');
	                console.error(e.toString());
	            }
	        }

	        var sizeRange = seriesModel.get('sizeRange');
	        var rotationRange = seriesModel.get('rotationRange');
	        var valueExtent = data.getDataExtent('value');

	        var DEGREE_TO_RAD = Math.PI / 180;
	        var gridSize = seriesModel.get('gridSize');
	        wordCloudLayoutHelper(canvas, {
	            list: data.mapArray('value', function (value, idx) {
	                var itemModel = data.getItemModel(idx);
	                return [
	                    data.getName(idx),
	                    itemModel.get('textStyle.normal.textSize', true)
	                        || echarts.number.linearMap(value, valueExtent, sizeRange),
	                    idx
	                ];
	            }).sort(function (a, b) {
	                // Sort from large to small in case there is no more room for more words
	                return b[1] - a[1];
	            }),
	            fontFamily: seriesModel.get('textStyle.normal.fontFamily')
	                || seriesModel.get('textStyle.emphasis.fontFamily')
	                || ecModel.get('textStyle.fontFamily'),
	            fontWeight: seriesModel.get('textStyle.normal.fontWeight')
	                || seriesModel.get('textStyle.emphasis.fontWeight')
	                || ecModel.get('textStyle.fontWeight'),
	            gridSize: gridSize,

	            ellipticity: gridRect.height / gridRect.width,

	            minRotation: rotationRange[0] * DEGREE_TO_RAD,
	            maxRotation: rotationRange[1] * DEGREE_TO_RAD,

	            clearCanvas: !maskImage,

	            rotateRatio: 1,

	            rotationStep: seriesModel.get('rotationStep') * DEGREE_TO_RAD,

	            drawOutOfBound: seriesModel.get('drawOutOfBound'),

	            shuffle: false,

	            shape: seriesModel.get('shape')
	        });

	        function onWordCloudDrawn(e) {
	            var item = e.detail.item;
	            if (e.detail.drawn && seriesModel.layoutInstance.ondraw) {
	                e.detail.drawn.gx += gridRect.x / gridSize;
	                e.detail.drawn.gy += gridRect.y / gridSize;
	                seriesModel.layoutInstance.ondraw(
	                    item[0], item[1], item[2], e.detail.drawn
	                );
	            }
	        }

	        canvas.addEventListener('wordclouddrawn', onWordCloudDrawn);

	        if (seriesModel.layoutInstance) {
	            // Dispose previous
	            seriesModel.layoutInstance.dispose();
	        }

	        seriesModel.layoutInstance = {
	            ondraw: null,

	            dispose: function () {
	                canvas.removeEventListener('wordclouddrawn', onWordCloudDrawn);
	                // Abort
	                canvas.addEventListener('wordclouddrawn', function (e) {
	                    // Prevent default to cancle the event and stop the loop
	                    e.preventDefault();
	                });
	            }
	        };
	    });
	});

	echarts.registerPreprocessor(function (option) {
	    var series = (option || {}).series;
	    !echarts.util.isArray(series) && (series = series ? [series] : []);

	    var compats = ['shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'];

	    echarts.util.each(series, function (seriesItem) {
	        if (seriesItem && seriesItem.type === 'wordCloud') {
	            var textStyle = seriesItem.textStyle || {};

	            compatTextStyle(textStyle.normal);
	            compatTextStyle(textStyle.emphasis);
	        }
	    });

	    function compatTextStyle(textStyle) {
	        textStyle && echarts.util.each(compats, function (key) {
	            if (textStyle.hasOwnProperty(key)) {
	                textStyle['text' + echarts.format.capitalFirst(key)] = textStyle[key];
	            }
	        });
	    }
	});


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var zrUtil = __webpack_require__(4);

	var BoundingRect = __webpack_require__(5);

	var _number = __webpack_require__(8);

	var parsePercent = _number.parsePercent;

	var formatUtil = __webpack_require__(9);

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/
	// Layout helpers for each component positioning
	var each = zrUtil.each;
	/**
	 * @public
	 */

	var LOCATION_PARAMS = ['left', 'right', 'top', 'bottom', 'width', 'height'];
	/**
	 * @public
	 */

	var HV_NAMES = [['width', 'left', 'right'], ['height', 'top', 'bottom']];

	function boxLayout(orient, group, gap, maxWidth, maxHeight) {
	  var x = 0;
	  var y = 0;

	  if (maxWidth == null) {
	    maxWidth = Infinity;
	  }

	  if (maxHeight == null) {
	    maxHeight = Infinity;
	  }

	  var currentLineMaxSize = 0;
	  group.eachChild(function (child, idx) {
	    var position = child.position;
	    var rect = child.getBoundingRect();
	    var nextChild = group.childAt(idx + 1);
	    var nextChildRect = nextChild && nextChild.getBoundingRect();
	    var nextX;
	    var nextY;

	    if (orient === 'horizontal') {
	      var moveX = rect.width + (nextChildRect ? -nextChildRect.x + rect.x : 0);
	      nextX = x + moveX; // Wrap when width exceeds maxWidth or meet a `newline` group
	      // FIXME compare before adding gap?

	      if (nextX > maxWidth || child.newline) {
	        x = 0;
	        nextX = moveX;
	        y += currentLineMaxSize + gap;
	        currentLineMaxSize = rect.height;
	      } else {
	        // FIXME: consider rect.y is not `0`?
	        currentLineMaxSize = Math.max(currentLineMaxSize, rect.height);
	      }
	    } else {
	      var moveY = rect.height + (nextChildRect ? -nextChildRect.y + rect.y : 0);
	      nextY = y + moveY; // Wrap when width exceeds maxHeight or meet a `newline` group

	      if (nextY > maxHeight || child.newline) {
	        x += currentLineMaxSize + gap;
	        y = 0;
	        nextY = moveY;
	        currentLineMaxSize = rect.width;
	      } else {
	        currentLineMaxSize = Math.max(currentLineMaxSize, rect.width);
	      }
	    }

	    if (child.newline) {
	      return;
	    }

	    position[0] = x;
	    position[1] = y;
	    orient === 'horizontal' ? x = nextX + gap : y = nextY + gap;
	  });
	}
	/**
	 * VBox or HBox layouting
	 * @param {string} orient
	 * @param {module:zrender/container/Group} group
	 * @param {number} gap
	 * @param {number} [width=Infinity]
	 * @param {number} [height=Infinity]
	 */


	var box = boxLayout;
	/**
	 * VBox layouting
	 * @param {module:zrender/container/Group} group
	 * @param {number} gap
	 * @param {number} [width=Infinity]
	 * @param {number} [height=Infinity]
	 */

	var vbox = zrUtil.curry(boxLayout, 'vertical');
	/**
	 * HBox layouting
	 * @param {module:zrender/container/Group} group
	 * @param {number} gap
	 * @param {number} [width=Infinity]
	 * @param {number} [height=Infinity]
	 */

	var hbox = zrUtil.curry(boxLayout, 'horizontal');
	/**
	 * If x or x2 is not specified or 'center' 'left' 'right',
	 * the width would be as long as possible.
	 * If y or y2 is not specified or 'middle' 'top' 'bottom',
	 * the height would be as long as possible.
	 *
	 * @param {Object} positionInfo
	 * @param {number|string} [positionInfo.x]
	 * @param {number|string} [positionInfo.y]
	 * @param {number|string} [positionInfo.x2]
	 * @param {number|string} [positionInfo.y2]
	 * @param {Object} containerRect {width, height}
	 * @param {string|number} margin
	 * @return {Object} {width, height}
	 */

	function getAvailableSize(positionInfo, containerRect, margin) {
	  var containerWidth = containerRect.width;
	  var containerHeight = containerRect.height;
	  var x = parsePercent(positionInfo.x, containerWidth);
	  var y = parsePercent(positionInfo.y, containerHeight);
	  var x2 = parsePercent(positionInfo.x2, containerWidth);
	  var y2 = parsePercent(positionInfo.y2, containerHeight);
	  (isNaN(x) || isNaN(parseFloat(positionInfo.x))) && (x = 0);
	  (isNaN(x2) || isNaN(parseFloat(positionInfo.x2))) && (x2 = containerWidth);
	  (isNaN(y) || isNaN(parseFloat(positionInfo.y))) && (y = 0);
	  (isNaN(y2) || isNaN(parseFloat(positionInfo.y2))) && (y2 = containerHeight);
	  margin = formatUtil.normalizeCssArray(margin || 0);
	  return {
	    width: Math.max(x2 - x - margin[1] - margin[3], 0),
	    height: Math.max(y2 - y - margin[0] - margin[2], 0)
	  };
	}
	/**
	 * Parse position info.
	 *
	 * @param {Object} positionInfo
	 * @param {number|string} [positionInfo.left]
	 * @param {number|string} [positionInfo.top]
	 * @param {number|string} [positionInfo.right]
	 * @param {number|string} [positionInfo.bottom]
	 * @param {number|string} [positionInfo.width]
	 * @param {number|string} [positionInfo.height]
	 * @param {number|string} [positionInfo.aspect] Aspect is width / height
	 * @param {Object} containerRect
	 * @param {string|number} [margin]
	 *
	 * @return {module:zrender/core/BoundingRect}
	 */


	function getLayoutRect(positionInfo, containerRect, margin) {
	  margin = formatUtil.normalizeCssArray(margin || 0);
	  var containerWidth = containerRect.width;
	  var containerHeight = containerRect.height;
	  var left = parsePercent(positionInfo.left, containerWidth);
	  var top = parsePercent(positionInfo.top, containerHeight);
	  var right = parsePercent(positionInfo.right, containerWidth);
	  var bottom = parsePercent(positionInfo.bottom, containerHeight);
	  var width = parsePercent(positionInfo.width, containerWidth);
	  var height = parsePercent(positionInfo.height, containerHeight);
	  var verticalMargin = margin[2] + margin[0];
	  var horizontalMargin = margin[1] + margin[3];
	  var aspect = positionInfo.aspect; // If width is not specified, calculate width from left and right

	  if (isNaN(width)) {
	    width = containerWidth - right - horizontalMargin - left;
	  }

	  if (isNaN(height)) {
	    height = containerHeight - bottom - verticalMargin - top;
	  }

	  if (aspect != null) {
	    // If width and height are not given
	    // 1. Graph should not exceeds the container
	    // 2. Aspect must be keeped
	    // 3. Graph should take the space as more as possible
	    // FIXME
	    // Margin is not considered, because there is no case that both
	    // using margin and aspect so far.
	    if (isNaN(width) && isNaN(height)) {
	      if (aspect > containerWidth / containerHeight) {
	        width = containerWidth * 0.8;
	      } else {
	        height = containerHeight * 0.8;
	      }
	    } // Calculate width or height with given aspect


	    if (isNaN(width)) {
	      width = aspect * height;
	    }

	    if (isNaN(height)) {
	      height = width / aspect;
	    }
	  } // If left is not specified, calculate left from right and width


	  if (isNaN(left)) {
	    left = containerWidth - right - width - horizontalMargin;
	  }

	  if (isNaN(top)) {
	    top = containerHeight - bottom - height - verticalMargin;
	  } // Align left and top


	  switch (positionInfo.left || positionInfo.right) {
	    case 'center':
	      left = containerWidth / 2 - width / 2 - margin[3];
	      break;

	    case 'right':
	      left = containerWidth - width - horizontalMargin;
	      break;
	  }

	  switch (positionInfo.top || positionInfo.bottom) {
	    case 'middle':
	    case 'center':
	      top = containerHeight / 2 - height / 2 - margin[0];
	      break;

	    case 'bottom':
	      top = containerHeight - height - verticalMargin;
	      break;
	  } // If something is wrong and left, top, width, height are calculated as NaN


	  left = left || 0;
	  top = top || 0;

	  if (isNaN(width)) {
	    // Width may be NaN if only one value is given except width
	    width = containerWidth - horizontalMargin - left - (right || 0);
	  }

	  if (isNaN(height)) {
	    // Height may be NaN if only one value is given except height
	    height = containerHeight - verticalMargin - top - (bottom || 0);
	  }

	  var rect = new BoundingRect(left + margin[3], top + margin[0], width, height);
	  rect.margin = margin;
	  return rect;
	}
	/**
	 * Position a zr element in viewport
	 *  Group position is specified by either
	 *  {left, top}, {right, bottom}
	 *  If all properties exists, right and bottom will be igonred.
	 *
	 * Logic:
	 *     1. Scale (against origin point in parent coord)
	 *     2. Rotate (against origin point in parent coord)
	 *     3. Traslate (with el.position by this method)
	 * So this method only fixes the last step 'Traslate', which does not affect
	 * scaling and rotating.
	 *
	 * If be called repeatly with the same input el, the same result will be gotten.
	 *
	 * @param {module:zrender/Element} el Should have `getBoundingRect` method.
	 * @param {Object} positionInfo
	 * @param {number|string} [positionInfo.left]
	 * @param {number|string} [positionInfo.top]
	 * @param {number|string} [positionInfo.right]
	 * @param {number|string} [positionInfo.bottom]
	 * @param {number|string} [positionInfo.width] Only for opt.boundingModel: 'raw'
	 * @param {number|string} [positionInfo.height] Only for opt.boundingModel: 'raw'
	 * @param {Object} containerRect
	 * @param {string|number} margin
	 * @param {Object} [opt]
	 * @param {Array.<number>} [opt.hv=[1,1]] Only horizontal or only vertical.
	 * @param {Array.<number>} [opt.boundingMode='all']
	 *        Specify how to calculate boundingRect when locating.
	 *        'all': Position the boundingRect that is transformed and uioned
	 *               both itself and its descendants.
	 *               This mode simplies confine the elements in the bounding
	 *               of their container (e.g., using 'right: 0').
	 *        'raw': Position the boundingRect that is not transformed and only itself.
	 *               This mode is useful when you want a element can overflow its
	 *               container. (Consider a rotated circle needs to be located in a corner.)
	 *               In this mode positionInfo.width/height can only be number.
	 */


	function positionElement(el, positionInfo, containerRect, margin, opt) {
	  var h = !opt || !opt.hv || opt.hv[0];
	  var v = !opt || !opt.hv || opt.hv[1];
	  var boundingMode = opt && opt.boundingMode || 'all';

	  if (!h && !v) {
	    return;
	  }

	  var rect;

	  if (boundingMode === 'raw') {
	    rect = el.type === 'group' ? new BoundingRect(0, 0, +positionInfo.width || 0, +positionInfo.height || 0) : el.getBoundingRect();
	  } else {
	    rect = el.getBoundingRect();

	    if (el.needLocalTransform()) {
	      var transform = el.getLocalTransform(); // Notice: raw rect may be inner object of el,
	      // which should not be modified.

	      rect = rect.clone();
	      rect.applyTransform(transform);
	    }
	  } // The real width and height can not be specified but calculated by the given el.


	  positionInfo = getLayoutRect(zrUtil.defaults({
	    width: rect.width,
	    height: rect.height
	  }, positionInfo), containerRect, margin); // Because 'tranlate' is the last step in transform
	  // (see zrender/core/Transformable#getLocalTransform),
	  // we can just only modify el.position to get final result.

	  var elPos = el.position;
	  var dx = h ? positionInfo.x - rect.x : 0;
	  var dy = v ? positionInfo.y - rect.y : 0;
	  el.attr('position', boundingMode === 'raw' ? [dx, dy] : [elPos[0] + dx, elPos[1] + dy]);
	}
	/**
	 * @param {Object} option Contains some of the properties in HV_NAMES.
	 * @param {number} hvIdx 0: horizontal; 1: vertical.
	 */


	function sizeCalculable(option, hvIdx) {
	  return option[HV_NAMES[hvIdx][0]] != null || option[HV_NAMES[hvIdx][1]] != null && option[HV_NAMES[hvIdx][2]] != null;
	}
	/**
	 * Consider Case:
	 * When defulat option has {left: 0, width: 100}, and we set {right: 0}
	 * through setOption or media query, using normal zrUtil.merge will cause
	 * {right: 0} does not take effect.
	 *
	 * @example
	 * ComponentModel.extend({
	 *     init: function () {
	 *         ...
	 *         var inputPositionParams = layout.getLayoutParams(option);
	 *         this.mergeOption(inputPositionParams);
	 *     },
	 *     mergeOption: function (newOption) {
	 *         newOption && zrUtil.merge(thisOption, newOption, true);
	 *         layout.mergeLayoutParam(thisOption, newOption);
	 *     }
	 * });
	 *
	 * @param {Object} targetOption
	 * @param {Object} newOption
	 * @param {Object|string} [opt]
	 * @param {boolean|Array.<boolean>} [opt.ignoreSize=false] Used for the components
	 *  that width (or height) should not be calculated by left and right (or top and bottom).
	 */


	function mergeLayoutParam(targetOption, newOption, opt) {
	  !zrUtil.isObject(opt) && (opt = {});
	  var ignoreSize = opt.ignoreSize;
	  !zrUtil.isArray(ignoreSize) && (ignoreSize = [ignoreSize, ignoreSize]);
	  var hResult = merge(HV_NAMES[0], 0);
	  var vResult = merge(HV_NAMES[1], 1);
	  copy(HV_NAMES[0], targetOption, hResult);
	  copy(HV_NAMES[1], targetOption, vResult);

	  function merge(names, hvIdx) {
	    var newParams = {};
	    var newValueCount = 0;
	    var merged = {};
	    var mergedValueCount = 0;
	    var enoughParamNumber = 2;
	    each(names, function (name) {
	      merged[name] = targetOption[name];
	    });
	    each(names, function (name) {
	      // Consider case: newOption.width is null, which is
	      // set by user for removing width setting.
	      hasProp(newOption, name) && (newParams[name] = merged[name] = newOption[name]);
	      hasValue(newParams, name) && newValueCount++;
	      hasValue(merged, name) && mergedValueCount++;
	    });

	    if (ignoreSize[hvIdx]) {
	      // Only one of left/right is premitted to exist.
	      if (hasValue(newOption, names[1])) {
	        merged[names[2]] = null;
	      } else if (hasValue(newOption, names[2])) {
	        merged[names[1]] = null;
	      }

	      return merged;
	    } // Case: newOption: {width: ..., right: ...},
	    // or targetOption: {right: ...} and newOption: {width: ...},
	    // There is no conflict when merged only has params count
	    // little than enoughParamNumber.


	    if (mergedValueCount === enoughParamNumber || !newValueCount) {
	      return merged;
	    } // Case: newOption: {width: ..., right: ...},
	    // Than we can make sure user only want those two, and ignore
	    // all origin params in targetOption.
	    else if (newValueCount >= enoughParamNumber) {
	        return newParams;
	      } else {
	        // Chose another param from targetOption by priority.
	        for (var i = 0; i < names.length; i++) {
	          var name = names[i];

	          if (!hasProp(newParams, name) && hasProp(targetOption, name)) {
	            newParams[name] = targetOption[name];
	            break;
	          }
	        }

	        return newParams;
	      }
	  }

	  function hasProp(obj, name) {
	    return obj.hasOwnProperty(name);
	  }

	  function hasValue(obj, name) {
	    return obj[name] != null && obj[name] !== 'auto';
	  }

	  function copy(names, target, source) {
	    each(names, function (name) {
	      target[name] = source[name];
	    });
	  }
	}
	/**
	 * Retrieve 'left', 'right', 'top', 'bottom', 'width', 'height' from object.
	 * @param {Object} source
	 * @return {Object} Result contains those props.
	 */


	function getLayoutParams(source) {
	  return copyLayoutParams({}, source);
	}
	/**
	 * Retrieve 'left', 'right', 'top', 'bottom', 'width', 'height' from object.
	 * @param {Object} source
	 * @return {Object} Result contains those props.
	 */


	function copyLayoutParams(target, source) {
	  source && target && each(LOCATION_PARAMS, function (name) {
	    source.hasOwnProperty(name) && (target[name] = source[name]);
	  });
	  return target;
	}

	exports.LOCATION_PARAMS = LOCATION_PARAMS;
	exports.HV_NAMES = HV_NAMES;
	exports.box = box;
	exports.vbox = vbox;
	exports.hbox = hbox;
	exports.getAvailableSize = getAvailableSize;
	exports.getLayoutRect = getLayoutRect;
	exports.positionElement = positionElement;
	exports.sizeCalculable = sizeCalculable;
	exports.mergeLayoutParam = mergeLayoutParam;
	exports.getLayoutParams = getLayoutParams;
	exports.copyLayoutParams = copyLayoutParams;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	/**
	 * @module zrender/core/util
	 */
	// 用于处理merge时无法遍历Date等对象的问题
	var BUILTIN_OBJECT = {
	  '[object Function]': 1,
	  '[object RegExp]': 1,
	  '[object Date]': 1,
	  '[object Error]': 1,
	  '[object CanvasGradient]': 1,
	  '[object CanvasPattern]': 1,
	  // For node-canvas
	  '[object Image]': 1,
	  '[object Canvas]': 1
	};
	var TYPED_ARRAY = {
	  '[object Int8Array]': 1,
	  '[object Uint8Array]': 1,
	  '[object Uint8ClampedArray]': 1,
	  '[object Int16Array]': 1,
	  '[object Uint16Array]': 1,
	  '[object Int32Array]': 1,
	  '[object Uint32Array]': 1,
	  '[object Float32Array]': 1,
	  '[object Float64Array]': 1
	};
	var objToString = Object.prototype.toString;
	var arrayProto = Array.prototype;
	var nativeForEach = arrayProto.forEach;
	var nativeFilter = arrayProto.filter;
	var nativeSlice = arrayProto.slice;
	var nativeMap = arrayProto.map;
	var nativeReduce = arrayProto.reduce; // Avoid assign to an exported variable, for transforming to cjs.

	var methods = {};

	function $override(name, fn) {
	  // Clear ctx instance for different environment
	  if (name === 'createCanvas') {
	    _ctx = null;
	  }

	  methods[name] = fn;
	}
	/**
	 * Those data types can be cloned:
	 *     Plain object, Array, TypedArray, number, string, null, undefined.
	 * Those data types will be assgined using the orginal data:
	 *     BUILTIN_OBJECT
	 * Instance of user defined class will be cloned to a plain object, without
	 * properties in prototype.
	 * Other data types is not supported (not sure what will happen).
	 *
	 * Caution: do not support clone Date, for performance consideration.
	 * (There might be a large number of date in `series.data`).
	 * So date should not be modified in and out of echarts.
	 *
	 * @param {*} source
	 * @return {*} new
	 */


	function clone(source) {
	  if (source == null || typeof source !== 'object') {
	    return source;
	  }

	  var result = source;
	  var typeStr = objToString.call(source);

	  if (typeStr === '[object Array]') {
	    if (!isPrimitive(source)) {
	      result = [];

	      for (var i = 0, len = source.length; i < len; i++) {
	        result[i] = clone(source[i]);
	      }
	    }
	  } else if (TYPED_ARRAY[typeStr]) {
	    if (!isPrimitive(source)) {
	      var Ctor = source.constructor;

	      if (source.constructor.from) {
	        result = Ctor.from(source);
	      } else {
	        result = new Ctor(source.length);

	        for (var i = 0, len = source.length; i < len; i++) {
	          result[i] = clone(source[i]);
	        }
	      }
	    }
	  } else if (!BUILTIN_OBJECT[typeStr] && !isPrimitive(source) && !isDom(source)) {
	    result = {};

	    for (var key in source) {
	      if (source.hasOwnProperty(key)) {
	        result[key] = clone(source[key]);
	      }
	    }
	  }

	  return result;
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {*} target
	 * @param {*} source
	 * @param {boolean} [overwrite=false]
	 */


	function merge(target, source, overwrite) {
	  // We should escapse that source is string
	  // and enter for ... in ...
	  if (!isObject(source) || !isObject(target)) {
	    return overwrite ? clone(source) : target;
	  }

	  for (var key in source) {
	    if (source.hasOwnProperty(key)) {
	      var targetProp = target[key];
	      var sourceProp = source[key];

	      if (isObject(sourceProp) && isObject(targetProp) && !isArray(sourceProp) && !isArray(targetProp) && !isDom(sourceProp) && !isDom(targetProp) && !isBuiltInObject(sourceProp) && !isBuiltInObject(targetProp) && !isPrimitive(sourceProp) && !isPrimitive(targetProp)) {
	        // 如果需要递归覆盖，就递归调用merge
	        merge(targetProp, sourceProp, overwrite);
	      } else if (overwrite || !(key in target)) {
	        // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
	        // NOTE，在 target[key] 不存在的时候也是直接覆盖
	        target[key] = clone(source[key], true);
	      }
	    }
	  }

	  return target;
	}
	/**
	 * @param {Array} targetAndSources The first item is target, and the rests are source.
	 * @param {boolean} [overwrite=false]
	 * @return {*} target
	 */


	function mergeAll(targetAndSources, overwrite) {
	  var result = targetAndSources[0];

	  for (var i = 1, len = targetAndSources.length; i < len; i++) {
	    result = merge(result, targetAndSources[i], overwrite);
	  }

	  return result;
	}
	/**
	 * @param {*} target
	 * @param {*} source
	 * @memberOf module:zrender/core/util
	 */


	function extend(target, source) {
	  for (var key in source) {
	    if (source.hasOwnProperty(key)) {
	      target[key] = source[key];
	    }
	  }

	  return target;
	}
	/**
	 * @param {*} target
	 * @param {*} source
	 * @param {boolean} [overlay=false]
	 * @memberOf module:zrender/core/util
	 */


	function defaults(target, source, overlay) {
	  for (var key in source) {
	    if (source.hasOwnProperty(key) && (overlay ? source[key] != null : target[key] == null)) {
	      target[key] = source[key];
	    }
	  }

	  return target;
	}

	var createCanvas = function () {
	  return methods.createCanvas();
	};

	methods.createCanvas = function () {
	  return document.createElement('canvas');
	}; // FIXME


	var _ctx;

	function getContext() {
	  if (!_ctx) {
	    // Use util.createCanvas instead of createCanvas
	    // because createCanvas may be overwritten in different environment
	    _ctx = createCanvas().getContext('2d');
	  }

	  return _ctx;
	}
	/**
	 * 查询数组中元素的index
	 * @memberOf module:zrender/core/util
	 */


	function indexOf(array, value) {
	  if (array) {
	    if (array.indexOf) {
	      return array.indexOf(value);
	    }

	    for (var i = 0, len = array.length; i < len; i++) {
	      if (array[i] === value) {
	        return i;
	      }
	    }
	  }

	  return -1;
	}
	/**
	 * 构造类继承关系
	 *
	 * @memberOf module:zrender/core/util
	 * @param {Function} clazz 源类
	 * @param {Function} baseClazz 基类
	 */


	function inherits(clazz, baseClazz) {
	  var clazzPrototype = clazz.prototype;

	  function F() {}

	  F.prototype = baseClazz.prototype;
	  clazz.prototype = new F();

	  for (var prop in clazzPrototype) {
	    if (clazzPrototype.hasOwnProperty(prop)) {
	      clazz.prototype[prop] = clazzPrototype[prop];
	    }
	  }

	  clazz.prototype.constructor = clazz;
	  clazz.superClass = baseClazz;
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {Object|Function} target
	 * @param {Object|Function} sorce
	 * @param {boolean} overlay
	 */


	function mixin(target, source, overlay) {
	  target = 'prototype' in target ? target.prototype : target;
	  source = 'prototype' in source ? source.prototype : source;
	  defaults(target, source, overlay);
	}
	/**
	 * Consider typed array.
	 * @param {Array|TypedArray} data
	 */


	function isArrayLike(data) {
	  if (!data) {
	    return;
	  }

	  if (typeof data === 'string') {
	    return false;
	  }

	  return typeof data.length === 'number';
	}
	/**
	 * 数组或对象遍历
	 * @memberOf module:zrender/core/util
	 * @param {Object|Array} obj
	 * @param {Function} cb
	 * @param {*} [context]
	 */


	function each(obj, cb, context) {
	  if (!(obj && cb)) {
	    return;
	  }

	  if (obj.forEach && obj.forEach === nativeForEach) {
	    obj.forEach(cb, context);
	  } else if (obj.length === +obj.length) {
	    for (var i = 0, len = obj.length; i < len; i++) {
	      cb.call(context, obj[i], i, obj);
	    }
	  } else {
	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        cb.call(context, obj[key], key, obj);
	      }
	    }
	  }
	}
	/**
	 * 数组映射
	 * @memberOf module:zrender/core/util
	 * @param {Array} obj
	 * @param {Function} cb
	 * @param {*} [context]
	 * @return {Array}
	 */


	function map(obj, cb, context) {
	  if (!(obj && cb)) {
	    return;
	  }

	  if (obj.map && obj.map === nativeMap) {
	    return obj.map(cb, context);
	  } else {
	    var result = [];

	    for (var i = 0, len = obj.length; i < len; i++) {
	      result.push(cb.call(context, obj[i], i, obj));
	    }

	    return result;
	  }
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {Array} obj
	 * @param {Function} cb
	 * @param {Object} [memo]
	 * @param {*} [context]
	 * @return {Array}
	 */


	function reduce(obj, cb, memo, context) {
	  if (!(obj && cb)) {
	    return;
	  }

	  if (obj.reduce && obj.reduce === nativeReduce) {
	    return obj.reduce(cb, memo, context);
	  } else {
	    for (var i = 0, len = obj.length; i < len; i++) {
	      memo = cb.call(context, memo, obj[i], i, obj);
	    }

	    return memo;
	  }
	}
	/**
	 * 数组过滤
	 * @memberOf module:zrender/core/util
	 * @param {Array} obj
	 * @param {Function} cb
	 * @param {*} [context]
	 * @return {Array}
	 */


	function filter(obj, cb, context) {
	  if (!(obj && cb)) {
	    return;
	  }

	  if (obj.filter && obj.filter === nativeFilter) {
	    return obj.filter(cb, context);
	  } else {
	    var result = [];

	    for (var i = 0, len = obj.length; i < len; i++) {
	      if (cb.call(context, obj[i], i, obj)) {
	        result.push(obj[i]);
	      }
	    }

	    return result;
	  }
	}
	/**
	 * 数组项查找
	 * @memberOf module:zrender/core/util
	 * @param {Array} obj
	 * @param {Function} cb
	 * @param {*} [context]
	 * @return {*}
	 */


	function find(obj, cb, context) {
	  if (!(obj && cb)) {
	    return;
	  }

	  for (var i = 0, len = obj.length; i < len; i++) {
	    if (cb.call(context, obj[i], i, obj)) {
	      return obj[i];
	    }
	  }
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {Function} func
	 * @param {*} context
	 * @return {Function}
	 */


	function bind(func, context) {
	  var args = nativeSlice.call(arguments, 2);
	  return function () {
	    return func.apply(context, args.concat(nativeSlice.call(arguments)));
	  };
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {Function} func
	 * @return {Function}
	 */


	function curry(func) {
	  var args = nativeSlice.call(arguments, 1);
	  return function () {
	    return func.apply(this, args.concat(nativeSlice.call(arguments)));
	  };
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {*} value
	 * @return {boolean}
	 */


	function isArray(value) {
	  return objToString.call(value) === '[object Array]';
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {*} value
	 * @return {boolean}
	 */


	function isFunction(value) {
	  return typeof value === 'function';
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {*} value
	 * @return {boolean}
	 */


	function isString(value) {
	  return objToString.call(value) === '[object String]';
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {*} value
	 * @return {boolean}
	 */


	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return type === 'function' || !!value && type === 'object';
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {*} value
	 * @return {boolean}
	 */


	function isBuiltInObject(value) {
	  return !!BUILTIN_OBJECT[objToString.call(value)];
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {*} value
	 * @return {boolean}
	 */


	function isTypedArray(value) {
	  return !!TYPED_ARRAY[objToString.call(value)];
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {*} value
	 * @return {boolean}
	 */


	function isDom(value) {
	  return typeof value === 'object' && typeof value.nodeType === 'number' && typeof value.ownerDocument === 'object';
	}
	/**
	 * Whether is exactly NaN. Notice isNaN('a') returns true.
	 * @param {*} value
	 * @return {boolean}
	 */


	function eqNaN(value) {
	  /* eslint-disable-next-line no-self-compare */
	  return value !== value;
	}
	/**
	 * If value1 is not null, then return value1, otherwise judget rest of values.
	 * Low performance.
	 * @memberOf module:zrender/core/util
	 * @return {*} Final value
	 */


	function retrieve(values) {
	  for (var i = 0, len = arguments.length; i < len; i++) {
	    if (arguments[i] != null) {
	      return arguments[i];
	    }
	  }
	}

	function retrieve2(value0, value1) {
	  return value0 != null ? value0 : value1;
	}

	function retrieve3(value0, value1, value2) {
	  return value0 != null ? value0 : value1 != null ? value1 : value2;
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {Array} arr
	 * @param {number} startIndex
	 * @param {number} endIndex
	 * @return {Array}
	 */


	function slice() {
	  return Function.call.apply(nativeSlice, arguments);
	}
	/**
	 * Normalize css liked array configuration
	 * e.g.
	 *  3 => [3, 3, 3, 3]
	 *  [4, 2] => [4, 2, 4, 2]
	 *  [4, 3, 2] => [4, 3, 2, 3]
	 * @param {number|Array.<number>} val
	 * @return {Array.<number>}
	 */


	function normalizeCssArray(val) {
	  if (typeof val === 'number') {
	    return [val, val, val, val];
	  }

	  var len = val.length;

	  if (len === 2) {
	    // vertical | horizontal
	    return [val[0], val[1], val[0], val[1]];
	  } else if (len === 3) {
	    // top | horizontal | bottom
	    return [val[0], val[1], val[2], val[1]];
	  }

	  return val;
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {boolean} condition
	 * @param {string} message
	 */


	function assert(condition, message) {
	  if (!condition) {
	    throw new Error(message);
	  }
	}
	/**
	 * @memberOf module:zrender/core/util
	 * @param {string} str string to be trimed
	 * @return {string} trimed string
	 */


	function trim(str) {
	  if (str == null) {
	    return null;
	  } else if (typeof str.trim === 'function') {
	    return str.trim();
	  } else {
	    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	  }
	}

	var primitiveKey = '__ec_primitive__';
	/**
	 * Set an object as primitive to be ignored traversing children in clone or merge
	 */

	function setAsPrimitive(obj) {
	  obj[primitiveKey] = true;
	}

	function isPrimitive(obj) {
	  return obj[primitiveKey];
	}
	/**
	 * @constructor
	 * @param {Object} obj Only apply `ownProperty`.
	 */


	function HashMap(obj) {
	  var isArr = isArray(obj); // Key should not be set on this, otherwise
	  // methods get/set/... may be overrided.

	  this.data = {};
	  var thisMap = this;
	  obj instanceof HashMap ? obj.each(visit) : obj && each(obj, visit);

	  function visit(value, key) {
	    isArr ? thisMap.set(value, key) : thisMap.set(key, value);
	  }
	}

	HashMap.prototype = {
	  constructor: HashMap,
	  // Do not provide `has` method to avoid defining what is `has`.
	  // (We usually treat `null` and `undefined` as the same, different
	  // from ES6 Map).
	  get: function (key) {
	    return this.data.hasOwnProperty(key) ? this.data[key] : null;
	  },
	  set: function (key, value) {
	    // Comparing with invocation chaining, `return value` is more commonly
	    // used in this case: `var someVal = map.set('a', genVal());`
	    return this.data[key] = value;
	  },
	  // Although util.each can be performed on this hashMap directly, user
	  // should not use the exposed keys, who are prefixed.
	  each: function (cb, context) {
	    context !== void 0 && (cb = bind(cb, context));
	    /* eslint-disable guard-for-in */

	    for (var key in this.data) {
	      this.data.hasOwnProperty(key) && cb(this.data[key], key);
	    }
	    /* eslint-enable guard-for-in */

	  },
	  // Do not use this method if performance sensitive.
	  removeKey: function (key) {
	    delete this.data[key];
	  }
	};

	function createHashMap(obj) {
	  return new HashMap(obj);
	}

	function concatArray(a, b) {
	  var newArray = new a.constructor(a.length + b.length);

	  for (var i = 0; i < a.length; i++) {
	    newArray[i] = a[i];
	  }

	  var offset = a.length;

	  for (i = 0; i < b.length; i++) {
	    newArray[i + offset] = b[i];
	  }

	  return newArray;
	}

	function noop() {}

	exports.$override = $override;
	exports.clone = clone;
	exports.merge = merge;
	exports.mergeAll = mergeAll;
	exports.extend = extend;
	exports.defaults = defaults;
	exports.createCanvas = createCanvas;
	exports.getContext = getContext;
	exports.indexOf = indexOf;
	exports.inherits = inherits;
	exports.mixin = mixin;
	exports.isArrayLike = isArrayLike;
	exports.each = each;
	exports.map = map;
	exports.reduce = reduce;
	exports.filter = filter;
	exports.find = find;
	exports.bind = bind;
	exports.curry = curry;
	exports.isArray = isArray;
	exports.isFunction = isFunction;
	exports.isString = isString;
	exports.isObject = isObject;
	exports.isBuiltInObject = isBuiltInObject;
	exports.isTypedArray = isTypedArray;
	exports.isDom = isDom;
	exports.eqNaN = eqNaN;
	exports.retrieve = retrieve;
	exports.retrieve2 = retrieve2;
	exports.retrieve3 = retrieve3;
	exports.slice = slice;
	exports.normalizeCssArray = normalizeCssArray;
	exports.assert = assert;
	exports.trim = trim;
	exports.setAsPrimitive = setAsPrimitive;
	exports.isPrimitive = isPrimitive;
	exports.createHashMap = createHashMap;
	exports.concatArray = concatArray;
	exports.noop = noop;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var vec2 = __webpack_require__(6);

	var matrix = __webpack_require__(7);

	/**
	 * @module echarts/core/BoundingRect
	 */
	var v2ApplyTransform = vec2.applyTransform;
	var mathMin = Math.min;
	var mathMax = Math.max;
	/**
	 * @alias module:echarts/core/BoundingRect
	 */

	function BoundingRect(x, y, width, height) {
	  if (width < 0) {
	    x = x + width;
	    width = -width;
	  }

	  if (height < 0) {
	    y = y + height;
	    height = -height;
	  }
	  /**
	   * @type {number}
	   */


	  this.x = x;
	  /**
	   * @type {number}
	   */

	  this.y = y;
	  /**
	   * @type {number}
	   */

	  this.width = width;
	  /**
	   * @type {number}
	   */

	  this.height = height;
	}

	BoundingRect.prototype = {
	  constructor: BoundingRect,

	  /**
	   * @param {module:echarts/core/BoundingRect} other
	   */
	  union: function (other) {
	    var x = mathMin(other.x, this.x);
	    var y = mathMin(other.y, this.y);
	    this.width = mathMax(other.x + other.width, this.x + this.width) - x;
	    this.height = mathMax(other.y + other.height, this.y + this.height) - y;
	    this.x = x;
	    this.y = y;
	  },

	  /**
	   * @param {Array.<number>} m
	   * @methods
	   */
	  applyTransform: function () {
	    var lt = [];
	    var rb = [];
	    var lb = [];
	    var rt = [];
	    return function (m) {
	      // In case usage like this
	      // el.getBoundingRect().applyTransform(el.transform)
	      // And element has no transform
	      if (!m) {
	        return;
	      }

	      lt[0] = lb[0] = this.x;
	      lt[1] = rt[1] = this.y;
	      rb[0] = rt[0] = this.x + this.width;
	      rb[1] = lb[1] = this.y + this.height;
	      v2ApplyTransform(lt, lt, m);
	      v2ApplyTransform(rb, rb, m);
	      v2ApplyTransform(lb, lb, m);
	      v2ApplyTransform(rt, rt, m);
	      this.x = mathMin(lt[0], rb[0], lb[0], rt[0]);
	      this.y = mathMin(lt[1], rb[1], lb[1], rt[1]);
	      var maxX = mathMax(lt[0], rb[0], lb[0], rt[0]);
	      var maxY = mathMax(lt[1], rb[1], lb[1], rt[1]);
	      this.width = maxX - this.x;
	      this.height = maxY - this.y;
	    };
	  }(),

	  /**
	   * Calculate matrix of transforming from self to target rect
	   * @param  {module:zrender/core/BoundingRect} b
	   * @return {Array.<number>}
	   */
	  calculateTransform: function (b) {
	    var a = this;
	    var sx = b.width / a.width;
	    var sy = b.height / a.height;
	    var m = matrix.create(); // 矩阵右乘

	    matrix.translate(m, m, [-a.x, -a.y]);
	    matrix.scale(m, m, [sx, sy]);
	    matrix.translate(m, m, [b.x, b.y]);
	    return m;
	  },

	  /**
	   * @param {(module:echarts/core/BoundingRect|Object)} b
	   * @return {boolean}
	   */
	  intersect: function (b) {
	    if (!b) {
	      return false;
	    }

	    if (!(b instanceof BoundingRect)) {
	      // Normalize negative width/height.
	      b = BoundingRect.create(b);
	    }

	    var a = this;
	    var ax0 = a.x;
	    var ax1 = a.x + a.width;
	    var ay0 = a.y;
	    var ay1 = a.y + a.height;
	    var bx0 = b.x;
	    var bx1 = b.x + b.width;
	    var by0 = b.y;
	    var by1 = b.y + b.height;
	    return !(ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0);
	  },
	  contain: function (x, y) {
	    var rect = this;
	    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
	  },

	  /**
	   * @return {module:echarts/core/BoundingRect}
	   */
	  clone: function () {
	    return new BoundingRect(this.x, this.y, this.width, this.height);
	  },

	  /**
	   * Copy from another rect
	   */
	  copy: function (other) {
	    this.x = other.x;
	    this.y = other.y;
	    this.width = other.width;
	    this.height = other.height;
	  },
	  plain: function () {
	    return {
	      x: this.x,
	      y: this.y,
	      width: this.width,
	      height: this.height
	    };
	  }
	};
	/**
	 * @param {Object|module:zrender/core/BoundingRect} rect
	 * @param {number} rect.x
	 * @param {number} rect.y
	 * @param {number} rect.width
	 * @param {number} rect.height
	 * @return {module:zrender/core/BoundingRect}
	 */

	BoundingRect.create = function (rect) {
	  return new BoundingRect(rect.x, rect.y, rect.width, rect.height);
	};

	var _default = BoundingRect;
	module.exports = _default;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/* global Float32Array */
	var ArrayCtor = typeof Float32Array === 'undefined' ? Array : Float32Array;
	/**
	 * 创建一个向量
	 * @param {number} [x=0]
	 * @param {number} [y=0]
	 * @return {Vector2}
	 */

	function create(x, y) {
	  var out = new ArrayCtor(2);

	  if (x == null) {
	    x = 0;
	  }

	  if (y == null) {
	    y = 0;
	  }

	  out[0] = x;
	  out[1] = y;
	  return out;
	}
	/**
	 * 复制向量数据
	 * @param {Vector2} out
	 * @param {Vector2} v
	 * @return {Vector2}
	 */


	function copy(out, v) {
	  out[0] = v[0];
	  out[1] = v[1];
	  return out;
	}
	/**
	 * 克隆一个向量
	 * @param {Vector2} v
	 * @return {Vector2}
	 */


	function clone(v) {
	  var out = new ArrayCtor(2);
	  out[0] = v[0];
	  out[1] = v[1];
	  return out;
	}
	/**
	 * 设置向量的两个项
	 * @param {Vector2} out
	 * @param {number} a
	 * @param {number} b
	 * @return {Vector2} 结果
	 */


	function set(out, a, b) {
	  out[0] = a;
	  out[1] = b;
	  return out;
	}
	/**
	 * 向量相加
	 * @param {Vector2} out
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 */


	function add(out, v1, v2) {
	  out[0] = v1[0] + v2[0];
	  out[1] = v1[1] + v2[1];
	  return out;
	}
	/**
	 * 向量缩放后相加
	 * @param {Vector2} out
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 * @param {number} a
	 */


	function scaleAndAdd(out, v1, v2, a) {
	  out[0] = v1[0] + v2[0] * a;
	  out[1] = v1[1] + v2[1] * a;
	  return out;
	}
	/**
	 * 向量相减
	 * @param {Vector2} out
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 */


	function sub(out, v1, v2) {
	  out[0] = v1[0] - v2[0];
	  out[1] = v1[1] - v2[1];
	  return out;
	}
	/**
	 * 向量长度
	 * @param {Vector2} v
	 * @return {number}
	 */


	function len(v) {
	  return Math.sqrt(lenSquare(v));
	}

	var length = len; // jshint ignore:line

	/**
	 * 向量长度平方
	 * @param {Vector2} v
	 * @return {number}
	 */

	function lenSquare(v) {
	  return v[0] * v[0] + v[1] * v[1];
	}

	var lengthSquare = lenSquare;
	/**
	 * 向量乘法
	 * @param {Vector2} out
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 */

	function mul(out, v1, v2) {
	  out[0] = v1[0] * v2[0];
	  out[1] = v1[1] * v2[1];
	  return out;
	}
	/**
	 * 向量除法
	 * @param {Vector2} out
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 */


	function div(out, v1, v2) {
	  out[0] = v1[0] / v2[0];
	  out[1] = v1[1] / v2[1];
	  return out;
	}
	/**
	 * 向量点乘
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 * @return {number}
	 */


	function dot(v1, v2) {
	  return v1[0] * v2[0] + v1[1] * v2[1];
	}
	/**
	 * 向量缩放
	 * @param {Vector2} out
	 * @param {Vector2} v
	 * @param {number} s
	 */


	function scale(out, v, s) {
	  out[0] = v[0] * s;
	  out[1] = v[1] * s;
	  return out;
	}
	/**
	 * 向量归一化
	 * @param {Vector2} out
	 * @param {Vector2} v
	 */


	function normalize(out, v) {
	  var d = len(v);

	  if (d === 0) {
	    out[0] = 0;
	    out[1] = 0;
	  } else {
	    out[0] = v[0] / d;
	    out[1] = v[1] / d;
	  }

	  return out;
	}
	/**
	 * 计算向量间距离
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 * @return {number}
	 */


	function distance(v1, v2) {
	  return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
	}

	var dist = distance;
	/**
	 * 向量距离平方
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 * @return {number}
	 */

	function distanceSquare(v1, v2) {
	  return (v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]);
	}

	var distSquare = distanceSquare;
	/**
	 * 求负向量
	 * @param {Vector2} out
	 * @param {Vector2} v
	 */

	function negate(out, v) {
	  out[0] = -v[0];
	  out[1] = -v[1];
	  return out;
	}
	/**
	 * 插值两个点
	 * @param {Vector2} out
	 * @param {Vector2} v1
	 * @param {Vector2} v2
	 * @param {number} t
	 */


	function lerp(out, v1, v2, t) {
	  out[0] = v1[0] + t * (v2[0] - v1[0]);
	  out[1] = v1[1] + t * (v2[1] - v1[1]);
	  return out;
	}
	/**
	 * 矩阵左乘向量
	 * @param {Vector2} out
	 * @param {Vector2} v
	 * @param {Vector2} m
	 */


	function applyTransform(out, v, m) {
	  var x = v[0];
	  var y = v[1];
	  out[0] = m[0] * x + m[2] * y + m[4];
	  out[1] = m[1] * x + m[3] * y + m[5];
	  return out;
	}
	/**
	 * 求两个向量最小值
	 * @param  {Vector2} out
	 * @param  {Vector2} v1
	 * @param  {Vector2} v2
	 */


	function min(out, v1, v2) {
	  out[0] = Math.min(v1[0], v2[0]);
	  out[1] = Math.min(v1[1], v2[1]);
	  return out;
	}
	/**
	 * 求两个向量最大值
	 * @param  {Vector2} out
	 * @param  {Vector2} v1
	 * @param  {Vector2} v2
	 */


	function max(out, v1, v2) {
	  out[0] = Math.max(v1[0], v2[0]);
	  out[1] = Math.max(v1[1], v2[1]);
	  return out;
	}

	exports.create = create;
	exports.copy = copy;
	exports.clone = clone;
	exports.set = set;
	exports.add = add;
	exports.scaleAndAdd = scaleAndAdd;
	exports.sub = sub;
	exports.len = len;
	exports.length = length;
	exports.lenSquare = lenSquare;
	exports.lengthSquare = lengthSquare;
	exports.mul = mul;
	exports.div = div;
	exports.dot = dot;
	exports.scale = scale;
	exports.normalize = normalize;
	exports.distance = distance;
	exports.dist = dist;
	exports.distanceSquare = distanceSquare;
	exports.distSquare = distSquare;
	exports.negate = negate;
	exports.lerp = lerp;
	exports.applyTransform = applyTransform;
	exports.min = min;
	exports.max = max;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/**
	 * 3x2矩阵操作类
	 * @exports zrender/tool/matrix
	 */

	/* global Float32Array */
	var ArrayCtor = typeof Float32Array === 'undefined' ? Array : Float32Array;
	/**
	 * Create a identity matrix.
	 * @return {Float32Array|Array.<number>}
	 */

	function create() {
	  var out = new ArrayCtor(6);
	  identity(out);
	  return out;
	}
	/**
	 * 设置矩阵为单位矩阵
	 * @param {Float32Array|Array.<number>} out
	 */


	function identity(out) {
	  out[0] = 1;
	  out[1] = 0;
	  out[2] = 0;
	  out[3] = 1;
	  out[4] = 0;
	  out[5] = 0;
	  return out;
	}
	/**
	 * 复制矩阵
	 * @param {Float32Array|Array.<number>} out
	 * @param {Float32Array|Array.<number>} m
	 */


	function copy(out, m) {
	  out[0] = m[0];
	  out[1] = m[1];
	  out[2] = m[2];
	  out[3] = m[3];
	  out[4] = m[4];
	  out[5] = m[5];
	  return out;
	}
	/**
	 * 矩阵相乘
	 * @param {Float32Array|Array.<number>} out
	 * @param {Float32Array|Array.<number>} m1
	 * @param {Float32Array|Array.<number>} m2
	 */


	function mul(out, m1, m2) {
	  // Consider matrix.mul(m, m2, m);
	  // where out is the same as m2.
	  // So use temp variable to escape error.
	  var out0 = m1[0] * m2[0] + m1[2] * m2[1];
	  var out1 = m1[1] * m2[0] + m1[3] * m2[1];
	  var out2 = m1[0] * m2[2] + m1[2] * m2[3];
	  var out3 = m1[1] * m2[2] + m1[3] * m2[3];
	  var out4 = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
	  var out5 = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
	  out[0] = out0;
	  out[1] = out1;
	  out[2] = out2;
	  out[3] = out3;
	  out[4] = out4;
	  out[5] = out5;
	  return out;
	}
	/**
	 * 平移变换
	 * @param {Float32Array|Array.<number>} out
	 * @param {Float32Array|Array.<number>} a
	 * @param {Float32Array|Array.<number>} v
	 */


	function translate(out, a, v) {
	  out[0] = a[0];
	  out[1] = a[1];
	  out[2] = a[2];
	  out[3] = a[3];
	  out[4] = a[4] + v[0];
	  out[5] = a[5] + v[1];
	  return out;
	}
	/**
	 * 旋转变换
	 * @param {Float32Array|Array.<number>} out
	 * @param {Float32Array|Array.<number>} a
	 * @param {number} rad
	 */


	function rotate(out, a, rad) {
	  var aa = a[0];
	  var ac = a[2];
	  var atx = a[4];
	  var ab = a[1];
	  var ad = a[3];
	  var aty = a[5];
	  var st = Math.sin(rad);
	  var ct = Math.cos(rad);
	  out[0] = aa * ct + ab * st;
	  out[1] = -aa * st + ab * ct;
	  out[2] = ac * ct + ad * st;
	  out[3] = -ac * st + ct * ad;
	  out[4] = ct * atx + st * aty;
	  out[5] = ct * aty - st * atx;
	  return out;
	}
	/**
	 * 缩放变换
	 * @param {Float32Array|Array.<number>} out
	 * @param {Float32Array|Array.<number>} a
	 * @param {Float32Array|Array.<number>} v
	 */


	function scale(out, a, v) {
	  var vx = v[0];
	  var vy = v[1];
	  out[0] = a[0] * vx;
	  out[1] = a[1] * vy;
	  out[2] = a[2] * vx;
	  out[3] = a[3] * vy;
	  out[4] = a[4] * vx;
	  out[5] = a[5] * vy;
	  return out;
	}
	/**
	 * 求逆矩阵
	 * @param {Float32Array|Array.<number>} out
	 * @param {Float32Array|Array.<number>} a
	 */


	function invert(out, a) {
	  var aa = a[0];
	  var ac = a[2];
	  var atx = a[4];
	  var ab = a[1];
	  var ad = a[3];
	  var aty = a[5];
	  var det = aa * ad - ab * ac;

	  if (!det) {
	    return null;
	  }

	  det = 1.0 / det;
	  out[0] = ad * det;
	  out[1] = -ab * det;
	  out[2] = -ac * det;
	  out[3] = aa * det;
	  out[4] = (ac * aty - ad * atx) * det;
	  out[5] = (ab * atx - aa * aty) * det;
	  return out;
	}
	/**
	 * Clone a new matrix.
	 * @param {Float32Array|Array.<number>} a
	 */


	function clone(a) {
	  var b = create();
	  copy(b, a);
	  return b;
	}

	exports.create = create;
	exports.identity = identity;
	exports.copy = copy;
	exports.mul = mul;
	exports.translate = translate;
	exports.rotate = rotate;
	exports.scale = scale;
	exports.invert = invert;
	exports.clone = clone;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var zrUtil = __webpack_require__(4);

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	/*
	* A third-party license is embeded for some of the code in this file:
	* The method "quantile" was copied from "d3.js".
	* (See more details in the comment of the method below.)
	* The use of the source code of this file is also subject to the terms
	* and consitions of the license of "d3.js" (BSD-3Clause, see
	* </licenses/LICENSE-d3>).
	*/
	var RADIAN_EPSILON = 1e-4;

	function _trim(str) {
	  return str.replace(/^\s+|\s+$/g, '');
	}
	/**
	 * Linear mapping a value from domain to range
	 * @memberOf module:echarts/util/number
	 * @param  {(number|Array.<number>)} val
	 * @param  {Array.<number>} domain Domain extent domain[0] can be bigger than domain[1]
	 * @param  {Array.<number>} range  Range extent range[0] can be bigger than range[1]
	 * @param  {boolean} clamp
	 * @return {(number|Array.<number>}
	 */


	function linearMap(val, domain, range, clamp) {
	  var subDomain = domain[1] - domain[0];
	  var subRange = range[1] - range[0];

	  if (subDomain === 0) {
	    return subRange === 0 ? range[0] : (range[0] + range[1]) / 2;
	  } // Avoid accuracy problem in edge, such as
	  // 146.39 - 62.83 === 83.55999999999999.
	  // See echarts/test/ut/spec/util/number.js#linearMap#accuracyError
	  // It is a little verbose for efficiency considering this method
	  // is a hotspot.


	  if (clamp) {
	    if (subDomain > 0) {
	      if (val <= domain[0]) {
	        return range[0];
	      } else if (val >= domain[1]) {
	        return range[1];
	      }
	    } else {
	      if (val >= domain[0]) {
	        return range[0];
	      } else if (val <= domain[1]) {
	        return range[1];
	      }
	    }
	  } else {
	    if (val === domain[0]) {
	      return range[0];
	    }

	    if (val === domain[1]) {
	      return range[1];
	    }
	  }

	  return (val - domain[0]) / subDomain * subRange + range[0];
	}
	/**
	 * Convert a percent string to absolute number.
	 * Returns NaN if percent is not a valid string or number
	 * @memberOf module:echarts/util/number
	 * @param {string|number} percent
	 * @param {number} all
	 * @return {number}
	 */


	function parsePercent(percent, all) {
	  switch (percent) {
	    case 'center':
	    case 'middle':
	      percent = '50%';
	      break;

	    case 'left':
	    case 'top':
	      percent = '0%';
	      break;

	    case 'right':
	    case 'bottom':
	      percent = '100%';
	      break;
	  }

	  if (typeof percent === 'string') {
	    if (_trim(percent).match(/%$/)) {
	      return parseFloat(percent) / 100 * all;
	    }

	    return parseFloat(percent);
	  }

	  return percent == null ? NaN : +percent;
	}
	/**
	 * (1) Fix rounding error of float numbers.
	 * (2) Support return string to avoid scientific notation like '3.5e-7'.
	 *
	 * @param {number} x
	 * @param {number} [precision]
	 * @param {boolean} [returnStr]
	 * @return {number|string}
	 */


	function round(x, precision, returnStr) {
	  if (precision == null) {
	    precision = 10;
	  } // Avoid range error


	  precision = Math.min(Math.max(0, precision), 20);
	  x = (+x).toFixed(precision);
	  return returnStr ? x : +x;
	}
	/**
	 * asc sort arr.
	 * The input arr will be modified.
	 *
	 * @param {Array} arr
	 * @return {Array} The input arr.
	 */


	function asc(arr) {
	  arr.sort(function (a, b) {
	    return a - b;
	  });
	  return arr;
	}
	/**
	 * Get precision
	 * @param {number} val
	 */


	function getPrecision(val) {
	  val = +val;

	  if (isNaN(val)) {
	    return 0;
	  } // It is much faster than methods converting number to string as follows
	  //      var tmp = val.toString();
	  //      return tmp.length - 1 - tmp.indexOf('.');
	  // especially when precision is low


	  var e = 1;
	  var count = 0;

	  while (Math.round(val * e) / e !== val) {
	    e *= 10;
	    count++;
	  }

	  return count;
	}
	/**
	 * @param {string|number} val
	 * @return {number}
	 */


	function getPrecisionSafe(val) {
	  var str = val.toString(); // Consider scientific notation: '3.4e-12' '3.4e+12'

	  var eIndex = str.indexOf('e');

	  if (eIndex > 0) {
	    var precision = +str.slice(eIndex + 1);
	    return precision < 0 ? -precision : 0;
	  } else {
	    var dotIndex = str.indexOf('.');
	    return dotIndex < 0 ? 0 : str.length - 1 - dotIndex;
	  }
	}
	/**
	 * Minimal dicernible data precisioin according to a single pixel.
	 *
	 * @param {Array.<number>} dataExtent
	 * @param {Array.<number>} pixelExtent
	 * @return {number} precision
	 */


	function getPixelPrecision(dataExtent, pixelExtent) {
	  var log = Math.log;
	  var LN10 = Math.LN10;
	  var dataQuantity = Math.floor(log(dataExtent[1] - dataExtent[0]) / LN10);
	  var sizeQuantity = Math.round(log(Math.abs(pixelExtent[1] - pixelExtent[0])) / LN10); // toFixed() digits argument must be between 0 and 20.

	  var precision = Math.min(Math.max(-dataQuantity + sizeQuantity, 0), 20);
	  return !isFinite(precision) ? 20 : precision;
	}
	/**
	 * Get a data of given precision, assuring the sum of percentages
	 * in valueList is 1.
	 * The largest remainer method is used.
	 * https://en.wikipedia.org/wiki/Largest_remainder_method
	 *
	 * @param {Array.<number>} valueList a list of all data
	 * @param {number} idx index of the data to be processed in valueList
	 * @param {number} precision integer number showing digits of precision
	 * @return {number} percent ranging from 0 to 100
	 */


	function getPercentWithPrecision(valueList, idx, precision) {
	  if (!valueList[idx]) {
	    return 0;
	  }

	  var sum = zrUtil.reduce(valueList, function (acc, val) {
	    return acc + (isNaN(val) ? 0 : val);
	  }, 0);

	  if (sum === 0) {
	    return 0;
	  }

	  var digits = Math.pow(10, precision);
	  var votesPerQuota = zrUtil.map(valueList, function (val) {
	    return (isNaN(val) ? 0 : val) / sum * digits * 100;
	  });
	  var targetSeats = digits * 100;
	  var seats = zrUtil.map(votesPerQuota, function (votes) {
	    // Assign automatic seats.
	    return Math.floor(votes);
	  });
	  var currentSum = zrUtil.reduce(seats, function (acc, val) {
	    return acc + val;
	  }, 0);
	  var remainder = zrUtil.map(votesPerQuota, function (votes, idx) {
	    return votes - seats[idx];
	  }); // Has remainding votes.

	  while (currentSum < targetSeats) {
	    // Find next largest remainder.
	    var max = Number.NEGATIVE_INFINITY;
	    var maxId = null;

	    for (var i = 0, len = remainder.length; i < len; ++i) {
	      if (remainder[i] > max) {
	        max = remainder[i];
	        maxId = i;
	      }
	    } // Add a vote to max remainder.


	    ++seats[maxId];
	    remainder[maxId] = 0;
	    ++currentSum;
	  }

	  return seats[idx] / digits;
	} // Number.MAX_SAFE_INTEGER, ie do not support.


	var MAX_SAFE_INTEGER = 9007199254740991;
	/**
	 * To 0 - 2 * PI, considering negative radian.
	 * @param {number} radian
	 * @return {number}
	 */

	function remRadian(radian) {
	  var pi2 = Math.PI * 2;
	  return (radian % pi2 + pi2) % pi2;
	}
	/**
	 * @param {type} radian
	 * @return {boolean}
	 */


	function isRadianAroundZero(val) {
	  return val > -RADIAN_EPSILON && val < RADIAN_EPSILON;
	}
	/* eslint-disable */


	var TIME_REG = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d\d)(?::(\d\d)(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/; // jshint ignore:line

	/* eslint-enable */

	/**
	 * @param {string|Date|number} value These values can be accepted:
	 *   + An instance of Date, represent a time in its own time zone.
	 *   + Or string in a subset of ISO 8601, only including:
	 *     + only year, month, date: '2012-03', '2012-03-01', '2012-03-01 05', '2012-03-01 05:06',
	 *     + separated with T or space: '2012-03-01T12:22:33.123', '2012-03-01 12:22:33.123',
	 *     + time zone: '2012-03-01T12:22:33Z', '2012-03-01T12:22:33+8000', '2012-03-01T12:22:33-05:00',
	 *     all of which will be treated as local time if time zone is not specified
	 *     (see <https://momentjs.com/>).
	 *   + Or other string format, including (all of which will be treated as loacal time):
	 *     '2012', '2012-3-1', '2012/3/1', '2012/03/01',
	 *     '2009/6/12 2:00', '2009/6/12 2:05:08', '2009/6/12 2:05:08.123'
	 *   + a timestamp, which represent a time in UTC.
	 * @return {Date} date
	 */

	function parseDate(value) {
	  if (value instanceof Date) {
	    return value;
	  } else if (typeof value === 'string') {
	    // Different browsers parse date in different way, so we parse it manually.
	    // Some other issues:
	    // new Date('1970-01-01') is UTC,
	    // new Date('1970/01/01') and new Date('1970-1-01') is local.
	    // See issue #3623
	    var match = TIME_REG.exec(value);

	    if (!match) {
	      // return Invalid Date.
	      return new Date(NaN);
	    } // Use local time when no timezone offset specifed.


	    if (!match[8]) {
	      // match[n] can only be string or undefined.
	      // But take care of '12' + 1 => '121'.
	      return new Date(+match[1], +(match[2] || 1) - 1, +match[3] || 1, +match[4] || 0, +(match[5] || 0), +match[6] || 0, +match[7] || 0);
	    } // Timezoneoffset of Javascript Date has considered DST (Daylight Saving Time,
	    // https://tc39.github.io/ecma262/#sec-daylight-saving-time-adjustment).
	    // For example, system timezone is set as "Time Zone: America/Toronto",
	    // then these code will get different result:
	    // `new Date(1478411999999).getTimezoneOffset();  // get 240`
	    // `new Date(1478412000000).getTimezoneOffset();  // get 300`
	    // So we should not use `new Date`, but use `Date.UTC`.
	    else {
	        var hour = +match[4] || 0;

	        if (match[8].toUpperCase() !== 'Z') {
	          hour -= match[8].slice(0, 3);
	        }

	        return new Date(Date.UTC(+match[1], +(match[2] || 1) - 1, +match[3] || 1, hour, +(match[5] || 0), +match[6] || 0, +match[7] || 0));
	      }
	  } else if (value == null) {
	    return new Date(NaN);
	  }

	  return new Date(Math.round(value));
	}
	/**
	 * Quantity of a number. e.g. 0.1, 1, 10, 100
	 *
	 * @param  {number} val
	 * @return {number}
	 */


	function quantity(val) {
	  return Math.pow(10, quantityExponent(val));
	}
	/**
	 * Exponent of the quantity of a number
	 * e.g., 1234 equals to 1.234*10^3, so quantityExponent(1234) is 3
	 *
	 * @param  {number} val non-negative value
	 * @return {number}
	 */


	function quantityExponent(val) {
	  if (val === 0) {
	    return 0;
	  }

	  var exp = Math.floor(Math.log(val) / Math.LN10);
	  /**
	   * exp is expected to be the rounded-down result of the base-10 log of val.
	   * But due to the precision loss with Math.log(val), we need to restore it
	   * using 10^exp to make sure we can get val back from exp. #11249
	   */

	  if (val / Math.pow(10, exp) >= 10) {
	    exp++;
	  }

	  return exp;
	}
	/**
	 * find a “nice” number approximately equal to x. Round the number if round = true,
	 * take ceiling if round = false. The primary observation is that the “nicest”
	 * numbers in decimal are 1, 2, and 5, and all power-of-ten multiples of these numbers.
	 *
	 * See "Nice Numbers for Graph Labels" of Graphic Gems.
	 *
	 * @param  {number} val Non-negative value.
	 * @param  {boolean} round
	 * @return {number}
	 */


	function nice(val, round) {
	  var exponent = quantityExponent(val);
	  var exp10 = Math.pow(10, exponent);
	  var f = val / exp10; // 1 <= f < 10

	  var nf;

	  if (round) {
	    if (f < 1.5) {
	      nf = 1;
	    } else if (f < 2.5) {
	      nf = 2;
	    } else if (f < 4) {
	      nf = 3;
	    } else if (f < 7) {
	      nf = 5;
	    } else {
	      nf = 10;
	    }
	  } else {
	    if (f < 1) {
	      nf = 1;
	    } else if (f < 2) {
	      nf = 2;
	    } else if (f < 3) {
	      nf = 3;
	    } else if (f < 5) {
	      nf = 5;
	    } else {
	      nf = 10;
	    }
	  }

	  val = nf * exp10; // Fix 3 * 0.1 === 0.30000000000000004 issue (see IEEE 754).
	  // 20 is the uppper bound of toFixed.

	  return exponent >= -20 ? +val.toFixed(exponent < 0 ? -exponent : 0) : val;
	}
	/**
	 * This code was copied from "d3.js"
	 * <https://github.com/d3/d3/blob/9cc9a875e636a1dcf36cc1e07bdf77e1ad6e2c74/src/arrays/quantile.js>.
	 * See the license statement at the head of this file.
	 * @param {Array.<number>} ascArr
	 */


	function quantile(ascArr, p) {
	  var H = (ascArr.length - 1) * p + 1;
	  var h = Math.floor(H);
	  var v = +ascArr[h - 1];
	  var e = H - h;
	  return e ? v + e * (ascArr[h] - v) : v;
	}
	/**
	 * Order intervals asc, and split them when overlap.
	 * expect(numberUtil.reformIntervals([
	 *     {interval: [18, 62], close: [1, 1]},
	 *     {interval: [-Infinity, -70], close: [0, 0]},
	 *     {interval: [-70, -26], close: [1, 1]},
	 *     {interval: [-26, 18], close: [1, 1]},
	 *     {interval: [62, 150], close: [1, 1]},
	 *     {interval: [106, 150], close: [1, 1]},
	 *     {interval: [150, Infinity], close: [0, 0]}
	 * ])).toEqual([
	 *     {interval: [-Infinity, -70], close: [0, 0]},
	 *     {interval: [-70, -26], close: [1, 1]},
	 *     {interval: [-26, 18], close: [0, 1]},
	 *     {interval: [18, 62], close: [0, 1]},
	 *     {interval: [62, 150], close: [0, 1]},
	 *     {interval: [150, Infinity], close: [0, 0]}
	 * ]);
	 * @param {Array.<Object>} list, where `close` mean open or close
	 *        of the interval, and Infinity can be used.
	 * @return {Array.<Object>} The origin list, which has been reformed.
	 */


	function reformIntervals(list) {
	  list.sort(function (a, b) {
	    return littleThan(a, b, 0) ? -1 : 1;
	  });
	  var curr = -Infinity;
	  var currClose = 1;

	  for (var i = 0; i < list.length;) {
	    var interval = list[i].interval;
	    var close = list[i].close;

	    for (var lg = 0; lg < 2; lg++) {
	      if (interval[lg] <= curr) {
	        interval[lg] = curr;
	        close[lg] = !lg ? 1 - currClose : 1;
	      }

	      curr = interval[lg];
	      currClose = close[lg];
	    }

	    if (interval[0] === interval[1] && close[0] * close[1] !== 1) {
	      list.splice(i, 1);
	    } else {
	      i++;
	    }
	  }

	  return list;

	  function littleThan(a, b, lg) {
	    return a.interval[lg] < b.interval[lg] || a.interval[lg] === b.interval[lg] && (a.close[lg] - b.close[lg] === (!lg ? 1 : -1) || !lg && littleThan(a, b, 1));
	  }
	}
	/**
	 * parseFloat NaNs numeric-cast false positives (null|true|false|"")
	 * ...but misinterprets leading-number strings, particularly hex literals ("0x...")
	 * subtraction forces infinities to NaN
	 *
	 * @param {*} v
	 * @return {boolean}
	 */


	function isNumeric(v) {
	  return v - parseFloat(v) >= 0;
	}

	exports.linearMap = linearMap;
	exports.parsePercent = parsePercent;
	exports.round = round;
	exports.asc = asc;
	exports.getPrecision = getPrecision;
	exports.getPrecisionSafe = getPrecisionSafe;
	exports.getPixelPrecision = getPixelPrecision;
	exports.getPercentWithPrecision = getPercentWithPrecision;
	exports.MAX_SAFE_INTEGER = MAX_SAFE_INTEGER;
	exports.remRadian = remRadian;
	exports.isRadianAroundZero = isRadianAroundZero;
	exports.parseDate = parseDate;
	exports.quantity = quantity;
	exports.quantityExponent = quantityExponent;
	exports.nice = nice;
	exports.quantile = quantile;
	exports.reformIntervals = reformIntervals;
	exports.isNumeric = isNumeric;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var zrUtil = __webpack_require__(4);

	var textContain = __webpack_require__(10);

	var numberUtil = __webpack_require__(8);

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/
	// import Text from 'zrender/src/graphic/Text';

	/**
	 * add commas after every three numbers
	 * @param {string|number} x
	 * @return {string}
	 */
	function addCommas(x) {
	  if (isNaN(x)) {
	    return '-';
	  }

	  x = (x + '').split('.');
	  return x[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,') + (x.length > 1 ? '.' + x[1] : '');
	}
	/**
	 * @param {string} str
	 * @param {boolean} [upperCaseFirst=false]
	 * @return {string} str
	 */


	function toCamelCase(str, upperCaseFirst) {
	  str = (str || '').toLowerCase().replace(/-(.)/g, function (match, group1) {
	    return group1.toUpperCase();
	  });

	  if (upperCaseFirst && str) {
	    str = str.charAt(0).toUpperCase() + str.slice(1);
	  }

	  return str;
	}

	var normalizeCssArray = zrUtil.normalizeCssArray;
	var replaceReg = /([&<>"'])/g;
	var replaceMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  '\'': '&#39;'
	};

	function encodeHTML(source) {
	  return source == null ? '' : (source + '').replace(replaceReg, function (str, c) {
	    return replaceMap[c];
	  });
	}

	var TPL_VAR_ALIAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

	var wrapVar = function (varName, seriesIdx) {
	  return '{' + varName + (seriesIdx == null ? '' : seriesIdx) + '}';
	};
	/**
	 * Template formatter
	 * @param {string} tpl
	 * @param {Array.<Object>|Object} paramsList
	 * @param {boolean} [encode=false]
	 * @return {string}
	 */


	function formatTpl(tpl, paramsList, encode) {
	  if (!zrUtil.isArray(paramsList)) {
	    paramsList = [paramsList];
	  }

	  var seriesLen = paramsList.length;

	  if (!seriesLen) {
	    return '';
	  }

	  var $vars = paramsList[0].$vars || [];

	  for (var i = 0; i < $vars.length; i++) {
	    var alias = TPL_VAR_ALIAS[i];
	    tpl = tpl.replace(wrapVar(alias), wrapVar(alias, 0));
	  }

	  for (var seriesIdx = 0; seriesIdx < seriesLen; seriesIdx++) {
	    for (var k = 0; k < $vars.length; k++) {
	      var val = paramsList[seriesIdx][$vars[k]];
	      tpl = tpl.replace(wrapVar(TPL_VAR_ALIAS[k], seriesIdx), encode ? encodeHTML(val) : val);
	    }
	  }

	  return tpl;
	}
	/**
	 * simple Template formatter
	 *
	 * @param {string} tpl
	 * @param {Object} param
	 * @param {boolean} [encode=false]
	 * @return {string}
	 */


	function formatTplSimple(tpl, param, encode) {
	  zrUtil.each(param, function (value, key) {
	    tpl = tpl.replace('{' + key + '}', encode ? encodeHTML(value) : value);
	  });
	  return tpl;
	}
	/**
	 * @param {Object|string} [opt] If string, means color.
	 * @param {string} [opt.color]
	 * @param {string} [opt.extraCssText]
	 * @param {string} [opt.type='item'] 'item' or 'subItem'
	 * @param {string} [opt.renderMode='html'] render mode of tooltip, 'html' or 'richText'
	 * @param {string} [opt.markerId='X'] id name for marker. If only one marker is in a rich text, this can be omitted.
	 * @return {string}
	 */


	function getTooltipMarker(opt, extraCssText) {
	  opt = zrUtil.isString(opt) ? {
	    color: opt,
	    extraCssText: extraCssText
	  } : opt || {};
	  var color = opt.color;
	  var type = opt.type;
	  var extraCssText = opt.extraCssText;
	  var renderMode = opt.renderMode || 'html';
	  var markerId = opt.markerId || 'X';

	  if (!color) {
	    return '';
	  }

	  if (renderMode === 'html') {
	    return type === 'subItem' ? '<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;' + 'border-radius:4px;width:4px;height:4px;background-color:' + encodeHTML(color) + ';' + (extraCssText || '') + '"></span>' : '<span style="display:inline-block;margin-right:5px;' + 'border-radius:10px;width:10px;height:10px;background-color:' + encodeHTML(color) + ';' + (extraCssText || '') + '"></span>';
	  } else {
	    // Space for rich element marker
	    return {
	      renderMode: renderMode,
	      content: '{marker' + markerId + '|}  ',
	      style: {
	        color: color
	      }
	    };
	  }
	}

	function pad(str, len) {
	  str += '';
	  return '0000'.substr(0, len - str.length) + str;
	}
	/**
	 * ISO Date format
	 * @param {string} tpl
	 * @param {number} value
	 * @param {boolean} [isUTC=false] Default in local time.
	 *           see `module:echarts/scale/Time`
	 *           and `module:echarts/util/number#parseDate`.
	 * @inner
	 */


	function formatTime(tpl, value, isUTC) {
	  if (tpl === 'week' || tpl === 'month' || tpl === 'quarter' || tpl === 'half-year' || tpl === 'year') {
	    tpl = 'MM-dd\nyyyy';
	  }

	  var date = numberUtil.parseDate(value);
	  var utc = isUTC ? 'UTC' : '';
	  var y = date['get' + utc + 'FullYear']();
	  var M = date['get' + utc + 'Month']() + 1;
	  var d = date['get' + utc + 'Date']();
	  var h = date['get' + utc + 'Hours']();
	  var m = date['get' + utc + 'Minutes']();
	  var s = date['get' + utc + 'Seconds']();
	  var S = date['get' + utc + 'Milliseconds']();
	  tpl = tpl.replace('MM', pad(M, 2)).replace('M', M).replace('yyyy', y).replace('yy', y % 100).replace('dd', pad(d, 2)).replace('d', d).replace('hh', pad(h, 2)).replace('h', h).replace('mm', pad(m, 2)).replace('m', m).replace('ss', pad(s, 2)).replace('s', s).replace('SSS', pad(S, 3));
	  return tpl;
	}
	/**
	 * Capital first
	 * @param {string} str
	 * @return {string}
	 */


	function capitalFirst(str) {
	  return str ? str.charAt(0).toUpperCase() + str.substr(1) : str;
	}

	var truncateText = textContain.truncateText;
	/**
	 * @public
	 * @param {Object} opt
	 * @param {string} opt.text
	 * @param {string} opt.font
	 * @param {string} [opt.textAlign='left']
	 * @param {string} [opt.textVerticalAlign='top']
	 * @param {Array.<number>} [opt.textPadding]
	 * @param {number} [opt.textLineHeight]
	 * @param {Object} [opt.rich]
	 * @param {Object} [opt.truncate]
	 * @return {Object} {x, y, width, height, lineHeight}
	 */

	function getTextBoundingRect(opt) {
	  return textContain.getBoundingRect(opt.text, opt.font, opt.textAlign, opt.textVerticalAlign, opt.textPadding, opt.textLineHeight, opt.rich, opt.truncate);
	}
	/**
	 * @deprecated
	 * the `textLineHeight` was added later.
	 * For backward compatiblility, put it as the last parameter.
	 * But deprecated this interface. Please use `getTextBoundingRect` instead.
	 */


	function getTextRect(text, font, textAlign, textVerticalAlign, textPadding, rich, truncate, textLineHeight) {
	  return textContain.getBoundingRect(text, font, textAlign, textVerticalAlign, textPadding, textLineHeight, rich, truncate);
	}
	/**
	 * open new tab
	 * @param {string} link url
	 * @param {string} target blank or self
	 */


	function windowOpen(link, target) {
	  if (target === '_blank' || target === 'blank') {
	    var blank = window.open();
	    blank.opener = null;
	    blank.location = link;
	  } else {
	    window.open(link, target);
	  }
	}

	exports.addCommas = addCommas;
	exports.toCamelCase = toCamelCase;
	exports.normalizeCssArray = normalizeCssArray;
	exports.encodeHTML = encodeHTML;
	exports.formatTpl = formatTpl;
	exports.formatTplSimple = formatTplSimple;
	exports.getTooltipMarker = getTooltipMarker;
	exports.formatTime = formatTime;
	exports.capitalFirst = capitalFirst;
	exports.truncateText = truncateText;
	exports.getTextBoundingRect = getTextBoundingRect;
	exports.getTextRect = getTextRect;
	exports.windowOpen = windowOpen;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var BoundingRect = __webpack_require__(5);

	var imageHelper = __webpack_require__(11);

	var _util = __webpack_require__(4);

	var getContext = _util.getContext;
	var extend = _util.extend;
	var retrieve2 = _util.retrieve2;
	var retrieve3 = _util.retrieve3;
	var trim = _util.trim;
	var textWidthCache = {};
	var textWidthCacheCounter = 0;
	var TEXT_CACHE_MAX = 5000;
	var STYLE_REG = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g;
	var DEFAULT_FONT = '12px sans-serif'; // Avoid assign to an exported variable, for transforming to cjs.

	var methods = {};

	function $override(name, fn) {
	  methods[name] = fn;
	}
	/**
	 * @public
	 * @param {string} text
	 * @param {string} font
	 * @return {number} width
	 */


	function getWidth(text, font) {
	  font = font || DEFAULT_FONT;
	  var key = text + ':' + font;

	  if (textWidthCache[key]) {
	    return textWidthCache[key];
	  }

	  var textLines = (text + '').split('\n');
	  var width = 0;

	  for (var i = 0, l = textLines.length; i < l; i++) {
	    // textContain.measureText may be overrided in SVG or VML
	    width = Math.max(measureText(textLines[i], font).width, width);
	  }

	  if (textWidthCacheCounter > TEXT_CACHE_MAX) {
	    textWidthCacheCounter = 0;
	    textWidthCache = {};
	  }

	  textWidthCacheCounter++;
	  textWidthCache[key] = width;
	  return width;
	}
	/**
	 * @public
	 * @param {string} text
	 * @param {string} font
	 * @param {string} [textAlign='left']
	 * @param {string} [textVerticalAlign='top']
	 * @param {Array.<number>} [textPadding]
	 * @param {Object} [rich]
	 * @param {Object} [truncate]
	 * @return {Object} {x, y, width, height, lineHeight}
	 */


	function getBoundingRect(text, font, textAlign, textVerticalAlign, textPadding, textLineHeight, rich, truncate) {
	  return rich ? getRichTextRect(text, font, textAlign, textVerticalAlign, textPadding, textLineHeight, rich, truncate) : getPlainTextRect(text, font, textAlign, textVerticalAlign, textPadding, textLineHeight, truncate);
	}

	function getPlainTextRect(text, font, textAlign, textVerticalAlign, textPadding, textLineHeight, truncate) {
	  var contentBlock = parsePlainText(text, font, textPadding, textLineHeight, truncate);
	  var outerWidth = getWidth(text, font);

	  if (textPadding) {
	    outerWidth += textPadding[1] + textPadding[3];
	  }

	  var outerHeight = contentBlock.outerHeight;
	  var x = adjustTextX(0, outerWidth, textAlign);
	  var y = adjustTextY(0, outerHeight, textVerticalAlign);
	  var rect = new BoundingRect(x, y, outerWidth, outerHeight);
	  rect.lineHeight = contentBlock.lineHeight;
	  return rect;
	}

	function getRichTextRect(text, font, textAlign, textVerticalAlign, textPadding, textLineHeight, rich, truncate) {
	  var contentBlock = parseRichText(text, {
	    rich: rich,
	    truncate: truncate,
	    font: font,
	    textAlign: textAlign,
	    textPadding: textPadding,
	    textLineHeight: textLineHeight
	  });
	  var outerWidth = contentBlock.outerWidth;
	  var outerHeight = contentBlock.outerHeight;
	  var x = adjustTextX(0, outerWidth, textAlign);
	  var y = adjustTextY(0, outerHeight, textVerticalAlign);
	  return new BoundingRect(x, y, outerWidth, outerHeight);
	}
	/**
	 * @public
	 * @param {number} x
	 * @param {number} width
	 * @param {string} [textAlign='left']
	 * @return {number} Adjusted x.
	 */


	function adjustTextX(x, width, textAlign) {
	  // FIXME Right to left language
	  if (textAlign === 'right') {
	    x -= width;
	  } else if (textAlign === 'center') {
	    x -= width / 2;
	  }

	  return x;
	}
	/**
	 * @public
	 * @param {number} y
	 * @param {number} height
	 * @param {string} [textVerticalAlign='top']
	 * @return {number} Adjusted y.
	 */


	function adjustTextY(y, height, textVerticalAlign) {
	  if (textVerticalAlign === 'middle') {
	    y -= height / 2;
	  } else if (textVerticalAlign === 'bottom') {
	    y -= height;
	  }

	  return y;
	}
	/**
	 * Follow same interface to `Displayable.prototype.calculateTextPosition`.
	 * @public
	 * @param {Obejct} [out] Prepared out object. If not input, auto created in the method.
	 * @param {module:zrender/graphic/Style} style where `textPosition` and `textDistance` are visited.
	 * @param {Object} rect {x, y, width, height} Rect of the host elment, according to which the text positioned.
	 * @return {Object} The input `out`. Set: {x, y, textAlign, textVerticalAlign}
	 */


	function calculateTextPosition(out, style, rect) {
	  var textPosition = style.textPosition;
	  var distance = style.textDistance;
	  var x = rect.x;
	  var y = rect.y;
	  distance = distance || 0;
	  var height = rect.height;
	  var width = rect.width;
	  var halfHeight = height / 2;
	  var textAlign = 'left';
	  var textVerticalAlign = 'top';

	  switch (textPosition) {
	    case 'left':
	      x -= distance;
	      y += halfHeight;
	      textAlign = 'right';
	      textVerticalAlign = 'middle';
	      break;

	    case 'right':
	      x += distance + width;
	      y += halfHeight;
	      textVerticalAlign = 'middle';
	      break;

	    case 'top':
	      x += width / 2;
	      y -= distance;
	      textAlign = 'center';
	      textVerticalAlign = 'bottom';
	      break;

	    case 'bottom':
	      x += width / 2;
	      y += height + distance;
	      textAlign = 'center';
	      break;

	    case 'inside':
	      x += width / 2;
	      y += halfHeight;
	      textAlign = 'center';
	      textVerticalAlign = 'middle';
	      break;

	    case 'insideLeft':
	      x += distance;
	      y += halfHeight;
	      textVerticalAlign = 'middle';
	      break;

	    case 'insideRight':
	      x += width - distance;
	      y += halfHeight;
	      textAlign = 'right';
	      textVerticalAlign = 'middle';
	      break;

	    case 'insideTop':
	      x += width / 2;
	      y += distance;
	      textAlign = 'center';
	      break;

	    case 'insideBottom':
	      x += width / 2;
	      y += height - distance;
	      textAlign = 'center';
	      textVerticalAlign = 'bottom';
	      break;

	    case 'insideTopLeft':
	      x += distance;
	      y += distance;
	      break;

	    case 'insideTopRight':
	      x += width - distance;
	      y += distance;
	      textAlign = 'right';
	      break;

	    case 'insideBottomLeft':
	      x += distance;
	      y += height - distance;
	      textVerticalAlign = 'bottom';
	      break;

	    case 'insideBottomRight':
	      x += width - distance;
	      y += height - distance;
	      textAlign = 'right';
	      textVerticalAlign = 'bottom';
	      break;
	  }

	  out = out || {};
	  out.x = x;
	  out.y = y;
	  out.textAlign = textAlign;
	  out.textVerticalAlign = textVerticalAlign;
	  return out;
	}
	/**
	 * To be removed. But still do not remove in case that some one has imported it.
	 * @deprecated
	 * @public
	 * @param {stirng} textPosition
	 * @param {Object} rect {x, y, width, height}
	 * @param {number} distance
	 * @return {Object} {x, y, textAlign, textVerticalAlign}
	 */


	function adjustTextPositionOnRect(textPosition, rect, distance) {
	  var dummyStyle = {
	    textPosition: textPosition,
	    textDistance: distance
	  };
	  return calculateTextPosition({}, dummyStyle, rect);
	}
	/**
	 * Show ellipsis if overflow.
	 *
	 * @public
	 * @param  {string} text
	 * @param  {string} containerWidth
	 * @param  {string} font
	 * @param  {number} [ellipsis='...']
	 * @param  {Object} [options]
	 * @param  {number} [options.maxIterations=3]
	 * @param  {number} [options.minChar=0] If truncate result are less
	 *                  then minChar, ellipsis will not show, which is
	 *                  better for user hint in some cases.
	 * @param  {number} [options.placeholder=''] When all truncated, use the placeholder.
	 * @return {string}
	 */


	function truncateText(text, containerWidth, font, ellipsis, options) {
	  if (!containerWidth) {
	    return '';
	  }

	  var textLines = (text + '').split('\n');
	  options = prepareTruncateOptions(containerWidth, font, ellipsis, options); // FIXME
	  // It is not appropriate that every line has '...' when truncate multiple lines.

	  for (var i = 0, len = textLines.length; i < len; i++) {
	    textLines[i] = truncateSingleLine(textLines[i], options);
	  }

	  return textLines.join('\n');
	}

	function prepareTruncateOptions(containerWidth, font, ellipsis, options) {
	  options = extend({}, options);
	  options.font = font;
	  var ellipsis = retrieve2(ellipsis, '...');
	  options.maxIterations = retrieve2(options.maxIterations, 2);
	  var minChar = options.minChar = retrieve2(options.minChar, 0); // FIXME
	  // Other languages?

	  options.cnCharWidth = getWidth('国', font); // FIXME
	  // Consider proportional font?

	  var ascCharWidth = options.ascCharWidth = getWidth('a', font);
	  options.placeholder = retrieve2(options.placeholder, ''); // Example 1: minChar: 3, text: 'asdfzxcv', truncate result: 'asdf', but not: 'a...'.
	  // Example 2: minChar: 3, text: '维度', truncate result: '维', but not: '...'.

	  var contentWidth = containerWidth = Math.max(0, containerWidth - 1); // Reserve some gap.

	  for (var i = 0; i < minChar && contentWidth >= ascCharWidth; i++) {
	    contentWidth -= ascCharWidth;
	  }

	  var ellipsisWidth = getWidth(ellipsis, font);

	  if (ellipsisWidth > contentWidth) {
	    ellipsis = '';
	    ellipsisWidth = 0;
	  }

	  contentWidth = containerWidth - ellipsisWidth;
	  options.ellipsis = ellipsis;
	  options.ellipsisWidth = ellipsisWidth;
	  options.contentWidth = contentWidth;
	  options.containerWidth = containerWidth;
	  return options;
	}

	function truncateSingleLine(textLine, options) {
	  var containerWidth = options.containerWidth;
	  var font = options.font;
	  var contentWidth = options.contentWidth;

	  if (!containerWidth) {
	    return '';
	  }

	  var lineWidth = getWidth(textLine, font);

	  if (lineWidth <= containerWidth) {
	    return textLine;
	  }

	  for (var j = 0;; j++) {
	    if (lineWidth <= contentWidth || j >= options.maxIterations) {
	      textLine += options.ellipsis;
	      break;
	    }

	    var subLength = j === 0 ? estimateLength(textLine, contentWidth, options.ascCharWidth, options.cnCharWidth) : lineWidth > 0 ? Math.floor(textLine.length * contentWidth / lineWidth) : 0;
	    textLine = textLine.substr(0, subLength);
	    lineWidth = getWidth(textLine, font);
	  }

	  if (textLine === '') {
	    textLine = options.placeholder;
	  }

	  return textLine;
	}

	function estimateLength(text, contentWidth, ascCharWidth, cnCharWidth) {
	  var width = 0;
	  var i = 0;

	  for (var len = text.length; i < len && width < contentWidth; i++) {
	    var charCode = text.charCodeAt(i);
	    width += 0 <= charCode && charCode <= 127 ? ascCharWidth : cnCharWidth;
	  }

	  return i;
	}
	/**
	 * @public
	 * @param {string} font
	 * @return {number} line height
	 */


	function getLineHeight(font) {
	  // FIXME A rough approach.
	  return getWidth('国', font);
	}
	/**
	 * @public
	 * @param {string} text
	 * @param {string} font
	 * @return {Object} width
	 */


	function measureText(text, font) {
	  return methods.measureText(text, font);
	} // Avoid assign to an exported variable, for transforming to cjs.


	methods.measureText = function (text, font) {
	  var ctx = getContext();
	  ctx.font = font || DEFAULT_FONT;
	  return ctx.measureText(text);
	};
	/**
	 * @public
	 * @param {string} text
	 * @param {string} font
	 * @param {Object} [truncate]
	 * @return {Object} block: {lineHeight, lines, height, outerHeight, canCacheByTextString}
	 *  Notice: for performance, do not calculate outerWidth util needed.
	 *  `canCacheByTextString` means the result `lines` is only determined by the input `text`.
	 *  Thus we can simply comparing the `input` text to determin whether the result changed,
	 *  without travel the result `lines`.
	 */


	function parsePlainText(text, font, padding, textLineHeight, truncate) {
	  text != null && (text += '');
	  var lineHeight = retrieve2(textLineHeight, getLineHeight(font));
	  var lines = text ? text.split('\n') : [];
	  var height = lines.length * lineHeight;
	  var outerHeight = height;
	  var canCacheByTextString = true;

	  if (padding) {
	    outerHeight += padding[0] + padding[2];
	  }

	  if (text && truncate) {
	    canCacheByTextString = false;
	    var truncOuterHeight = truncate.outerHeight;
	    var truncOuterWidth = truncate.outerWidth;

	    if (truncOuterHeight != null && outerHeight > truncOuterHeight) {
	      text = '';
	      lines = [];
	    } else if (truncOuterWidth != null) {
	      var options = prepareTruncateOptions(truncOuterWidth - (padding ? padding[1] + padding[3] : 0), font, truncate.ellipsis, {
	        minChar: truncate.minChar,
	        placeholder: truncate.placeholder
	      }); // FIXME
	      // It is not appropriate that every line has '...' when truncate multiple lines.

	      for (var i = 0, len = lines.length; i < len; i++) {
	        lines[i] = truncateSingleLine(lines[i], options);
	      }
	    }
	  }

	  return {
	    lines: lines,
	    height: height,
	    outerHeight: outerHeight,
	    lineHeight: lineHeight,
	    canCacheByTextString: canCacheByTextString
	  };
	}
	/**
	 * For example: 'some text {a|some text}other text{b|some text}xxx{c|}xxx'
	 * Also consider 'bbbb{a|xxx\nzzz}xxxx\naaaa'.
	 *
	 * @public
	 * @param {string} text
	 * @param {Object} style
	 * @return {Object} block
	 * {
	 *      width,
	 *      height,
	 *      lines: [{
	 *          lineHeight,
	 *          width,
	 *          tokens: [[{
	 *              styleName,
	 *              text,
	 *              width,      // include textPadding
	 *              height,     // include textPadding
	 *              textWidth, // pure text width
	 *              textHeight, // pure text height
	 *              lineHeihgt,
	 *              font,
	 *              textAlign,
	 *              textVerticalAlign
	 *          }], [...], ...]
	 *      }, ...]
	 * }
	 * If styleName is undefined, it is plain text.
	 */


	function parseRichText(text, style) {
	  var contentBlock = {
	    lines: [],
	    width: 0,
	    height: 0
	  };
	  text != null && (text += '');

	  if (!text) {
	    return contentBlock;
	  }

	  var lastIndex = STYLE_REG.lastIndex = 0;
	  var result;

	  while ((result = STYLE_REG.exec(text)) != null) {
	    var matchedIndex = result.index;

	    if (matchedIndex > lastIndex) {
	      pushTokens(contentBlock, text.substring(lastIndex, matchedIndex));
	    }

	    pushTokens(contentBlock, result[2], result[1]);
	    lastIndex = STYLE_REG.lastIndex;
	  }

	  if (lastIndex < text.length) {
	    pushTokens(contentBlock, text.substring(lastIndex, text.length));
	  }

	  var lines = contentBlock.lines;
	  var contentHeight = 0;
	  var contentWidth = 0; // For `textWidth: 100%`

	  var pendingList = [];
	  var stlPadding = style.textPadding;
	  var truncate = style.truncate;
	  var truncateWidth = truncate && truncate.outerWidth;
	  var truncateHeight = truncate && truncate.outerHeight;

	  if (stlPadding) {
	    truncateWidth != null && (truncateWidth -= stlPadding[1] + stlPadding[3]);
	    truncateHeight != null && (truncateHeight -= stlPadding[0] + stlPadding[2]);
	  } // Calculate layout info of tokens.


	  for (var i = 0; i < lines.length; i++) {
	    var line = lines[i];
	    var lineHeight = 0;
	    var lineWidth = 0;

	    for (var j = 0; j < line.tokens.length; j++) {
	      var token = line.tokens[j];
	      var tokenStyle = token.styleName && style.rich[token.styleName] || {}; // textPadding should not inherit from style.

	      var textPadding = token.textPadding = tokenStyle.textPadding; // textFont has been asigned to font by `normalizeStyle`.

	      var font = token.font = tokenStyle.font || style.font; // textHeight can be used when textVerticalAlign is specified in token.

	      var tokenHeight = token.textHeight = retrieve2( // textHeight should not be inherited, consider it can be specified
	      // as box height of the block.
	      tokenStyle.textHeight, getLineHeight(font));
	      textPadding && (tokenHeight += textPadding[0] + textPadding[2]);
	      token.height = tokenHeight;
	      token.lineHeight = retrieve3(tokenStyle.textLineHeight, style.textLineHeight, tokenHeight);
	      token.textAlign = tokenStyle && tokenStyle.textAlign || style.textAlign;
	      token.textVerticalAlign = tokenStyle && tokenStyle.textVerticalAlign || 'middle';

	      if (truncateHeight != null && contentHeight + token.lineHeight > truncateHeight) {
	        return {
	          lines: [],
	          width: 0,
	          height: 0
	        };
	      }

	      token.textWidth = getWidth(token.text, font);
	      var tokenWidth = tokenStyle.textWidth;
	      var tokenWidthNotSpecified = tokenWidth == null || tokenWidth === 'auto'; // Percent width, can be `100%`, can be used in drawing separate
	      // line when box width is needed to be auto.

	      if (typeof tokenWidth === 'string' && tokenWidth.charAt(tokenWidth.length - 1) === '%') {
	        token.percentWidth = tokenWidth;
	        pendingList.push(token);
	        tokenWidth = 0; // Do not truncate in this case, because there is no user case
	        // and it is too complicated.
	      } else {
	        if (tokenWidthNotSpecified) {
	          tokenWidth = token.textWidth; // FIXME: If image is not loaded and textWidth is not specified, calling
	          // `getBoundingRect()` will not get correct result.

	          var textBackgroundColor = tokenStyle.textBackgroundColor;
	          var bgImg = textBackgroundColor && textBackgroundColor.image; // Use cases:
	          // (1) If image is not loaded, it will be loaded at render phase and call
	          // `dirty()` and `textBackgroundColor.image` will be replaced with the loaded
	          // image, and then the right size will be calculated here at the next tick.
	          // See `graphic/helper/text.js`.
	          // (2) If image loaded, and `textBackgroundColor.image` is image src string,
	          // use `imageHelper.findExistImage` to find cached image.
	          // `imageHelper.findExistImage` will always be called here before
	          // `imageHelper.createOrUpdateImage` in `graphic/helper/text.js#renderRichText`
	          // which ensures that image will not be rendered before correct size calcualted.

	          if (bgImg) {
	            bgImg = imageHelper.findExistImage(bgImg);

	            if (imageHelper.isImageReady(bgImg)) {
	              tokenWidth = Math.max(tokenWidth, bgImg.width * tokenHeight / bgImg.height);
	            }
	          }
	        }

	        var paddingW = textPadding ? textPadding[1] + textPadding[3] : 0;
	        tokenWidth += paddingW;
	        var remianTruncWidth = truncateWidth != null ? truncateWidth - lineWidth : null;

	        if (remianTruncWidth != null && remianTruncWidth < tokenWidth) {
	          if (!tokenWidthNotSpecified || remianTruncWidth < paddingW) {
	            token.text = '';
	            token.textWidth = tokenWidth = 0;
	          } else {
	            token.text = truncateText(token.text, remianTruncWidth - paddingW, font, truncate.ellipsis, {
	              minChar: truncate.minChar
	            });
	            token.textWidth = getWidth(token.text, font);
	            tokenWidth = token.textWidth + paddingW;
	          }
	        }
	      }

	      lineWidth += token.width = tokenWidth;
	      tokenStyle && (lineHeight = Math.max(lineHeight, token.lineHeight));
	    }

	    line.width = lineWidth;
	    line.lineHeight = lineHeight;
	    contentHeight += lineHeight;
	    contentWidth = Math.max(contentWidth, lineWidth);
	  }

	  contentBlock.outerWidth = contentBlock.width = retrieve2(style.textWidth, contentWidth);
	  contentBlock.outerHeight = contentBlock.height = retrieve2(style.textHeight, contentHeight);

	  if (stlPadding) {
	    contentBlock.outerWidth += stlPadding[1] + stlPadding[3];
	    contentBlock.outerHeight += stlPadding[0] + stlPadding[2];
	  }

	  for (var i = 0; i < pendingList.length; i++) {
	    var token = pendingList[i];
	    var percentWidth = token.percentWidth; // Should not base on outerWidth, because token can not be placed out of padding.

	    token.width = parseInt(percentWidth, 10) / 100 * contentWidth;
	  }

	  return contentBlock;
	}

	function pushTokens(block, str, styleName) {
	  var isEmptyStr = str === '';
	  var strs = str.split('\n');
	  var lines = block.lines;

	  for (var i = 0; i < strs.length; i++) {
	    var text = strs[i];
	    var token = {
	      styleName: styleName,
	      text: text,
	      isLineHolder: !text && !isEmptyStr
	    }; // The first token should be appended to the last line.

	    if (!i) {
	      var tokens = (lines[lines.length - 1] || (lines[0] = {
	        tokens: []
	      })).tokens; // Consider cases:
	      // (1) ''.split('\n') => ['', '\n', ''], the '' at the first item
	      // (which is a placeholder) should be replaced by new token.
	      // (2) A image backage, where token likes {a|}.
	      // (3) A redundant '' will affect textAlign in line.
	      // (4) tokens with the same tplName should not be merged, because
	      // they should be displayed in different box (with border and padding).

	      var tokensLen = tokens.length;
	      tokensLen === 1 && tokens[0].isLineHolder ? tokens[0] = token : // Consider text is '', only insert when it is the "lineHolder" or
	      // "emptyStr". Otherwise a redundant '' will affect textAlign in line.
	      (text || !tokensLen || isEmptyStr) && tokens.push(token);
	    } // Other tokens always start a new line.
	    else {
	        // If there is '', insert it as a placeholder.
	        lines.push({
	          tokens: [token]
	        });
	      }
	  }
	}

	function makeFont(style) {
	  // FIXME in node-canvas fontWeight is before fontStyle
	  // Use `fontSize` `fontFamily` to check whether font properties are defined.
	  var font = (style.fontSize || style.fontFamily) && [style.fontStyle, style.fontWeight, (style.fontSize || 12) + 'px', // If font properties are defined, `fontFamily` should not be ignored.
	  style.fontFamily || 'sans-serif'].join(' ');
	  return font && trim(font) || style.textFont || style.font;
	}

	exports.DEFAULT_FONT = DEFAULT_FONT;
	exports.$override = $override;
	exports.getWidth = getWidth;
	exports.getBoundingRect = getBoundingRect;
	exports.adjustTextX = adjustTextX;
	exports.adjustTextY = adjustTextY;
	exports.calculateTextPosition = calculateTextPosition;
	exports.adjustTextPositionOnRect = adjustTextPositionOnRect;
	exports.truncateText = truncateText;
	exports.getLineHeight = getLineHeight;
	exports.measureText = measureText;
	exports.parsePlainText = parsePlainText;
	exports.parseRichText = parseRichText;
	exports.makeFont = makeFont;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var LRU = __webpack_require__(12);

	var globalImageCache = new LRU(50);
	/**
	 * @param {string|HTMLImageElement|HTMLCanvasElement|Canvas} newImageOrSrc
	 * @return {HTMLImageElement|HTMLCanvasElement|Canvas} image
	 */

	function findExistImage(newImageOrSrc) {
	  if (typeof newImageOrSrc === 'string') {
	    var cachedImgObj = globalImageCache.get(newImageOrSrc);
	    return cachedImgObj && cachedImgObj.image;
	  } else {
	    return newImageOrSrc;
	  }
	}
	/**
	 * Caution: User should cache loaded images, but not just count on LRU.
	 * Consider if required images more than LRU size, will dead loop occur?
	 *
	 * @param {string|HTMLImageElement|HTMLCanvasElement|Canvas} newImageOrSrc
	 * @param {HTMLImageElement|HTMLCanvasElement|Canvas} image Existent image.
	 * @param {module:zrender/Element} [hostEl] For calling `dirty`.
	 * @param {Function} [cb] params: (image, cbPayload)
	 * @param {Object} [cbPayload] Payload on cb calling.
	 * @return {HTMLImageElement|HTMLCanvasElement|Canvas} image
	 */


	function createOrUpdateImage(newImageOrSrc, image, hostEl, cb, cbPayload) {
	  if (!newImageOrSrc) {
	    return image;
	  } else if (typeof newImageOrSrc === 'string') {
	    // Image should not be loaded repeatly.
	    if (image && image.__zrImageSrc === newImageOrSrc || !hostEl) {
	      return image;
	    } // Only when there is no existent image or existent image src
	    // is different, this method is responsible for load.


	    var cachedImgObj = globalImageCache.get(newImageOrSrc);
	    var pendingWrap = {
	      hostEl: hostEl,
	      cb: cb,
	      cbPayload: cbPayload
	    };

	    if (cachedImgObj) {
	      image = cachedImgObj.image;
	      !isImageReady(image) && cachedImgObj.pending.push(pendingWrap);
	    } else {
	      image = new Image();
	      image.onload = image.onerror = imageOnLoad;
	      globalImageCache.put(newImageOrSrc, image.__cachedImgObj = {
	        image: image,
	        pending: [pendingWrap]
	      });
	      image.src = image.__zrImageSrc = newImageOrSrc;
	    }

	    return image;
	  } // newImageOrSrc is an HTMLImageElement or HTMLCanvasElement or Canvas
	  else {
	      return newImageOrSrc;
	    }
	}

	function imageOnLoad() {
	  var cachedImgObj = this.__cachedImgObj;
	  this.onload = this.onerror = this.__cachedImgObj = null;

	  for (var i = 0; i < cachedImgObj.pending.length; i++) {
	    var pendingWrap = cachedImgObj.pending[i];
	    var cb = pendingWrap.cb;
	    cb && cb(this, pendingWrap.cbPayload);
	    pendingWrap.hostEl.dirty();
	  }

	  cachedImgObj.pending.length = 0;
	}

	function isImageReady(image) {
	  return image && image.width && image.height;
	}

	exports.findExistImage = findExistImage;
	exports.createOrUpdateImage = createOrUpdateImage;
	exports.isImageReady = isImageReady;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	// Simple LRU cache use doubly linked list
	// @module zrender/core/LRU

	/**
	 * Simple double linked list. Compared with array, it has O(1) remove operation.
	 * @constructor
	 */
	var LinkedList = function () {
	  /**
	   * @type {module:zrender/core/LRU~Entry}
	   */
	  this.head = null;
	  /**
	   * @type {module:zrender/core/LRU~Entry}
	   */

	  this.tail = null;
	  this._len = 0;
	};

	var linkedListProto = LinkedList.prototype;
	/**
	 * Insert a new value at the tail
	 * @param  {} val
	 * @return {module:zrender/core/LRU~Entry}
	 */

	linkedListProto.insert = function (val) {
	  var entry = new Entry(val);
	  this.insertEntry(entry);
	  return entry;
	};
	/**
	 * Insert an entry at the tail
	 * @param  {module:zrender/core/LRU~Entry} entry
	 */


	linkedListProto.insertEntry = function (entry) {
	  if (!this.head) {
	    this.head = this.tail = entry;
	  } else {
	    this.tail.next = entry;
	    entry.prev = this.tail;
	    entry.next = null;
	    this.tail = entry;
	  }

	  this._len++;
	};
	/**
	 * Remove entry.
	 * @param  {module:zrender/core/LRU~Entry} entry
	 */


	linkedListProto.remove = function (entry) {
	  var prev = entry.prev;
	  var next = entry.next;

	  if (prev) {
	    prev.next = next;
	  } else {
	    // Is head
	    this.head = next;
	  }

	  if (next) {
	    next.prev = prev;
	  } else {
	    // Is tail
	    this.tail = prev;
	  }

	  entry.next = entry.prev = null;
	  this._len--;
	};
	/**
	 * @return {number}
	 */


	linkedListProto.len = function () {
	  return this._len;
	};
	/**
	 * Clear list
	 */


	linkedListProto.clear = function () {
	  this.head = this.tail = null;
	  this._len = 0;
	};
	/**
	 * @constructor
	 * @param {} val
	 */


	var Entry = function (val) {
	  /**
	   * @type {}
	   */
	  this.value = val;
	  /**
	   * @type {module:zrender/core/LRU~Entry}
	   */

	  this.next;
	  /**
	   * @type {module:zrender/core/LRU~Entry}
	   */

	  this.prev;
	};
	/**
	 * LRU Cache
	 * @constructor
	 * @alias module:zrender/core/LRU
	 */


	var LRU = function (maxSize) {
	  this._list = new LinkedList();
	  this._map = {};
	  this._maxSize = maxSize || 10;
	  this._lastRemovedEntry = null;
	};

	var LRUProto = LRU.prototype;
	/**
	 * @param  {string} key
	 * @param  {} value
	 * @return {} Removed value
	 */

	LRUProto.put = function (key, value) {
	  var list = this._list;
	  var map = this._map;
	  var removed = null;

	  if (map[key] == null) {
	    var len = list.len(); // Reuse last removed entry

	    var entry = this._lastRemovedEntry;

	    if (len >= this._maxSize && len > 0) {
	      // Remove the least recently used
	      var leastUsedEntry = list.head;
	      list.remove(leastUsedEntry);
	      delete map[leastUsedEntry.key];
	      removed = leastUsedEntry.value;
	      this._lastRemovedEntry = leastUsedEntry;
	    }

	    if (entry) {
	      entry.value = value;
	    } else {
	      entry = new Entry(value);
	    }

	    entry.key = key;
	    list.insertEntry(entry);
	    map[key] = entry;
	  }

	  return removed;
	};
	/**
	 * @param  {string} key
	 * @return {}
	 */


	LRUProto.get = function (key) {
	  var entry = this._map[key];
	  var list = this._list;

	  if (entry != null) {
	    // Put the latest used entry in the tail
	    if (entry !== list.tail) {
	      list.remove(entry);
	      list.insertEntry(entry);
	    }

	    return entry.value;
	  }
	};
	/**
	 * Clear the cache
	 */


	LRUProto.clear = function () {
	  this._list.clear();

	  this._map = {};
	};

	var _default = LRU;
	module.exports = _default;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var completeDimensions = __webpack_require__(14);
	var echarts = __webpack_require__(2);

	echarts.extendSeriesModel({

	    type: 'series.wordCloud',

	    visualColorAccessPath: 'textStyle.normal.color',

	    optionUpdated: function () {
	        var option = this.option;
	        option.gridSize = Math.max(Math.floor(option.gridSize), 4);
	    },

	    getInitialData: function (option, ecModel) {
	        var dimensions = completeDimensions(['value'], option.data);
	        var list = new echarts.List(dimensions, this);
	        list.initData(option.data);
	        return list;
	    },

	    // Most of options are from https://github.com/timdream/wordcloud2.js/blob/gh-pages/API.md
	    defaultOption: {

	        maskImage: null,

	        // Shape can be 'circle', 'cardioid', 'diamond', 'triangle-forward', 'triangle', 'pentagon', 'star'
	        shape: 'circle',

	        left: 'center',

	        top: 'center',

	        width: '70%',

	        height: '80%',

	        sizeRange: [12, 60],

	        rotationRange: [-90, 90],

	        rotationStep: 45,

	        gridSize: 8,

	        drawOutOfBound: false,

	        textStyle: {
	            normal: {
	                fontWeight: 'normal'
	            }
	        }
	    }
	});


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var _util = __webpack_require__(4);

	var createHashMap = _util.createHashMap;
	var each = _util.each;
	var isString = _util.isString;
	var defaults = _util.defaults;
	var extend = _util.extend;
	var isObject = _util.isObject;
	var clone = _util.clone;

	var _model = __webpack_require__(15);

	var normalizeToArray = _model.normalizeToArray;

	var _sourceHelper = __webpack_require__(17);

	var guessOrdinal = _sourceHelper.guessOrdinal;
	var BE_ORDINAL = _sourceHelper.BE_ORDINAL;

	var Source = __webpack_require__(19);

	var _dimensionHelper = __webpack_require__(22);

	var OTHER_DIMENSIONS = _dimensionHelper.OTHER_DIMENSIONS;

	var DataDimensionInfo = __webpack_require__(23);

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	/**
	 * @deprecated
	 * Use `echarts/data/helper/createDimensions` instead.
	 */

	/**
	 * @see {module:echarts/test/ut/spec/data/completeDimensions}
	 *
	 * This method builds the relationship between:
	 * + "what the coord sys or series requires (see `sysDims`)",
	 * + "what the user defines (in `encode` and `dimensions`, see `opt.dimsDef` and `opt.encodeDef`)"
	 * + "what the data source provids (see `source`)".
	 *
	 * Some guess strategy will be adapted if user does not define something.
	 * If no 'value' dimension specified, the first no-named dimension will be
	 * named as 'value'.
	 *
	 * @param {Array.<string>} sysDims Necessary dimensions, like ['x', 'y'], which
	 *      provides not only dim template, but also default order.
	 *      properties: 'name', 'type', 'displayName'.
	 *      `name` of each item provides default coord name.
	 *      [{dimsDef: [string|Object, ...]}, ...] dimsDef of sysDim item provides default dim name, and
	 *                                    provide dims count that the sysDim required.
	 *      [{ordinalMeta}] can be specified.
	 * @param {module:echarts/data/Source|Array|Object} source or data (for compatibal with pervious)
	 * @param {Object} [opt]
	 * @param {Array.<Object|string>} [opt.dimsDef] option.series.dimensions User defined dimensions
	 *      For example: ['asdf', {name, type}, ...].
	 * @param {Object|HashMap} [opt.encodeDef] option.series.encode {x: 2, y: [3, 1], tooltip: [1, 2], label: 3}
	 * @param {Function} [opt.encodeDefaulter] Called if no `opt.encodeDef` exists.
	 *      If not specified, auto find the next available data dim.
	 *      param source {module:data/Source}
	 *      param dimCount {number}
	 *      return {Object} encode Never be `null/undefined`.
	 * @param {string} [opt.generateCoord] Generate coord dim with the given name.
	 *      If not specified, extra dim names will be:
	 *      'value', 'value0', 'value1', ...
	 * @param {number} [opt.generateCoordCount] By default, the generated dim name is `generateCoord`.
	 *      If `generateCoordCount` specified, the generated dim names will be:
	 *      `generateCoord` + 0, `generateCoord` + 1, ...
	 *      can be Infinity, indicate that use all of the remain columns.
	 * @param {number} [opt.dimCount] If not specified, guess by the first data item.
	 * @return {Array.<module:data/DataDimensionInfo>}
	 */
	function completeDimensions(sysDims, source, opt) {
	  if (!Source.isInstance(source)) {
	    source = Source.seriesDataToSource(source);
	  }

	  opt = opt || {};
	  sysDims = (sysDims || []).slice();
	  var dimsDef = (opt.dimsDef || []).slice();
	  var dataDimNameMap = createHashMap();
	  var coordDimNameMap = createHashMap(); // var valueCandidate;

	  var result = [];
	  var dimCount = getDimCount(source, sysDims, dimsDef, opt.dimCount); // Apply user defined dims (`name` and `type`) and init result.

	  for (var i = 0; i < dimCount; i++) {
	    var dimDefItem = dimsDef[i] = extend({}, isObject(dimsDef[i]) ? dimsDef[i] : {
	      name: dimsDef[i]
	    });
	    var userDimName = dimDefItem.name;
	    var resultItem = result[i] = new DataDimensionInfo(); // Name will be applied later for avoiding duplication.

	    if (userDimName != null && dataDimNameMap.get(userDimName) == null) {
	      // Only if `series.dimensions` is defined in option
	      // displayName, will be set, and dimension will be diplayed vertically in
	      // tooltip by default.
	      resultItem.name = resultItem.displayName = userDimName;
	      dataDimNameMap.set(userDimName, i);
	    }

	    dimDefItem.type != null && (resultItem.type = dimDefItem.type);
	    dimDefItem.displayName != null && (resultItem.displayName = dimDefItem.displayName);
	  }

	  var encodeDef = opt.encodeDef;

	  if (!encodeDef && opt.encodeDefaulter) {
	    encodeDef = opt.encodeDefaulter(source, dimCount);
	  }

	  encodeDef = createHashMap(encodeDef); // Set `coordDim` and `coordDimIndex` by `encodeDef` and normalize `encodeDef`.

	  encodeDef.each(function (dataDims, coordDim) {
	    dataDims = normalizeToArray(dataDims).slice(); // Note: It is allowed that `dataDims.length` is `0`, e.g., options is
	    // `{encode: {x: -1, y: 1}}`. Should not filter anything in
	    // this case.

	    if (dataDims.length === 1 && !isString(dataDims[0]) && dataDims[0] < 0) {
	      encodeDef.set(coordDim, false);
	      return;
	    }

	    var validDataDims = encodeDef.set(coordDim, []);
	    each(dataDims, function (resultDimIdx, idx) {
	      // The input resultDimIdx can be dim name or index.
	      isString(resultDimIdx) && (resultDimIdx = dataDimNameMap.get(resultDimIdx));

	      if (resultDimIdx != null && resultDimIdx < dimCount) {
	        validDataDims[idx] = resultDimIdx;
	        applyDim(result[resultDimIdx], coordDim, idx);
	      }
	    });
	  }); // Apply templetes and default order from `sysDims`.

	  var availDimIdx = 0;
	  each(sysDims, function (sysDimItem, sysDimIndex) {
	    var coordDim;
	    var sysDimItem;
	    var sysDimItemDimsDef;
	    var sysDimItemOtherDims;

	    if (isString(sysDimItem)) {
	      coordDim = sysDimItem;
	      sysDimItem = {};
	    } else {
	      coordDim = sysDimItem.name;
	      var ordinalMeta = sysDimItem.ordinalMeta;
	      sysDimItem.ordinalMeta = null;
	      sysDimItem = clone(sysDimItem);
	      sysDimItem.ordinalMeta = ordinalMeta; // `coordDimIndex` should not be set directly.

	      sysDimItemDimsDef = sysDimItem.dimsDef;
	      sysDimItemOtherDims = sysDimItem.otherDims;
	      sysDimItem.name = sysDimItem.coordDim = sysDimItem.coordDimIndex = sysDimItem.dimsDef = sysDimItem.otherDims = null;
	    }

	    var dataDims = encodeDef.get(coordDim); // negative resultDimIdx means no need to mapping.

	    if (dataDims === false) {
	      return;
	    }

	    var dataDims = normalizeToArray(dataDims); // dimensions provides default dim sequences.

	    if (!dataDims.length) {
	      for (var i = 0; i < (sysDimItemDimsDef && sysDimItemDimsDef.length || 1); i++) {
	        while (availDimIdx < result.length && result[availDimIdx].coordDim != null) {
	          availDimIdx++;
	        }

	        availDimIdx < result.length && dataDims.push(availDimIdx++);
	      }
	    } // Apply templates.


	    each(dataDims, function (resultDimIdx, coordDimIndex) {
	      var resultItem = result[resultDimIdx];
	      applyDim(defaults(resultItem, sysDimItem), coordDim, coordDimIndex);

	      if (resultItem.name == null && sysDimItemDimsDef) {
	        var sysDimItemDimsDefItem = sysDimItemDimsDef[coordDimIndex];
	        !isObject(sysDimItemDimsDefItem) && (sysDimItemDimsDefItem = {
	          name: sysDimItemDimsDefItem
	        });
	        resultItem.name = resultItem.displayName = sysDimItemDimsDefItem.name;
	        resultItem.defaultTooltip = sysDimItemDimsDefItem.defaultTooltip;
	      } // FIXME refactor, currently only used in case: {otherDims: {tooltip: false}}


	      sysDimItemOtherDims && defaults(resultItem.otherDims, sysDimItemOtherDims);
	    });
	  });

	  function applyDim(resultItem, coordDim, coordDimIndex) {
	    if (OTHER_DIMENSIONS.get(coordDim) != null) {
	      resultItem.otherDims[coordDim] = coordDimIndex;
	    } else {
	      resultItem.coordDim = coordDim;
	      resultItem.coordDimIndex = coordDimIndex;
	      coordDimNameMap.set(coordDim, true);
	    }
	  } // Make sure the first extra dim is 'value'.


	  var generateCoord = opt.generateCoord;
	  var generateCoordCount = opt.generateCoordCount;
	  var fromZero = generateCoordCount != null;
	  generateCoordCount = generateCoord ? generateCoordCount || 1 : 0;
	  var extra = generateCoord || 'value'; // Set dim `name` and other `coordDim` and other props.

	  for (var resultDimIdx = 0; resultDimIdx < dimCount; resultDimIdx++) {
	    var resultItem = result[resultDimIdx] = result[resultDimIdx] || new DataDimensionInfo();
	    var coordDim = resultItem.coordDim;

	    if (coordDim == null) {
	      resultItem.coordDim = genName(extra, coordDimNameMap, fromZero);
	      resultItem.coordDimIndex = 0;

	      if (!generateCoord || generateCoordCount <= 0) {
	        resultItem.isExtraCoord = true;
	      }

	      generateCoordCount--;
	    }

	    resultItem.name == null && (resultItem.name = genName(resultItem.coordDim, dataDimNameMap));

	    if (resultItem.type == null && (guessOrdinal(source, resultDimIdx, resultItem.name) === BE_ORDINAL.Must // Consider the case:
	    // {
	    //    dataset: {source: [
	    //        ['2001', 123],
	    //        ['2002', 456],
	    //        ...
	    //        ['The others', 987],
	    //    ]},
	    //    series: {type: 'pie'}
	    // }
	    // The first colum should better be treated as a "ordinal" although it
	    // might not able to be detected as an "ordinal" by `guessOrdinal`.
	    || resultItem.isExtraCoord && (resultItem.otherDims.itemName != null || resultItem.otherDims.seriesName != null))) {
	      resultItem.type = 'ordinal';
	    }
	  }

	  return result;
	} // ??? TODO
	// Originally detect dimCount by data[0]. Should we
	// optimize it to only by sysDims and dimensions and encode.
	// So only necessary dims will be initialized.
	// But
	// (1) custom series should be considered. where other dims
	// may be visited.
	// (2) sometimes user need to calcualte bubble size or use visualMap
	// on other dimensions besides coordSys needed.
	// So, dims that is not used by system, should be shared in storage?


	function getDimCount(source, sysDims, dimsDef, optDimCount) {
	  // Note that the result dimCount should not small than columns count
	  // of data, otherwise `dataDimNameMap` checking will be incorrect.
	  var dimCount = Math.max(source.dimensionsDetectCount || 1, sysDims.length, dimsDef.length, optDimCount || 0);
	  each(sysDims, function (sysDimItem) {
	    var sysDimItemDimsDef = sysDimItem.dimsDef;
	    sysDimItemDimsDef && (dimCount = Math.max(dimCount, sysDimItemDimsDef.length));
	  });
	  return dimCount;
	}

	function genName(name, map, fromZero) {
	  if (fromZero || map.get(name) != null) {
	    var i = 0;

	    while (map.get(name + i) != null) {
	      i++;
	    }

	    name += i;
	  }

	  map.set(name, true);
	  return name;
	}

	var _default = completeDimensions;
	module.exports = _default;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var zrUtil = __webpack_require__(4);

	var env = __webpack_require__(16);

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/
	var each = zrUtil.each;
	var isObject = zrUtil.isObject;
	var isArray = zrUtil.isArray;
	/**
	 * Make the name displayable. But we should
	 * make sure it is not duplicated with user
	 * specified name, so use '\0';
	 */

	var DUMMY_COMPONENT_NAME_PREFIX = 'series\0';
	/**
	 * If value is not array, then translate it to array.
	 * @param  {*} value
	 * @return {Array} [value] or value
	 */

	function normalizeToArray(value) {
	  return value instanceof Array ? value : value == null ? [] : [value];
	}
	/**
	 * Sync default option between normal and emphasis like `position` and `show`
	 * In case some one will write code like
	 *     label: {
	 *          show: false,
	 *          position: 'outside',
	 *          fontSize: 18
	 *     },
	 *     emphasis: {
	 *          label: { show: true }
	 *     }
	 * @param {Object} opt
	 * @param {string} key
	 * @param {Array.<string>} subOpts
	 */


	function defaultEmphasis(opt, key, subOpts) {
	  // Caution: performance sensitive.
	  if (opt) {
	    opt[key] = opt[key] || {};
	    opt.emphasis = opt.emphasis || {};
	    opt.emphasis[key] = opt.emphasis[key] || {}; // Default emphasis option from normal

	    for (var i = 0, len = subOpts.length; i < len; i++) {
	      var subOptName = subOpts[i];

	      if (!opt.emphasis[key].hasOwnProperty(subOptName) && opt[key].hasOwnProperty(subOptName)) {
	        opt.emphasis[key][subOptName] = opt[key][subOptName];
	      }
	    }
	  }
	}

	var TEXT_STYLE_OPTIONS = ['fontStyle', 'fontWeight', 'fontSize', 'fontFamily', 'rich', 'tag', 'color', 'textBorderColor', 'textBorderWidth', 'width', 'height', 'lineHeight', 'align', 'verticalAlign', 'baseline', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'textShadowColor', 'textShadowBlur', 'textShadowOffsetX', 'textShadowOffsetY', 'backgroundColor', 'borderColor', 'borderWidth', 'borderRadius', 'padding']; // modelUtil.LABEL_OPTIONS = modelUtil.TEXT_STYLE_OPTIONS.concat([
	//     'position', 'offset', 'rotate', 'origin', 'show', 'distance', 'formatter',
	//     'fontStyle', 'fontWeight', 'fontSize', 'fontFamily',
	//     // FIXME: deprecated, check and remove it.
	//     'textStyle'
	// ]);

	/**
	 * The method do not ensure performance.
	 * data could be [12, 2323, {value: 223}, [1221, 23], {value: [2, 23]}]
	 * This helper method retieves value from data.
	 * @param {string|number|Date|Array|Object} dataItem
	 * @return {number|string|Date|Array.<number|string|Date>}
	 */

	function getDataItemValue(dataItem) {
	  return isObject(dataItem) && !isArray(dataItem) && !(dataItem instanceof Date) ? dataItem.value : dataItem;
	}
	/**
	 * data could be [12, 2323, {value: 223}, [1221, 23], {value: [2, 23]}]
	 * This helper method determine if dataItem has extra option besides value
	 * @param {string|number|Date|Array|Object} dataItem
	 */


	function isDataItemOption(dataItem) {
	  return isObject(dataItem) && !(dataItem instanceof Array); // // markLine data can be array
	  // && !(dataItem[0] && isObject(dataItem[0]) && !(dataItem[0] instanceof Array));
	}
	/**
	 * Mapping to exists for merge.
	 *
	 * @public
	 * @param {Array.<Object>|Array.<module:echarts/model/Component>} exists
	 * @param {Object|Array.<Object>} newCptOptions
	 * @return {Array.<Object>} Result, like [{exist: ..., option: ...}, {}],
	 *                          index of which is the same as exists.
	 */


	function mappingToExists(exists, newCptOptions) {
	  // Mapping by the order by original option (but not order of
	  // new option) in merge mode. Because we should ensure
	  // some specified index (like xAxisIndex) is consistent with
	  // original option, which is easy to understand, espatially in
	  // media query. And in most case, merge option is used to
	  // update partial option but not be expected to change order.
	  newCptOptions = (newCptOptions || []).slice();
	  var result = zrUtil.map(exists || [], function (obj, index) {
	    return {
	      exist: obj
	    };
	  }); // Mapping by id or name if specified.

	  each(newCptOptions, function (cptOption, index) {
	    if (!isObject(cptOption)) {
	      return;
	    } // id has highest priority.


	    for (var i = 0; i < result.length; i++) {
	      if (!result[i].option // Consider name: two map to one.
	      && cptOption.id != null && result[i].exist.id === cptOption.id + '') {
	        result[i].option = cptOption;
	        newCptOptions[index] = null;
	        return;
	      }
	    }

	    for (var i = 0; i < result.length; i++) {
	      var exist = result[i].exist;

	      if (!result[i].option // Consider name: two map to one.
	      // Can not match when both ids exist but different.
	      && (exist.id == null || cptOption.id == null) && cptOption.name != null && !isIdInner(cptOption) && !isIdInner(exist) && exist.name === cptOption.name + '') {
	        result[i].option = cptOption;
	        newCptOptions[index] = null;
	        return;
	      }
	    }
	  }); // Otherwise mapping by index.

	  each(newCptOptions, function (cptOption, index) {
	    if (!isObject(cptOption)) {
	      return;
	    }

	    var i = 0;

	    for (; i < result.length; i++) {
	      var exist = result[i].exist;

	      if (!result[i].option // Existing model that already has id should be able to
	      // mapped to (because after mapping performed model may
	      // be assigned with a id, whish should not affect next
	      // mapping), except those has inner id.
	      && !isIdInner(exist) // Caution:
	      // Do not overwrite id. But name can be overwritten,
	      // because axis use name as 'show label text'.
	      // 'exist' always has id and name and we dont
	      // need to check it.
	      && cptOption.id == null) {
	        result[i].option = cptOption;
	        break;
	      }
	    }

	    if (i >= result.length) {
	      result.push({
	        option: cptOption
	      });
	    }
	  });
	  return result;
	}
	/**
	 * Make id and name for mapping result (result of mappingToExists)
	 * into `keyInfo` field.
	 *
	 * @public
	 * @param {Array.<Object>} Result, like [{exist: ..., option: ...}, {}],
	 *                          which order is the same as exists.
	 * @return {Array.<Object>} The input.
	 */


	function makeIdAndName(mapResult) {
	  // We use this id to hash component models and view instances
	  // in echarts. id can be specified by user, or auto generated.
	  // The id generation rule ensures new view instance are able
	  // to mapped to old instance when setOption are called in
	  // no-merge mode. So we generate model id by name and plus
	  // type in view id.
	  // name can be duplicated among components, which is convenient
	  // to specify multi components (like series) by one name.
	  // Ensure that each id is distinct.
	  var idMap = zrUtil.createHashMap();
	  each(mapResult, function (item, index) {
	    var existCpt = item.exist;
	    existCpt && idMap.set(existCpt.id, item);
	  });
	  each(mapResult, function (item, index) {
	    var opt = item.option;
	    zrUtil.assert(!opt || opt.id == null || !idMap.get(opt.id) || idMap.get(opt.id) === item, 'id duplicates: ' + (opt && opt.id));
	    opt && opt.id != null && idMap.set(opt.id, item);
	    !item.keyInfo && (item.keyInfo = {});
	  }); // Make name and id.

	  each(mapResult, function (item, index) {
	    var existCpt = item.exist;
	    var opt = item.option;
	    var keyInfo = item.keyInfo;

	    if (!isObject(opt)) {
	      return;
	    } // name can be overwitten. Consider case: axis.name = '20km'.
	    // But id generated by name will not be changed, which affect
	    // only in that case: setOption with 'not merge mode' and view
	    // instance will be recreated, which can be accepted.


	    keyInfo.name = opt.name != null ? opt.name + '' : existCpt ? existCpt.name // Avoid diffferent series has the same name,
	    // because name may be used like in color pallet.
	    : DUMMY_COMPONENT_NAME_PREFIX + index;

	    if (existCpt) {
	      keyInfo.id = existCpt.id;
	    } else if (opt.id != null) {
	      keyInfo.id = opt.id + '';
	    } else {
	      // Consider this situatoin:
	      //  optionA: [{name: 'a'}, {name: 'a'}, {..}]
	      //  optionB [{..}, {name: 'a'}, {name: 'a'}]
	      // Series with the same name between optionA and optionB
	      // should be mapped.
	      var idNum = 0;

	      do {
	        keyInfo.id = '\0' + keyInfo.name + '\0' + idNum++;
	      } while (idMap.get(keyInfo.id));
	    }

	    idMap.set(keyInfo.id, item);
	  });
	}

	function isNameSpecified(componentModel) {
	  var name = componentModel.name; // Is specified when `indexOf` get -1 or > 0.

	  return !!(name && name.indexOf(DUMMY_COMPONENT_NAME_PREFIX));
	}
	/**
	 * @public
	 * @param {Object} cptOption
	 * @return {boolean}
	 */


	function isIdInner(cptOption) {
	  return isObject(cptOption) && cptOption.id && (cptOption.id + '').indexOf('\0_ec_\0') === 0;
	}
	/**
	 * A helper for removing duplicate items between batchA and batchB,
	 * and in themselves, and categorize by series.
	 *
	 * @param {Array.<Object>} batchA Like: [{seriesId: 2, dataIndex: [32, 4, 5]}, ...]
	 * @param {Array.<Object>} batchB Like: [{seriesId: 2, dataIndex: [32, 4, 5]}, ...]
	 * @return {Array.<Array.<Object>, Array.<Object>>} result: [resultBatchA, resultBatchB]
	 */


	function compressBatches(batchA, batchB) {
	  var mapA = {};
	  var mapB = {};
	  makeMap(batchA || [], mapA);
	  makeMap(batchB || [], mapB, mapA);
	  return [mapToArray(mapA), mapToArray(mapB)];

	  function makeMap(sourceBatch, map, otherMap) {
	    for (var i = 0, len = sourceBatch.length; i < len; i++) {
	      var seriesId = sourceBatch[i].seriesId;
	      var dataIndices = normalizeToArray(sourceBatch[i].dataIndex);
	      var otherDataIndices = otherMap && otherMap[seriesId];

	      for (var j = 0, lenj = dataIndices.length; j < lenj; j++) {
	        var dataIndex = dataIndices[j];

	        if (otherDataIndices && otherDataIndices[dataIndex]) {
	          otherDataIndices[dataIndex] = null;
	        } else {
	          (map[seriesId] || (map[seriesId] = {}))[dataIndex] = 1;
	        }
	      }
	    }
	  }

	  function mapToArray(map, isData) {
	    var result = [];

	    for (var i in map) {
	      if (map.hasOwnProperty(i) && map[i] != null) {
	        if (isData) {
	          result.push(+i);
	        } else {
	          var dataIndices = mapToArray(map[i], true);
	          dataIndices.length && result.push({
	            seriesId: i,
	            dataIndex: dataIndices
	          });
	        }
	      }
	    }

	    return result;
	  }
	}
	/**
	 * @param {module:echarts/data/List} data
	 * @param {Object} payload Contains dataIndex (means rawIndex) / dataIndexInside / name
	 *                         each of which can be Array or primary type.
	 * @return {number|Array.<number>} dataIndex If not found, return undefined/null.
	 */


	function queryDataIndex(data, payload) {
	  if (payload.dataIndexInside != null) {
	    return payload.dataIndexInside;
	  } else if (payload.dataIndex != null) {
	    return zrUtil.isArray(payload.dataIndex) ? zrUtil.map(payload.dataIndex, function (value) {
	      return data.indexOfRawIndex(value);
	    }) : data.indexOfRawIndex(payload.dataIndex);
	  } else if (payload.name != null) {
	    return zrUtil.isArray(payload.name) ? zrUtil.map(payload.name, function (value) {
	      return data.indexOfName(value);
	    }) : data.indexOfName(payload.name);
	  }
	}
	/**
	 * Enable property storage to any host object.
	 * Notice: Serialization is not supported.
	 *
	 * For example:
	 * var inner = zrUitl.makeInner();
	 *
	 * function some1(hostObj) {
	 *      inner(hostObj).someProperty = 1212;
	 *      ...
	 * }
	 * function some2() {
	 *      var fields = inner(this);
	 *      fields.someProperty1 = 1212;
	 *      fields.someProperty2 = 'xx';
	 *      ...
	 * }
	 *
	 * @return {Function}
	 */


	function makeInner() {
	  // Consider different scope by es module import.
	  var key = '__\0ec_inner_' + innerUniqueIndex++ + '_' + Math.random().toFixed(5);
	  return function (hostObj) {
	    return hostObj[key] || (hostObj[key] = {});
	  };
	}

	var innerUniqueIndex = 0;
	/**
	 * @param {module:echarts/model/Global} ecModel
	 * @param {string|Object} finder
	 *        If string, e.g., 'geo', means {geoIndex: 0}.
	 *        If Object, could contain some of these properties below:
	 *        {
	 *            seriesIndex, seriesId, seriesName,
	 *            geoIndex, geoId, geoName,
	 *            bmapIndex, bmapId, bmapName,
	 *            xAxisIndex, xAxisId, xAxisName,
	 *            yAxisIndex, yAxisId, yAxisName,
	 *            gridIndex, gridId, gridName,
	 *            ... (can be extended)
	 *        }
	 *        Each properties can be number|string|Array.<number>|Array.<string>
	 *        For example, a finder could be
	 *        {
	 *            seriesIndex: 3,
	 *            geoId: ['aa', 'cc'],
	 *            gridName: ['xx', 'rr']
	 *        }
	 *        xxxIndex can be set as 'all' (means all xxx) or 'none' (means not specify)
	 *        If nothing or null/undefined specified, return nothing.
	 * @param {Object} [opt]
	 * @param {string} [opt.defaultMainType]
	 * @param {Array.<string>} [opt.includeMainTypes]
	 * @return {Object} result like:
	 *        {
	 *            seriesModels: [seriesModel1, seriesModel2],
	 *            seriesModel: seriesModel1, // The first model
	 *            geoModels: [geoModel1, geoModel2],
	 *            geoModel: geoModel1, // The first model
	 *            ...
	 *        }
	 */

	function parseFinder(ecModel, finder, opt) {
	  if (zrUtil.isString(finder)) {
	    var obj = {};
	    obj[finder + 'Index'] = 0;
	    finder = obj;
	  }

	  var defaultMainType = opt && opt.defaultMainType;

	  if (defaultMainType && !has(finder, defaultMainType + 'Index') && !has(finder, defaultMainType + 'Id') && !has(finder, defaultMainType + 'Name')) {
	    finder[defaultMainType + 'Index'] = 0;
	  }

	  var result = {};
	  each(finder, function (value, key) {
	    var value = finder[key]; // Exclude 'dataIndex' and other illgal keys.

	    if (key === 'dataIndex' || key === 'dataIndexInside') {
	      result[key] = value;
	      return;
	    }

	    var parsedKey = key.match(/^(\w+)(Index|Id|Name)$/) || [];
	    var mainType = parsedKey[1];
	    var queryType = (parsedKey[2] || '').toLowerCase();

	    if (!mainType || !queryType || value == null || queryType === 'index' && value === 'none' || opt && opt.includeMainTypes && zrUtil.indexOf(opt.includeMainTypes, mainType) < 0) {
	      return;
	    }

	    var queryParam = {
	      mainType: mainType
	    };

	    if (queryType !== 'index' || value !== 'all') {
	      queryParam[queryType] = value;
	    }

	    var models = ecModel.queryComponents(queryParam);
	    result[mainType + 'Models'] = models;
	    result[mainType + 'Model'] = models[0];
	  });
	  return result;
	}

	function has(obj, prop) {
	  return obj && obj.hasOwnProperty(prop);
	}

	function setAttribute(dom, key, value) {
	  dom.setAttribute ? dom.setAttribute(key, value) : dom[key] = value;
	}

	function getAttribute(dom, key) {
	  return dom.getAttribute ? dom.getAttribute(key) : dom[key];
	}

	function getTooltipRenderMode(renderModeOption) {
	  if (renderModeOption === 'auto') {
	    // Using html when `document` exists, use richText otherwise
	    return env.domSupported ? 'html' : 'richText';
	  } else {
	    return renderModeOption || 'html';
	  }
	}
	/**
	 * Group a list by key.
	 *
	 * @param {Array} array
	 * @param {Function} getKey
	 *        param {*} Array item
	 *        return {string} key
	 * @return {Object} Result
	 *        {Array}: keys,
	 *        {module:zrender/core/util/HashMap} buckets: {key -> Array}
	 */


	function groupData(array, getKey) {
	  var buckets = zrUtil.createHashMap();
	  var keys = [];
	  zrUtil.each(array, function (item) {
	    var key = getKey(item);
	    (buckets.get(key) || (keys.push(key), buckets.set(key, []))).push(item);
	  });
	  return {
	    keys: keys,
	    buckets: buckets
	  };
	}

	exports.normalizeToArray = normalizeToArray;
	exports.defaultEmphasis = defaultEmphasis;
	exports.TEXT_STYLE_OPTIONS = TEXT_STYLE_OPTIONS;
	exports.getDataItemValue = getDataItemValue;
	exports.isDataItemOption = isDataItemOption;
	exports.mappingToExists = mappingToExists;
	exports.makeIdAndName = makeIdAndName;
	exports.isNameSpecified = isNameSpecified;
	exports.isIdInner = isIdInner;
	exports.compressBatches = compressBatches;
	exports.queryDataIndex = queryDataIndex;
	exports.makeInner = makeInner;
	exports.parseFinder = parseFinder;
	exports.setAttribute = setAttribute;
	exports.getAttribute = getAttribute;
	exports.getTooltipRenderMode = getTooltipRenderMode;
	exports.groupData = groupData;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	/**
	 * echarts设备环境识别
	 *
	 * @desc echarts基于Canvas，纯Javascript图表库，提供直观，生动，可交互，可个性化定制的数据统计图表。
	 * @author firede[firede@firede.us]
	 * @desc thanks zepto.
	 */

	/* global wx */
	var env = {};

	if (typeof wx === 'object' && typeof wx.getSystemInfoSync === 'function') {
	  // In Weixin Application
	  env = {
	    browser: {},
	    os: {},
	    node: false,
	    wxa: true,
	    // Weixin Application
	    canvasSupported: true,
	    svgSupported: false,
	    touchEventsSupported: true,
	    domSupported: false
	  };
	} else if (typeof document === 'undefined' && typeof self !== 'undefined') {
	  // In worker
	  env = {
	    browser: {},
	    os: {},
	    node: false,
	    worker: true,
	    canvasSupported: true,
	    domSupported: false
	  };
	} else if (typeof navigator === 'undefined') {
	  // In node
	  env = {
	    browser: {},
	    os: {},
	    node: true,
	    worker: false,
	    // Assume canvas is supported
	    canvasSupported: true,
	    svgSupported: true,
	    domSupported: false
	  };
	} else {
	  env = detect(navigator.userAgent);
	}

	var _default = env; // Zepto.js
	// (c) 2010-2013 Thomas Fuchs
	// Zepto.js may be freely distributed under the MIT license.

	function detect(ua) {
	  var os = {};
	  var browser = {}; // var webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/);
	  // var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
	  // var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
	  // var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
	  // var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
	  // var webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/);
	  // var touchpad = webos && ua.match(/TouchPad/);
	  // var kindle = ua.match(/Kindle\/([\d.]+)/);
	  // var silk = ua.match(/Silk\/([\d._]+)/);
	  // var blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
	  // var bb10 = ua.match(/(BB10).*Version\/([\d.]+)/);
	  // var rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/);
	  // var playbook = ua.match(/PlayBook/);
	  // var chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/);

	  var firefox = ua.match(/Firefox\/([\d.]+)/); // var safari = webkit && ua.match(/Mobile\//) && !chrome;
	  // var webview = ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/) && !chrome;

	  var ie = ua.match(/MSIE\s([\d.]+)/) // IE 11 Trident/7.0; rv:11.0
	  || ua.match(/Trident\/.+?rv:(([\d.]+))/);
	  var edge = ua.match(/Edge\/([\d.]+)/); // IE 12 and 12+

	  var weChat = /micromessenger/i.test(ua); // Todo: clean this up with a better OS/browser seperation:
	  // - discern (more) between multiple browsers on android
	  // - decide if kindle fire in silk mode is android or not
	  // - Firefox on Android doesn't specify the Android version
	  // - possibly devide in os, device and browser hashes
	  // if (browser.webkit = !!webkit) browser.version = webkit[1];
	  // if (android) os.android = true, os.version = android[2];
	  // if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.');
	  // if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.');
	  // if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
	  // if (webos) os.webos = true, os.version = webos[2];
	  // if (touchpad) os.touchpad = true;
	  // if (blackberry) os.blackberry = true, os.version = blackberry[2];
	  // if (bb10) os.bb10 = true, os.version = bb10[2];
	  // if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2];
	  // if (playbook) browser.playbook = true;
	  // if (kindle) os.kindle = true, os.version = kindle[1];
	  // if (silk) browser.silk = true, browser.version = silk[1];
	  // if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true;
	  // if (chrome) browser.chrome = true, browser.version = chrome[1];

	  if (firefox) {
	    browser.firefox = true;
	    browser.version = firefox[1];
	  } // if (safari && (ua.match(/Safari/) || !!os.ios)) browser.safari = true;
	  // if (webview) browser.webview = true;


	  if (ie) {
	    browser.ie = true;
	    browser.version = ie[1];
	  }

	  if (edge) {
	    browser.edge = true;
	    browser.version = edge[1];
	  } // It is difficult to detect WeChat in Win Phone precisely, because ua can
	  // not be set on win phone. So we do not consider Win Phone.


	  if (weChat) {
	    browser.weChat = true;
	  } // os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
	  //     (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)));
	  // os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos ||
	  //     (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
	  //     (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))));


	  return {
	    browser: browser,
	    os: os,
	    node: false,
	    // 原生canvas支持，改极端点了
	    // canvasSupported : !(browser.ie && parseFloat(browser.version) < 9)
	    canvasSupported: !!document.createElement('canvas').getContext,
	    svgSupported: typeof SVGRect !== 'undefined',
	    // works on most browsers
	    // IE10/11 does not support touch event, and MS Edge supports them but not by
	    // default, so we dont check navigator.maxTouchPoints for them here.
	    touchEventsSupported: 'ontouchstart' in window && !browser.ie && !browser.edge,
	    // <http://caniuse.com/#search=pointer%20event>.
	    pointerEventsSupported: // (1) Firefox supports pointer but not by default, only MS browsers are reliable on pointer
	    // events currently. So we dont use that on other browsers unless tested sufficiently.
	    // For example, in iOS 13 Mobile Chromium 78, if the touching behavior starts page
	    // scroll, the `pointermove` event can not be fired any more. That will break some
	    // features like "pan horizontally to move something and pan vertically to page scroll".
	    // The horizontal pan probably be interrupted by the casually triggered page scroll.
	    // (2) Although IE 10 supports pointer event, it use old style and is different from the
	    // standard. So we exclude that. (IE 10 is hardly used on touch device)
	    'onpointerdown' in window && (browser.edge || browser.ie && browser.version >= 11),
	    // passiveSupported: detectPassiveSupport()
	    domSupported: typeof document !== 'undefined'
	  };
	} // See https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
	// function detectPassiveSupport() {
	//     // Test via a getter in the options object to see if the passive property is accessed
	//     var supportsPassive = false;
	//     try {
	//         var opts = Object.defineProperty({}, 'passive', {
	//             get: function() {
	//                 supportsPassive = true;
	//             }
	//         });
	//         window.addEventListener('testPassive', function() {}, opts);
	//     } catch (e) {
	//     }
	//     return supportsPassive;
	// }


	module.exports = _default;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var _config = __webpack_require__(18);

	var __DEV__ = _config.__DEV__;

	var _model = __webpack_require__(15);

	var makeInner = _model.makeInner;
	var getDataItemValue = _model.getDataItemValue;

	var _util = __webpack_require__(4);

	var createHashMap = _util.createHashMap;
	var each = _util.each;
	var map = _util.map;
	var isArray = _util.isArray;
	var isString = _util.isString;
	var isObject = _util.isObject;
	var isTypedArray = _util.isTypedArray;
	var isArrayLike = _util.isArrayLike;
	var extend = _util.extend;
	var assert = _util.assert;

	var Source = __webpack_require__(19);

	var _sourceType = __webpack_require__(21);

	var SOURCE_FORMAT_ORIGINAL = _sourceType.SOURCE_FORMAT_ORIGINAL;
	var SOURCE_FORMAT_ARRAY_ROWS = _sourceType.SOURCE_FORMAT_ARRAY_ROWS;
	var SOURCE_FORMAT_OBJECT_ROWS = _sourceType.SOURCE_FORMAT_OBJECT_ROWS;
	var SOURCE_FORMAT_KEYED_COLUMNS = _sourceType.SOURCE_FORMAT_KEYED_COLUMNS;
	var SOURCE_FORMAT_UNKNOWN = _sourceType.SOURCE_FORMAT_UNKNOWN;
	var SOURCE_FORMAT_TYPED_ARRAY = _sourceType.SOURCE_FORMAT_TYPED_ARRAY;
	var SERIES_LAYOUT_BY_ROW = _sourceType.SERIES_LAYOUT_BY_ROW;

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/
	// The result of `guessOrdinal`.
	var BE_ORDINAL = {
	  Must: 1,
	  // Encounter string but not '-' and not number-like.
	  Might: 2,
	  // Encounter string but number-like.
	  Not: 3 // Other cases

	};
	var inner = makeInner();
	/**
	 * @see {module:echarts/data/Source}
	 * @param {module:echarts/component/dataset/DatasetModel} datasetModel
	 * @return {string} sourceFormat
	 */

	function detectSourceFormat(datasetModel) {
	  var data = datasetModel.option.source;
	  var sourceFormat = SOURCE_FORMAT_UNKNOWN;

	  if (isTypedArray(data)) {
	    sourceFormat = SOURCE_FORMAT_TYPED_ARRAY;
	  } else if (isArray(data)) {
	    // FIXME Whether tolerate null in top level array?
	    if (data.length === 0) {
	      sourceFormat = SOURCE_FORMAT_ARRAY_ROWS;
	    }

	    for (var i = 0, len = data.length; i < len; i++) {
	      var item = data[i];

	      if (item == null) {
	        continue;
	      } else if (isArray(item)) {
	        sourceFormat = SOURCE_FORMAT_ARRAY_ROWS;
	        break;
	      } else if (isObject(item)) {
	        sourceFormat = SOURCE_FORMAT_OBJECT_ROWS;
	        break;
	      }
	    }
	  } else if (isObject(data)) {
	    for (var key in data) {
	      if (data.hasOwnProperty(key) && isArrayLike(data[key])) {
	        sourceFormat = SOURCE_FORMAT_KEYED_COLUMNS;
	        break;
	      }
	    }
	  } else if (data != null) {
	    throw new Error('Invalid data');
	  }

	  inner(datasetModel).sourceFormat = sourceFormat;
	}
	/**
	 * [Scenarios]:
	 * (1) Provide source data directly:
	 *     series: {
	 *         encode: {...},
	 *         dimensions: [...]
	 *         seriesLayoutBy: 'row',
	 *         data: [[...]]
	 *     }
	 * (2) Refer to datasetModel.
	 *     series: [{
	 *         encode: {...}
	 *         // Ignore datasetIndex means `datasetIndex: 0`
	 *         // and the dimensions defination in dataset is used
	 *     }, {
	 *         encode: {...},
	 *         seriesLayoutBy: 'column',
	 *         datasetIndex: 1
	 *     }]
	 *
	 * Get data from series itself or datset.
	 * @return {module:echarts/data/Source} source
	 */


	function getSource(seriesModel) {
	  return inner(seriesModel).source;
	}
	/**
	 * MUST be called before mergeOption of all series.
	 * @param {module:echarts/model/Global} ecModel
	 */


	function resetSourceDefaulter(ecModel) {
	  // `datasetMap` is used to make default encode.
	  inner(ecModel).datasetMap = createHashMap();
	}
	/**
	 * [Caution]:
	 * MUST be called after series option merged and
	 * before "series.getInitailData()" called.
	 *
	 * [The rule of making default encode]:
	 * Category axis (if exists) alway map to the first dimension.
	 * Each other axis occupies a subsequent dimension.
	 *
	 * [Why make default encode]:
	 * Simplify the typing of encode in option, avoiding the case like that:
	 * series: [{encode: {x: 0, y: 1}}, {encode: {x: 0, y: 2}}, {encode: {x: 0, y: 3}}],
	 * where the "y" have to be manually typed as "1, 2, 3, ...".
	 *
	 * @param {module:echarts/model/Series} seriesModel
	 */


	function prepareSource(seriesModel) {
	  var seriesOption = seriesModel.option;
	  var data = seriesOption.data;
	  var sourceFormat = isTypedArray(data) ? SOURCE_FORMAT_TYPED_ARRAY : SOURCE_FORMAT_ORIGINAL;
	  var fromDataset = false;
	  var seriesLayoutBy = seriesOption.seriesLayoutBy;
	  var sourceHeader = seriesOption.sourceHeader;
	  var dimensionsDefine = seriesOption.dimensions;
	  var datasetModel = getDatasetModel(seriesModel);

	  if (datasetModel) {
	    var datasetOption = datasetModel.option;
	    data = datasetOption.source;
	    sourceFormat = inner(datasetModel).sourceFormat;
	    fromDataset = true; // These settings from series has higher priority.

	    seriesLayoutBy = seriesLayoutBy || datasetOption.seriesLayoutBy;
	    sourceHeader == null && (sourceHeader = datasetOption.sourceHeader);
	    dimensionsDefine = dimensionsDefine || datasetOption.dimensions;
	  }

	  var completeResult = completeBySourceData(data, sourceFormat, seriesLayoutBy, sourceHeader, dimensionsDefine);
	  inner(seriesModel).source = new Source({
	    data: data,
	    fromDataset: fromDataset,
	    seriesLayoutBy: seriesLayoutBy,
	    sourceFormat: sourceFormat,
	    dimensionsDefine: completeResult.dimensionsDefine,
	    startIndex: completeResult.startIndex,
	    dimensionsDetectCount: completeResult.dimensionsDetectCount,
	    // Note: dataset option does not have `encode`.
	    encodeDefine: seriesOption.encode
	  });
	} // return {startIndex, dimensionsDefine, dimensionsCount}


	function completeBySourceData(data, sourceFormat, seriesLayoutBy, sourceHeader, dimensionsDefine) {
	  if (!data) {
	    return {
	      dimensionsDefine: normalizeDimensionsDefine(dimensionsDefine)
	    };
	  }

	  var dimensionsDetectCount;
	  var startIndex;

	  if (sourceFormat === SOURCE_FORMAT_ARRAY_ROWS) {
	    // Rule: Most of the first line are string: it is header.
	    // Caution: consider a line with 5 string and 1 number,
	    // it still can not be sure it is a head, because the
	    // 5 string may be 5 values of category columns.
	    if (sourceHeader === 'auto' || sourceHeader == null) {
	      arrayRowsTravelFirst(function (val) {
	        // '-' is regarded as null/undefined.
	        if (val != null && val !== '-') {
	          if (isString(val)) {
	            startIndex == null && (startIndex = 1);
	          } else {
	            startIndex = 0;
	          }
	        } // 10 is an experience number, avoid long loop.

	      }, seriesLayoutBy, data, 10);
	    } else {
	      startIndex = sourceHeader ? 1 : 0;
	    }

	    if (!dimensionsDefine && startIndex === 1) {
	      dimensionsDefine = [];
	      arrayRowsTravelFirst(function (val, index) {
	        dimensionsDefine[index] = val != null ? val : '';
	      }, seriesLayoutBy, data);
	    }

	    dimensionsDetectCount = dimensionsDefine ? dimensionsDefine.length : seriesLayoutBy === SERIES_LAYOUT_BY_ROW ? data.length : data[0] ? data[0].length : null;
	  } else if (sourceFormat === SOURCE_FORMAT_OBJECT_ROWS) {
	    if (!dimensionsDefine) {
	      dimensionsDefine = objectRowsCollectDimensions(data);
	    }
	  } else if (sourceFormat === SOURCE_FORMAT_KEYED_COLUMNS) {
	    if (!dimensionsDefine) {
	      dimensionsDefine = [];
	      each(data, function (colArr, key) {
	        dimensionsDefine.push(key);
	      });
	    }
	  } else if (sourceFormat === SOURCE_FORMAT_ORIGINAL) {
	    var value0 = getDataItemValue(data[0]);
	    dimensionsDetectCount = isArray(value0) && value0.length || 1;
	  } else if (sourceFormat === SOURCE_FORMAT_TYPED_ARRAY) {}

	  return {
	    startIndex: startIndex,
	    dimensionsDefine: normalizeDimensionsDefine(dimensionsDefine),
	    dimensionsDetectCount: dimensionsDetectCount
	  };
	} // Consider dimensions defined like ['A', 'price', 'B', 'price', 'C', 'price'],
	// which is reasonable. But dimension name is duplicated.
	// Returns undefined or an array contains only object without null/undefiend or string.


	function normalizeDimensionsDefine(dimensionsDefine) {
	  if (!dimensionsDefine) {
	    // The meaning of null/undefined is different from empty array.
	    return;
	  }

	  var nameMap = createHashMap();
	  return map(dimensionsDefine, function (item, index) {
	    item = extend({}, isObject(item) ? item : {
	      name: item
	    }); // User can set null in dimensions.
	    // We dont auto specify name, othewise a given name may
	    // cause it be refered unexpectedly.

	    if (item.name == null) {
	      return item;
	    } // Also consider number form like 2012.


	    item.name += ''; // User may also specify displayName.
	    // displayName will always exists except user not
	    // specified or dim name is not specified or detected.
	    // (A auto generated dim name will not be used as
	    // displayName).

	    if (item.displayName == null) {
	      item.displayName = item.name;
	    }

	    var exist = nameMap.get(item.name);

	    if (!exist) {
	      nameMap.set(item.name, {
	        count: 1
	      });
	    } else {
	      item.name += '-' + exist.count++;
	    }

	    return item;
	  });
	}

	function arrayRowsTravelFirst(cb, seriesLayoutBy, data, maxLoop) {
	  maxLoop == null && (maxLoop = Infinity);

	  if (seriesLayoutBy === SERIES_LAYOUT_BY_ROW) {
	    for (var i = 0; i < data.length && i < maxLoop; i++) {
	      cb(data[i] ? data[i][0] : null, i);
	    }
	  } else {
	    var value0 = data[0] || [];

	    for (var i = 0; i < value0.length && i < maxLoop; i++) {
	      cb(value0[i], i);
	    }
	  }
	}

	function objectRowsCollectDimensions(data) {
	  var firstIndex = 0;
	  var obj;

	  while (firstIndex < data.length && !(obj = data[firstIndex++])) {} // jshint ignore: line


	  if (obj) {
	    var dimensions = [];
	    each(obj, function (value, key) {
	      dimensions.push(key);
	    });
	    return dimensions;
	  }
	}
	/**
	 * [The strategy of the arrengment of data dimensions for dataset]:
	 * "value way": all axes are non-category axes. So series one by one take
	 *     several (the number is coordSysDims.length) dimensions from dataset.
	 *     The result of data arrengment of data dimensions like:
	 *     | ser0_x | ser0_y | ser1_x | ser1_y | ser2_x | ser2_y |
	 * "category way": at least one axis is category axis. So the the first data
	 *     dimension is always mapped to the first category axis and shared by
	 *     all of the series. The other data dimensions are taken by series like
	 *     "value way" does.
	 *     The result of data arrengment of data dimensions like:
	 *     | ser_shared_x | ser0_y | ser1_y | ser2_y |
	 *
	 * @param {Array.<Object|string>} coordDimensions [{name: <string>, type: <string>, dimsDef: <Array>}, ...]
	 * @param {module:model/Series} seriesModel
	 * @param {module:data/Source} source
	 * @return {Object} encode Never be `null/undefined`.
	 */


	function makeSeriesEncodeForAxisCoordSys(coordDimensions, seriesModel, source) {
	  var encode = {};
	  var datasetModel = getDatasetModel(seriesModel); // Currently only make default when using dataset, util more reqirements occur.

	  if (!datasetModel || !coordDimensions) {
	    return encode;
	  }

	  var encodeItemName = [];
	  var encodeSeriesName = [];
	  var ecModel = seriesModel.ecModel;
	  var datasetMap = inner(ecModel).datasetMap;
	  var key = datasetModel.uid + '_' + source.seriesLayoutBy;
	  var baseCategoryDimIndex;
	  var categoryWayValueDimStart;
	  coordDimensions = coordDimensions.slice();
	  each(coordDimensions, function (coordDimInfo, coordDimIdx) {
	    !isObject(coordDimInfo) && (coordDimensions[coordDimIdx] = {
	      name: coordDimInfo
	    });

	    if (coordDimInfo.type === 'ordinal' && baseCategoryDimIndex == null) {
	      baseCategoryDimIndex = coordDimIdx;
	      categoryWayValueDimStart = getDataDimCountOnCoordDim(coordDimensions[coordDimIdx]);
	    }

	    encode[coordDimInfo.name] = [];
	  });
	  var datasetRecord = datasetMap.get(key) || datasetMap.set(key, {
	    categoryWayDim: categoryWayValueDimStart,
	    valueWayDim: 0
	  }); // TODO
	  // Auto detect first time axis and do arrangement.

	  each(coordDimensions, function (coordDimInfo, coordDimIdx) {
	    var coordDimName = coordDimInfo.name;
	    var count = getDataDimCountOnCoordDim(coordDimInfo); // In value way.

	    if (baseCategoryDimIndex == null) {
	      var start = datasetRecord.valueWayDim;
	      pushDim(encode[coordDimName], start, count);
	      pushDim(encodeSeriesName, start, count);
	      datasetRecord.valueWayDim += count; // ??? TODO give a better default series name rule?
	      // especially when encode x y specified.
	      // consider: when mutiple series share one dimension
	      // category axis, series name should better use
	      // the other dimsion name. On the other hand, use
	      // both dimensions name.
	    } // In category way, the first category axis.
	    else if (baseCategoryDimIndex === coordDimIdx) {
	        pushDim(encode[coordDimName], 0, count);
	        pushDim(encodeItemName, 0, count);
	      } // In category way, the other axis.
	      else {
	          var start = datasetRecord.categoryWayDim;
	          pushDim(encode[coordDimName], start, count);
	          pushDim(encodeSeriesName, start, count);
	          datasetRecord.categoryWayDim += count;
	        }
	  });

	  function pushDim(dimIdxArr, idxFrom, idxCount) {
	    for (var i = 0; i < idxCount; i++) {
	      dimIdxArr.push(idxFrom + i);
	    }
	  }

	  function getDataDimCountOnCoordDim(coordDimInfo) {
	    var dimsDef = coordDimInfo.dimsDef;
	    return dimsDef ? dimsDef.length : 1;
	  }

	  encodeItemName.length && (encode.itemName = encodeItemName);
	  encodeSeriesName.length && (encode.seriesName = encodeSeriesName);
	  return encode;
	}
	/**
	 * Work for data like [{name: ..., value: ...}, ...].
	 *
	 * @param {module:model/Series} seriesModel
	 * @param {module:data/Source} source
	 * @return {Object} encode Never be `null/undefined`.
	 */


	function makeSeriesEncodeForNameBased(seriesModel, source, dimCount) {
	  var encode = {};
	  var datasetModel = getDatasetModel(seriesModel); // Currently only make default when using dataset, util more reqirements occur.

	  if (!datasetModel) {
	    return encode;
	  }

	  var sourceFormat = source.sourceFormat;
	  var dimensionsDefine = source.dimensionsDefine;
	  var potentialNameDimIndex;

	  if (sourceFormat === SOURCE_FORMAT_OBJECT_ROWS || sourceFormat === SOURCE_FORMAT_KEYED_COLUMNS) {
	    each(dimensionsDefine, function (dim, idx) {
	      if ((isObject(dim) ? dim.name : dim) === 'name') {
	        potentialNameDimIndex = idx;
	      }
	    });
	  } // idxResult: {v, n}.


	  var idxResult = function () {
	    var idxRes0 = {};
	    var idxRes1 = {};
	    var guessRecords = []; // 5 is an experience value.

	    for (var i = 0, len = Math.min(5, dimCount); i < len; i++) {
	      var guessResult = doGuessOrdinal(source.data, sourceFormat, source.seriesLayoutBy, dimensionsDefine, source.startIndex, i);
	      guessRecords.push(guessResult);
	      var isPureNumber = guessResult === BE_ORDINAL.Not; // [Strategy of idxRes0]: find the first BE_ORDINAL.Not as the value dim,
	      // and then find a name dim with the priority:
	      // "BE_ORDINAL.Might|BE_ORDINAL.Must" > "other dim" > "the value dim itself".

	      if (isPureNumber && idxRes0.v == null && i !== potentialNameDimIndex) {
	        idxRes0.v = i;
	      }

	      if (idxRes0.n == null || idxRes0.n === idxRes0.v || !isPureNumber && guessRecords[idxRes0.n] === BE_ORDINAL.Not) {
	        idxRes0.n = i;
	      }

	      if (fulfilled(idxRes0) && guessRecords[idxRes0.n] !== BE_ORDINAL.Not) {
	        return idxRes0;
	      } // [Strategy of idxRes1]: if idxRes0 not satisfied (that is, no BE_ORDINAL.Not),
	      // find the first BE_ORDINAL.Might as the value dim,
	      // and then find a name dim with the priority:
	      // "other dim" > "the value dim itself".
	      // That is for backward compat: number-like (e.g., `'3'`, `'55'`) can be
	      // treated as number.


	      if (!isPureNumber) {
	        if (guessResult === BE_ORDINAL.Might && idxRes1.v == null && i !== potentialNameDimIndex) {
	          idxRes1.v = i;
	        }

	        if (idxRes1.n == null || idxRes1.n === idxRes1.v) {
	          idxRes1.n = i;
	        }
	      }
	    }

	    function fulfilled(idxResult) {
	      return idxResult.v != null && idxResult.n != null;
	    }

	    return fulfilled(idxRes0) ? idxRes0 : fulfilled(idxRes1) ? idxRes1 : null;
	  }();

	  if (idxResult) {
	    encode.value = idxResult.v; // `potentialNameDimIndex` has highest priority.

	    var nameDimIndex = potentialNameDimIndex != null ? potentialNameDimIndex : idxResult.n; // By default, label use itemName in charts.
	    // So we dont set encodeLabel here.

	    encode.itemName = [nameDimIndex];
	    encode.seriesName = [nameDimIndex];
	  }

	  return encode;
	}
	/**
	 * If return null/undefined, indicate that should not use datasetModel.
	 */


	function getDatasetModel(seriesModel) {
	  var option = seriesModel.option; // Caution: consider the scenario:
	  // A dataset is declared and a series is not expected to use the dataset,
	  // and at the beginning `setOption({series: { noData })` (just prepare other
	  // option but no data), then `setOption({series: {data: [...]}); In this case,
	  // the user should set an empty array to avoid that dataset is used by default.

	  var thisData = option.data;

	  if (!thisData) {
	    return seriesModel.ecModel.getComponent('dataset', option.datasetIndex || 0);
	  }
	}
	/**
	 * The rule should not be complex, otherwise user might not
	 * be able to known where the data is wrong.
	 * The code is ugly, but how to make it neat?
	 *
	 * @param {module:echars/data/Source} source
	 * @param {number} dimIndex
	 * @return {BE_ORDINAL} guess result.
	 */


	function guessOrdinal(source, dimIndex) {
	  return doGuessOrdinal(source.data, source.sourceFormat, source.seriesLayoutBy, source.dimensionsDefine, source.startIndex, dimIndex);
	} // dimIndex may be overflow source data.
	// return {BE_ORDINAL}


	function doGuessOrdinal(data, sourceFormat, seriesLayoutBy, dimensionsDefine, startIndex, dimIndex) {
	  var result; // Experience value.

	  var maxLoop = 5;

	  if (isTypedArray(data)) {
	    return BE_ORDINAL.Not;
	  } // When sourceType is 'objectRows' or 'keyedColumns', dimensionsDefine
	  // always exists in source.


	  var dimName;
	  var dimType;

	  if (dimensionsDefine) {
	    var dimDefItem = dimensionsDefine[dimIndex];

	    if (isObject(dimDefItem)) {
	      dimName = dimDefItem.name;
	      dimType = dimDefItem.type;
	    } else if (isString(dimDefItem)) {
	      dimName = dimDefItem;
	    }
	  }

	  if (dimType != null) {
	    return dimType === 'ordinal' ? BE_ORDINAL.Must : BE_ORDINAL.Not;
	  }

	  if (sourceFormat === SOURCE_FORMAT_ARRAY_ROWS) {
	    if (seriesLayoutBy === SERIES_LAYOUT_BY_ROW) {
	      var sample = data[dimIndex];

	      for (var i = 0; i < (sample || []).length && i < maxLoop; i++) {
	        if ((result = detectValue(sample[startIndex + i])) != null) {
	          return result;
	        }
	      }
	    } else {
	      for (var i = 0; i < data.length && i < maxLoop; i++) {
	        var row = data[startIndex + i];

	        if (row && (result = detectValue(row[dimIndex])) != null) {
	          return result;
	        }
	      }
	    }
	  } else if (sourceFormat === SOURCE_FORMAT_OBJECT_ROWS) {
	    if (!dimName) {
	      return BE_ORDINAL.Not;
	    }

	    for (var i = 0; i < data.length && i < maxLoop; i++) {
	      var item = data[i];

	      if (item && (result = detectValue(item[dimName])) != null) {
	        return result;
	      }
	    }
	  } else if (sourceFormat === SOURCE_FORMAT_KEYED_COLUMNS) {
	    if (!dimName) {
	      return BE_ORDINAL.Not;
	    }

	    var sample = data[dimName];

	    if (!sample || isTypedArray(sample)) {
	      return BE_ORDINAL.Not;
	    }

	    for (var i = 0; i < sample.length && i < maxLoop; i++) {
	      if ((result = detectValue(sample[i])) != null) {
	        return result;
	      }
	    }
	  } else if (sourceFormat === SOURCE_FORMAT_ORIGINAL) {
	    for (var i = 0; i < data.length && i < maxLoop; i++) {
	      var item = data[i];
	      var val = getDataItemValue(item);

	      if (!isArray(val)) {
	        return BE_ORDINAL.Not;
	      }

	      if ((result = detectValue(val[dimIndex])) != null) {
	        return result;
	      }
	    }
	  }

	  function detectValue(val) {
	    var beStr = isString(val); // Consider usage convenience, '1', '2' will be treated as "number".
	    // `isFinit('')` get `true`.

	    if (val != null && isFinite(val) && val !== '') {
	      return beStr ? BE_ORDINAL.Might : BE_ORDINAL.Not;
	    } else if (beStr && val !== '-') {
	      return BE_ORDINAL.Must;
	    }
	  }

	  return BE_ORDINAL.Not;
	}

	exports.BE_ORDINAL = BE_ORDINAL;
	exports.detectSourceFormat = detectSourceFormat;
	exports.getSource = getSource;
	exports.resetSourceDefaulter = resetSourceDefaulter;
	exports.prepareSource = prepareSource;
	exports.makeSeriesEncodeForAxisCoordSys = makeSeriesEncodeForAxisCoordSys;
	exports.makeSeriesEncodeForNameBased = makeSeriesEncodeForNameBased;
	exports.guessOrdinal = guessOrdinal;

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/
	// (1) The code `if (__DEV__) ...` can be removed by build tool.
	// (2) If intend to use `__DEV__`, this module should be imported. Use a global
	// variable `__DEV__` may cause that miss the declaration (see #6535), or the
	// declaration is behind of the using position (for example in `Model.extent`,
	// And tools like rollup can not analysis the dependency if not import).
	var dev; // In browser

	if (typeof window !== 'undefined') {
	  dev = window.__DEV__;
	} // In node
	else if (typeof global !== 'undefined') {
	    dev = global.__DEV__;
	  }

	if (typeof dev === 'undefined') {
	  dev = true;
	}

	var __DEV__ = dev;
	exports.__DEV__ = __DEV__;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var _util = __webpack_require__(4);

	var createHashMap = _util.createHashMap;
	var isTypedArray = _util.isTypedArray;

	var _clazz = __webpack_require__(20);

	var enableClassCheck = _clazz.enableClassCheck;

	var _sourceType = __webpack_require__(21);

	var SOURCE_FORMAT_ORIGINAL = _sourceType.SOURCE_FORMAT_ORIGINAL;
	var SERIES_LAYOUT_BY_COLUMN = _sourceType.SERIES_LAYOUT_BY_COLUMN;
	var SOURCE_FORMAT_UNKNOWN = _sourceType.SOURCE_FORMAT_UNKNOWN;
	var SOURCE_FORMAT_TYPED_ARRAY = _sourceType.SOURCE_FORMAT_TYPED_ARRAY;
	var SOURCE_FORMAT_KEYED_COLUMNS = _sourceType.SOURCE_FORMAT_KEYED_COLUMNS;

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	/**
	 * [sourceFormat]
	 *
	 * + "original":
	 * This format is only used in series.data, where
	 * itemStyle can be specified in data item.
	 *
	 * + "arrayRows":
	 * [
	 *     ['product', 'score', 'amount'],
	 *     ['Matcha Latte', 89.3, 95.8],
	 *     ['Milk Tea', 92.1, 89.4],
	 *     ['Cheese Cocoa', 94.4, 91.2],
	 *     ['Walnut Brownie', 85.4, 76.9]
	 * ]
	 *
	 * + "objectRows":
	 * [
	 *     {product: 'Matcha Latte', score: 89.3, amount: 95.8},
	 *     {product: 'Milk Tea', score: 92.1, amount: 89.4},
	 *     {product: 'Cheese Cocoa', score: 94.4, amount: 91.2},
	 *     {product: 'Walnut Brownie', score: 85.4, amount: 76.9}
	 * ]
	 *
	 * + "keyedColumns":
	 * {
	 *     'product': ['Matcha Latte', 'Milk Tea', 'Cheese Cocoa', 'Walnut Brownie'],
	 *     'count': [823, 235, 1042, 988],
	 *     'score': [95.8, 81.4, 91.2, 76.9]
	 * }
	 *
	 * + "typedArray"
	 *
	 * + "unknown"
	 */

	/**
	 * @constructor
	 * @param {Object} fields
	 * @param {string} fields.sourceFormat
	 * @param {Array|Object} fields.fromDataset
	 * @param {Array|Object} [fields.data]
	 * @param {string} [seriesLayoutBy='column']
	 * @param {Array.<Object|string>} [dimensionsDefine]
	 * @param {Objet|HashMap} [encodeDefine]
	 * @param {number} [startIndex=0]
	 * @param {number} [dimensionsDetectCount]
	 */
	function Source(fields) {
	  /**
	   * @type {boolean}
	   */
	  this.fromDataset = fields.fromDataset;
	  /**
	   * Not null/undefined.
	   * @type {Array|Object}
	   */

	  this.data = fields.data || (fields.sourceFormat === SOURCE_FORMAT_KEYED_COLUMNS ? {} : []);
	  /**
	   * See also "detectSourceFormat".
	   * Not null/undefined.
	   * @type {string}
	   */

	  this.sourceFormat = fields.sourceFormat || SOURCE_FORMAT_UNKNOWN;
	  /**
	   * 'row' or 'column'
	   * Not null/undefined.
	   * @type {string} seriesLayoutBy
	   */

	  this.seriesLayoutBy = fields.seriesLayoutBy || SERIES_LAYOUT_BY_COLUMN;
	  /**
	   * dimensions definition in option.
	   * can be null/undefined.
	   * @type {Array.<Object|string>}
	   */

	  this.dimensionsDefine = fields.dimensionsDefine;
	  /**
	   * encode definition in option.
	   * can be null/undefined.
	   * @type {Objet|HashMap}
	   */

	  this.encodeDefine = fields.encodeDefine && createHashMap(fields.encodeDefine);
	  /**
	   * Not null/undefined, uint.
	   * @type {number}
	   */

	  this.startIndex = fields.startIndex || 0;
	  /**
	   * Can be null/undefined (when unknown), uint.
	   * @type {number}
	   */

	  this.dimensionsDetectCount = fields.dimensionsDetectCount;
	}
	/**
	 * Wrap original series data for some compatibility cases.
	 */


	Source.seriesDataToSource = function (data) {
	  return new Source({
	    data: data,
	    sourceFormat: isTypedArray(data) ? SOURCE_FORMAT_TYPED_ARRAY : SOURCE_FORMAT_ORIGINAL,
	    fromDataset: false
	  });
	};

	enableClassCheck(Source);
	var _default = Source;
	module.exports = _default;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var _config = __webpack_require__(18);

	var __DEV__ = _config.__DEV__;

	var zrUtil = __webpack_require__(4);

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/
	var TYPE_DELIMITER = '.';
	var IS_CONTAINER = '___EC__COMPONENT__CONTAINER___';
	/**
	 * Notice, parseClassType('') should returns {main: '', sub: ''}
	 * @public
	 */

	function parseClassType(componentType) {
	  var ret = {
	    main: '',
	    sub: ''
	  };

	  if (componentType) {
	    componentType = componentType.split(TYPE_DELIMITER);
	    ret.main = componentType[0] || '';
	    ret.sub = componentType[1] || '';
	  }

	  return ret;
	}
	/**
	 * @public
	 */


	function checkClassType(componentType) {
	  zrUtil.assert(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(componentType), 'componentType "' + componentType + '" illegal');
	}
	/**
	 * @public
	 */


	function enableClassExtend(RootClass, mandatoryMethods) {
	  RootClass.$constructor = RootClass;

	  RootClass.extend = function (proto) {
	    var superClass = this;

	    var ExtendedClass = function () {
	      if (!proto.$constructor) {
	        superClass.apply(this, arguments);
	      } else {
	        proto.$constructor.apply(this, arguments);
	      }
	    };

	    zrUtil.extend(ExtendedClass.prototype, proto);
	    ExtendedClass.extend = this.extend;
	    ExtendedClass.superCall = superCall;
	    ExtendedClass.superApply = superApply;
	    zrUtil.inherits(ExtendedClass, this);
	    ExtendedClass.superClass = superClass;
	    return ExtendedClass;
	  };
	}

	var classBase = 0;
	/**
	 * Can not use instanceof, consider different scope by
	 * cross domain or es module import in ec extensions.
	 * Mount a method "isInstance()" to Clz.
	 */

	function enableClassCheck(Clz) {
	  var classAttr = ['__\0is_clz', classBase++, Math.random().toFixed(3)].join('_');
	  Clz.prototype[classAttr] = true;

	  Clz.isInstance = function (obj) {
	    return !!(obj && obj[classAttr]);
	  };
	} // superCall should have class info, which can not be fetch from 'this'.
	// Consider this case:
	// class A has method f,
	// class B inherits class A, overrides method f, f call superApply('f'),
	// class C inherits class B, do not overrides method f,
	// then when method of class C is called, dead loop occured.


	function superCall(context, methodName) {
	  var args = zrUtil.slice(arguments, 2);
	  return this.superClass.prototype[methodName].apply(context, args);
	}

	function superApply(context, methodName, args) {
	  return this.superClass.prototype[methodName].apply(context, args);
	}
	/**
	 * @param {Object} entity
	 * @param {Object} options
	 * @param {boolean} [options.registerWhenExtend]
	 * @public
	 */


	function enableClassManagement(entity, options) {
	  options = options || {};
	  /**
	   * Component model classes
	   * key: componentType,
	   * value:
	   *     componentClass, when componentType is 'xxx'
	   *     or Object.<subKey, componentClass>, when componentType is 'xxx.yy'
	   * @type {Object}
	   */

	  var storage = {};

	  entity.registerClass = function (Clazz, componentType) {
	    if (componentType) {
	      checkClassType(componentType);
	      componentType = parseClassType(componentType);

	      if (!componentType.sub) {
	        storage[componentType.main] = Clazz;
	      } else if (componentType.sub !== IS_CONTAINER) {
	        var container = makeContainer(componentType);
	        container[componentType.sub] = Clazz;
	      }
	    }

	    return Clazz;
	  };

	  entity.getClass = function (componentMainType, subType, throwWhenNotFound) {
	    var Clazz = storage[componentMainType];

	    if (Clazz && Clazz[IS_CONTAINER]) {
	      Clazz = subType ? Clazz[subType] : null;
	    }

	    if (throwWhenNotFound && !Clazz) {
	      throw new Error(!subType ? componentMainType + '.' + 'type should be specified.' : 'Component ' + componentMainType + '.' + (subType || '') + ' not exists. Load it first.');
	    }

	    return Clazz;
	  };

	  entity.getClassesByMainType = function (componentType) {
	    componentType = parseClassType(componentType);
	    var result = [];
	    var obj = storage[componentType.main];

	    if (obj && obj[IS_CONTAINER]) {
	      zrUtil.each(obj, function (o, type) {
	        type !== IS_CONTAINER && result.push(o);
	      });
	    } else {
	      result.push(obj);
	    }

	    return result;
	  };

	  entity.hasClass = function (componentType) {
	    // Just consider componentType.main.
	    componentType = parseClassType(componentType);
	    return !!storage[componentType.main];
	  };
	  /**
	   * @return {Array.<string>} Like ['aa', 'bb'], but can not be ['aa.xx']
	   */


	  entity.getAllClassMainTypes = function () {
	    var types = [];
	    zrUtil.each(storage, function (obj, type) {
	      types.push(type);
	    });
	    return types;
	  };
	  /**
	   * If a main type is container and has sub types
	   * @param  {string}  mainType
	   * @return {boolean}
	   */


	  entity.hasSubTypes = function (componentType) {
	    componentType = parseClassType(componentType);
	    var obj = storage[componentType.main];
	    return obj && obj[IS_CONTAINER];
	  };

	  entity.parseClassType = parseClassType;

	  function makeContainer(componentType) {
	    var container = storage[componentType.main];

	    if (!container || !container[IS_CONTAINER]) {
	      container = storage[componentType.main] = {};
	      container[IS_CONTAINER] = true;
	    }

	    return container;
	  }

	  if (options.registerWhenExtend) {
	    var originalExtend = entity.extend;

	    if (originalExtend) {
	      entity.extend = function (proto) {
	        var ExtendedClass = originalExtend.call(this, proto);
	        return entity.registerClass(ExtendedClass, proto.type);
	      };
	    }
	  }

	  return entity;
	}
	/**
	 * @param {string|Array.<string>} properties
	 */


	function setReadOnly(obj, properties) {// FIXME It seems broken in IE8 simulation of IE11
	  // if (!zrUtil.isArray(properties)) {
	  //     properties = properties != null ? [properties] : [];
	  // }
	  // zrUtil.each(properties, function (prop) {
	  //     var value = obj[prop];
	  //     Object.defineProperty
	  //         && Object.defineProperty(obj, prop, {
	  //             value: value, writable: false
	  //         });
	  //     zrUtil.isArray(obj[prop])
	  //         && Object.freeze
	  //         && Object.freeze(obj[prop]);
	  // });
	}

	exports.parseClassType = parseClassType;
	exports.enableClassExtend = enableClassExtend;
	exports.enableClassCheck = enableClassCheck;
	exports.enableClassManagement = enableClassManagement;
	exports.setReadOnly = setReadOnly;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/
	// Avoid typo.
	var SOURCE_FORMAT_ORIGINAL = 'original';
	var SOURCE_FORMAT_ARRAY_ROWS = 'arrayRows';
	var SOURCE_FORMAT_OBJECT_ROWS = 'objectRows';
	var SOURCE_FORMAT_KEYED_COLUMNS = 'keyedColumns';
	var SOURCE_FORMAT_UNKNOWN = 'unknown'; // ??? CHANGE A NAME

	var SOURCE_FORMAT_TYPED_ARRAY = 'typedArray';
	var SERIES_LAYOUT_BY_COLUMN = 'column';
	var SERIES_LAYOUT_BY_ROW = 'row';
	exports.SOURCE_FORMAT_ORIGINAL = SOURCE_FORMAT_ORIGINAL;
	exports.SOURCE_FORMAT_ARRAY_ROWS = SOURCE_FORMAT_ARRAY_ROWS;
	exports.SOURCE_FORMAT_OBJECT_ROWS = SOURCE_FORMAT_OBJECT_ROWS;
	exports.SOURCE_FORMAT_KEYED_COLUMNS = SOURCE_FORMAT_KEYED_COLUMNS;
	exports.SOURCE_FORMAT_UNKNOWN = SOURCE_FORMAT_UNKNOWN;
	exports.SOURCE_FORMAT_TYPED_ARRAY = SOURCE_FORMAT_TYPED_ARRAY;
	exports.SERIES_LAYOUT_BY_COLUMN = SERIES_LAYOUT_BY_COLUMN;
	exports.SERIES_LAYOUT_BY_ROW = SERIES_LAYOUT_BY_ROW;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var _util = __webpack_require__(4);

	var each = _util.each;
	var createHashMap = _util.createHashMap;
	var assert = _util.assert;

	var _config = __webpack_require__(18);

	var __DEV__ = _config.__DEV__;

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/
	var OTHER_DIMENSIONS = createHashMap(['tooltip', 'label', 'itemName', 'itemId', 'seriesName']);

	function summarizeDimensions(data) {
	  var summary = {};
	  var encode = summary.encode = {};
	  var notExtraCoordDimMap = createHashMap();
	  var defaultedLabel = [];
	  var defaultedTooltip = []; // See the comment of `List.js#userOutput`.

	  var userOutput = summary.userOutput = {
	    dimensionNames: data.dimensions.slice(),
	    encode: {}
	  };
	  each(data.dimensions, function (dimName) {
	    var dimItem = data.getDimensionInfo(dimName);
	    var coordDim = dimItem.coordDim;

	    if (coordDim) {
	      var coordDimIndex = dimItem.coordDimIndex;
	      getOrCreateEncodeArr(encode, coordDim)[coordDimIndex] = dimName;

	      if (!dimItem.isExtraCoord) {
	        notExtraCoordDimMap.set(coordDim, 1); // Use the last coord dim (and label friendly) as default label,
	        // because when dataset is used, it is hard to guess which dimension
	        // can be value dimension. If both show x, y on label is not look good,
	        // and conventionally y axis is focused more.

	        if (mayLabelDimType(dimItem.type)) {
	          defaultedLabel[0] = dimName;
	        } // User output encode do not contain generated coords.
	        // And it only has index. User can use index to retrieve value from the raw item array.


	        getOrCreateEncodeArr(userOutput.encode, coordDim)[coordDimIndex] = dimItem.index;
	      }

	      if (dimItem.defaultTooltip) {
	        defaultedTooltip.push(dimName);
	      }
	    }

	    OTHER_DIMENSIONS.each(function (v, otherDim) {
	      var encodeArr = getOrCreateEncodeArr(encode, otherDim);
	      var dimIndex = dimItem.otherDims[otherDim];

	      if (dimIndex != null && dimIndex !== false) {
	        encodeArr[dimIndex] = dimItem.name;
	      }
	    });
	  });
	  var dataDimsOnCoord = [];
	  var encodeFirstDimNotExtra = {};
	  notExtraCoordDimMap.each(function (v, coordDim) {
	    var dimArr = encode[coordDim]; // ??? FIXME extra coord should not be set in dataDimsOnCoord.
	    // But should fix the case that radar axes: simplify the logic
	    // of `completeDimension`, remove `extraPrefix`.

	    encodeFirstDimNotExtra[coordDim] = dimArr[0]; // Not necessary to remove duplicate, because a data
	    // dim canot on more than one coordDim.

	    dataDimsOnCoord = dataDimsOnCoord.concat(dimArr);
	  });
	  summary.dataDimsOnCoord = dataDimsOnCoord;
	  summary.encodeFirstDimNotExtra = encodeFirstDimNotExtra;
	  var encodeLabel = encode.label; // FIXME `encode.label` is not recommanded, because formatter can not be set
	  // in this way. Use label.formatter instead. May be remove this approach someday.

	  if (encodeLabel && encodeLabel.length) {
	    defaultedLabel = encodeLabel.slice();
	  }

	  var encodeTooltip = encode.tooltip;

	  if (encodeTooltip && encodeTooltip.length) {
	    defaultedTooltip = encodeTooltip.slice();
	  } else if (!defaultedTooltip.length) {
	    defaultedTooltip = defaultedLabel.slice();
	  }

	  encode.defaultedLabel = defaultedLabel;
	  encode.defaultedTooltip = defaultedTooltip;
	  return summary;
	}

	function getOrCreateEncodeArr(encode, dim) {
	  if (!encode.hasOwnProperty(dim)) {
	    encode[dim] = [];
	  }

	  return encode[dim];
	}

	function getDimensionTypeByAxis(axisType) {
	  return axisType === 'category' ? 'ordinal' : axisType === 'time' ? 'time' : 'float';
	}

	function mayLabelDimType(dimType) {
	  // In most cases, ordinal and time do not suitable for label.
	  // Ordinal info can be displayed on axis. Time is too long.
	  return !(dimType === 'ordinal' || dimType === 'time');
	} // function findTheLastDimMayLabel(data) {
	//     // Get last value dim
	//     var dimensions = data.dimensions.slice();
	//     var valueType;
	//     var valueDim;
	//     while (dimensions.length && (
	//         valueDim = dimensions.pop(),
	//         valueType = data.getDimensionInfo(valueDim).type,
	//         valueType === 'ordinal' || valueType === 'time'
	//     )) {} // jshint ignore:line
	//     return valueDim;
	// }


	exports.OTHER_DIMENSIONS = OTHER_DIMENSIONS;
	exports.summarizeDimensions = summarizeDimensions;
	exports.getDimensionTypeByAxis = getDimensionTypeByAxis;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	
	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	var zrUtil = __webpack_require__(4);

	/*
	* Licensed to the Apache Software Foundation (ASF) under one
	* or more contributor license agreements.  See the NOTICE file
	* distributed with this work for additional information
	* regarding copyright ownership.  The ASF licenses this file
	* to you under the Apache License, Version 2.0 (the
	* "License"); you may not use this file except in compliance
	* with the License.  You may obtain a copy of the License at
	*
	*   http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing,
	* software distributed under the License is distributed on an
	* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	* KIND, either express or implied.  See the License for the
	* specific language governing permissions and limitations
	* under the License.
	*/

	/**
	 * @class
	 * @param {Object|DataDimensionInfo} [opt] All of the fields will be shallow copied.
	 */
	function DataDimensionInfo(opt) {
	  if (opt != null) {
	    zrUtil.extend(this, opt);
	  }
	  /**
	   * Dimension name.
	   * Mandatory.
	   * @type {string}
	   */
	  // this.name;

	  /**
	   * The origin name in dimsDef, see source helper.
	   * If displayName given, the tooltip will displayed vertically.
	   * Optional.
	   * @type {string}
	   */
	  // this.displayName;

	  /**
	   * Which coordSys dimension this dimension mapped to.
	   * A `coordDim` can be a "coordSysDim" that the coordSys required
	   * (for example, an item in `coordSysDims` of `model/referHelper#CoordSysInfo`),
	   * or an generated "extra coord name" if does not mapped to any "coordSysDim"
	   * (That is determined by whether `isExtraCoord` is `true`).
	   * Mandatory.
	   * @type {string}
	   */
	  // this.coordDim;

	  /**
	   * The index of this dimension in `series.encode[coordDim]`.
	   * Mandatory.
	   * @type {number}
	   */
	  // this.coordDimIndex;

	  /**
	   * Dimension type. The enumerable values are the key of
	   * `dataCtors` of `data/List`.
	   * Optional.
	   * @type {string}
	   */
	  // this.type;

	  /**
	   * This index of this dimension info in `data/List#_dimensionInfos`.
	   * Mandatory after added to `data/List`.
	   * @type {number}
	   */
	  // this.index;

	  /**
	   * The format of `otherDims` is:
	   * ```js
	   * {
	   *     tooltip: number optional,
	   *     label: number optional,
	   *     itemName: number optional,
	   *     seriesName: number optional,
	   * }
	   * ```
	   *
	   * A `series.encode` can specified these fields:
	   * ```js
	   * encode: {
	   *     // "3, 1, 5" is the index of data dimension.
	   *     tooltip: [3, 1, 5],
	   *     label: [0, 3],
	   *     ...
	   * }
	   * ```
	   * `otherDims` is the parse result of the `series.encode` above, like:
	   * ```js
	   * // Suppose the index of this data dimension is `3`.
	   * this.otherDims = {
	   *     // `3` is at the index `0` of the `encode.tooltip`
	   *     tooltip: 0,
	   *     // `3` is at the index `1` of the `encode.tooltip`
	   *     label: 1
	   * };
	   * ```
	   *
	   * This prop should never be `null`/`undefined` after initialized.
	   * @type {Object}
	   */


	  this.otherDims = {};
	  /**
	   * Be `true` if this dimension is not mapped to any "coordSysDim" that the
	   * "coordSys" required.
	   * Mandatory.
	   * @type {boolean}
	   */
	  // this.isExtraCoord;

	  /**
	   * @type {module:data/OrdinalMeta}
	   */
	  // this.ordinalMeta;

	  /**
	   * Whether to create inverted indices.
	   * @type {boolean}
	   */
	  // this.createInvertedIndices;
	}

	;
	var _default = DataDimensionInfo;
	module.exports = _default;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var echarts = __webpack_require__(2);

	function getShallow(model, path) {
	    return model && model.getShallow(path);
	}

	echarts.extendChartView({

	    type: 'wordCloud',

	    render: function (seriesModel, ecModel, api) {
	        var group = this.group;
	        group.removeAll();

	        var data = seriesModel.getData();

	        var gridSize = seriesModel.get('gridSize');

	        seriesModel.layoutInstance.ondraw = function (text, size, dataIdx, drawn) {
	            var itemModel = data.getItemModel(dataIdx);
	            var textStyleModel = itemModel.getModel('textStyle.normal');
	            var emphasisTextStyleModel = itemModel.getModel('textStyle.emphasis');

	            var textEl = new echarts.graphic.Text({
	                style: echarts.graphic.setTextStyle({}, textStyleModel, {
	                    x: drawn.info.fillTextOffsetX,
	                    y: drawn.info.fillTextOffsetY + size * 0.5,
	                    text: text,
	                    textBaseline: 'middle',
	                    textFill: data.getItemVisual(dataIdx, 'color'),
	                    fontSize: size
	                }),
	                scale: [1 / drawn.info.mu, 1 / drawn.info.mu],
	                position: [
	                    (drawn.gx + drawn.info.gw / 2) * gridSize,
	                    (drawn.gy + drawn.info.gh / 2) * gridSize
	                ],
	                rotation: drawn.rot
	            });

	            group.add(textEl);

	            data.setItemGraphicEl(dataIdx, textEl);

	            echarts.graphic.setHoverStyle(
	                textEl,
	                echarts.graphic.setTextStyle({}, emphasisTextStyleModel, null, { forMerge: true }, true)
	            );
	        };

	        this._model = seriesModel;
	    },

	    remove: function () {
	        this.group.removeAll();
	        this._model && this._model.layoutInstance && this._model.layoutInstance.dispose();
	    },

	    dispose: function () {
	        this._model && this._model.layoutInstance && this._model.layoutInstance.dispose();
	    }
	});


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * wordcloud2.js
	 * http://timdream.org/wordcloud2.js/
	 *
	 * Copyright 2011 - 2013 Tim Chien
	 * Released under the MIT license
	 */

	'use strict';

	// setImmediate
	if (!window.setImmediate) {
	  window.setImmediate = (function setupSetImmediate() {
	    return window.msSetImmediate ||
	    window.webkitSetImmediate ||
	    window.mozSetImmediate ||
	    window.oSetImmediate ||
	    (function setupSetZeroTimeout() {
	      if (!window.postMessage || !window.addEventListener) {
	        return null;
	      }

	      var callbacks = [undefined];
	      var message = 'zero-timeout-message';

	      // Like setTimeout, but only takes a function argument.  There's
	      // no time argument (always zero) and no arguments (you have to
	      // use a closure).
	      var setZeroTimeout = function setZeroTimeout(callback) {
	        var id = callbacks.length;
	        callbacks.push(callback);
	        window.postMessage(message + id.toString(36), '*');

	        return id;
	      };

	      window.addEventListener('message', function setZeroTimeoutMessage(evt) {
	        // Skipping checking event source, retarded IE confused this window
	        // object with another in the presence of iframe
	        if (typeof evt.data !== 'string' ||
	            evt.data.substr(0, message.length) !== message/* ||
	            evt.source !== window */) {
	          return;
	        }

	        evt.stopImmediatePropagation();

	        var id = parseInt(evt.data.substr(message.length), 36);
	        if (!callbacks[id]) {
	          return;
	        }

	        callbacks[id]();
	        callbacks[id] = undefined;
	      }, true);

	      /* specify clearImmediate() here since we need the scope */
	      window.clearImmediate = function clearZeroTimeout(id) {
	        if (!callbacks[id]) {
	          return;
	        }

	        callbacks[id] = undefined;
	      };

	      return setZeroTimeout;
	    })() ||
	    // fallback
	    function setImmediateFallback(fn) {
	      window.setTimeout(fn, 0);
	    };
	  })();
	}

	if (!window.clearImmediate) {
	  window.clearImmediate = (function setupClearImmediate() {
	    return window.msClearImmediate ||
	    window.webkitClearImmediate ||
	    window.mozClearImmediate ||
	    window.oClearImmediate ||
	    // "clearZeroTimeout" is implement on the previous block ||
	    // fallback
	    function clearImmediateFallback(timer) {
	      window.clearTimeout(timer);
	    };
	  })();
	}

	(function(global) {

	  // Check if WordCloud can run on this browser
	  var isSupported = (function isSupported() {
	    var canvas = document.createElement('canvas');
	    if (!canvas || !canvas.getContext) {
	      return false;
	    }

	    var ctx = canvas.getContext('2d');
	    if (!ctx.getImageData) {
	      return false;
	    }
	    if (!ctx.fillText) {
	      return false;
	    }

	    if (!Array.prototype.some) {
	      return false;
	    }
	    if (!Array.prototype.push) {
	      return false;
	    }

	    return true;
	  }());

	  // Find out if the browser impose minium font size by
	  // drawing small texts on a canvas and measure it's width.
	  var minFontSize = (function getMinFontSize() {
	    if (!isSupported) {
	      return;
	    }

	    var ctx = document.createElement('canvas').getContext('2d');

	    // start from 20
	    var size = 20;

	    // two sizes to measure
	    var hanWidth, mWidth;

	    while (size) {
	      ctx.font = size.toString(10) + 'px sans-serif';
	      if ((ctx.measureText('\uFF37').width === hanWidth) &&
	          (ctx.measureText('m').width) === mWidth) {
	        return (size + 1);
	      }

	      hanWidth = ctx.measureText('\uFF37').width;
	      mWidth = ctx.measureText('m').width;

	      size--;
	    }

	    return 0;
	  })();

	  // Based on http://jsfromhell.com/array/shuffle
	  var shuffleArray = function shuffleArray(arr) {
	    for (var j, x, i = arr.length; i;
	      j = Math.floor(Math.random() * i),
	      x = arr[--i], arr[i] = arr[j],
	      arr[j] = x) {}
	    return arr;
	  };

	  var WordCloud = function WordCloud(elements, options) {
	    if (!isSupported) {
	      return;
	    }

	    if (!Array.isArray(elements)) {
	      elements = [elements];
	    }

	    elements.forEach(function(el, i) {
	      if (typeof el === 'string') {
	        elements[i] = document.getElementById(el);
	        if (!elements[i]) {
	          throw 'The element id specified is not found.';
	        }
	      } else if (!el.tagName && !el.appendChild) {
	        throw 'You must pass valid HTML elements, or ID of the element.';
	      }
	    });

	    /* Default values to be overwritten by options object */
	    var settings = {
	      list: [],
	      fontFamily: '"Trebuchet MS", "Heiti TC", "微軟正黑體", ' +
	                  '"Arial Unicode MS", "Droid Fallback Sans", sans-serif',
	      fontWeight: 'normal',
	      color: 'random-dark',
	      minSize: 0, // 0 to disable
	      weightFactor: 1,
	      clearCanvas: true,
	      backgroundColor: '#fff',  // opaque white = rgba(255, 255, 255, 1)

	      gridSize: 8,
	      drawOutOfBound: false,
	      origin: null,

	      drawMask: false,
	      maskColor: 'rgba(255,0,0,0.3)',
	      maskGapWidth: 0.3,

	      wait: 0,
	      abortThreshold: 0, // disabled
	      abort: function noop() {},

	      minRotation: - Math.PI / 2,
	      maxRotation: Math.PI / 2,
	      rotationStep: 0.1,

	      shuffle: true,
	      rotateRatio: 0.1,

	      shape: 'circle',
	      ellipticity: 0.65,

	      classes: null,

	      hover: null,
	      click: null
	    };

	    if (options) {
	      for (var key in options) {
	        if (key in settings) {
	          settings[key] = options[key];
	        }
	      }
	    }

	    /* Convert weightFactor into a function */
	    if (typeof settings.weightFactor !== 'function') {
	      var factor = settings.weightFactor;
	      settings.weightFactor = function weightFactor(pt) {
	        return pt * factor; //in px
	      };
	    }

	    /* Convert shape into a function */
	    if (typeof settings.shape !== 'function') {
	      switch (settings.shape) {
	        case 'circle':
	        /* falls through */
	        default:
	          // 'circle' is the default and a shortcut in the code loop.
	          settings.shape = 'circle';
	          break;

	        case 'cardioid':
	          settings.shape = function shapeCardioid(theta) {
	            return 1 - Math.sin(theta);
	          };
	          break;

	        /*
	        To work out an X-gon, one has to calculate "m",
	        where 1/(cos(2*PI/X)+m*sin(2*PI/X)) = 1/(cos(0)+m*sin(0))
	        http://www.wolframalpha.com/input/?i=1%2F%28cos%282*PI%2FX%29%2Bm*sin%28
	        2*PI%2FX%29%29+%3D+1%2F%28cos%280%29%2Bm*sin%280%29%29
	        Copy the solution into polar equation r = 1/(cos(t') + m*sin(t'))
	        where t' equals to mod(t, 2PI/X);
	        */

	        case 'diamond':
	        case 'square':
	          // http://www.wolframalpha.com/input/?i=plot+r+%3D+1%2F%28cos%28mod+
	          // %28t%2C+PI%2F2%29%29%2Bsin%28mod+%28t%2C+PI%2F2%29%29%29%2C+t+%3D
	          // +0+..+2*PI
	          settings.shape = function shapeSquare(theta) {
	            var thetaPrime = theta % (2 * Math.PI / 4);
	            return 1 / (Math.cos(thetaPrime) + Math.sin(thetaPrime));
	          };
	          break;

	        case 'triangle-forward':
	          // http://www.wolframalpha.com/input/?i=plot+r+%3D+1%2F%28cos%28mod+
	          // %28t%2C+2*PI%2F3%29%29%2Bsqrt%283%29sin%28mod+%28t%2C+2*PI%2F3%29
	          // %29%29%2C+t+%3D+0+..+2*PI
	          settings.shape = function shapeTriangle(theta) {
	            var thetaPrime = theta % (2 * Math.PI / 3);
	            return 1 / (Math.cos(thetaPrime) +
	                        Math.sqrt(3) * Math.sin(thetaPrime));
	          };
	          break;

	        case 'triangle':
	        case 'triangle-upright':
	          settings.shape = function shapeTriangle(theta) {
	            var thetaPrime = (theta + Math.PI * 3 / 2) % (2 * Math.PI / 3);
	            return 1 / (Math.cos(thetaPrime) +
	                        Math.sqrt(3) * Math.sin(thetaPrime));
	          };
	          break;

	        case 'pentagon':
	          settings.shape = function shapePentagon(theta) {
	            var thetaPrime = (theta + 0.955) % (2 * Math.PI / 5);
	            return 1 / (Math.cos(thetaPrime) +
	                        0.726543 * Math.sin(thetaPrime));
	          };
	          break;

	        case 'star':
	          settings.shape = function shapeStar(theta) {
	            var thetaPrime = (theta + 0.955) % (2 * Math.PI / 10);
	            if ((theta + 0.955) % (2 * Math.PI / 5) - (2 * Math.PI / 10) >= 0) {
	              return 1 / (Math.cos((2 * Math.PI / 10) - thetaPrime) +
	                          3.07768 * Math.sin((2 * Math.PI / 10) - thetaPrime));
	            } else {
	              return 1 / (Math.cos(thetaPrime) +
	                          3.07768 * Math.sin(thetaPrime));
	            }
	          };
	          break;
	      }
	    }

	    /* Make sure gridSize is a whole number and is not smaller than 4px */
	    settings.gridSize = Math.max(Math.floor(settings.gridSize), 4);

	    /* shorthand */
	    var g = settings.gridSize;
	    var maskRectWidth = g - settings.maskGapWidth;

	    /* normalize rotation settings */
	    var rotationRange = Math.abs(settings.maxRotation - settings.minRotation);
	    var minRotation = Math.min(settings.maxRotation, settings.minRotation);
	    var rotationStep = settings.rotationStep;

	    /* information/object available to all functions, set when start() */
	    var grid, // 2d array containing filling information
	      ngx, ngy, // width and height of the grid
	      center, // position of the center of the cloud
	      maxRadius;

	    /* timestamp for measuring each putWord() action */
	    var escapeTime;

	    /* function for getting the color of the text */
	    var getTextColor;
	    function random_hsl_color(min, max) {
	      return 'hsl(' +
	        (Math.random() * 360).toFixed() + ',' +
	        (Math.random() * 30 + 70).toFixed() + '%,' +
	        (Math.random() * (max - min) + min).toFixed() + '%)';
	    }
	    switch (settings.color) {
	      case 'random-dark':
	        getTextColor = function getRandomDarkColor() {
	          return random_hsl_color(10, 50);
	        };
	        break;

	      case 'random-light':
	        getTextColor = function getRandomLightColor() {
	          return random_hsl_color(50, 90);
	        };
	        break;

	      default:
	        if (typeof settings.color === 'function') {
	          getTextColor = settings.color;
	        }
	        break;
	    }

	    /* function for getting the classes of the text */
	    var getTextClasses = null;
	    if (typeof settings.classes === 'function') {
	      getTextClasses = settings.classes;
	    }

	    /* Interactive */
	    var interactive = false;
	    var infoGrid = [];
	    var hovered;

	    var getInfoGridFromMouseTouchEvent =
	    function getInfoGridFromMouseTouchEvent(evt) {
	      var canvas = evt.currentTarget;
	      var rect = canvas.getBoundingClientRect();
	      var clientX;
	      var clientY;
	      /** Detect if touches are available */
	      if (evt.touches) {
	        clientX = evt.touches[0].clientX;
	        clientY = evt.touches[0].clientY;
	      } else {
	        clientX = evt.clientX;
	        clientY = evt.clientY;
	      }
	      var eventX = clientX - rect.left;
	      var eventY = clientY - rect.top;

	      var x = Math.floor(eventX * ((canvas.width / rect.width) || 1) / g);
	      var y = Math.floor(eventY * ((canvas.height / rect.height) || 1) / g);

	      return infoGrid[x][y];
	    };

	    var wordcloudhover = function wordcloudhover(evt) {
	      var info = getInfoGridFromMouseTouchEvent(evt);

	      if (hovered === info) {
	        return;
	      }

	      hovered = info;
	      if (!info) {
	        settings.hover(undefined, undefined, evt);

	        return;
	      }

	      settings.hover(info.item, info.dimension, evt);

	    };

	    var wordcloudclick = function wordcloudclick(evt) {
	      var info = getInfoGridFromMouseTouchEvent(evt);
	      if (!info) {
	        return;
	      }

	      settings.click(info.item, info.dimension, evt);
	      evt.preventDefault();
	    };

	    /* Get points on the grid for a given radius away from the center */
	    var pointsAtRadius = [];
	    var getPointsAtRadius = function getPointsAtRadius(radius) {
	      if (pointsAtRadius[radius]) {
	        return pointsAtRadius[radius];
	      }

	      // Look for these number of points on each radius
	      var T = radius * 8;

	      // Getting all the points at this radius
	      var t = T;
	      var points = [];

	      if (radius === 0) {
	        points.push([center[0], center[1], 0]);
	      }

	      while (t--) {
	        // distort the radius to put the cloud in shape
	        var rx = 1;
	        if (settings.shape !== 'circle') {
	          rx = settings.shape(t / T * 2 * Math.PI); // 0 to 1
	        }

	        // Push [x, y, t]; t is used solely for getTextColor()
	        points.push([
	          center[0] + radius * rx * Math.cos(-t / T * 2 * Math.PI),
	          center[1] + radius * rx * Math.sin(-t / T * 2 * Math.PI) *
	            settings.ellipticity,
	          t / T * 2 * Math.PI]);
	      }

	      pointsAtRadius[radius] = points;
	      return points;
	    };

	    /* Return true if we had spent too much time */
	    var exceedTime = function exceedTime() {
	      return ((settings.abortThreshold > 0) &&
	        ((new Date()).getTime() - escapeTime > settings.abortThreshold));
	    };

	    /* Get the deg of rotation according to settings, and luck. */
	    var getRotateDeg = function getRotateDeg() {
	      if (settings.rotateRatio === 0) {
	        return 0;
	      }

	      if (Math.random() > settings.rotateRatio) {
	        return 0;
	      }

	      if (rotationRange === 0) {
	        return minRotation;
	      }

	      return minRotation + Math.round(Math.random() * rotationRange / rotationStep) * rotationStep;
	    };

	    var getTextInfo = function getTextInfo(word, weight, rotateDeg) {
	      // calculate the acutal font size
	      // fontSize === 0 means weightFactor function wants the text skipped,
	      // and size < minSize means we cannot draw the text.
	      var debug = false;
	      var fontSize = settings.weightFactor(weight);
	      if (fontSize <= settings.minSize) {
	        return false;
	      }

	      // Scale factor here is to make sure fillText is not limited by
	      // the minium font size set by browser.
	      // It will always be 1 or 2n.
	      var mu = 1;
	      if (fontSize < minFontSize) {
	        mu = (function calculateScaleFactor() {
	          var mu = 2;
	          while (mu * fontSize < minFontSize) {
	            mu += 2;
	          }
	          return mu;
	        })();
	      }

	      var fcanvas = document.createElement('canvas');
	      var fctx = fcanvas.getContext('2d', { willReadFrequently: true });

	      fctx.font = settings.fontWeight + ' ' +
	        (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;

	      // Estimate the dimension of the text with measureText().
	      var fw = fctx.measureText(word).width / mu;
	      var fh = Math.max(fontSize * mu,
	                        fctx.measureText('m').width,
	                        fctx.measureText('\uFF37').width) / mu;

	      // Create a boundary box that is larger than our estimates,
	      // so text don't get cut of (it sill might)
	      var boxWidth = fw + fh * 2;
	      var boxHeight = fh * 3;
	      var fgw = Math.ceil(boxWidth / g);
	      var fgh = Math.ceil(boxHeight / g);
	      boxWidth = fgw * g;
	      boxHeight = fgh * g;

	      // Calculate the proper offsets to make the text centered at
	      // the preferred position.

	      // This is simply half of the width.
	      var fillTextOffsetX = - fw / 2;
	      // Instead of moving the box to the exact middle of the preferred
	      // position, for Y-offset we move 0.4 instead, so Latin alphabets look
	      // vertical centered.
	      var fillTextOffsetY = - fh * 0.4;

	      // Calculate the actual dimension of the canvas, considering the rotation.
	      var cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) +
	                           boxHeight * Math.abs(Math.cos(rotateDeg))) / g);
	      var cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) +
	                           boxHeight * Math.abs(Math.sin(rotateDeg))) / g);
	      var width = cgw * g;
	      var height = cgh * g;

	      fcanvas.setAttribute('width', width);
	      fcanvas.setAttribute('height', height);

	      if (debug) {
	        // Attach fcanvas to the DOM
	        document.body.appendChild(fcanvas);
	        // Save it's state so that we could restore and draw the grid correctly.
	        fctx.save();
	      }

	      // Scale the canvas with |mu|.
	      fctx.scale(1 / mu, 1 / mu);
	      fctx.translate(width * mu / 2, height * mu / 2);
	      fctx.rotate(- rotateDeg);

	      // Once the width/height is set, ctx info will be reset.
	      // Set it again here.
	      fctx.font = settings.fontWeight + ' ' +
	        (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;

	      // Fill the text into the fcanvas.
	      // XXX: We cannot because textBaseline = 'top' here because
	      // Firefox and Chrome uses different default line-height for canvas.
	      // Please read https://bugzil.la/737852#c6.
	      // Here, we use textBaseline = 'middle' and draw the text at exactly
	      // 0.5 * fontSize lower.
	      fctx.fillStyle = '#000';
	      fctx.textBaseline = 'middle';
	      fctx.fillText(word, fillTextOffsetX * mu,
	                    (fillTextOffsetY + fontSize * 0.5) * mu);

	      // Get the pixels of the text
	      var imageData = fctx.getImageData(0, 0, width, height).data;

	      if (exceedTime()) {
	        return false;
	      }

	      if (debug) {
	        // Draw the box of the original estimation
	        fctx.strokeRect(fillTextOffsetX * mu,
	                        fillTextOffsetY, fw * mu, fh * mu);
	        fctx.restore();
	      }

	      // Read the pixels and save the information to the occupied array
	      var occupied = [];
	      var gx = cgw, gy, x, y;
	      var bounds = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
	      while (gx--) {
	        gy = cgh;
	        while (gy--) {
	          y = g;
	          singleGridLoop: {
	            while (y--) {
	              x = g;
	              while (x--) {
	                if (imageData[((gy * g + y) * width +
	                               (gx * g + x)) * 4 + 3]) {
	                  occupied.push([gx, gy]);

	                  if (gx < bounds[3]) {
	                    bounds[3] = gx;
	                  }
	                  if (gx > bounds[1]) {
	                    bounds[1] = gx;
	                  }
	                  if (gy < bounds[0]) {
	                    bounds[0] = gy;
	                  }
	                  if (gy > bounds[2]) {
	                    bounds[2] = gy;
	                  }

	                  if (debug) {
	                    fctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
	                    fctx.fillRect(gx * g, gy * g, g - 0.5, g - 0.5);
	                  }
	                  break singleGridLoop;
	                }
	              }
	            }
	            if (debug) {
	              fctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
	              fctx.fillRect(gx * g, gy * g, g - 0.5, g - 0.5);
	            }
	          }
	        }
	      }

	      if (debug) {
	        fctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
	        fctx.fillRect(bounds[3] * g,
	                      bounds[0] * g,
	                      (bounds[1] - bounds[3] + 1) * g,
	                      (bounds[2] - bounds[0] + 1) * g);
	      }

	      // Return information needed to create the text on the real canvas
	      return {
	        mu: mu,
	        occupied: occupied,
	        bounds: bounds,
	        gw: cgw,
	        gh: cgh,
	        fillTextOffsetX: fillTextOffsetX,
	        fillTextOffsetY: fillTextOffsetY,
	        fillTextWidth: fw,
	        fillTextHeight: fh,
	        fontSize: fontSize
	      };
	    };

	    /* Determine if there is room available in the given dimension */
	    var canFitText = function canFitText(gx, gy, gw, gh, occupied) {
	      // Go through the occupied points,
	      // return false if the space is not available.
	      var i = occupied.length;
	      while (i--) {
	        var px = gx + occupied[i][0];
	        var py = gy + occupied[i][1];

	        if (px >= ngx || py >= ngy || px < 0 || py < 0) {
	          if (!settings.drawOutOfBound) {
	            return false;
	          }
	          continue;
	        }

	        if (!grid[px][py]) {
	          return false;
	        }
	      }
	      return true;
	    };

	    /* Actually draw the text on the grid */
	    var drawText = function drawText(gx, gy, info, word, weight,
	                                     distance, theta, rotateDeg, attributes) {

	      var fontSize = info.fontSize;
	      var color;
	      if (getTextColor) {
	        color = getTextColor(word, weight, fontSize, distance, theta);
	      } else {
	        color = settings.color;
	      }

	      var classes;
	      if (getTextClasses) {
	        classes = getTextClasses(word, weight, fontSize, distance, theta);
	      } else {
	        classes = settings.classes;
	      }

	      var dimension;
	      var bounds = info.bounds;
	      dimension = {
	        x: (gx + bounds[3]) * g,
	        y: (gy + bounds[0]) * g,
	        w: (bounds[1] - bounds[3] + 1) * g,
	        h: (bounds[2] - bounds[0] + 1) * g
	      };

	      elements.forEach(function(el) {
	        if (el.getContext) {
	          var ctx = el.getContext('2d');
	          var mu = info.mu;

	          // Save the current state before messing it
	          ctx.save();
	          ctx.scale(1 / mu, 1 / mu);

	          ctx.font = settings.fontWeight + ' ' +
	                     (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;
	          ctx.fillStyle = color;

	          // Translate the canvas position to the origin coordinate of where
	          // the text should be put.
	          ctx.translate((gx + info.gw / 2) * g * mu,
	                        (gy + info.gh / 2) * g * mu);

	          if (rotateDeg !== 0) {
	            ctx.rotate(- rotateDeg);
	          }

	          // Finally, fill the text.

	          // XXX: We cannot because textBaseline = 'top' here because
	          // Firefox and Chrome uses different default line-height for canvas.
	          // Please read https://bugzil.la/737852#c6.
	          // Here, we use textBaseline = 'middle' and draw the text at exactly
	          // 0.5 * fontSize lower.
	          ctx.textBaseline = 'middle';
	          ctx.fillText(word, info.fillTextOffsetX * mu,
	                             (info.fillTextOffsetY + fontSize * 0.5) * mu);

	          // The below box is always matches how <span>s are positioned
	          /* ctx.strokeRect(info.fillTextOffsetX, info.fillTextOffsetY,
	            info.fillTextWidth, info.fillTextHeight); */

	          // Restore the state.
	          ctx.restore();
	        } else {
	          // drawText on DIV element
	          var span = document.createElement('span');
	          var transformRule = '';
	          transformRule = 'rotate(' + (- rotateDeg / Math.PI * 180) + 'deg) ';
	          if (info.mu !== 1) {
	            transformRule +=
	              'translateX(-' + (info.fillTextWidth / 4) + 'px) ' +
	              'scale(' + (1 / info.mu) + ')';
	          }
	          var styleRules = {
	            'position': 'absolute',
	            'display': 'block',
	            'font': settings.fontWeight + ' ' +
	                    (fontSize * info.mu) + 'px ' + settings.fontFamily,
	            'left': ((gx + info.gw / 2) * g + info.fillTextOffsetX) + 'px',
	            'top': ((gy + info.gh / 2) * g + info.fillTextOffsetY) + 'px',
	            'width': info.fillTextWidth + 'px',
	            'height': info.fillTextHeight + 'px',
	            'lineHeight': fontSize + 'px',
	            'whiteSpace': 'nowrap',
	            'transform': transformRule,
	            'webkitTransform': transformRule,
	            'msTransform': transformRule,
	            'transformOrigin': '50% 40%',
	            'webkitTransformOrigin': '50% 40%',
	            'msTransformOrigin': '50% 40%'
	          };
	          if (color) {
	            styleRules.color = color;
	          }
	          span.textContent = word;
	          for (var cssProp in styleRules) {
	            span.style[cssProp] = styleRules[cssProp];
	          }
	          if (attributes) {
	            for (var attribute in attributes) {
	              span.setAttribute(attribute, attributes[attribute]);
	            }
	          }
	          if (classes) {
	            span.className += classes;
	          }
	          el.appendChild(span);
	        }
	      });
	    };

	    /* Help function to updateGrid */
	    var fillGridAt = function fillGridAt(x, y, drawMask, dimension, item) {
	      if (x >= ngx || y >= ngy || x < 0 || y < 0) {
	        return;
	      }

	      grid[x][y] = false;

	      if (drawMask) {
	        var ctx = elements[0].getContext('2d');
	        ctx.fillRect(x * g, y * g, maskRectWidth, maskRectWidth);
	      }

	      if (interactive) {
	        infoGrid[x][y] = { item: item, dimension: dimension };
	      }
	    };

	    /* Update the filling information of the given space with occupied points.
	       Draw the mask on the canvas if necessary. */
	    var updateGrid = function updateGrid(gx, gy, gw, gh, info, item) {
	      var occupied = info.occupied;
	      var drawMask = settings.drawMask;
	      var ctx;
	      if (drawMask) {
	        ctx = elements[0].getContext('2d');
	        ctx.save();
	        ctx.fillStyle = settings.maskColor;
	      }

	      var dimension;
	      if (interactive) {
	        var bounds = info.bounds;
	        dimension = {
	          x: (gx + bounds[3]) * g,
	          y: (gy + bounds[0]) * g,
	          w: (bounds[1] - bounds[3] + 1) * g,
	          h: (bounds[2] - bounds[0] + 1) * g
	        };
	      }

	      var i = occupied.length;
	      while (i--) {
	        var px = gx + occupied[i][0];
	        var py = gy + occupied[i][1];

	        if (px >= ngx || py >= ngy || px < 0 || py < 0) {
	          continue;
	        }

	        fillGridAt(px, py, drawMask, dimension, item);
	      }

	      if (drawMask) {
	        ctx.restore();
	      }
	    };

	    /* putWord() processes each item on the list,
	       calculate it's size and determine it's position, and actually
	       put it on the canvas. */
	    var putWord = function putWord(item) {
	      var word, weight, attributes;
	      if (Array.isArray(item)) {
	        word = item[0];
	        weight = item[1];
	      } else {
	        word = item.word;
	        weight = item.weight;
	        attributes = item.attributes;
	      }
	      var rotateDeg = getRotateDeg();

	      // get info needed to put the text onto the canvas
	      var info = getTextInfo(word, weight, rotateDeg);

	      // not getting the info means we shouldn't be drawing this one.
	      if (!info) {
	        return false;
	      }

	      if (exceedTime()) {
	        return false;
	      }

	      // If drawOutOfBound is set to false,
	      // skip the loop if we have already know the bounding box of
	      // word is larger than the canvas.
	      if (!settings.drawOutOfBound) {
	        var bounds = info.bounds;
	        if ((bounds[1] - bounds[3] + 1) > ngx ||
	          (bounds[2] - bounds[0] + 1) > ngy) {
	          return false;
	        }
	      }

	      // Determine the position to put the text by
	      // start looking for the nearest points
	      var r = maxRadius + 1;

	      var tryToPutWordAtPoint = function(gxy) {
	        var gx = Math.floor(gxy[0] - info.gw / 2);
	        var gy = Math.floor(gxy[1] - info.gh / 2);
	        var gw = info.gw;
	        var gh = info.gh;

	        // If we cannot fit the text at this position, return false
	        // and go to the next position.
	        if (!canFitText(gx, gy, gw, gh, info.occupied)) {
	          return false;
	        }

	        // Actually put the text on the canvas
	        drawText(gx, gy, info, word, weight,
	                 (maxRadius - r), gxy[2], rotateDeg, attributes);

	        // Mark the spaces on the grid as filled
	        updateGrid(gx, gy, gw, gh, info, item);

	        return {
	          gx: gx,
	          gy: gy,
	          rot: rotateDeg,
	          info: info
	        };
	      };

	      while (r--) {
	        var points = getPointsAtRadius(maxRadius - r);

	        if (settings.shuffle) {
	          points = [].concat(points);
	          shuffleArray(points);
	        }

	        // Try to fit the words by looking at each point.
	        // array.some() will stop and return true
	        // when putWordAtPoint() returns true.
	        for (var i = 0; i < points.length; i++) {
	          var res = tryToPutWordAtPoint(points[i]);
	          if (res) {
	            return res;
	          }
	        }

	        // var drawn = points.some(tryToPutWordAtPoint);
	        // if (drawn) {
	        //   // leave putWord() and return true
	        //   return true;
	        // }
	      }
	      // we tried all distances but text won't fit, return null
	      return null;
	    };

	    /* Send DOM event to all elements. Will stop sending event and return
	       if the previous one is canceled (for cancelable events). */
	    var sendEvent = function sendEvent(type, cancelable, detail) {
	      if (cancelable) {
	        return !elements.some(function(el) {
	          var evt = document.createEvent('CustomEvent');
	          evt.initCustomEvent(type, true, cancelable, detail || {});
	          return !el.dispatchEvent(evt);
	        }, this);
	      } else {
	        elements.forEach(function(el) {
	          var evt = document.createEvent('CustomEvent');
	          evt.initCustomEvent(type, true, cancelable, detail || {});
	          el.dispatchEvent(evt);
	        }, this);
	      }
	    };

	    /* Start drawing on a canvas */
	    var start = function start() {
	      // For dimensions, clearCanvas etc.,
	      // we only care about the first element.
	      var canvas = elements[0];

	      if (canvas.getContext) {
	        ngx = Math.ceil(canvas.width / g);
	        ngy = Math.ceil(canvas.height / g);
	      } else {
	        var rect = canvas.getBoundingClientRect();
	        ngx = Math.ceil(rect.width / g);
	        ngy = Math.ceil(rect.height / g);
	      }

	      // Sending a wordcloudstart event which cause the previous loop to stop.
	      // Do nothing if the event is canceled.
	      if (!sendEvent('wordcloudstart', true)) {
	        return;
	      }

	      // Determine the center of the word cloud
	      center = (settings.origin) ?
	        [settings.origin[0]/g, settings.origin[1]/g] :
	        [ngx / 2, ngy / 2];

	      // Maxium radius to look for space
	      maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));

	      /* Clear the canvas only if the clearCanvas is set,
	         if not, update the grid to the current canvas state */
	      grid = [];

	      var gx, gy, i;
	      if (!canvas.getContext || settings.clearCanvas) {
	        elements.forEach(function(el) {
	          if (el.getContext) {
	            var ctx = el.getContext('2d');
	            ctx.fillStyle = settings.backgroundColor;
	            ctx.clearRect(0, 0, ngx * (g + 1), ngy * (g + 1));
	            ctx.fillRect(0, 0, ngx * (g + 1), ngy * (g + 1));
	          } else {
	            el.textContent = '';
	            el.style.backgroundColor = settings.backgroundColor;
	            el.style.position = 'relative';
	          }
	        });

	        /* fill the grid with empty state */
	        gx = ngx;
	        while (gx--) {
	          grid[gx] = [];
	          gy = ngy;
	          while (gy--) {
	            grid[gx][gy] = true;
	          }
	        }
	      } else {
	        /* Determine bgPixel by creating
	           another canvas and fill the specified background color. */
	        var bctx = document.createElement('canvas').getContext('2d');

	        bctx.fillStyle = settings.backgroundColor;
	        bctx.fillRect(0, 0, 1, 1);
	        var bgPixel = bctx.getImageData(0, 0, 1, 1).data;

	        /* Read back the pixels of the canvas we got to tell which part of the
	           canvas is empty.
	           (no clearCanvas only works with a canvas, not divs) */
	        var imageData =
	          canvas.getContext('2d').getImageData(0, 0, ngx * g, ngy * g).data;

	        gx = ngx;
	        var x, y;
	        while (gx--) {
	          grid[gx] = [];
	          gy = ngy;
	          while (gy--) {
	            y = g;
	            singleGridLoop: while (y--) {
	              x = g;
	              while (x--) {
	                i = 4;
	                while (i--) {
	                  if (imageData[((gy * g + y) * ngx * g +
	                                 (gx * g + x)) * 4 + i] !== bgPixel[i]) {
	                    grid[gx][gy] = false;
	                    break singleGridLoop;
	                  }
	                }
	              }
	            }
	            if (grid[gx][gy] !== false) {
	              grid[gx][gy] = true;
	            }
	          }
	        }

	        imageData = bctx = bgPixel = undefined;
	      }

	      // fill the infoGrid with empty state if we need it
	      if (settings.hover || settings.click) {

	        interactive = true;

	        /* fill the grid with empty state */
	        gx = ngx + 1;
	        while (gx--) {
	          infoGrid[gx] = [];
	        }

	        if (settings.hover) {
	          canvas.addEventListener('mousemove', wordcloudhover);
	        }

	        if (settings.click) {
	          canvas.addEventListener('click', wordcloudclick);
	          canvas.addEventListener('touchstart', wordcloudclick);
	          canvas.addEventListener('touchend', function (e) {
	            e.preventDefault();
	          });
	          canvas.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
	        }

	        canvas.addEventListener('wordcloudstart', function stopInteraction() {
	          canvas.removeEventListener('wordcloudstart', stopInteraction);

	          canvas.removeEventListener('mousemove', wordcloudhover);
	          canvas.removeEventListener('click', wordcloudclick);
	          hovered = undefined;
	        });
	      }

	      i = 0;
	      var loopingFunction, stoppingFunction;
	      if (settings.wait !== 0) {
	        loopingFunction = window.setTimeout;
	        stoppingFunction = window.clearTimeout;
	      } else {
	        loopingFunction = window.setImmediate;
	        stoppingFunction = window.clearImmediate;
	      }

	      var addEventListener = function addEventListener(type, listener) {
	        elements.forEach(function(el) {
	          el.addEventListener(type, listener);
	        }, this);
	      };

	      var removeEventListener = function removeEventListener(type, listener) {
	        elements.forEach(function(el) {
	          el.removeEventListener(type, listener);
	        }, this);
	      };

	      var anotherWordCloudStart = function anotherWordCloudStart() {
	        removeEventListener('wordcloudstart', anotherWordCloudStart);
	        stoppingFunction(timer);
	      };

	      addEventListener('wordcloudstart', anotherWordCloudStart);

	      var timer = loopingFunction(function loop() {
	        if (i >= settings.list.length) {
	          stoppingFunction(timer);
	          sendEvent('wordcloudstop', false);
	          removeEventListener('wordcloudstart', anotherWordCloudStart);

	          return;
	        }
	        escapeTime = (new Date()).getTime();
	        var drawn = putWord(settings.list[i]);
	        var canceled = !sendEvent('wordclouddrawn', true, {
	          item: settings.list[i], drawn: drawn });
	        if (exceedTime() || canceled) {
	          stoppingFunction(timer);
	          settings.abort();
	          sendEvent('wordcloudabort', false);
	          sendEvent('wordcloudstop', false);
	          removeEventListener('wordcloudstart', anotherWordCloudStart);
	          return;
	        }
	        i++;
	        timer = loopingFunction(loop, settings.wait);
	      }, settings.wait);
	    };

	    // All set, start the drawing
	    start();
	  };

	  WordCloud.isSupported = isSupported;
	  WordCloud.minFontSize = minFontSize;

	  // Expose the library as an AMD module
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() { return WordCloud; }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module !== 'undefined' && module.exports) {
	    module.exports = WordCloud;
	  } else {
	    global.WordCloud = WordCloud;
	  }

	})(this); //jshint ignore:line

/***/ })
/******/ ])
});
;
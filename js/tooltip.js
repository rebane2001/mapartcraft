/**
 * Tooltip.js
 * A basic script that applies a mouseover tooltip functionality to all elements of a page that have a data-tooltip attribute
 * Matthias Schuetz, http://matthiasschuetz.com
 *
 * Copyright (C) Matthias Schuetz
 * Free to use under the MIT license
 */

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(factory);
	} else if (!root.tooltip) {
		// Browser globals
		root.tooltip = factory(root);
	}
}(this, function() {
	var _options = {
		tooltipId: "tooltip",
		offsetDefault: 15
	};

	var _tooltips = [];
	var _tooltipsTemp = null;

	function _bindTooltips(resetTooltips) {
		if (resetTooltips) {
			_tooltipsTemp = _tooltips.concat();
			_tooltips = [];
		}

		Array.prototype.forEach.call(document.querySelectorAll("[data-tooltip]"), function(elm, idx) {
			var tooltipText = elm.getAttribute("title").trim();
			var options;

			if (resetTooltips && _tooltipsTemp.length && _tooltipsTemp[idx] && _tooltipsTemp[idx].text) {
				if (tooltipText.length === 0) {
					elm.setAttribute("title", _tooltipsTemp[idx].text);
					tooltipText = _tooltipsTemp[idx].text;
				}

				elm.removeEventListener("mousemove", _onElementMouseMove);
				elm.removeEventListener("mouseout", _onElementMouseOut);
				elm.removeEventListener("mouseover", _onElementMouseOver);
			}

			if (tooltipText) {
				elm.setAttribute("title", "");
				elm.setAttribute("data-tooltip-id", idx);
				options = _parseOptions(elm.getAttribute("data-tooltip"));
				
				_tooltips[idx] = {
					text: tooltipText,
					options: options
				};

				elm.addEventListener("mousemove", _onElementMouseMove);
				elm.addEventListener("mouseout", _onElementMouseOut);
				elm.addEventListener("mouseover", _onElementMouseOver);
			}
		});

		if (resetTooltips) {
			_tooltipsTemp = null;
		}
	}

	function _createTooltip(text, tooltipId) {
		var tooltipElm = document.createElement("div");
		var tooltipText = document.createTextNode(text);
		var options = tooltipId && _tooltips[tooltipId] && _tooltips[tooltipId].options;

		if (options && options["class"]) {
			tooltipElm.setAttribute("class", options["class"]);
		}

		tooltipElm.setAttribute("id", _options.tooltipId);
		tooltipElm.appendChild(tooltipText);

		document.querySelector("body").appendChild(tooltipElm);
	}

	function _getTooltipElm() {
		return document.querySelector("#" + _options.tooltipId);
	}

	function _onElementMouseMove(evt) {
		var tooltipId = this.getAttribute("data-tooltip-id");
		var tooltipElm = _getTooltipElm();
		var options = tooltipId && _tooltips[tooltipId] && _tooltips[tooltipId].options;
		var offset = options && options.offset || _options.offsetDefault;
		var scrollY = window.scrollY || window.pageYOffset;
		var scrollX = window.scrollX || window.pageXOffset;
		var tooltipTop = evt.pageY + offset;
		var tooltipLeft = evt.pageX + offset;

		if (tooltipElm) {
			tooltipTop = (tooltipTop - scrollY + tooltipElm.offsetHeight + 20 >= window.innerHeight ? (tooltipTop - tooltipElm.offsetHeight - 20) : tooltipTop);
			tooltipLeft = (tooltipLeft - scrollX + tooltipElm.offsetWidth + 20 >= window.innerWidth ? (tooltipLeft - tooltipElm.offsetWidth - 20) : tooltipLeft);

			tooltipElm.style.top = tooltipTop + "px";
			tooltipElm.style.left = tooltipLeft + "px";
		}
	}

	function _onElementMouseOut(evt) {
		var tooltipElm = _getTooltipElm();

		if (tooltipElm) {
			document.querySelector("body").removeChild(tooltipElm);
		}
	}

	function _onElementMouseOver(evt) {
		var tooltipId = this.getAttribute("data-tooltip-id");
		var tooltipText = tooltipId && _tooltips[tooltipId] && _tooltips[tooltipId].text;

		if (tooltipText) {
			_createTooltip(tooltipText, tooltipId);	
		}
	}

	function _parseOptions(options) {
		var optionsObj;

		if (options.length) {
			try {
				optionsObj = JSON.parse(options.replace(/'/ig, "\""));
			} catch(err) {
				console.log(err);
			}
		}

		return optionsObj;
	}

	function _init() {
		window.addEventListener("load", _bindTooltips);
	}

	_init();

	return {
		setOptions: function(options) {
			for (var option in options) {
				if (_options.hasOwnProperty(option)) {
					_options[option] = options[option];
				}
			}
		},
		refresh: function() {
			_bindTooltips(true);
		}
	};
}));

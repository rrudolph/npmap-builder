/* globals Modernizr */

/* =========================================================
 * bootstrap-slider.js v2.0.0
 * http://www.eyecon.ro/bootstrap-slider
 * =========================================================
 * Copyright 2012 Stefan Petre
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
 * ========================================================= */
!function($) {
  var Slider = function(element, options) {
    var tooltip;

    if (typeof Modernizr !== 'undefined' && Modernizr.touch) {
      this.touchCapable = true;
    }

    this.element = $(element);
    this.picker = $('' +
      '<div class="slider">' +
        '<div class="slider-track">' +
          '<div class="slider-selection"></div>' +
          '<div class="slider-handle value"></div>' +
          '<div class="slider-handle min"></div>' +
          '<div class="slider-handle center"></div>' +
          '<div class="slider-handle max"></div>' +
        '</div>' +
        '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>' +
      '</div>'
    ).insertBefore(this.element).append(this.element);

    this.id = this.element.data('slider-id') || options.id;

    if (this.id) {
      this.picker[0].id = this.id;
    }

    tooltip = this.element.data('slider-tooltip') || options.tooltip;
    this.orientation = this.element.data('slider-orientation') || options.orientation;
    this.tooltip = this.picker.find('.tooltip');
    this.tooltipInner = this.tooltip.find('div.tooltip-inner');

    switch (this.orientation) {
      case 'vertical':
        this.mousePos = 'pageY';
        this.picker.addClass('slider-vertical');
        this.sizePos = 'offsetHeight';
        this.stylePos = 'top';
        this.tooltip.addClass('right')[0].style.left = '100%';
        break;
      default:
        this.mousePos = 'pageX';
        this.orientation = 'horizontal';
        this.picker
          .addClass('slider-horizontal')
          .css('width', '100%');
        this.sizePos = 'offsetWidth';
        this.stylePos = 'left';
        this.tooltip.addClass('top')[0].style.top = -this.tooltip.outerHeight() - 53 + 'px';
        break;
    }

    this.center = this.element.data('slider-center') || options.center;
    this.max = this.element.data('slider-max') || options.max;
    this.min = this.element.data('slider-min') || options.min;
    this.step = this.element.data('slider-step') || options.step;
    this.value = this.element.data('slider-value') || options.value;

    if (this.value[1]) {
      this.range = true;
    }

    this.selection = this.element.data('slider-selection') || options.selection;
    this.selectionEl = this.picker.find('.slider-selection');

    if (this.selection === 'none') {
      this.selectionEl.addClass('hide');
    }

    this.selectionElStyle = this.selectionEl[0].style;
    this.handleCenter = this.picker.find('.slider-handle.center');
    this.handleCenterStype = this.handleCenter[0].style;
    this.handleMin = this.picker.find('.slider-handle.min');
    this.handleMinStype = this.handleMin[0].style;
    this.handleMax = this.picker.find('.slider-handle.max');
    this.handleMaxStype = this.handleMax[0].style;
    this.handleSingle = this.picker.find('.slider-handle.value');
    this.handleSingleMaxStype = this.handleSingle[0].style;

    if (this.range) {
      this.handleSingle.addClass('hide');

      if (!this.center) {
        this.handleCenter.addClass('hide');
      }

      this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
      this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
    } else {
      this.handleCenter.addClass('hide');
      this.handleMin.addClass('hide');
      this.handleMax.addClass('hide');
      this.value = [Math.max(this.min, Math.min(this.max, this.value))];

      if (this.selection === 'after') {
        this.value[1] = this.max;
      } else {
        this.value[1] = this.min;
      }
    }

    this.diff = this.max - this.min;
    this.formatter = options.formatter;
    this.offset = this.picker.offset();
    this.percentage = [
      (this.value[0] - this.min) * 100 / this.diff,
      (this.value[1] - this.min) * 100 / this.diff,
      this.step * 100 / this.diff
    ];
    //this.size = this.picker[0][this.sizePos];
    this.size = $(this.picker[0]).width();
    //this.size = $(this.picker[0]).find('.slider-selection').outerWidth();

    this.layout();

    if (this.touchCapable) {
      this.picker.on({
        touchstart: $.proxy(this.mousedown, this)
      });
    } else {
      this.picker.on({
        mousedown: $.proxy(this.mousedown, this)
      });
    }

    if (tooltip === 'show') {
      this.picker.on({
        mouseenter: $.proxy(this.showTooltip, this),
        mouseleave: $.proxy(this.hideTooltip, this)
      });
    } else {
      this.tooltip.addClass('hide');
    }
  };

  Slider.prototype = {
    constructor: Slider,
    inDrag: false,
    over: false,
    calculateValue: function() {
      var val;

      if (this.range) {
        val = [
          (this.min + Math.round((this.diff * this.percentage[0]/100)/this.step)*this.step),
          (this.min + Math.round((this.diff * this.percentage[1]/100)/this.step)*this.step)
        ];
        this.value = val;
      } else {
        val = (this.min + Math.round((this.diff * this.percentage[0]/100)/this.step)*this.step);
        this.value = [val, this.value[1]];
      }
      return val;
    },
    getPercentage: function(ev) {
      if (this.touchCapable) {
        ev = ev.touches[0];
      }

      return Math.max(0, Math.min(100, Math.round((ev[this.mousePos] - this.offset[this.stylePos])*100/this.size / this.percentage[2]) * this.percentage[2]));
    },
    getValue: function() {
      if (this.range) {
        return this.value;
      }

      return this.value[0];
    },
    hideTooltip: function(){
      if (this.inDrag === false) {
        this.tooltip.removeClass('in');
      }

      this.over = false;
    },
    layout: function(){
      this.handleMinStype[this.stylePos] = this.percentage[0] + '%';
      this.handleMaxStype[this.stylePos] = this.percentage[1] + '%';

      if (this.orientation === 'vertical') {
        this.selectionElStyle.top = Math.min(this.percentage[0], this.percentage[1]) + '%';
        this.selectionElStyle.height = Math.abs(this.percentage[0] - this.percentage[1]) +'%';
      } else {
        this.selectionElStyle.left = Math.min(this.percentage[0], this.percentage[1]) + '%';
        this.selectionElStyle.width = Math.abs(this.percentage[0] - this.percentage[1]) + '%';
      }
      if (this.range) {
        this.tooltipInner.text(this.formatter(this.value[0]) + ' : ' + this.formatter(this.value[1]));

        this.tooltip[0].style[this.stylePos] = this.size * (this.percentage[0] + (this.percentage[1] - this.percentage[0])/2)/100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight()/2 : this.tooltip.outerWidth()/2) + 'px';
      } else {
        this.tooltipInner.text(
          this.formatter(this.value[0])
        );

        this.tooltip[0].style[this.stylePos] = this.size * this.percentage[0] / 100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + 'px';
      }
    },
    mousedown: function(ev) {
      if (this.touchCapable && ev.type === 'touchstart') {
        ev = ev.originalEvent;
      }

      this.offset = this.picker.offset();
      this.size = this.picker[0][this.sizePos];

      var percentage = this.getPercentage(ev);

      if (this.range) {
        var diff1 = Math.abs(this.percentage[0] - percentage);
        var diff2 = Math.abs(this.percentage[1] - percentage);
        this.dragged = (diff1 < diff2) ? 0 : 1;
      } else {
        this.dragged = 0;
      }

      this.percentage[this.dragged] = percentage;
      this.layout();

      if (this.touchCapable) {
        $(document).on({
          touchmove: $.proxy(this.mousemove, this),
          touchend: $.proxy(this.mouseup, this)
        });
      } else {
        $(document).on({
          mousemove: $.proxy(this.mousemove, this),
          mouseup: $.proxy(this.mouseup, this)
        });
      }

      this.inDrag = true;
      var val = this.calculateValue();
      this.element.trigger({
          type: 'slideStart',
          value: val
        }).trigger({
          type: 'slide',
          value: val
        });

      this.setValue(val);
      return false;
    },
    mousemove: function(ev) {
      if (this.touchCapable && ev.type === 'touchmove') {
        ev = ev.originalEvent;
      }

      var percentage = this.getPercentage(ev);
      if (this.range) {
        if (this.dragged === 0 && this.percentage[1] < percentage) {
          this.percentage[0] = this.percentage[1];
          this.dragged = 1;
        } else if (this.dragged === 1 && this.percentage[0] > percentage) {
          this.percentage[1] = this.percentage[0];
          this.dragged = 0;
        }
      }
      this.percentage[this.dragged] = percentage;
      this.layout();
      var val = this.calculateValue();
      this.element
        .trigger({
          type: 'slide',
          value: val
        })
        .data('value', val)
        .prop('value', val);

      this.setValue(val);
      return false;
    },
    mouseup: function() {
      if (this.touchCapable) {
        $(document).off({
          touchmove: this.mousemove,
          touchend: this.mouseup
        });
      } else {
        $(document).off({
          mousemove: this.mousemove,
          mouseup: this.mouseup
        });
      }

      this.inDrag = false;

      if (this.over === false) {
        this.hideTooltip();
      }

      var val = this.calculateValue();

      this.element
        .trigger({
          type: 'slideStop',
          value: val
        })
        .data('value', val)
        .prop('value', val);

      this.setValue(val);
      return false;
    },
    setValue: function(val) {
      this.value = val;

      if (this.range) {
        this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
        this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
      } else {
        this.value = [ Math.max(this.min, Math.min(this.max, this.value))];
        this.handle2.addClass('hide');

        if (this.selection === 'after') {
          this.value[1] = this.max;
        } else {
          this.value[1] = this.min;
        }
      }
      this.diff = this.max - this.min;
      this.percentage = [
        (this.value[0]-this.min)*100/this.diff,
        (this.value[1]-this.min)*100/this.diff,
        this.step*100/this.diff
      ];
      this.layout();
    },
    showTooltip: function(){
      this.layout();
      this.over = true;
      this.tooltip.addClass('in');
    }
  };

  $.fn.slider = function(option, val) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data('slider'),
          options = typeof option === 'object' && option;

      if (!data)  {
        $this.data('slider', (data = new Slider(this, $.extend({}, $.fn.slider.defaults,options))));
      }

      if (typeof option === 'string') {
        data[option](val);
      }
    });
  };
  $.fn.slider.defaults = {
    max: 10,
    min: 0,
    orientation: 'horizontal',
    selection: 'before',
    step: 1,
    tooltip: 'show',
    value: 5,
    formatter: function(value) {
      return value;
    }
  };
  $.fn.slider.Constructor = Slider;
}(window.jQuery);

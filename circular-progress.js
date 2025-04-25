/**
 * Bootstrap Progress - Animated progress bar plugin
 * Version 1.0.0
 */

(function ($) {
  'use strict';

  // PROGRESS CLASS DEFINITION
  // ========================
  
  const Progress = function (element, config) {
    this._element = element;
    this._config = this._getConfig(config);
    this._isCircular = $(element).hasClass('circular');
    this._targetValue = parseInt(element.getAttribute('aria-valuenow'), 10);
    this._isAnimating = false;
    this._progressBar = $(element).find('.progress-bar')[0];
  };

  Progress.VERSION = '1.0.0';
  Progress.DATA_KEY = 'bs.progress';
  Progress.EVENT_KEY = `.${Progress.DATA_KEY}`;

  Progress.DefaultConfig = {
    duration: 1500,
    easing: 'linear'
  };

  Progress.Event = {
    ANIMATION_START: `animationStart${Progress.EVENT_KEY}`,
    ANIMATION_COMPLETE: `animationComplete${Progress.EVENT_KEY}`,
    VALUE_CHANGED: `valueChanged${Progress.EVENT_KEY}`
  };

  // PROGRESS CLASS METHODS
  // ========================

  Progress.prototype = {

    // Get configuration with defaults
    _getConfig: function (config) {
      return {
        ...Progress.DefaultConfig,
        ...(config || {})
      };
    },

    // Initialize progress bar to 0%
    initialize: function () {
      this.setValue(0);
      return this;
    },

    // Set value without animation
    setValue: function (percent) {
      percent = Math.min(Math.max(parseInt(percent, 10), 0), 100);
      
      if (this._isCircular) {
        this._setCircularProgress(percent);
      } else {
        this._setHorizontalProgress(percent);
      }
      
      $(this._element).trigger($.Event(Progress.Event.VALUE_CHANGED, {
        value: percent
      }));
      
      return this;
    },

    // Animate to target value
    animate: function (targetValue = null, customDuration = null) {
      if (this._isAnimating) return this;
      
      const startValue = this._getCurrentValue();
      this._targetValue = targetValue !== null ? Math.min(Math.max(parseInt(targetValue, 10), 0), 100) 
                                           : this._targetValue;
      const duration = customDuration || this._config.duration;
      
      if (startValue === this._targetValue) return this;
      
      this._isAnimating = true;
      const startTime = performance.now();
      
      $(this._element).trigger($.Event(Progress.Event.ANIMATION_START, {
        startValue: startValue,
        targetValue: this._targetValue
      }));

      const animate = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + progress * (this._targetValue - startValue));
        
        this.setValue(currentValue);
        
        if (progress < 1) {
          window.requestAnimationFrame(animate);
        } else {
          this._isAnimating = false;
          $(this._element).trigger($.Event(Progress.Event.ANIMATION_COMPLETE, {
            value: this._targetValue
          }));
        }
      };
      
      window.requestAnimationFrame(animate);
      return this;
    },

    // Get current value
    _getCurrentValue: function () {
      if (this._isCircular) {
        const label = $(this._element).find('.progress-label');
        return label.length ? parseInt(label.text(), 10) : 0;
      } else {
        // Get the current width percentage from the style attribute
        const width = $(this._progressBar).css('width');
        const parentWidth = $(this._element).width();
        
        if (width.indexOf('%') !== -1) {
          // If width is already in percentage
          return parseInt(width, 10);
        } else if (parentWidth > 0) {
          // Calculate percentage based on pixel width
          const pixelWidth = parseFloat(width);
          return Math.round((pixelWidth / parentWidth) * 100);
        }
        
        return 0;
      }
    },

    // Set circular progress 
    _setCircularProgress: function (percent) {
      const angle = percent * 3.6; // 3.6 = 360 / 100
      
      // Update the text percentage
      const textElement = $(this._element).find('.progress-label');
      if (textElement.length) {
        textElement.text(`${percent}%`);
      }
      
      // Set the border color based on context class
      let arcColor = 'var(--bs-primary)'; // Default primary blue
      const progressBar = this._progressBar;
      
      if (progressBar.classList.contains('bg-success')) {
        arcColor = 'var(--bs-success)';
      } else if (progressBar.classList.contains('bg-danger')) {
        arcColor = 'var(--bs-danger)';
      } else if (progressBar.classList.contains('bg-warning')) {
        arcColor = 'var(--bs-warning)';
      } else if (progressBar.classList.contains('bg-info')) {
        arcColor = 'var(--bs-info)';
      }
      
      // Apply the conic gradient
      const progressElement = $(this._element).find('.circle-progress');
      if (progressElement.length) {
        progressElement[0].style.background = `conic-gradient(${arcColor} 0deg, ${arcColor} ${angle}deg, var(--bs-gray-200) ${angle}deg, var(--bs-gray-200) 360deg)`;
      }
    },

    // Set horizontal progress
    _setHorizontalProgress: function (percent) {
      $(this._progressBar).css('width', `${percent}%`);
    }
  };

  // PROGRESS PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      const $this = $(this);
      let data = $this.data(Progress.DATA_KEY);
      const options = typeof option === 'object' && option;

      if (!data) {
        data = new Progress(this, options);
        $this.data(Progress.DATA_KEY, data);
      }

      if (typeof option === 'string') {
        if (typeof data[option] === 'undefined') {
          throw new TypeError(`No method named "${option}"`);
        }
        data[option]();
      } else if (options && options.animate) {
        data.initialize().animate();
      } else {
        data.initialize();
      }
    });
  }

  const old = $.fn.progress;

  $.fn.progress = Plugin;
  $.fn.progress.Constructor = Progress;

  // PROGRESS NO CONFLICT
  // ===================

  $.fn.progress.noConflict = function () {
    $.fn.progress = old;
    return this;
  };

  // PROGRESS DATA-API
  // ================

  $(document).on('DOMContentLoaded', function () {
    $('.progress').each(function () {
      const $progress = $(this);
      const targetValue = parseInt($progress.attr('aria-valuenow'), 10);
      const animate = $progress.data('animate') !== false;
      
      $progress.progress({
        animate: animate,
        duration: $progress.data('duration') || 1500
      });
      
      if (animate) {
        // Stagger the animations slightly
        const index = $progress.index('.progress');
        setTimeout(() => {
          $progress.data(Progress.DATA_KEY).animate(targetValue);
        }, index * 200);
      } else {
        $progress.data(Progress.DATA_KEY).setValue(targetValue);
      }
    });
  });

})(jQuery || window.jQuery); 
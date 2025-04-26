/**
 * Bootstrap Progress Bars - Enhanced progress bar component with circular progress and viewport animations
 * @version 1.0.0
 * @license MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? module.exports = factory()
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global = typeof globalThis !== 'undefined' ? globalThis : global || self,
        global.ProgressBar = factory());
})(this, (function () {
  'use strict';

  /**
   * Constants
   */
  const NAME = 'progressBar';
  const VERSION = '1.0.0';
  const DATA_KEY = 'bs.progressBar';
  const EVENT_KEY = `.${DATA_KEY}`;
  
  const EVENT_ANIMATION_START = `animation.start${EVENT_KEY}`;
  const EVENT_ANIMATION_COMPLETE = `animation.complete${EVENT_KEY}`;
  const EVENT_VALUE_CHANGED = `value.changed${EVENT_KEY}`;
  
  /**
   * Default configuration
   */
  const Default = {
    duration: 1500,
    easing: 'linear',
    animation: true,
    delay: 0,
    strokeWidth: 15,
    animateInViewport: true
  };

  /**
   * ProgressBar Class Definition
   * @class
   */
  class ProgressBar {
    /**
     * ProgressBar constructor
     * @param {HTMLElement} element - The target element
     * @param {Object} config - Configuration options
     */
    constructor(element, config = {}) {
      if (!element) {
        throw new Error('Element must be provided to ProgressBar constructor');
      }

      this._element = element;
      this._config = this._getConfig(config);
      this._isCircular = element.classList.contains('circular');
      this._targetValue = parseInt(element.getAttribute('aria-valuenow') || '0', 10);
      this._isAnimating = false;
      this._progressBar = element.querySelector('.progress-bar');
      this._isInViewport = false;
      this._hasBeenInViewport = false;
      
      // Set circle stroke width if specified in config
      if (this._isCircular && this._config.strokeWidth) {
        this._applyStrokeWidth(this._config.strokeWidth);
      }

      // Set up intersection observer for viewport-based animation
      if (this._config.animateInViewport) {
        this._setupIntersectionObserver();
      }
      
      // Store instance in element's data
      element.progressBar = this;
    }

    // Static properties
    /**
     * Version number
     * @static
     * @type {string}
     */
    static get VERSION() { return VERSION; }

    /**
     * Data attribute key for storing instance
     * @static
     * @type {string}
     */
    static get DATA_KEY() { return DATA_KEY; }

    /**
     * Event namespace
     * @static
     * @type {string}
     */
    static get EVENT_KEY() { return EVENT_KEY; }
    
    /**
     * Default configuration
     * @static
     * @type {object}
     */
    static get Default() {
      return Default;
    }
    
    /**
     * Event names object
     * @static
     * @type {object}
     */
    static get Event() {
      return {
        ANIMATION_START: EVENT_ANIMATION_START,
        ANIMATION_COMPLETE: EVENT_ANIMATION_COMPLETE,
        VALUE_CHANGED: EVENT_VALUE_CHANGED
      };
    }

    /**
     * Check if user prefers reduced motion
     * @static
     * @returns {boolean}
     */
    static get prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Private methods
    /**
     * Get configuration with defaults and data attributes
     * @private
     * @param {Object} config - Configuration passed in constructor
     * @returns {Object} - Complete configuration
     */
    _getConfig(config) {
      // Get base config with defaults
      let result = {
        ...Default
      };
      
      // Process data-bs-config attribute if present (as JSON)
      const configAttr = this._element.getAttribute('data-bs-config');
      
      if (configAttr) {
        try {
          const configJSON = JSON.parse(configAttr);
          result = { ...result, ...configJSON };
        } catch (e) {
          console.error('Error parsing data-bs-config attribute:', e);
        }
      }
      
      // Finally, add direct JS config options (highest precedence)
      result = { ...result, ...(config || {}) };
      
      return result;
    }
    
    /**
     * Set up intersection observer for viewport animation
     * @private
     */
    _setupIntersectionObserver() {
      const options = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // 50% of the element is visible
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this._hasBeenInViewport) {
            this._isInViewport = true;
            this._hasBeenInViewport = true;
            
            // Start animation when in viewport
            if (this._config.animation && !ProgressBar.prefersReducedMotion) {
              const delay = this._config.delay || 0;
              setTimeout(() => {
                this.animate(this._targetValue);
              }, delay);
            } else {
              this.setValue(this._targetValue);
            }
            
            // Disconnect observer once animation has started
            observer.disconnect();
          }
        });
      }, options);
      
      observer.observe(this._element);
    }
    
    /**
     * Apply stroke width to circular progress
     * @private
     * @param {number} width - Width in pixels
     */
    _applyStrokeWidth(width) {
      // Remove any existing thickness classes
      this._element.classList.remove('thickness-5px', 'thickness-15px');
      
      // Add a custom CSS variable for stroke width
      this._element.style.setProperty('--circle-thickness', `${width}px`);
    }
    
    /**
     * Get current progress value
     * @private
     * @returns {number} - Current percentage value (0-100)
     */
    _getCurrentValue() {
      if (this._isCircular) {
        const label = this._element.querySelector('.progress-label');
        return label ? parseInt(label.textContent, 10) : 0;
      } else {
        // Get the current width percentage
        const width = this._progressBar.style.width;
        
        if (width.indexOf('%') !== -1) {
          // If width is already in percentage
          return parseInt(width, 10);
        } else if (this._element.offsetWidth > 0) {
          // Calculate percentage based on pixel width
          const pixelWidth = parseFloat(width);
          return Math.round((pixelWidth / this._element.offsetWidth) * 100);
        }
        
        return 0;
      }
    }
    
    /**
     * Set circular progress visual appearance
     * @private
     * @param {number} percent - Percentage value (0-100)
     */
    _setCircularProgress(percent) {
      const angle = percent * 3.6; // 3.6 = 360 / 100
      
      // Update the text percentage
      const textElement = this._element.querySelector('.progress-label');
      if (textElement) {
        textElement.textContent = `${percent}%`;
      }
      
      // Set the arc color based on context class
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
      
      // Use Bootstrap's native progress background variable
      const trackColor = 'var(--bs-progress-bg)'; 
      
      // Apply the conic gradient
      const progressElement = this._element.querySelector('.circle-progress');
      if (progressElement) {
        progressElement.style.background = `conic-gradient(${arcColor} 0deg, ${arcColor} ${angle}deg, ${trackColor} ${angle}deg, ${trackColor} 360deg)`;
      }
    }
    
    /**
     * Set horizontal progress bar width
     * @private
     * @param {number} percent - Percentage value (0-100)
     */
    _setHorizontalProgress(percent) {
      this._progressBar.style.width = `${percent}%`;
    }
    
    /**
     * Dispatch custom event
     * @private
     * @param {string} eventName - Event name to dispatch
     * @param {Object} detail - Event detail object
     */
    _dispatchEvent(eventName, detail = {}) {
      const event = new CustomEvent(eventName, {
        bubbles: true,
        detail
      });
      
      this._element.dispatchEvent(event);
    }

    /**
     * Check if animation should be disabled based on user preference
     * @private
     * @returns {boolean}
     */
    _shouldDisableAnimation() {
      return ProgressBar.prefersReducedMotion;
    }
    
    // Public methods
    /**
     * Initialize progress bar to 0%
     * @public
     * @returns {ProgressBar} - Returns this instance for chaining
     */
    initialize() {
      this.setValue(0);
      return this;
    }
    
    /**
     * Set value without animation
     * @public
     * @param {number} percent - Percentage value (0-100)
     * @returns {ProgressBar} - Returns this instance for chaining
     */
    setValue(percent) {
      percent = Math.min(Math.max(parseInt(percent, 10), 0), 100);
      
      if (this._isCircular) {
        this._setCircularProgress(percent);
      } else {
        this._setHorizontalProgress(percent);
      }
      
      this._dispatchEvent(EVENT_VALUE_CHANGED, { value: percent });
      
      return this;
    }
    
    /**
     * Animate to target value
     * @public
     * @param {number|null} targetValue - Target percentage (0-100), or null to use aria-valuenow
     * @param {number|null} customDuration - Custom animation duration in ms, or null to use config
     * @returns {ProgressBar} - Returns this instance for chaining
     */
    animate(targetValue = null, customDuration = null) {
      if (this._isAnimating) return this;
      
      const startValue = this._getCurrentValue();
      this._targetValue = targetValue !== null ? Math.min(Math.max(parseInt(targetValue, 10), 0), 100) 
                                            : this._targetValue;
      const duration = customDuration || this._config.duration;
      
      if (startValue === this._targetValue) return this;
      
      // Check if animation should be disabled based on reduced motion preference
      if (this._shouldDisableAnimation()) {
        this.setValue(this._targetValue);
        this._dispatchEvent(EVENT_ANIMATION_COMPLETE, {
          value: this._targetValue
        });
        return this;
      }
      
      this._isAnimating = true;
      const startTime = performance.now();
      
      this._dispatchEvent(EVENT_ANIMATION_START, {
        startValue: startValue,
        targetValue: this._targetValue
      });

      const animate = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + progress * (this._targetValue - startValue));
        
        this.setValue(currentValue);
        
        if (progress < 1) {
          window.requestAnimationFrame(animate);
        } else {
          this._isAnimating = false;
          this._dispatchEvent(EVENT_ANIMATION_COMPLETE, {
            value: this._targetValue
          });
        }
      };
      
      window.requestAnimationFrame(animate);
      return this;
    }
    
    /**
     * Dispose the progress bar instance
     * @public
     */
    dispose() {
      // Clean up event listeners, observers, etc.
      this._element.progressBar = undefined;
    }
    
    // Static methods
    /**
     * Get instance from element
     * @static
     * @param {HTMLElement} element - DOM element
     * @returns {ProgressBar|null} - Instance or null if not found
     */
    static getInstance(element) {
      return element.progressBar;
    }
    
    /**
     * Get or create instance
     * @static
     * @param {HTMLElement} element - DOM element
     * @param {Object} config - Configuration options
     * @returns {ProgressBar} - New or existing instance
     */
    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, config);
    }

    /**
     * Initialize all progress bars in the document
     * @static
     */
    static initializeAll() {
      const progressBars = [...document.querySelectorAll('.progress')];
      
      progressBars.forEach(element => {
        // Initialize each progress bar
        ProgressBar.getOrCreateInstance(element);
        
        // If not using viewport animation, initialize values immediately
        const progress = ProgressBar.getInstance(element);
        
        if (!progress._config.animateInViewport) {
          progress.initialize();
          
          if (progress._config.animation && !ProgressBar.prefersReducedMotion) {
            const delay = progress._config.delay || 0;
            setTimeout(() => {
              progress.animate(progress._targetValue);
            }, delay);
          } else {
            progress.setValue(progress._targetValue);
          }
        } else {
          // If using viewport animation, just initialize to 0 and wait for viewport
          progress.initialize();
        }
      });
    }
  }

  /**
   * Initialize on DOM content loaded
   */
  document.addEventListener('DOMContentLoaded', () => {
    ProgressBar.initializeAll();
  });

  return ProgressBar;
})); 
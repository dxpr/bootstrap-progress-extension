/**
 * Bootstrap Progress Bar Extension - Enhanced progress bar component with circular progress and viewport animations
 * @version 1.0.0
 * @license MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ProgressBar = factory());
})(this, (function () {
  'use strict';
  const NAME = 'progressBar', VERSION = '1.0.0', DATA_KEY = 'bs.progressBar', EVENT_KEY = `.${DATA_KEY}`;
  const Default = {
    duration: 1500,
    animation: true,
    delay: 0,
    strokeWidth: 15,
    size: 120,
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
      this._isCircular = element.classList.contains('circular');
      this._progressBar = element.querySelector('.progress-bar');
      
      // Ensure the progress bar element exists
      if (!this._progressBar) {
        // If no progress-bar exists, create a default one (though this shouldn't happen with standard Bootstrap markup)
        this._progressBar = document.createElement('div');
        this._progressBar.className = 'progress-bar';
        element.appendChild(this._progressBar);
        console.warn('[ProgressBar Constructor] Progress element was missing a .progress-bar child, one was created.', element);
      }

      // Get and apply configuration first
      this._config = this._getConfig(config);
      if (this._isCircular) {
        if (this._config.strokeWidth) this._element.style.setProperty('--circle-thickness', `${this._config.strokeWidth}px`);
        if (this._config.size) this._element.style.setProperty('--circle-size', `${this._config.size}px`);

        // Dynamically add required elements if they don't exist
        if (!this._progressBar.querySelector('.circle-background')) {
          const background = document.createElement('div');
          background.className = 'circle-background';
          background.setAttribute('aria-hidden', 'true'); // Hide decorative element
          this._progressBar.appendChild(background);
        }
        if (!this._progressBar.querySelector('.circle-progress')) {
          const progress = document.createElement('div');
          progress.className = 'circle-progress';
          progress.setAttribute('aria-hidden', 'true'); // Hide decorative element
          this._progressBar.appendChild(progress);
        }
        if (!this._progressBar.querySelector('.progress-label')) {
          const label = document.createElement('div');
          label.className = 'progress-label';
          // Initialize with 0% - it will be updated by setValue/animate
          label.textContent = '0%'; 
          this._progressBar.appendChild(label);
        }
      }

      // Parse value from aria-valuenow attribute
      this._targetValue = parseInt(element.getAttribute('aria-valuenow') || '0', 10);
      this._isAnimating = false;
      this._isInViewport = false;
      this._hasBeenInViewport = false;

      // Set up intersection observer for viewport-based animation
      if (this._config.animateInViewport) {
        this._setupIntersectionObserver();
      }
      
      // Store instance in element's data
      element.progressBar = this;
      
      // Mark as initialized
      element.setAttribute('data-bs-progress-initialized', 'true');
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
      
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this._hasBeenInViewport) {
            this._isInViewport = this._hasBeenInViewport = true;
            
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
            this._observer.disconnect();
          }
        });
      }, options);
      
      this._observer.observe(this._element);
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
      
      // Set the CSS variable for the angle used by the CSS conic-gradient
      const progressElement = this._element.querySelector('.circle-progress');
      if (progressElement) {
        progressElement.style.setProperty('--progress-angle', `${angle}deg`);
      }
      
      // Update the text percentage
      const textElement = this._element.querySelector('.progress-label');
      if (textElement) {
        textElement.textContent = `${percent}%`;
      }
      
      // Color and background gradient are now handled by CSS using --arc-color and --progress-angle variables
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
    initialize() { return this.setValue(0); }
    
    /**
     * Set value without animation
     * @public
     * @param {number} percent - Percentage value (0-100)
     * @returns {ProgressBar} - Returns this instance for chaining
     */
    setValue(percent) {
      percent = Math.min(Math.max(parseInt(percent, 10), 0), 100);
      // Update the ARIA attribute for accessibility
      this._element.setAttribute('aria-valuenow', percent);
      // Update visual representation
      this._isCircular ? this._setCircularProgress(percent) : this._setHorizontalProgress(percent);
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
      // If no target value is provided, use the one from aria-valuenow
      this._targetValue = targetValue !== null ? Math.min(Math.max(parseInt(targetValue, 10), 0), 100) : this._targetValue;
      if (startValue === this._targetValue) return this;
      if (ProgressBar.prefersReducedMotion) { this.setValue(this._targetValue); return this; }
      this._isAnimating = true;
      const startTime = performance.now(), duration = customDuration || this._config.duration;
      const animate = timestamp => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        this.setValue(Math.floor(startValue + progress * (this._targetValue - startValue)));
        if (progress < 1) window.requestAnimationFrame(animate);
        else this._isAnimating = false;
      };
      window.requestAnimationFrame(animate);
      return this;
    }
    
    /**
     * Dispose the progress bar instance
     * @public
     */
    dispose() { this._element.progressBar = undefined; }
  }

  /**
   * Initialize all progress bars that haven't been initialized yet
   */
  function initProgressBars() {
    document.querySelectorAll('.progress:not([data-bs-progress-initialized])').forEach(element => {
      const progress = new ProgressBar(element);
      if (!progress._config.animateInViewport) {
        progress.initialize();
        if (progress._config.animation && !ProgressBar.prefersReducedMotion) {
          setTimeout(() => progress.animate(progress._targetValue), progress._config.delay || 0);
        } else progress.setValue(progress._targetValue);
      } else {
        // Initialize to 0 even if waiting for viewport, ensures label exists
        progress.initialize(); 
      }
    });
  }

  // Initialize progress bars on DOM content loaded
  document.addEventListener('DOMContentLoaded', initProgressBars);
  
  // Use MutationObserver to detect and initialize dynamically added progress bars
  const observer = new MutationObserver(mutations => {
    let shouldInit = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && 
              (node.matches('.progress:not([data-bs-progress-initialized])') || 
               node.querySelector('.progress:not([data-bs-progress-initialized])'))) {
            shouldInit = true;
            break;
          }
        }
        if (shouldInit) break;
      }
    }
    if (shouldInit) {
      initProgressBars();
    }
  });
  
  // Start observing the document body for added progress bars
  observer.observe(document.body, { childList: true, subtree: true });

  return ProgressBar;
})); 
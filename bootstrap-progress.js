/**
 * Bootstrap Progress - Animated progress bar plugin
 * Version 1.0.0
 */

(() => {
  'use strict';

  // PROGRESS CLASS DEFINITION
  // ========================
  
  class Progress {
    // Static properties
    static get VERSION() { return '1.0.0'; }
    static get DATA_KEY() { return 'bs.progress'; }
    static get EVENT_KEY() { return `.${Progress.DATA_KEY}`; }
    static get DATA_API_KEY() { return '.data-api'; }
    
    static get DefaultConfig() {
      return {
        duration: 1500,
        easing: 'linear',
        animation: true,
        delay: 0,
        strokeWidth: null,
        animateInViewport: true
      };
    }
    
    static get Event() {
      return {
        ANIMATION_START: `animationStart${Progress.EVENT_KEY}`,
        ANIMATION_COMPLETE: `animationComplete${Progress.EVENT_KEY}`,
        VALUE_CHANGED: `valueChanged${Progress.EVENT_KEY}`,
        LOAD_DATA_API: `load${Progress.EVENT_KEY}${Progress.DATA_API_KEY}`
      };
    }

    // Check if user prefers reduced motion
    static get prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Constructor
    constructor(element, config = {}) {
      this._element = element;
      this._config = this._getConfig(config);
      this._isCircular = element.classList.contains('circular');
      this._targetValue = parseInt(element.getAttribute('aria-valuenow'), 10);
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
      element.bsProgress = this;
    }

    // Private methods
    _getConfig(config) {
      // Get base config with defaults
      let result = {
        ...Progress.DefaultConfig
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
            if (this._config.animation && !Progress.prefersReducedMotion) {
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
    
    _applyStrokeWidth(width) {
      // Remove any existing thickness classes
      this._element.classList.remove('thickness-5px', 'thickness-15px');
      
      // Add a custom CSS variable for stroke width
      this._element.style.setProperty('--circle-thickness', `${width}px`);
    }
    
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
    
    _setCircularProgress(percent) {
      const angle = percent * 3.6; // 3.6 = 360 / 100
      
      // Update the text percentage
      const textElement = this._element.querySelector('.progress-label');
      if (textElement) {
        textElement.textContent = `${percent}%`;
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
      const progressElement = this._element.querySelector('.circle-progress');
      if (progressElement) {
        progressElement.style.background = `conic-gradient(${arcColor} 0deg, ${arcColor} ${angle}deg, var(--bs-gray-200) ${angle}deg, var(--bs-gray-200) 360deg)`;
      }
    }
    
    _setHorizontalProgress(percent) {
      this._progressBar.style.width = `${percent}%`;
    }
    
    _dispatchEvent(eventName, detail = {}) {
      const event = new CustomEvent(eventName, {
        bubbles: true,
        detail
      });
      
      this._element.dispatchEvent(event);
    }

    // Check if animation should be disabled based on user preference
    _shouldDisableAnimation() {
      return Progress.prefersReducedMotion;
    }
    
    // Public methods
    initialize() {
      this.setValue(0);
      return this;
    }
    
    setValue(percent) {
      percent = Math.min(Math.max(parseInt(percent, 10), 0), 100);
      
      if (this._isCircular) {
        this._setCircularProgress(percent);
      } else {
        this._setHorizontalProgress(percent);
      }
      
      this._dispatchEvent(Progress.Event.VALUE_CHANGED, { value: percent });
      
      return this;
    }
    
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
        this._dispatchEvent(Progress.Event.ANIMATION_COMPLETE, {
          value: this._targetValue
        });
        return this;
      }
      
      this._isAnimating = true;
      const startTime = performance.now();
      
      this._dispatchEvent(Progress.Event.ANIMATION_START, {
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
          this._dispatchEvent(Progress.Event.ANIMATION_COMPLETE, {
            value: this._targetValue
          });
        }
      };
      
      window.requestAnimationFrame(animate);
      return this;
    }
    
    // Static methods
    static getInstance(element) {
      return element.bsProgress;
    }
    
    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, config);
    }
  }

  // Initialize all progress bars when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    const progressBars = [...document.querySelectorAll('.progress')];
    
    progressBars.forEach(element => {
      // Initialize each progress bar
      Progress.getOrCreateInstance(element);
      
      // If not using viewport animation, initialize values immediately
      const progress = Progress.getInstance(element);
      
      if (!progress._config.animateInViewport) {
        progress.initialize();
        
        if (progress._config.animation && !Progress.prefersReducedMotion) {
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
  });

  // Export to window
  window.Progress = Progress;
})(); 
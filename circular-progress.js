// Simple function to set a circular progress bar percentage
function setCircularProgress(element, percent) {
  // Calculate the angle based on percentage (0-100)
  const angle = percent * 3.6; // 3.6 = 360 / 100
  
  // Get the progress element
  const progressElement = element.querySelector('.circle-progress');
  if (!progressElement) return;
  
  // Update the text percentage
  const textElement = element.querySelector('.progress-label');
  if (textElement) {
    textElement.textContent = `${percent}%`;
  }
  
  // Set the border color based on context class
  let arcColor = 'var(--bs-primary)'; // Default primary blue
  
  if (element.classList.contains('bg-success')) {
    arcColor = 'var(--bs-success)';
  } else if (element.classList.contains('bg-danger')) {
    arcColor = 'var(--bs-danger)';
  } else if (element.classList.contains('bg-warning')) {
    arcColor = 'var(--bs-warning)';
  } else if (element.classList.contains('bg-info')) {
    arcColor = 'var(--bs-info)';
  }
  
  // Apply the conic gradient directly with the correct color and angle
  progressElement.style.background = `conic-gradient(${arcColor} 0deg, ${arcColor} ${angle}deg, var(--bs-gray-200) ${angle}deg, var(--bs-gray-200) 360deg)`;
}

// Animate a single progress bar
function animateProgressBar(element, targetValue, duration = 1000) {
  let startTimestamp = null;
  const startValue = 0;
  
  // Animation step function
  function step(timestamp) {
    if (!startTimestamp) startTimestamp = timestamp;
    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(startValue + progress * (targetValue - startValue));
    
    setCircularProgress(element, currentValue);
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }
  
  // Start animation
  window.requestAnimationFrame(step);
}

// Main function to initialize and animate all progress bars
function initializeProgressBars() {
  // Get all circular progress bars
  const progressBars = document.querySelectorAll('.progress.circular .progress-bar');
  
  // Set initial state to 0 for all
  progressBars.forEach(bar => {
    setCircularProgress(bar, 0);
  });
  
  // Start animations with staggered delay
  progressBars.forEach((bar, index) => {
    const progressContainer = bar.closest('.progress');
    const targetValue = parseInt(progressContainer.getAttribute('aria-valuenow'), 10);
    
    // Stagger the animations slightly
    setTimeout(() => {
      animateProgressBar(bar, targetValue, 1500);
    }, index * 200);
  });
}

// Run when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProgressBars);
} else {
  // DOM already loaded
  initializeProgressBars();
} 
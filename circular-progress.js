// Function to set the progress of a circular progress bar
function setCircularProgress(element, percent) {
  // Calculate the angle based on percentage (0-100)
  const angle = percent * 3.6; // 3.6 = 360 / 100
  
  // Get the progress element
  const progressElement = element.querySelector('.circle-progress');
  if (!progressElement) return;
  
  // Update the aria attribute
  const progressBar = element.closest('.progress');
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', percent);
  }
  
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
  
  // Apply the conic gradient with the correct color and angle
  progressElement.style.background = `conic-gradient(${arcColor} 0deg, ${arcColor} ${angle}deg, var(--bs-gray-200) ${angle}deg, var(--bs-gray-200) 360deg)`;
}

// Add interactive controls to update progress bars
document.addEventListener('DOMContentLoaded', function() {
  // Add a range input to control all circular progress bars
  const controls = document.createElement('div');
  controls.className = 'mt-4 text-center';
  controls.innerHTML = `
    <label for="progress-control" class="form-label">Control Circle Progress</label>
    <input type="range" class="form-range w-50 mx-auto" id="progress-control" min="0" max="100" value="50">
  `;
  
  // Find the circular progress container and append controls
  const circularSection = document.querySelector('.section:last-child');
  circularSection.appendChild(controls);
  
  // Get all circular progress elements
  const circleProgressElements = document.querySelectorAll('.progress.circular .progress-bar');
  
  // Set initial values based on aria-valuenow
  circleProgressElements.forEach((element) => {
    const progressBar = element.closest('.progress');
    const initialValue = parseInt(progressBar.getAttribute('aria-valuenow'));
    setCircularProgress(element, initialValue);
  });
  
  // Add event listener to range input
  const rangeInput = document.getElementById('progress-control');
  rangeInput.addEventListener('input', function() {
    const percent = parseInt(this.value);
    
    // Update all circular progress bars
    circleProgressElements.forEach(element => {
      setCircularProgress(element, percent);
    });
  });
  
  // Add button to animate progress
  const animateButton = document.createElement('button');
  animateButton.className = 'btn btn-primary mt-3';
  animateButton.textContent = 'Animate Progress';
  
  // Add button to the controls
  controls.appendChild(animateButton);
  
  // Add animation functionality
  animateButton.addEventListener('click', function() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      if (progress > 100) {
        clearInterval(interval);
        return;
      }
      
      // Update range input
      rangeInput.value = progress;
      
      // Update all circular progress bars
      circleProgressElements.forEach(element => {
        setCircularProgress(element, progress);
      });
    }, 30);
  });
}); 
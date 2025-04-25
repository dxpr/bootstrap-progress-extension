# Bootstrap Circular Progress Bar Demo

A demonstration of Bootstrap 5.3's progress components with custom circular progress bars.

## Features

This demo showcases:

- Basic progress bars
- Progress bars with labels
- Height variations
- Colored progress bars (success, info, warning, danger)
- Striped progress bars
- Animated striped progress bars
- Multiple progress bars in a single container
- Custom circular progress bars with interactive controls

## Usage

1. Simply open `index.html` in a web browser to view the demonstration.
2. The circular progress bars at the bottom of the page include:
   - A slider to manually adjust all circular progress bars simultaneously
   - An "Animate Progress" button that animates the progress from 0% to 100%

## Technical Implementation

This demo uses:

- Bootstrap 5.3.5 loaded from CDN
- Custom CSS for circular progress bars using CSS pseudo-elements
- JavaScript for interactive functionality of circular progress bars
- Standard Bootstrap progress HTML structure for consistency

## How It Works

The circular progress bars are implemented using Bootstrap's standard HTML structure:

```html
<div class="progress circular" role="progressbar" aria-label="Circular progress" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar">
    <div class="progress-label">25%</div>
  </div>
</div>
```

Key features of the implementation:

- Uses the same HTML structure as standard Bootstrap progress bars for consistency
- The circular appearance is achieved through CSS styling and pseudo-elements
- Progress is visualized using a rotating semi-transparent border on a pseudo-element
- The rotation calculation is `-90 + (percent / 100 * 360)` degrees, applied via CSS variables
- Progress values are properly tracked with ARIA attributes for accessibility

## Customization

You can customize the circular progress bars by:

1. Changing the size by modifying the width and height in the CSS
2. Adjusting colors by using Bootstrap's contextual classes (bg-success, bg-info, etc.)
3. Modifying the border thickness in the ::before pseudo-element

## Browser Compatibility

This demo works in all modern browsers that support:
- CSS transforms
- CSS variables
- CSS pseudo-elements
- Border radius
- JavaScript ES6 features 
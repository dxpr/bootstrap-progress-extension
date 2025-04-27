[![npm version](https://img.shields.io/npm/v/bootstrap-progress-extension)](https://www.npmjs.com/package/bootstrap-progress-extension)
[![npm downloads](https://img.shields.io/npm/dm/bootstrap-progress-extension)](https://www.npmjs.com/package/bootstrap-progress-extension)
[![GitHub repo stars](https://img.shields.io/github/stars/dxpr/bootstrap-progress-extension?style=social)](https://github.com/dxpr/bootstrap-progress-extension)

# Bootstrap Progress Bar Extension

Enhanced progress components with circular progress and animations for Bootstrap 5.

**[View Live Demo](https://dxpr.github.io/bootstrap-progress-extension/)**

![Demo of Bootstrap Progress Bar Extension](docs/images/progress-bar-extension2.gif)

## Features

This package provides:

- Standard Bootstrap Progress Bar Extension with animation
- Custom circular progress bars with animation
- Viewport-based animation triggers
- Configurable animation duration and delays
- Two configuration methods:
  - Individual `data-bs-*` attributes (Recommended, aligns with Bootstrap)
  - Single `data-bs-config` JSON attribute (Legacy)
- Multiple color variants (primary, success, info, warning, danger, etc.)
- Stroke width and size customization for circular progress
- Built-in accessibility features (ARIA, reduced motion)
- Lightweight implementation
- Support for dynamically added progress bars

## Installation

```bash
npm install bootstrap-progress-extension
```

Include the CSS and JavaScript files in your project:

```html
<!-- For production -->
<link href="path/to/bootstrap-progress-extension.min.css" rel="stylesheet">
<script src="path/to/bootstrap-progress-extension.min.js"></script>

<!-- For development/debugging -->
<link href="path/to/bootstrap-progress-extension.css" rel="stylesheet">
<script src="path/to/bootstrap-progress-extension.js"></script>
```

## Usage

Progress bars are configured primarily using data attributes. You can use individual attributes (recommended) or a single JSON attribute.

**Precedence:** JavaScript constructor options > Individual `data-bs-*` attributes > `data-bs-config` JSON > Defaults.

### Basic Progress Bar

```html
<!-- Using individual attributes (Recommended) -->
<div class="progress" role="progressbar" aria-label="Basic example"
     aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"
     data-bs-duration="2000" data-bs-animation>
  <div class="progress-bar"></div>
</div>

<!-- Using JSON attribute -->
<div class="progress" role="progressbar" aria-label="Basic example (JSON)"
     aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"
     data-bs-config='{"duration": 2500, "animation": true}'>
  <div class="progress-bar bg-info"></div>
</div>
```

### Circular Progress Bar

**Important:** For circular progress bars, include the standard `.progress.circular` and `.progress-bar` elements, along with a `<div class="progress-label">...%</div>` inside the `.progress-bar`. The script automatically injects the necessary decorative elements (`.circle-background`, `.circle-progress`). **Do not include them in your source HTML.**

```html
<!-- Using individual attributes (Recommended) -->
<div class="progress circular" role="progressbar" aria-label="Circular progress"
     aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"
     data-bs-stroke-width="15" data-bs-animate-in-viewport="true" data-bs-animation>
  <div class="progress-bar bg-success">
    <div class="progress-label">75%</div>
    <!-- .circle-background and .circle-progress are added here -->
  </div>
</div>

<!-- Using JSON attribute -->
<div class="progress circular" role="progressbar" aria-label="Circular progress (JSON)"
     aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
     data-bs-config='{"strokeWidth": 10, "size": 150, "animation": true}'>
  <div class="progress-bar bg-danger">
    <div class="progress-label">60%</div>
    <!-- .circle-background and .circle-progress are added here -->
  </div>
</div>
```

### RTL Support (Right-to-Left)

Wrap your progress bar in a container with `dir="rtl"`. Configuration works the same way.

```html
<div dir="rtl">
  <!-- Circular Progress in RTL (Individual Attrs) -->
  <div class="progress circular" role="progressbar" aria-label="تقدم دائري"
       aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"
       data-bs-stroke-width="15" data-bs-duration="2000" data-bs-animation>
    <div class="progress-bar bg-primary">
      <div class="progress-label">٦٥٪</div>
    </div>
  </div>

  <!-- Standard Progress Bar in RTL (Individual Attrs) -->
  <div class="progress" role="progressbar" aria-label="شريط التقدم"
       aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"
       data-bs-duration="1800" data-bs-animation>
    <div class="progress-bar bg-success"></div>
  </div>
</div>
```

### Dynamic Creation

Progress bars added dynamically to the DOM after page load will be automatically initialized:

```javascript
// Create a progress bar dynamically
const progressBar = document.createElement('div');
progressBar.className = 'progress';
progressBar.setAttribute('role', 'progressbar');
progressBar.setAttribute('aria-label', 'Dynamic progress');
progressBar.setAttribute('aria-valuenow', '60');
progressBar.setAttribute('aria-valuemin', '0');
progressBar.setAttribute('aria-valuemax', '100');

const bar = document.createElement('div');
bar.className = 'progress-bar bg-success';
bar.style.width = '0%';

progressBar.appendChild(bar);
// Example of setting individual attributes dynamically
progressBar.setAttribute('data-bs-animation', 'true');
progressBar.setAttribute('data-bs-duration', '1000');
document.body.appendChild(progressBar);
// No manual initialization needed - MutationObserver will detect and initialize it
```

## Configuration Options

Configuration can be set via data attributes. Individual `data-bs-*` attributes are recommended.

**Precedence:** JavaScript constructor options > Individual `data-bs-*` attributes > `data-bs-config` JSON > Defaults.

| Attribute / Option      | Type    | Default | Description |
|-------------------------|---------|---------|-------------|
| `data-bs-stroke-width`  | Number  | `15`    | (Circular only) Stroke width in pixels. Corresponds to `strokeWidth` JS/JSON option. |
| `data-bs-size`          | Number  | `120`   | (Circular only) Size in pixels. Corresponds to `size` JS/JSON option. |
| `data-bs-duration`      | Number  | `1500`  | Animation duration in milliseconds. Corresponds to `duration` JS/JSON option. |
| `data-bs-delay`         | Number  | `0`     | Delay before animation starts in milliseconds. Corresponds to `delay` JS/JSON option. |
| `data-bs-animation`     | Boolean | `true`  | Enable animation. Omit or set `="false"` to disable. Corresponds to `animation` JS/JSON option. |
| `data-bs-animate-in-viewport` | Boolean | `true` | Only animate when the element enters the viewport. Set `="false"` to disable. Corresponds to `animateInViewport` JS/JSON option. |
| `data-bs-config`        | String  | `null`  | (Legacy) A JSON string containing multiple options (e.g., `'{"strokeWidth": 10, "animation": true}'`). |

**Note:** For boolean attributes like `data-bs-animation`, simply adding the attribute implies `true`. You only need to add `="false"` to explicitly disable it.

## CSS Variables

The appearance of the circular progress bars can be customized using the following CSS custom properties:

| Variable             | Description                                                                 | Default Value | Controlled By           |
| -------------------- | --------------------------------------------------------------------------- | ------------- | ----------------------- |
| `--circle-size`      | The overall width and height of the circular progress component.            | `120px`       | `size` config option    |
| `--circle-thickness` | The thickness of the progress ring.                                         | `15px`        | `strokeWidth` config option |
| `--arc-color`        | The color of the progress arc. Determined by `bg-*` classes.                | `var(--bs-progress-bar-bg)` | `bg-*` CSS class        |
| `--progress-angle`   | The calculated angle (0-360deg) representing the current progress visually. | `0deg`        | JavaScript (`setValue`) |

**Note:** While `--arc-color` and `--progress-angle` are used internally, you typically control the appearance via configuration options (`data-bs-size`, `data-bs-stroke-width`) and standard Bootstrap background utility classes (`bg-primary`, `bg-success`, etc.) rather than setting these CSS variables directly.

### Bootstrap Variable Usage

This extension leverages standard Bootstrap CSS variables for theming and consistency:

| Bootstrap Variable      | How It's Used                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--bs-progress-bg`      | Background color for the track of standard progress bars and the inactive portion of the circular progress ring.    |
| `--bs-progress-bar-bg`  | Default color for the active arc of circular progress bars (used when no specific `bg-*` class is applied).       |
| `--bs-success`          | Color for the active arc when `.bg-success` is used on the circular progress bar.                                |
| `--bs-danger`           | Color for the active arc when `.bg-danger` is used on the circular progress bar.                                 |
| `--bs-warning`          | Color for the active arc when `.bg-warning` is used on the circular progress bar.                                |
| `--bs-info`             | Color for the active arc when `.bg-info` is used on the circular progress bar.                                   |
| `--bs-body-bg`          | Background color used for the inner cutout area of the circular progress bar (to match the page background).       |
| `--bs-body-color`       | Default text color for the percentage label inside circular progress bars.                                        |
| `--bs-dark`             | Text color used for the percentage label specifically when the circular progress bar has the `.bg-light` class. |

## JavaScript API

Working with progress bars programmatically:

```javascript
// Create a new progress bar instance
const progressElement = document.querySelector('.progress');
const progressBar = new ProgressBar(progressElement);

// Set value without animation
progressBar.setValue(75);

// Animate to value (target percentage, optional duration)
progressBar.animate(90, 2000);

// Initialize to 0%
progressBar.initialize();
```

## Accessibility Features

Bootstrap Progress Bar Extension are built with accessibility in mind:

- **ARIA Support**: All progress bars use proper ARIA attributes (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`)
- **Reduced Motion**: Automatically respects the user's `prefers-reduced-motion` browser setting, disabling animations for users who prefer reduced motion
- **Text Labels**: Circular progress bars include visible text labels showing the current progress percentage
- **Color Contrast**: All components maintain proper contrast ratios between background, foreground, and text elements
- **RTL Support**: Full support for right-to-left languages using the `dir="rtl"` attribute
- **Responsive Design**: Components adapt to different screen sizes for usability on mobile devices

## Browser Compatibility

- Chrome/Edge 60+
- Firefox 60+
- Safari 12+
- iOS 12+
- Not compatible with Internet Explorer

## License

MIT
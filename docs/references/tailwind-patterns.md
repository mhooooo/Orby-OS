# Tailwind CSS Best Practices

## Class Organization Convention

Order classes consistently:
1. Layout (display, position, flex/grid)
2. Sizing (width, height, padding, margin)
3. Typography (font, text)
4. Visual (background, border, shadow)
5. Interactive (hover, focus, transition)

```html
<div class="flex items-center justify-between w-full p-4 text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
```

## Dark Mode Patterns

### System Preference (Default)
```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content adapts to OS setting
</div>
```

### Manual Toggle with Class
```css
/* In globals.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

```html
<html class="dark">
  <body>
    <div class="bg-white dark:bg-black">...</div>
  </body>
</html>
```

### JavaScript Toggle
```javascript
// Toggle based on user preference or stored setting
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
);
```

## Responsive Design

### Breakpoint Prefixes
```html
<!-- Mobile first: base styles, then override at breakpoints -->
<div class="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>

<div class="animate-none md:animate-spin">
  Animation only on medium+ screens
</div>

<button class="duration-0 md:duration-150">
  Transition duration changes
</button>
```

### Common Breakpoints
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+
- `2xl:` - 1536px+

## Animation Utilities

### Built-in Animations
```html
<div class="animate-spin">Loading...</div>
<div class="animate-pulse">Skeleton</div>
<div class="animate-bounce">Attention</div>
<div class="animate-ping">Notification</div>
```

### Custom Shimmer Animation
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
```

### Transition Utilities
```html
<button class="transition-colors duration-300 ease-in-out hover:bg-blue-600">
  Smooth color change
</button>

<div class="transition-all duration-500 hover:scale-105 hover:shadow-lg">
  Scale and shadow on hover
</div>
```

## Glassmorphism Pattern

```html
<div class="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] rounded-3xl">
  Glass card
</div>
```

## Custom Shadows (Tailwind v4)

```css
@theme inline {
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.36);
  --shadow-glow-coral: 0 0 20px rgba(255, 107, 53, 0.3);
  --shadow-glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3);
}
```

Usage: `shadow-glass`, `shadow-glow-coral`

## Interactive States

### Hover + Focus Combination
```html
<button class="bg-coral-500 hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 focus:ring-offset-black">
  Accessible button
</button>
```

### Group Hover
```html
<div class="group p-4 hover:bg-gray-800">
  <span class="text-gray-500 group-hover:text-white">
    Child changes on parent hover
  </span>
</div>
```

### Peer Selectors
```html
<input class="peer" type="checkbox" />
<label class="peer-checked:text-green-500">
  Changes when input is checked
</label>
```

## Color Opacity Shorthand

```html
<!-- Modern syntax -->
<div class="bg-white/10 text-black/80 border-white/5">
  10% white bg, 80% black text, 5% white border
</div>
```

## Arbitrary Values

```html
<div class="w-[327px] h-[195px] bg-[#1E1F20] rounded-[32px]">
  Custom values when tokens don't fit
</div>
```

## Common Patterns for Dark UI

```html
<!-- Card -->
<div class="bg-[#1E1F20] border border-white/5 rounded-3xl p-6">

<!-- Input -->
<input class="bg-[#282A2C] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:bg-[#1E1F20]" />

<!-- Primary Button -->
<button class="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold rounded-xl px-6 py-3">

<!-- Ghost Button -->
<button class="bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl px-6 py-3 border border-white/10 hover:border-white/20">

<!-- Text Hierarchy -->
<h1 class="text-white">Primary</h1>
<p class="text-gray-400">Secondary</p>
<span class="text-gray-500">Muted</span>
```

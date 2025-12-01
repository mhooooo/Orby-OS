# Cloudinary Integration Guide

## Overview

This project uses Cloudinary for optimized image delivery with automatic format selection (WebP/AVIF), quality optimization, responsive sizing, and blur placeholders for improved performance.

## Setup

### 1. Get Cloudinary Account

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name from the [Console](https://cloudinary.com/console)

### 2. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

Note: This is already documented in `.env.example` as an optional variable.

### 3. Upload Images to Cloudinary

Upload course images to your Cloudinary account:

1. Go to Media Library in Cloudinary Console
2. Create a folder structure (e.g., `courses/`, `fleet/`, `tours/`)
3. Upload images
4. Note the public IDs (e.g., `courses/alpine-golf.jpg`)

## Usage

### Basic Usage

```tsx
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Course"
  width={800}
  height={400}
/>
```

### With Blur Placeholder

```tsx
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Course"
  width={800}
  height={400}
  blur // Generates low-quality placeholder
  priority // For above-the-fold images
/>
```

### Custom Transformations

```tsx
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Course"
  width={800}
  height={400}
  transforms="c_fill,g_auto" // Custom Cloudinary transforms
  quality={80}
  format="webp"
/>
```

### Fallback to External URLs

The component automatically handles external URLs (non-Cloudinary):

```tsx
<CloudinaryImage
  src="https://images.unsplash.com/photo-123456"
  alt="Golf Course"
  width={800}
  height={400}
/>
```

## Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | Required | Cloudinary public ID or full URL |
| `alt` | `string` | Required | Alt text for accessibility |
| `width` | `number` | Required | Image width in pixels |
| `height` | `number` | Required | Image height in pixels |
| `className` | `string` | - | Additional CSS classes |
| `priority` | `boolean` | `false` | Priority loading for above-fold images |
| `blur` | `boolean` | `false` | Enable blur placeholder |
| `transforms` | `string` | - | Custom Cloudinary transforms |
| `quality` | `number` | `auto` | Image quality (1-100) |
| `format` | `'auto' \| 'webp' \| 'avif' \| 'jpg' \| 'png'` | `'auto'` | Image format |
| `objectFit` | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | CSS object-fit |
| `objectPosition` | `string` | `'center'` | CSS object-position |
| `onLoad` | `() => void` | - | Load callback |
| `onError` | `() => void` | - | Error callback |

### Automatic Optimizations

The component automatically applies:

- **Responsive Width**: `w_auto` or specific width
- **Auto Quality**: `q_auto` (unless specified)
- **Auto Format**: `f_auto` (WebP/AVIF based on browser support)
- **Blur Placeholder**: `e_blur:1000,q_1,w_20` for LQIP

## Image URL Structure

### Cloudinary Public ID

```
courses/alpine-golf.jpg
```

Becomes:

```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_800,q_auto,f_auto/courses/alpine-golf.jpg
```

### Full Cloudinary URL

```
https://res.cloudinary.com/demo/image/upload/sample.jpg
```

Used as-is.

### External URL

```
https://images.unsplash.com/photo-123456
```

Passes through to Next.js Image without Cloudinary transforms.

## Migration Strategy

### Phase 1: Enable Cloudinary (Current)

1. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
2. Use CloudinaryImage component
3. Keep existing Unsplash URLs as fallback

### Phase 2: Upload Images

1. Upload course images to Cloudinary
2. Update database course records with Cloudinary public IDs
3. Test all image loading

### Phase 3: Remove External Dependencies

1. Replace all Unsplash URLs with Cloudinary IDs
2. Remove Unsplash from `next.config.ts` remote patterns

## Files Modified

### Created

- `/src/components/ui/CloudinaryImage.tsx` - Main component

### Updated

- `/next.config.ts` - Added Cloudinary to remote patterns
- `/src/components/generative-ui/CourseCard.tsx` - Uses CloudinaryImage
- `/src/components/generative-ui/CourseDetailCard.tsx` - Uses CloudinaryImage

## Performance Benefits

### Before Cloudinary

- Large JPEG files (500KB-2MB)
- No responsive sizing
- No format optimization
- No blur placeholders

### After Cloudinary

- WebP/AVIF format (~60% smaller)
- Responsive sizing (only load what's needed)
- Auto quality optimization
- Blur placeholders (perceived performance)
- CDN delivery (global edge caching)

## Cloudinary Transformations Reference

### Common Transforms

```
c_fill,g_auto          // Crop to fill, auto gravity
c_fit                  // Fit within dimensions
c_scale                // Scale to dimensions
e_blur:300             // Blur effect
q_auto:eco             // Eco quality (smaller)
q_auto:good            // Good quality (balanced)
q_auto:best            // Best quality (larger)
f_auto                 // Auto format (WebP/AVIF)
dpr_2.0                // 2x DPR for retina
```

### Chaining Transforms

```tsx
transforms="c_fill,g_auto,e_sharpen:100"
```

## Troubleshooting

### Images Not Loading

1. Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
2. Verify public ID exists in Cloudinary
3. Check browser console for errors
4. Ensure image is uploaded and published

### Blur Placeholder Not Working

1. Ensure `blur` prop is `true`
2. Verify Cloudinary URL is valid
3. Check that public ID is correct

### External URLs Not Working

1. Verify URL is in `next.config.ts` remote patterns
2. Check CORS headers on external domain
3. Ensure URL is HTTPS

## Next Steps

1. Upload high-quality course images to Cloudinary
2. Create organized folder structure (`courses/`, `fleet/`, `tours/`)
3. Update database with Cloudinary public IDs
4. Monitor image performance with Cloudinary Analytics
5. Consider implementing responsive image breakpoints
6. Add lazy loading for below-fold images

## Resources

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- [Cloudinary Transformations](https://cloudinary.com/documentation/image_transformations)

# CloudinaryImage Component - Usage Examples

## Basic Examples

### Carousel Images (320x400)

```tsx
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={320}
  height={400}
  blur
  className="w-full h-full"
  objectFit="cover"
/>
```

### Hero Images (1200x384)

```tsx
<CloudinaryImage
  src="courses/thai-country-club.jpg"
  alt="Thai Country Club"
  width={1200}
  height={384}
  priority
  blur
  className="absolute inset-0"
  objectFit="cover"
/>
```

### Thumbnails (200x150)

```tsx
<CloudinaryImage
  src="courses/blue-canyon.jpg"
  alt="Blue Canyon Country Club"
  width={200}
  height={150}
  blur
  className="rounded-xl"
/>
```

## Advanced Examples

### Custom Transformations

```tsx
// Crop and focus on center
<CloudinaryImage
  src="courses/siam-country-club.jpg"
  alt="Siam Country Club"
  width={800}
  height={600}
  transforms="c_fill,g_auto,e_sharpen:100"
  quality={85}
/>

// Artistic blur overlay
<CloudinaryImage
  src="courses/phoenix-gold.jpg"
  alt="Phoenix Gold Golf Club"
  width={400}
  height={300}
  transforms="e_art:hokusai"
/>

// Black and white effect
<CloudinaryImage
  src="courses/vintage-course.jpg"
  alt="Vintage Course"
  width={600}
  height={400}
  transforms="e_grayscale"
/>
```

### Responsive Images

```tsx
// Mobile-optimized
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={375}
  height={250}
  className="block md:hidden"
/>

// Desktop-optimized
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={1200}
  height={600}
  className="hidden md:block"
  priority
/>
```

### Loading States

```tsx
function CourseImage({ course }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      <CloudinaryImage
        src={course.heroImage}
        alt={course.name}
        width={800}
        height={400}
        blur
        onLoad={() => setIsLoaded(true)}
        onError={() => console.error('Failed to load image')}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}
    </div>
  );
}
```

## Migration Examples

### Before (Using Background Image)

```tsx
<div
  className="absolute inset-0 bg-cover bg-center"
  style={{ backgroundImage: `url(${course.heroImage})` }}
/>
```

### After (Using CloudinaryImage)

```tsx
<CloudinaryImage
  src={course.heroImage}
  alt={course.name}
  width={1200}
  height={384}
  priority
  blur
  className="absolute inset-0"
  objectFit="cover"
/>
```

### Before (Using Next/Image Directly)

```tsx
<Image
  src={course.heroImage}
  alt={course.name}
  width={800}
  height={400}
  className="rounded-2xl"
/>
```

### After (Using CloudinaryImage with Optimizations)

```tsx
<CloudinaryImage
  src={course.heroImage}
  alt={course.name}
  width={800}
  height={400}
  blur
  className="rounded-2xl"
  objectFit="cover"
/>
```

## Real Component Examples

### CourseCard.tsx

```tsx
// Inside motion.div with zoom effect
<motion.div
  className="absolute inset-0"
  animate={{ scale: isExpanded ? 1.05 : 1 }}
  whileHover={{ scale: isExpanded ? 1.05 : 1.1 }}
  transition={{ duration: 0.6 }}
>
  <CloudinaryImage
    src={course.heroImage}
    alt={course.name}
    width={320}
    height={400}
    blur
    className="w-full h-full"
    objectFit="cover"
  />
</motion.div>
```

### CourseDetailCard.tsx

```tsx
// Hero section with overlay
<div className="relative h-96">
  <CloudinaryImage
    src={course.heroImage}
    alt={course.name}
    width={1200}
    height={384}
    priority
    blur
    className="absolute inset-0"
    objectFit="cover"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
</div>
```

### FleetCard (Future)

```tsx
<CloudinaryImage
  src="fleet/luxury-van.jpg"
  alt="Luxury Mercedes-Benz Sprinter"
  width={600}
  height={400}
  blur
  className="w-full rounded-2xl"
/>
```

## Format Examples

### Auto Format (Recommended)

```tsx
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={800}
  height={400}
  format="auto" // WebP/AVIF based on browser support
/>
```

### Specific Format

```tsx
// Force WebP
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={800}
  height={400}
  format="webp"
/>

// Force AVIF (smaller, newer)
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={800}
  height={400}
  format="avif"
/>
```

## Quality Examples

### Auto Quality (Recommended)

```tsx
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={800}
  height={400}
  // No quality prop = q_auto
/>
```

### Custom Quality

```tsx
// High quality for hero images
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={1200}
  height={600}
  quality={90}
  priority
/>

// Lower quality for thumbnails
<CloudinaryImage
  src="courses/alpine-golf.jpg"
  alt="Alpine Golf Club"
  width={200}
  height={150}
  quality={70}
/>
```

## Database Integration

### Course Schema with Cloudinary IDs

```typescript
interface Course {
  id: string;
  name: string;
  heroImage: string; // "courses/alpine-golf.jpg"
  galleryImages?: string[]; // ["courses/alpine-golf-1.jpg", "courses/alpine-golf-2.jpg"]
  // ... other fields
}
```

### Rendering Course Images

```tsx
function CourseGallery({ course }: { course: Course }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {course.galleryImages?.map((image, index) => (
        <CloudinaryImage
          key={index}
          src={image}
          alt={`${course.name} - View ${index + 1}`}
          width={400}
          height={300}
          blur
          className="rounded-xl"
        />
      ))}
    </div>
  );
}
```

## Performance Optimization

### Above-the-Fold Images

```tsx
// Use priority for immediately visible images
<CloudinaryImage
  src={course.heroImage}
  alt={course.name}
  width={1200}
  height={600}
  priority
  blur
/>
```

### Below-the-Fold Images

```tsx
// Default lazy loading for below-fold images
<CloudinaryImage
  src={course.heroImage}
  alt={course.name}
  width={800}
  height={400}
  blur
  // No priority = lazy load
/>
```

### Carousel Images

```tsx
// First 2-3 images with priority
{courses.map((course, index) => (
  <CloudinaryImage
    key={course.id}
    src={course.heroImage}
    alt={course.name}
    width={320}
    height={400}
    priority={index < 3}
    blur
  />
))}
```

## Error Handling

### With Fallback

```tsx
function CourseImageWithFallback({ course }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-96 bg-gray-800 flex items-center justify-center">
        <span className="text-gray-500">Image unavailable</span>
      </div>
    );
  }

  return (
    <CloudinaryImage
      src={course.heroImage}
      alt={course.name}
      width={800}
      height={400}
      onError={() => setHasError(true)}
    />
  );
}
```

## Best Practices

1. **Always provide blur placeholders** for perceived performance
2. **Use priority for above-fold images** (hero, first carousel items)
3. **Match width/height to actual display size** to avoid oversized downloads
4. **Use auto format and quality** unless you have specific requirements
5. **Provide descriptive alt text** for accessibility
6. **Use consistent folder structure** in Cloudinary (e.g., courses/, fleet/)
7. **Lazy load below-fold images** to improve initial page load
8. **Test on slow connections** to ensure blur placeholders work

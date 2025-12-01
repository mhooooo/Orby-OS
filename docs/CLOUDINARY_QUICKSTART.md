# Cloudinary Quick Start Guide

## 5-Minute Setup

### Step 1: Get Cloudinary Account (2 minutes)

1. Go to [cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up with email or GitHub
3. Go to [console.cloudinary.com](https://console.cloudinary.com)
4. Copy your **Cloud Name** from the dashboard

### Step 2: Configure Environment (30 seconds)

Add to `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

Replace `your-cloud-name` with the value from Step 1.

### Step 3: Upload Test Image (2 minutes)

1. Go to **Media Library** in Cloudinary console
2. Click **Upload**
3. Create folder: `courses`
4. Upload a golf course image
5. Note the public ID (e.g., `courses/test-course.jpg`)

### Step 4: Test Integration (30 seconds)

Update a course in your database:

```sql
UPDATE courses
SET hero_image = 'courses/test-course.jpg'
WHERE id = 'your-course-id';
```

Or use the existing component:

```tsx
<CloudinaryImage
  src="courses/test-course.jpg"
  alt="Test Course"
  width={800}
  height={400}
  blur
/>
```

### Step 5: Verify (30 seconds)

1. Run `npm run dev`
2. Navigate to a course page
3. Open DevTools Network tab
4. Look for URLs containing `res.cloudinary.com`
5. Verify images load with WebP/AVIF format

## You're Done!

Your Cloudinary integration is now active. Images will be:
- Automatically optimized (WebP/AVIF)
- Responsively sized
- CDN-delivered
- With blur placeholders

## Next Steps

### Immediate
- [ ] Upload all course images to Cloudinary
- [ ] Update database with Cloudinary public IDs
- [ ] Test on mobile devices

### Soon
- [ ] Update FleetCard, TourShowcase, ServiceBento
- [ ] Measure performance improvements
- [ ] Set up monitoring

### Later
- [ ] Configure responsive breakpoints
- [ ] Set up named transformations
- [ ] Optimize for Core Web Vitals

## Common Issues

### Images Not Loading

**Problem**: Images show "Failed to load image"

**Solutions**:
1. Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set correctly
2. Verify public ID exists in Cloudinary
3. Check browser console for 404 errors
4. Ensure image is published (not draft)

### No Optimization

**Problem**: Images still loading as JPEG

**Solutions**:
1. Verify environment variable is set
2. Restart dev server after changing `.env.local`
3. Check Network tab for Cloudinary URLs
4. Clear browser cache

### Blur Placeholder Not Showing

**Problem**: No blur effect during loading

**Solutions**:
1. Ensure `blur` prop is set to `true`
2. Verify Cloudinary public ID is correct (not external URL)
3. Check browser supports blur placeholder
4. Test with slower connection

## Folder Structure (Recommended)

```
Cloudinary Media Library
├── courses/
│   ├── alpine-golf.jpg
│   ├── thai-country-club.jpg
│   └── blue-canyon.jpg
├── fleet/
│   ├── luxury-van.jpg
│   └── executive-suv.jpg
├── tours/
│   ├── bangkok-tour.jpg
│   └── phuket-tour.jpg
└── services/
    ├── tee-time.jpg
    └── transport.jpg
```

## Testing Checklist

- [ ] Course carousel loads with Cloudinary images
- [ ] Course detail page shows hero image
- [ ] Images show blur placeholders while loading
- [ ] Network tab shows WebP/AVIF format
- [ ] Images load quickly on slow connection
- [ ] External URLs (Unsplash) still work as fallback

## Cheat Sheet

### Basic Usage
```tsx
<CloudinaryImage src="courses/alpine-golf.jpg" alt="Alpine" width={800} height={400} blur />
```

### Priority (Above-fold)
```tsx
<CloudinaryImage src="courses/hero.jpg" alt="Hero" width={1200} height={600} priority blur />
```

### Custom Quality
```tsx
<CloudinaryImage src="courses/course.jpg" alt="Course" width={800} height={400} quality={85} />
```

### Custom Transforms
```tsx
<CloudinaryImage src="courses/course.jpg" alt="Course" width={800} height={400} transforms="c_fill,g_auto" />
```

## Resources

- **Integration Guide**: `/docs/CLOUDINARY_INTEGRATION.md`
- **Usage Examples**: `/docs/CLOUDINARY_USAGE_EXAMPLES.md`
- **Migration Checklist**: `/docs/CLOUDINARY_MIGRATION_CHECKLIST.md`
- **Summary**: `/docs/CLOUDINARY_SUMMARY.md`

## Support

- Cloudinary Docs: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- Next.js Image: [nextjs.org/docs/pages/building-your-application/optimizing/images](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- Transformations: [cloudinary.com/documentation/image_transformations](https://cloudinary.com/documentation/image_transformations)

---

**Ready to optimize?** Start uploading images to Cloudinary and see immediate performance improvements!

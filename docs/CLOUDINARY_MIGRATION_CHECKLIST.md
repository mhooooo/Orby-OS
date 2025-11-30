# Cloudinary Migration Checklist

## Pre-Migration

- [x] Create Cloudinary account
- [ ] Get Cloud Name from console
- [ ] Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to `.env.local`
- [x] Install CloudinaryImage component
- [x] Update `next.config.ts` with Cloudinary remote patterns

## Image Upload

### Course Images (Priority 1)

Folder: `courses/`

- [ ] Thai Country Club - `courses/thai-country-club.jpg`
- [ ] Alpine Golf Club - `courses/alpine-golf.jpg`
- [ ] Siam Country Club - `courses/siam-country-club.jpg`
- [ ] Blue Canyon Country Club - `courses/blue-canyon.jpg`
- [ ] Phoenix Gold Golf & Country Club - `courses/phoenix-gold.jpg`
- [ ] Black Mountain Golf Club - `courses/black-mountain.jpg`
- [ ] Santiburi Koh Samui - `courses/santiburi-samui.jpg`
- [ ] Red Mountain Golf Club - `courses/red-mountain.jpg`
- [ ] Banyan Tree Phuket - `courses/banyan-tree.jpg`
- [ ] Laguna Golf Phuket - `courses/laguna-phuket.jpg`
- [ ] Chiang Mai Highlands - `courses/chiang-mai-highlands.jpg`
- [ ] Alpine Golf Club Chiang Mai - `courses/alpine-chiang-mai.jpg`
- [ ] Pattana Golf Club - `courses/pattana.jpg`
- [ ] Nikanti Golf Club - `courses/nikanti.jpg`
- [ ] Royal Gems Golf City - `courses/royal-gems.jpg`

### Fleet Images (Priority 2)

Folder: `fleet/`

- [ ] Luxury Van - `fleet/luxury-van.jpg`
- [ ] Executive SUV - `fleet/executive-suv.jpg`
- [ ] Mini Bus - `fleet/mini-bus.jpg`
- [ ] Coach Bus - `fleet/coach-bus.jpg`

### Tour Images (Priority 3)

Folder: `tours/`

- [ ] Bangkok Golf Tour - `tours/bangkok-tour.jpg`
- [ ] Phuket Golf Tour - `tours/phuket-tour.jpg`
- [ ] Chiang Mai Golf Tour - `tours/chiang-mai-tour.jpg`
- [ ] Pattaya Golf Tour - `tours/pattaya-tour.jpg`

### Service Images (Priority 4)

Folder: `services/`

- [ ] Tee Time Booking - `services/tee-time.jpg`
- [ ] Transport - `services/transport.jpg`
- [ ] Accommodation - `services/accommodation.jpg`
- [ ] Multi-Course - `services/multi-course.jpg`
- [ ] Restaurants - `services/restaurants.jpg`
- [ ] Custom - `services/custom.jpg`

## Component Migration

### Completed

- [x] CourseCard.tsx - Uses CloudinaryImage
- [x] CourseDetailCard.tsx - Uses CloudinaryImage

### Pending

- [ ] FleetCard.tsx - Update to use CloudinaryImage
- [ ] TourShowcase.tsx - Update to use CloudinaryImage
- [ ] ServiceBento.tsx - Update to use CloudinaryImage
- [ ] AboutCard.tsx - Update to use CloudinaryImage (if has images)

## Database Migration

### Development

- [ ] Update seed data in `supabase/schema.sql`
- [ ] Replace Unsplash URLs with Cloudinary public IDs
- [ ] Test all course images load correctly
- [ ] Verify blur placeholders work

### Production

- [ ] Update existing course records in Supabase
- [ ] Run migration script (if needed)
- [ ] Verify all images load in production
- [ ] Monitor Cloudinary bandwidth usage

## Testing

### Visual Testing

- [ ] Test course carousel images
- [ ] Test course detail hero images
- [ ] Test fleet cards
- [ ] Test tour showcase
- [ ] Test service bento grid
- [ ] Test mobile responsive images

### Performance Testing

- [ ] Test blur placeholders load
- [ ] Test WebP/AVIF format delivery
- [ ] Measure before/after page load times
- [ ] Test on slow 3G connection
- [ ] Check Lighthouse scores

### Browser Testing

- [ ] Chrome (WebP/AVIF support)
- [ ] Safari (WebP support)
- [ ] Firefox (WebP/AVIF support)
- [ ] Edge (WebP/AVIF support)
- [ ] Mobile Safari
- [ ] Mobile Chrome

## Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Cloudinary Settings

- [ ] Enable auto-format in Cloudinary settings
- [ ] Enable auto-quality in Cloudinary settings
- [ ] Set up backup folder (optional)
- [ ] Configure signed URLs (if needed for security)

## Cleanup

### After Migration

- [ ] Remove Unsplash URLs from database
- [ ] Remove `images.unsplash.com` from `next.config.ts`
- [ ] Remove mock image data (if using Cloudinary exclusively)
- [ ] Update documentation with Cloudinary public IDs

## Monitoring

### Post-Launch

- [ ] Monitor Cloudinary bandwidth usage
- [ ] Check Cloudinary transformation credits
- [ ] Review image analytics in Cloudinary
- [ ] Monitor page load times
- [ ] Check for broken images

## Optimization

### Advanced Features (Optional)

- [ ] Set up responsive breakpoints
- [ ] Configure progressive JPEG encoding
- [ ] Enable auto-tagging for SEO
- [ ] Set up named transformations for common sizes
- [ ] Configure video optimization (if adding videos)

## Rollback Plan

If issues arise:

1. Revert to Unsplash URLs in database
2. Keep CloudinaryImage component (handles fallback)
3. Investigate Cloudinary configuration
4. Check environment variables
5. Verify image uploads

## Cost Management

### Free Tier Limits

- 25 credits/month
- 25GB storage
- 25GB bandwidth
- Monitor usage in Cloudinary console

### If Exceeding Limits

- Upgrade to paid plan
- Optimize transformations
- Reduce image quality
- Use CDN caching
- Implement lazy loading

## Documentation

### Updated Files

- [x] `docs/CLOUDINARY_INTEGRATION.md` - Setup guide
- [x] `docs/CLOUDINARY_USAGE_EXAMPLES.md` - Usage examples
- [x] `docs/CLOUDINARY_MIGRATION_CHECKLIST.md` - This checklist
- [ ] Update CLAUDE.md with Cloudinary notes

## Next Steps

1. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` environment variable
2. Upload course images to Cloudinary
3. Update database with Cloudinary public IDs
4. Test image loading in development
5. Deploy to staging/production
6. Monitor performance and costs

## Notes

- Cloudinary public IDs should NOT include the file extension for flexibility
- Use folder structure to organize images (e.g., `courses/alpine-golf`)
- Blur placeholders are generated automatically with `blur` prop
- External URLs (Unsplash) still work as fallback until migration complete

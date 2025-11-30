'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CloudinaryImageProps {
  /**
   * Image source - can be:
   * - Cloudinary public ID (e.g., "courses/alpine-golf")
   * - Full Cloudinary URL (e.g., "https://res.cloudinary.com/xxx/image/upload/...")
   * - External URL (e.g., "https://images.unsplash.com/...")
   */
  src: string;

  /** Alt text for accessibility */
  alt: string;

  /** Image width in pixels */
  width: number;

  /** Image height in pixels */
  height: number;

  /** Additional CSS classes */
  className?: string;

  /** Priority loading for above-the-fold images */
  priority?: boolean;

  /** Enable blur placeholder (generates low-quality placeholder) */
  blur?: boolean;

  /** Custom Cloudinary transformations (e.g., "c_fill,g_auto") */
  transforms?: string;

  /** Image quality (1-100, default: auto) */
  quality?: number;

  /** Image format (auto, webp, avif, jpg, png) */
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';

  /** Object fit (cover, contain, fill, none, scale-down) */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

  /** Object position (center, top, bottom, left, right) */
  objectPosition?: string;

  /** Callback when image loads successfully */
  onLoad?: () => void;

  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * CloudinaryImage Component
 *
 * Optimized image component with automatic Cloudinary transformations.
 * Features:
 * - Responsive image loading with srcset
 * - Auto format (WebP/AVIF) and quality optimization
 * - Blur placeholder support
 * - Fallback to original URL if not Cloudinary
 * - Loading states
 *
 * @example
 * ```tsx
 * <CloudinaryImage
 *   src="courses/alpine-golf.jpg"
 *   alt="Alpine Golf Course"
 *   width={800}
 *   height={400}
 *   blur
 *   priority
 * />
 * ```
 */
export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  blur = false,
  transforms,
  quality,
  format = 'auto',
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  /**
   * Determine if this is a Cloudinary URL/ID
   */
  const isCloudinaryImage = (url: string): boolean => {
    return (
      // Already a Cloudinary URL
      url.includes('res.cloudinary.com') ||
      // Or a public ID (no protocol, no domain)
      (!url.startsWith('http://') && !url.startsWith('https://'))
    );
  };

  /**
   * Build Cloudinary URL with transformations
   */
  const buildCloudinaryUrl = (publicId: string): string => {
    if (!cloudName) {
      console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set, using original URL');
      return publicId.startsWith('http') ? publicId : src;
    }

    // If already a full Cloudinary URL, return as-is
    if (publicId.includes('res.cloudinary.com')) {
      return publicId;
    }

    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

    // Build transformation string
    const transformParts: string[] = [];

    // Add custom transforms first
    if (transforms) {
      transformParts.push(transforms);
    }

    // Add responsive width
    transformParts.push(`w_${width}`);

    // Add quality
    if (quality) {
      transformParts.push(`q_${quality}`);
    } else {
      transformParts.push('q_auto');
    }

    // Add format
    if (format === 'auto') {
      transformParts.push('f_auto');
    } else {
      transformParts.push(`f_${format}`);
    }

    const transformString = transformParts.join(',');

    return `${baseUrl}/${transformString}/${publicId}`;
  };

  /**
   * Generate blur placeholder URL
   */
  const getBlurDataUrl = (url: string): string => {
    if (!cloudName || !isCloudinaryImage(url)) {
      return '';
    }

    // Extract public ID from URL if needed
    let publicId = url;
    if (url.includes('res.cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts[1]) {
        publicId = parts[1].split('/').slice(1).join('/');
      }
    }

    return `https://res.cloudinary.com/${cloudName}/image/upload/e_blur:1000,q_1,f_auto,w_20/${publicId}`;
  };

  // Determine final image URL
  const imageUrl = isCloudinaryImage(src) && cloudName
    ? buildCloudinaryUrl(src)
    : src;

  // Generate blur placeholder if requested
  const blurDataURL = blur ? getBlurDataUrl(src) : undefined;

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={blurDataURL ? 'blur' : undefined}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
          hasError && 'opacity-50'
        )}
        style={{
          objectFit,
          objectPosition,
        }}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <div className="text-xs text-gray-500 text-center px-4">
            Failed to load image
          </div>
        </div>
      )}
    </div>
  );
}

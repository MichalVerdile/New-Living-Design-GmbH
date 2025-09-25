import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  title,
  className = '',
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  loading = 'lazy',
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px 0px', // Load image 100px before it becomes visible
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isVisible]);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string): string => {
    if (!baseSrc.includes('.')) return baseSrc;
    
    const extension = baseSrc.split('.').pop();
    const baseName = baseSrc.replace(`.${extension}`, '');
    
    // Generate different sizes for responsive images
    const sizes = [320, 640, 768, 1024, 1200, 1920];
    return sizes
      .map(size => `${baseName}_${size}w.${extension} ${size}w`)
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Don't render anything until intersection observer triggers or priority is set
  if (!isVisible && !priority) {
    return (
      <div
        ref={imgRef}
        className={`image-placeholder ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label={alt}
      >
        {placeholder && (
          <img
            src={placeholder}
            alt=""
            style={{ opacity: 0.3, maxWidth: '50px', maxHeight: '50px' }}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`image-error ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          fontSize: '0.875rem'
        }}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <span>Image not available</span>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`}>
      <img
        ref={imgRef}
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        title={title}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          transition: 'opacity 0.3s ease',
          opacity: isLoaded ? 1 : 0,
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div
          className="image-loading-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d'
          }}
          aria-hidden="true"
        >
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
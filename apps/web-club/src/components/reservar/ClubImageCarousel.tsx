import React, { useState, useRef, useCallback } from 'react';

interface ClubImageCarouselProps {
  images: string[];
  clubName: string;
  height?: number | string;
  topRightBadge?: React.ReactNode;
  topLeftBadge?: React.ReactNode;
  bottomLeftBadge?: React.ReactNode;
  onCardClick?: () => void;
  style?: React.CSSProperties;
}

const ChevronLeftIcon = ({ size = 14, color = '#ffffff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = ({ size = 14, color = '#ffffff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ShieldIcon = ({ size = 11, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CameraIcon = ({ size = 11, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const ClubImageCarousel: React.FC<ClubImageCarouselProps> = ({
  images,
  clubName,
  height = 240,
  topRightBadge,
  topLeftBadge,
  bottomLeftBadge,
  onCardClick,
  style = {},
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Normalize image list (fallback to default if empty)
  const safeImages = Array.isArray(images) && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80'];

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(el.scrollLeft / width);
      setActiveIndex(Math.max(0, Math.min(newIndex, safeImages.length - 1)));
    }
  }, [safeImages.length]);

  const scrollToSlide = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const el = scrollRef.current;
    if (!el) return;
    const targetX = index * el.clientWidth;
    el.scrollTo({ left: targetX, behavior: 'smooth' });
    setActiveIndex(index);
  };

  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === safeImages.length - 1;

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#070707',
        cursor: onCardClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onCardClick}
    >
      {/* Horizontal Snap Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {safeImages.map((imgSrc, idx) => {
          const isLogo = idx === 0 && (imgSrc.startsWith('/logos/') || imgSrc.includes('logo'));
          return (
            <div
              key={`${imgSrc}-${idx}`}
              style={{
                flex: '0 0 100%',
                width: '100%',
                height: '100%',
                scrollSnapAlign: 'start',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isLogo ? '#080808' : '#0a0a0a',
                overflow: 'hidden',
              }}
            >
              {isLogo ? (
                <>
                  {/* Subtle stadium texture / glow background for logo */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at 50% 50%, rgba(252, 28, 70, 0.08) 0%, rgba(8, 8, 8, 0.95) 75%)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Outer geometric grid watermark */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0.04,
                      backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                      pointerEvents: 'none',
                    }}
                  />
                  <img
                    src={imgSrc}
                    alt={`${clubName} — Isotipo Oficial`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '24px 32px',
                      filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.6))',
                      position: 'relative',
                      zIndex: 2,
                    }}
                    onError={(e) => {
                      // Graceful fallback if logo fails
                      e.currentTarget.style.display = 'none';
                    }}
                    loading="lazy"
                  />
                </>
              ) : (
                <>
                  <img
                    src={imgSrc}
                    alt={`${clubName} — Foto Cancha ${idx}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      filter: 'brightness(0.9)',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80';
                    }}
                    loading="lazy"
                  />
                  {/* Scrim Gradient Overlay for readability (hay-equipo-designer) */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Top Left Badge (e.g. Sport or Logo indicator) */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 10,
        }}
      >
        {topLeftBadge}

        {/* Slide Category Pill */}
        <div
          style={{
            padding: '3px 9px',
            backgroundColor: activeIndex === 0 ? 'rgba(252, 28, 70, 0.2)' : 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            border: activeIndex === 0 ? '1px solid rgba(252, 28, 70, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-full)',
            fontSize: 9,
            fontWeight: 700,
            color: activeIndex === 0 ? 'var(--color-crimson-signal)' : 'var(--color-ash)',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {activeIndex === 0 ? (
            <>
              <ShieldIcon size={10} color="var(--color-crimson-signal)" />
              <span>ISOTIPO</span>
            </>
          ) : (
            <>
              <CameraIcon size={10} color="var(--color-ash)" />
              <span>FOTO REAL</span>
            </>
          )}
        </div>
      </div>

      {/* Top Right Badges (Rating & Count Indicator) */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 10,
        }}
      >
        {safeImages.length > 1 && (
          <div
            style={{
              padding: '3px 9px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 'var(--radius-full)',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--color-frost)',
              letterSpacing: '0.5px',
            }}
          >
            {activeIndex + 1} / {safeImages.length}
          </div>
        )}
        {topRightBadge}
      </div>

      {/* Bottom Left Badge (Courts Count) */}
      {bottomLeftBadge && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            zIndex: 10,
          }}
        >
          {bottomLeftBadge}
        </div>
      )}

      {/* Navigation Arrow Controls (Pills - Stop Propagation) */}
      {safeImages.length > 1 && (
        <>
          {!isFirstSlide && (
            <button
              type="button"
              onClick={(e) => scrollToSlide(activeIndex - 1, e)}
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 15,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-crimson-signal)';
                e.currentTarget.style.borderColor = 'var(--color-crimson-signal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              aria-label="Ver imagen anterior"
            >
              <ChevronLeftIcon size={13} />
            </button>
          )}

          {!isLastSlide && (
            <button
              type="button"
              onClick={(e) => scrollToSlide(activeIndex + 1, e)}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 15,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-crimson-signal)';
                e.currentTarget.style.borderColor = 'var(--color-crimson-signal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              aria-label="Ver siguiente imagen"
            >
              <ChevronRightIcon size={13} />
            </button>
          )}

          {/* Dots Indicator at bottom center */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(6px)',
              padding: '3px 6px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {safeImages.map((_, dotIdx) => (
              <div
                key={`dot-${dotIdx}`}
                onClick={(e) => scrollToSlide(dotIdx, e)}
                style={{
                  width: activeIndex === dotIdx ? 14 : 5,
                  height: 5,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: activeIndex === dotIdx ? 'var(--color-crimson-signal)' : 'rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

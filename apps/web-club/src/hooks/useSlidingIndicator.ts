import { useState, useRef, useEffect, useCallback } from 'react';

export interface IndicatorDimensions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function useSlidingIndicator<T extends string>(activeKey: T) {
  const containerRef = useRef<HTMLDivElement | HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [indicator, setIndicator] = useState<IndicatorDimensions>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const [mounted, setMounted] = useState(false);

  const setItemRef = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      itemRefs.current[key] = el;
    },
    []
  );

  const update = useCallback(() => {
    const el = itemRefs.current[activeKey];
    if (el) {
      setIndicator({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    }
  }, [activeKey]);

  useEffect(() => {
    update();

    const timer = setTimeout(() => {
      update();
      setMounted(true);
    }, 20);

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(update).catch(() => {});
    }

    const handleResize = () => {
      update();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [update]);

  const indicatorStyle = {
    position: 'absolute' as const,
    top: indicator.top,
    left: 0,
    width: indicator.width,
    height: indicator.height,
    transform: `translate3d(${indicator.left}px, 0, 0)`,
    backgroundColor: 'var(--color-crimson-signal)',
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 0 24px rgba(252, 28, 70, 0.45)',
    transition: mounted
      ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'none',
    opacity: indicator.width > 0 ? 1 : 0,
    pointerEvents: 'none' as const,
    zIndex: 1,
  };

  return {
    containerRef,
    itemRefs,
    setItemRef,
    indicator,
    mounted,
    update,
    indicatorStyle,
  };
}

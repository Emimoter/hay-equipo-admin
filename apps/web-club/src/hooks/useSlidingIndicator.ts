import { useState, useRef, useEffect, useCallback } from 'react';

export interface IndicatorDimensions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function useSlidingIndicator<T extends string>(activeKey: T, deps: any[] = []) {
  const containerRef = useRef<HTMLDivElement | HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [indicator, setIndicator] = useState<IndicatorDimensions>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const [mounted, setMounted] = useState(false);

  const measure = useCallback((el: HTMLElement | null) => {
    if (el && el.offsetWidth > 0) {
      setIndicator({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
      return true;
    }
    return false;
  }, []);

  const update = useCallback(() => {
    const el = itemRefs.current[activeKey];
    if (el) {
      measure(el);
    }
  }, [activeKey, measure]);

  const setItemRef = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      itemRefs.current[key] = el;
      if (el && key === activeKey) {
        measure(el);
      }
    },
    [activeKey, measure]
  );

  useEffect(() => {
    update();

    const t1 = setTimeout(update, 10);
    const t2 = setTimeout(update, 50);
    const t3 = setTimeout(() => {
      update();
      setMounted(true);
    }, 100);

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(update).catch(() => {});
    }

    const handleResize = () => update();
    window.addEventListener('resize', handleResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => update());
      ro.observe(containerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [update, ...deps]);

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

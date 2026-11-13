import { useEffect, useState } from 'react';

export type DetectedDevice = 'desktop' | 'mobile';
export type FrameSelection = 'auto' | 'desktop' | 'mobile' | 'both';

function detectDevice(): DetectedDevice {
  if (typeof window === 'undefined') return 'desktop';
  const isNarrowViewport = window.matchMedia('(max-width: 767px)').matches;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  return isNarrowViewport || (isMobileUA && window.innerWidth < 1024)
    ? 'mobile'
    : 'desktop';
}

export function useAutoFrame(initialSelection: FrameSelection = 'auto') {
  const [selection, setSelection] = useState<FrameSelection>(initialSelection);
  const [detectedDevice, setDetectedDevice] = useState<DetectedDevice>(() => detectDevice());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const update = () => setDetectedDevice(detectDevice());

    update();
    mediaQuery.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const resolvedLayout: 'desktop' | 'mobile' | 'both' =
    selection === 'auto' ? detectedDevice : selection;

  return {
    selection,
    setSelection,
    detectedDevice,
    resolvedLayout,
  };
}

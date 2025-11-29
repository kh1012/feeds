'use client';

import { createPortal } from 'react-dom';
import { type ReactNode, useEffect, useState } from 'react';

type PortalOverlayProps = {
  children: ReactNode;
};

export default function PortalOverlay({ children }: PortalOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center backdrop-blur-sm bg-white/70">
      {children}
    </div>,
    document.body,
  );
}

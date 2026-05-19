// src/components/InstallPWA.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import usePWAInstall from '../hooks/usePWAInstall';

const CloseButton = React.memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
    aria-label="Close"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
));

const InstallPWA = React.memo(() => {
  const { isInstallable, isInstalled, isSupported, install, decline } = usePWAInstall();
  const [show, setShow] = useState(false);
  const [dismissedPermanently, setDismissedPermanently] = useState(false);

  // Check localStorage once
  useEffect(() => {
    const dismissed = localStorage.getItem('pwaInstallDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const day = 24 * 60 * 60 * 1000;
    if (dismissedTime && Date.now() - dismissedTime < day) {
      setDismissedPermanently(true);
    }
  }, []);

  // Control visibility
  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissedPermanently) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isInstallable, isInstalled, dismissedPermanently]);

  const handleDecline = useCallback(() => {
    setShow(false);
    decline(); // stores dismissal time in localStorage
  }, [decline]);

  const handleInstall = useCallback(async () => {
    const success = await install();
    if (success) setShow(false);
  }, [install]);

  // Don't render anything if popup is not needed
  if (!show) return null;

  // Unsupported browser fallback (manual instructions)
  if (!isSupported && !isInstalled) {
    const fallbackContent = (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 md:max-w-sm bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50 p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🌿</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">Install MindEase</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
            </p>
          </div>
          <CloseButton onClick={() => setShow(false)} />
        </div>
      </div>
    );
    return createPortal(fallbackContent, document.body);
  }

  // Main install prompt (supported browser)
  const installContent = (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 md:max-w-sm bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative p-4">
        <CloseButton onClick={handleDecline} />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Install MindEase</h3>
            <p className="text-xs text-slate-500">Faster, smoother app experience</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleInstall}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition active:scale-95 shadow-md"
          >
            Install
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl transition"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(installContent, document.body);
});

InstallPWA.displayName = 'InstallPWA';
export default InstallPWA;
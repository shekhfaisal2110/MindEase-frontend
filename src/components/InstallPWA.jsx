import React, { useEffect, useState } from 'react';
import usePWAInstall from '../hooks/usePWAInstall';

const InstallPWA = () => {
  const { isInstallable, isInstalled, isSupported, install, decline } = usePWAInstall();
  const [show, setShow] = useState(false);
  const [dismissedPermanently, setDismissedPermanently] = useState(false);

  // Check if user already dismissed the popup (optional, using localStorage)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwaInstallDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const day = 24 * 60 * 60 * 1000;
    if (dismissedTime && Date.now() - dismissedTime < day) {
      setDismissedPermanently(true);
    }
  }, []);

  useEffect(() => {
    // Only show popup if installable and not already installed and not dismissed
    if (isInstallable && !isInstalled && !dismissedPermanently) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isInstallable, isInstalled, dismissedPermanently]);

  const handleDecline = () => {
    setShow(false);
    decline(); // clears the deferred prompt and stores dismissal in localStorage
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShow(false);
    }
  };

  // Don't render anything if no popup needed
  if (!show && !(!isSupported && !isInstalled)) return null;

  // Fallback for unsupported browser (but still show install instructions)
  if (!isSupported && !isInstalled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-6 md:max-w-md bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50 p-5 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🌿</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">Install MindEase</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> for the best experience.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Already installed (optional, you could show a different message)
  if (isInstalled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-6 md:max-w-md bg-white rounded-2xl shadow-2xl border border-green-100 z-50 p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <p className="text-sm text-slate-600">MindEase is already installed on your device.</p>
        </div>
      </div>
    );
  }

  // Main install popup (when beforeinstallprompt is available)
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-6 md:max-w-md bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative p-5">
        <button
          onClick={handleDecline}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🌿</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Install MindEase</h3>
            <p className="text-xs text-slate-500">Get our app for a faster, smoother experience</p>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
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
};

export default InstallPWA;
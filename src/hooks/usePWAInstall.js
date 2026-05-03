import { useState, useEffect } from 'react';

const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if app is already running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // Check if browser supports the install prompt
    if ('BeforeInstallPromptEvent' in window) {
      const handler = (e) => {
        e.preventDefault(); // Prevent automatic mini-infobar
        setDeferredPrompt(e);
        setIsInstallable(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    } else {
      setIsSupported(false);
      setIsInstallable(false);
    }
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    if (outcome === 'accepted') {
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  const decline = () => {
    setDeferredPrompt(null);
    setIsInstallable(false);
    // You can optionally store a flag in localStorage to not ask again for some time
    localStorage.setItem('pwaInstallDismissed', Date.now());
  };

  return { isInstallable, isInstalled, isSupported, install, decline };
};

export default usePWAInstall;
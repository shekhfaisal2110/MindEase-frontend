import React from 'react';
import usePWAInstall from '../hooks/usePWAInstall';
import PageLayout from '../components/PageLayout';

const InstallGuide = () => {
  const { isInstallable, isInstalled, isSupported, install } = usePWAInstall();

  // Step icons (using lucide‑style SVG, but we use emoji for simplicity; you can replace with actual SVGs)
  const steps = [
    {
      icon: '⋮',
      iconBg: 'bg-gray-100',
      action: 'Open Chrome Menu',
      description: 'Tap the three dots in the top‑right corner of your browser.',
      visual: <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-gray-600">⋮</div>,
    },
    {
      icon: '➕',
      iconBg: 'bg-indigo-50',
      action: 'Tap "Add to Home Screen"',
      description: 'Scroll down the menu and select <strong>Add to Home screen</strong>.',
      visual: (
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl text-indigo-600">
          ➕
        </div>
      ),
    },
    {
      icon: '✅',
      iconBg: 'bg-emerald-50',
      action: 'Confirm Installation',
      description: 'Press <strong>Add</strong> in the confirmation pop‑up.',
      visual: (
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl text-emerald-600">
          ✅
        </div>
      ),
    },
    {
      icon: '🌿',
      iconBg: 'bg-purple-50',
      action: 'Open from Home Screen',
      description: 'Find the MindEase icon on your home screen and tap it to launch.',
      visual: (
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
          🌿
        </div>
      ),
    },
  ];

  return (
    <PageLayout title="Install MindEase" subtitle="Get the best experience by installing our app.">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* One‑Click Install Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 overflow-hidden shadow-md">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-md">
                📲
              </div>
              <h2 className="text-2xl font-bold text-slate-800">One‑Tap Install</h2>
            </div>
            <p className="text-slate-600 mb-6">
              Install MindEase directly from your browser with a single tap.
            </p>

            {isInstalled ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <div className="text-5xl mb-2">✅</div>
                <p className="text-green-800 font-bold text-lg">MindEase is already installed!</p>
                <p className="text-green-600 text-sm">You can launch it from your home screen.</p>
              </div>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <span className="text-xl">📥</span>
                <span>Install MindEase Now</span>
              </button>
            ) : isSupported ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                <p className="text-amber-700">
                  The browser is not ready for one‑tap install. Follow the manual steps below.
                </p>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
                <p className="text-rose-700">
                  Your browser does not support automatic install. Use the manual guide below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Manual Install Guide */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-xl">
                🧭
              </div>
              <h2 className="text-xl font-bold text-white">Manual Installation (Add to Home Screen)</h2>
            </div>
            <p className="text-slate-300 text-sm mt-2">Follow these simple steps – they take less than a minute.</p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-5 items-start group">
                {/* Step number badge */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                </div>

                {/* Icon + text content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 ${step.iconBg} rounded-xl flex items-center justify-center text-xl`}>
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{step.action}</h3>
                  </div>
                  <p
                    className="text-sm text-slate-500 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: step.description }}
                  />
                </div>

                {/* Visual representation (mobile friendly) */}
                <div className="flex-shrink-0 w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:shadow-md transition">
                  {step.visual}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border-t border-blue-100 px-6 py-5 flex gap-3 text-sm text-blue-800">
            <span className="text-xl">💡</span>
            <p>
              If you don’t see <strong>“Add to Home Screen”</strong>, make sure you are using Chrome, Edge, Samsung Internet,
              or another modern browser.
            </p>
          </div>
        </div>

      </div>
    </PageLayout>
  );
};

export default InstallGuide;
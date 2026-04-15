import React from 'react';
import Navbar from './Navbar';

const PageLayout = ({ 
  children, 
  title, 
  subtitle, 
  maxWidth = 'max-w-6xl', 
  centerTitle = false,
  showDecorativeBackground = true 
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Decorative Background Elements (Optional) */}
      {showDecorativeBackground && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-30" />
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10 transition-all duration-500`}>
        <div className={`${maxWidth} mx-auto`}>
          
          {/* Header Section */}
          {(title || subtitle) && (
            <header className={`mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ${centerTitle ? 'text-center' : 'text-left'}`}>
              {title && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  {subtitle}
                </p>
              )}
              
              {/* Decorative underline for centered titles */}
              {centerTitle && title && (
                <div className="mt-4 flex justify-center">
                  <div className="h-1.5 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                </div>
              )}
            </header>
          )}

          {/* Children Wrapper */}
          <section className="animate-in fade-in zoom-in-95 duration-500 delay-150">
            {children}
          </section>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="py-8 px-4 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm z-10">
        <div className="container mx-auto text-center">
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} MindEase • Your Wellness Companion
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
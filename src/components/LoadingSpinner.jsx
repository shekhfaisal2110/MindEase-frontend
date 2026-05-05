// import React, { useState, useEffect } from 'react';
// import motivationalQuotes from '../data/quotes.json';

// const LoadingSpinner = () => {
//   // Random initial quote
//   const [quote, setQuote] = useState(() => {
//     const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
//     return motivationalQuotes[randomIndex];
//   });

//   useEffect(() => {
//     const interval = setInterval(() => {
//       let newIndex;
//       do {
//         newIndex = Math.floor(Math.random() * motivationalQuotes.length);
//       } while (motivationalQuotes[newIndex] === quote);
//       setQuote(motivationalQuotes[newIndex]);
//     }, 1000); 

//     return () => clearInterval(interval);
//   }, [quote]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-6">
//       <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
//         <div className="flex justify-center mb-6">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <span className="text-2xl">🌿</span>
//             </div>
//           </div>
//         </div>
//         <p className="text-slate-600 text-lg font-medium italic transition-all duration-500">
//           "{quote}"
//         </p>
//         <p className="text-slate-400 text-sm mt-4">Loading MindEase...</p>
//       </div>
//     </div>
//   );
// };

// export default LoadingSpinner;






import React, { useState, useEffect, useMemo, useCallback } from 'react';
import motivationalQuotes from '../data/quotes.json';

const LoadingSpinner = React.memo(() => {
  // Memoize random initial quote – avoids recalculation on re‑mount
  const initialQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  }, []);

  const [quote, setQuote] = useState(initialQuote);

  // Memoized quote updater to prevent unnecessary interval resets
  const updateQuote = useCallback(() => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (motivationalQuotes[newIndex] === quote);
    setQuote(motivationalQuotes[newIndex]);
  }, [quote]);

  useEffect(() => {
    const interval = setInterval(updateQuote, 1000);
    return () => clearInterval(interval);
  }, [updateQuote]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-xl mx-4 sm:mx-0">
        {/* Spinner with leaf icon – responsive size */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">🌿</span>
            </div>
          </div>
        </div>
        
        {/* Quote – smooth transitions, readable on mobile */}
        <p className="text-slate-600 text-base sm:text-lg font-medium italic transition-all duration-500 px-2">
          "{quote}"
        </p>
        
        {/* Loading text – subtle */}
        <p className="text-slate-400 text-xs sm:text-sm mt-4 sm:mt-5">
          Loading MindEase...
        </p>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
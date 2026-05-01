import { motion, AnimatePresence } from 'motion/react';
import { User, MessageCircle } from 'lucide-react';

interface AvatarProps {
  message: string;
  isThinking?: boolean;
  position?: { x: number; y: number };
  variant?: 'bubble' | 'bar';
  theme?: 'dark' | 'light';
}

export default function Avatar({ message, isThinking, position, variant = 'bubble', theme = 'dark' }: AvatarProps) {
  if (variant === 'bar') {
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={`fixed bottom-0 left-0 right-0 z-50 h-20 border-t backdrop-blur-xl flex items-center px-12 pointer-events-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950/90 border-cyan-500/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}`}
      >
        <div className="flex items-center gap-6 w-full max-w-7xl mx-auto">
          <div className="relative shrink-0">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden transition-colors ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
               <div className="w-10 h-8 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full border border-amber-200/30 relative">
                  <div className="absolute top-1 left-2 right-2 h-0.5 bg-white/20" />
                  {isThinking && (
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-75" />
                    </div>
                  )}
               </div>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse transition-colors ${theme === 'dark' ? 'bg-cyan-500 shadow-[0_0_8px_#22d3ee]' : 'bg-cyan-600 shadow-[0_0_8px_rgba(8,145,178,0.5)]'}`} />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p 
                key={message}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`text-lg font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis transition-colors ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
              >
                <span className={`mr-3 uppercase text-xs tracking-widest font-black transition-colors ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>Mischief:</span>
                {message.split(' ').map((word, i) => {
                  const lower = word.toLowerCase();
                  const isSpecial = lower.includes('winner') || lower.includes('n log n') || lower.includes('bubbles') || lower.includes('protocol');
                  const colorClass = lower.includes('winner') ? (theme === 'dark' ? 'text-yellow-400' : 'text-amber-600') : (theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700');
                  return (
                    <span key={i} className={isSpecial ? `${colorClass}` : ''}>
                      {word}{' '}
                    </span>
                  );
                })}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <div className="hidden md:flex gap-4 shrink-0">
             <div className="flex flex-col items-end">
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Signal Strength</span>
                <div className="flex gap-1 mt-1">
                   {[1,2,3,4].map(i => <div key={i} className={`w-1 h-3 rounded-full transition-colors ${i < 4 ? (theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-600') : (theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200')}`} />)}
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const isFarRight = (position?.x || 0) > (typeof window !== 'undefined' ? window.innerWidth - 500 : 800);
  const isFarTop = (position?.y || 0) < 300;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      animate={{
        x: position?.x ?? 400,
        y: position?.y ?? 420,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
    >
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.8, y: isFarTop ? -20 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: isFarTop ? -10 : 10 }}
            className={`absolute ${isFarTop ? 'top-44' : 'bottom-44'} ${isFarRight ? 'right-4' : 'left-0'} w-72 border rounded-3xl p-5 backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto ${theme === 'dark' ? 'bg-slate-900/95 border-cyan-500/40 shadow-cyan-900/40' : 'bg-white/95 border-slate-200 shadow-slate-200/40'}`}
          >
            <div className={`absolute ${isFarRight ? 'right-8' : 'left-12'} ${isFarTop ? '-top-3 rotate-[225deg]' : '-bottom-3 rotate-45'} w-6 h-6 border-r border-b transition-colors ${theme === 'dark' ? 'bg-slate-900 border-cyan-500/40' : 'bg-white border-slate-200'}`} />
            <p className={`text-base font-medium leading-relaxed transition-colors ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              {message.split(' ').map((word, i) => {
                const lower = word.toLowerCase();
                const isSpecial = lower.includes('orange') || lower.includes('cyan') || lower.includes('green');
                const colorClass = lower.includes('orange') ? 'text-orange-400' : lower.includes('cyan') ? (theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700') : (theme === 'dark' ? 'text-green-400' : 'text-emerald-700');
                return (
                  <span key={i} className={isSpecial ? `${colorClass} font-bold` : ''}>
                    {word}{' '}
                  </span>
                );
              })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <div className="w-40 h-40 relative">
          {/* Helmet Base */}
          <div className={`absolute bottom-0 w-full h-28 rounded-t-3xl border-x-4 border-t-4 shadow-2xl overflow-hidden transition-colors ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300'}`}>
            {/* Ventilation/Detail */}
            <div className={`absolute bottom-4 left-6 w-4 h-4 rounded-full transition-colors ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-400'}`} />
            <div className={`absolute bottom-4 right-6 w-4 h-4 rounded-full transition-colors ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-400'}`} />
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-12 rounded-t-xl border-t-2 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-100 border-slate-300'}`} />
          </div>
          
          {/* Visor */}
          <motion.div 
            animate={{
              boxShadow: isThinking ? (theme === 'dark' ? '0 0 30px rgba(251,146,60,0.6)' : '0 0 20px rgba(251,146,60,0.4)') : (theme === 'dark' ? '0 0 15px rgba(251,146,60,0.3)' : '0 0 5px rgba(251,146,60,0.1)')
            }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-32 h-10 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full border border-amber-200/50 flex items-center justify-center overflow-hidden"
          >
            {/* Visor Glint */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/30" />
            {isThinking && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150" />
              </div>
            )}
          </motion.div>

          {/* Side Lights */}
          <div className={`absolute top-1/2 -left-2 w-2 h-6 rounded-full blur-[2px] opacity-60 transition-colors ${theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-600'}`} />
          <div className={`absolute top-1/2 -right-2 w-2 h-6 rounded-full blur-[2px] opacity-60 transition-colors ${theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-600'}`} />
        </div>
      </div>
    </motion.div>
  );
}

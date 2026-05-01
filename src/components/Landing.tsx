import { motion } from 'motion/react';

interface LandingProps {
  onStart: (mode: 'learn' | 'code' | 'play') => void;
  theme: 'dark' | 'light';
}

export default function Landing({ onStart, theme }: LandingProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen relative transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-16 z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-8">
           <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'bg-cyan-600 shadow-xl shadow-cyan-600/30'}`}>
             <span className={`text-4xl font-black ${theme === 'dark' ? 'text-black' : 'text-white'}`}>L</span>
           </div>
           <h1 className={`text-7xl font-black tracking-tighter drop-shadow-2xl transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            LEARN.<span className={theme === 'dark' ? 'text-cyan-500' : 'text-cyan-600'}>CODE</span>.PLAY
          </h1>
        </div>
        <p className={`text-sm font-bold tracking-[0.4em] uppercase opacity-80 mb-12 transition-colors ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>
          Submersive Balloon Sort Visualizer
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {['Learn', 'Code', 'Play'].map((mode, i) => (
            <motion.button
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => onStart(mode.toLowerCase() as any)}
              className={`group relative px-12 py-4 border-2 rounded-full overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900/80 border-white/10 hover:border-cyan-500' : 'bg-white border-slate-200 hover:border-cyan-600 shadow-md hover:shadow-xl hover:-translate-y-0.5'}`}
            >
              <div className={`absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-600'}`} />
              <span className={`relative text-xl font-black transition-colors uppercase tracking-widest ${theme === 'dark' ? 'text-white group-hover:text-black' : 'text-slate-900 group-hover:text-white'}`}>
                {mode}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] -z-10 transition-opacity ${theme === 'dark' ? 'bg-cyan-500/10 opacity-100' : 'bg-cyan-500/5 opacity-50'}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] -z-10 transition-opacity ${theme === 'dark' ? 'bg-indigo-500/10 opacity-100' : 'bg-indigo-500/5 opacity-50'}`} />
    </div>
  );
}

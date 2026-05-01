import { useState } from 'react';
import { RefreshCw, Play, Pause, ChevronRight } from 'lucide-react';

interface ControlsProps {
  algorithm: string;
  speed: number;
  theme?: 'dark' | 'light';
  onSpeedChange: (val: number) => void;
  onRandom: () => void;
  onManual: (arr: number[]) => void;
  onStart: () => void;
  isSorting: boolean;
  onReset: () => void;
}

export default function Controls({
  algorithm,
  speed,
  theme = 'dark',
  onSpeedChange,
  onRandom,
  onManual,
  onStart,
  isSorting,
  onReset
}: ControlsProps) {
  const [manualInput, setManualInput] = useState('');

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center mb-2">
           <label className={`text-[10px] uppercase font-bold tracking-[0.2em] transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Pulse Speed</label>
           <span className={`text-[10px] font-mono transition-colors ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>{(speed - 1600) * -1 / 100}x</span>
        </div>
        <input
          type="range"
          min="100"
          max="1500"
          step="100"
          value={1600 - speed}
          onChange={(e) => onSpeedChange(1600 - Number(e.target.value))}
          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-colors ${theme === 'dark' ? 'bg-slate-800 accent-cyan-500 hover:accent-cyan-400' : 'bg-slate-200 accent-cyan-600 hover:accent-cyan-500'}`}
        />
      </div>

      <div className={`flex flex-col gap-4 pt-4 border-t-2 transition-colors ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
        {!isSorting ? (
          <>
            <button
              onClick={onRandom}
              className={`w-full py-4 border-2 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-100' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'}`}
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Generate Array
            </button>
            
            <div className="relative group/input">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ex: 5, 2, 8, 1"
                className={`w-full border-2 rounded-xl px-4 py-4 text-xs focus:outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-300 focus:border-cyan-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-cyan-600/50 focus:ring-2 focus:ring-cyan-100 shadow-sm'}`}
              />
              <button
                onClick={() => {
                  const arr = manualInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                  if (arr.length > 0) onManual(arr);
                }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${theme === 'dark' ? 'bg-cyan-500 text-black' : 'bg-cyan-600 text-white shadow-md'}`}
              >
                <ChevronRight className={`w-4 h-4 stroke-[3px] ${theme === 'dark' ? 'text-black' : 'text-white'}`} />
              </button>
            </div>

            <button
              onClick={onStart}
              className={`w-full py-5 font-black uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 ${theme === 'dark' ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/30'}`}
            >
              <Play className="w-5 h-5 fill-current" />
              Execute
            </button>
          </>
        ) : (
          <button
            onClick={onReset}
            className={`w-full py-5 border font-black uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-3 transition-all ${theme === 'dark' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200 shadow-sm'}`}
          >
            Abort Protocol
          </button>
        )}
      </div>
    </div>
  );
}

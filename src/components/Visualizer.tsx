import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';
import { Check } from 'lucide-react';

export interface ArrayItem {
  id: string;
  value: number;
}

interface VisualizerProps {
  array: ArrayItem[];
  steps: any[];
  speed: number;
  highlights: Record<number, string>;
  sortedIndices: Set<number>;
  visualType?: 'balloons' | 'bars' | 'lines' | 'lollipops' | 'fun';
  compact?: boolean;
  pointers?: { i: number | null; j: number | null; n?: number | null };
  onStepComplete?: (stepIndex: number) => void;
  onFinish?: () => void;
  paused?: boolean;
  theme?: 'dark' | 'light';
}

const BALLOON_GRADIENS = [
  'from-red-600 to-red-400 shadow-[0_10px_20px_rgba(239,68,68,0.3)]',
  'from-blue-600 to-blue-400 shadow-[0_10px_20px_rgba(59,130,246,0.3)]',
  'from-purple-600 to-purple-400 shadow-[0_10px_20px_rgba(168,85,247,0.3)]',
  'from-yellow-600 to-yellow-400 shadow-[0_10px_20px_rgba(234,179,8,0.3)]',
  'from-pink-600 to-pink-400 shadow-[0_10px_20px_rgba(236,72,153,0.3)]',
  'from-cyan-600 to-cyan-400 shadow-[0_10px_20px_rgba(6,182,212,0.3)]',
  'from-indigo-600 to-indigo-400 shadow-[0_10_20px_rgba(79,70,229,0.3)]',
  'from-rose-600 to-rose-400 shadow-[0_10px_20px_rgba(244,63,94,0.3)]',
  'from-emerald-600 to-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.3)]',
  'from-amber-600 to-amber-400 shadow-[0_10px_20px_rgba(217,119,6,0.3)]'
];

export default function Visualizer({ 
  array, 
  steps, 
  speed, 
  highlights, 
  sortedIndices,
  visualType = 'balloons',
  compact = false,
  pointers = { i: null, j: null },
  onStepComplete, 
  onFinish, 
  paused,
  theme = 'dark'
}: VisualizerProps) {
  const [currentArray, setCurrentArray] = useState<ArrayItem[]>([...array]);

  useEffect(() => {
    setCurrentArray([...array]);
  }, [array]);

  const maxVal = useMemo(() => {
    const vals = array.map(i => i.value);
    return Math.max(...vals, 1);
  }, [array]);

  const FUN_EMOJIS = ['🥹', '😎', '🤩', '🥳', '🤔', '🫠', '🤡', '🤠', '👽', '🤖', '👻', '🤯', '🥵', '🥶', '🧐', '😴', '😇', '😈', '🤮', '🤑'];

  return (
    <div className={`flex items-end justify-center ${compact ? 'gap-2 h-full max-w-full' : 'gap-6 h-[500px] max-w-5xl'} w-full px-4 pb-4 overflow-hidden`}>
      {currentArray.map((item, idx) => {
        const val = item.value;
        const isSelected = highlights[idx] === 'selected';
        const isComparing = highlights[idx] === 'comparing';
        const isSorted = sortedIndices.has(idx);

        let height, width, borderRadius;
        let gradientClass = BALLOON_GRADIENS[idx % BALLOON_GRADIENS.length];

        if (isSorted) gradientClass = theme === 'dark' ? 'from-green-600 to-green-400 shadow-[0_10px_20px_rgba(34,197,94,0.3)]' : 'from-green-600 to-green-500 shadow-[0_8px_20px_rgba(22,163,74,0.2)]';
        if (isComparing || isSelected) {
          gradientClass = theme === 'dark' ? 'from-orange-600 to-orange-400 shadow-[0_15px_30px_rgba(251,146,60,0.6)]' : 'from-orange-600 to-orange-500 shadow-[0_12px_25px_rgba(234,88,12,0.3)]';
        }

        const scaleFactor = compact ? 0.6 : 1.2;

        switch (visualType) {
          case 'bars':
            height = ((val / maxVal) * 160 + 30) * scaleFactor;
            width = 52 * scaleFactor;
            borderRadius = "rounded-t-lg";
            break;
          case 'lines':
            height = ((val / maxVal) * 180 + 40) * scaleFactor;
            width = 10 * scaleFactor;
            borderRadius = "rounded-full";
            break;
          case 'lollipops':
            height = ((val / maxVal) * 120 + 40) * scaleFactor;
            width = ((val / maxVal) * 30 + 30) * scaleFactor;
            borderRadius = "rounded-full";
            break;
          case 'fun':
            width = ((val / maxVal) * 45 + 30) * scaleFactor;
            height = ((val / maxVal) * 120 + 40) * scaleFactor;
            borderRadius = "rounded-2xl";
            break;
          case 'balloons':
          default:
            height = ((val / maxVal) * 120 + 60) * scaleFactor;
            width = ((val / maxVal) * 30 + 40) * scaleFactor;
            borderRadius = "rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]";
            break;
        }

        const baseEmoji = FUN_EMOJIS[val % FUN_EMOJIS.length];
        const displayEmoji = isSorted ? '😁' : baseEmoji;

        return (
          <motion.div
            key={item.id}
            layout
            className={`relative flex flex-col items-center justify-end group`}
            initial={false}
          >
            <motion.div
              animate={{
                height: (visualType === 'lollipops' || visualType === 'fun') ? width : height,
                width,
                scale: (isComparing || isSelected) ? 1.2 : 1,
                y: (isComparing || isSelected) ? -20 : 0,
                marginBottom: (visualType === 'lollipops' || visualType === 'fun') ? height - width : 0
              }}
              transition={{
                duration: Math.min(speed / 1000, 0.4),
                ease: "easeOut"
              }}
              className={`${borderRadius} relative transition-all ${visualType === 'fun' ? 'bg-transparent border-none shadow-none' : `bg-gradient-to-tr ${gradientClass} border-b-4 border-black/10`} ${
                (isComparing || isSelected) && visualType !== 'fun' ? 'ring-4 ring-orange-400/50 scale-110' : ''
              } ${visualType === 'lines' ? (theme === 'dark' ? 'shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'shadow-lg shadow-cyan-200/50') : (theme === 'light' ? 'shadow-xl shadow-black/10' : '')} brightness-125 flex items-center justify-center`}
            >
              {theme === 'light' && !compact && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-black/5 blur-[4px] rounded-full" />
              )}
              <span 
                className={`text-white font-black transition-all ${
                  visualType === 'lines' ? 'hidden' : 
                  visualType === 'bars' ? `${compact ? 'text-[8px]' : 'text-lg'} rotate-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]` : 
                  visualType === 'fun' ? (theme === 'dark' ? 'drop-shadow-none' : 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]') :
                  width < 30 ? 'text-[8px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' :
                  width < 50 ? 'text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
                }`}
                style={{ fontSize: visualType === 'fun' ? `${width * 0.8}px` : undefined }}
              >
                {visualType === 'fun' ? displayEmoji : val}
              </span>

              <AnimatePresence>
                {isSorted && (
                  <motion.div
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    key="sorted-tick"
                    className="absolute -top-10 bg-green-500 rounded-full p-1 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Decorative elements based on type */}
              {visualType === 'balloons' && (
                <div className={`absolute top-[98%] left-1/2 -translate-x-1/2 w-0.5 transition-all ${
                  (isComparing || isSelected) ? 'bg-orange-400/40' : 'bg-white/20'
                }`} style={{ height: compact ? 40 : 80 }} />
              )}

              {visualType === 'lollipops' || visualType === 'fun' ? (
                <div className={`absolute top-[100%] left-1/2 -translate-x-1/2 transition-all ${visualType === 'fun' ? 'bg-white/10' : `bg-gradient-to-b ${gradientClass} opacity-40`}`} 
                     style={{ height: height - width, width: compact ? 4 : 10 }} />
              ) : null}
            </motion.div>
            
            <div className={`mt-2 text-[8px] font-bold uppercase tracking-widest h-2 transition-opacity ${
              (isSorted || isComparing || isSelected) && !compact ? 'opacity-100' : 'opacity-0'
            } ${
              isSorted ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : (theme === 'dark' ? 'text-orange-400' : 'text-orange-600')
            }`}>
              {isSorted ? 'Sorted' : isComparing ? 'Comp' : isSelected ? 'Sel' : ''}
            </div>

            {/* Pointer Labels */}
            <div className={`absolute ${compact ? '-top-14' : '-bottom-20'} left-0 right-0 flex flex-col items-center gap-1.5 h-20 pointer-events-none`}>
              {pointers.i === idx && (
                <motion.div 
                  initial={{ scale: 0, y: 10 }} 
                  animate={{ scale: 1, y: 0 }} 
                  className={`${compact ? 'px-2 py-0.5 text-[9px]' : 'px-4 py-1.5 text-xs'} font-black rounded-xl relative flex items-center justify-center min-w-[30px] shadow-lg ${theme === 'dark' ? 'bg-cyan-400 text-black shadow-cyan-400/50' : 'bg-cyan-600 text-white shadow-cyan-600/30'}`}
                >
                  <div className={`absolute ${compact ? '-bottom-1.5 border-t-[6px] border-b-0' : '-top-1.5 border-b-[6px] border-t-0'} left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] transition-all ${theme === 'dark' ? (compact ? 'border-t-cyan-400' : 'border-b-cyan-400') : (compact ? 'border-t-cyan-600' : 'border-b-cyan-600')}`} />
                  i = {idx}
                </motion.div>
              )}
              {pointers.j === idx && (
                <motion.div 
                  initial={{ scale: 0, y: 10 }} 
                  animate={{ scale: 1, y: 0 }} 
                  className={`${compact ? 'px-2 py-0.5 text-[9px]' : 'px-4 py-1.5 text-xs'} font-black rounded-xl relative flex items-center justify-center min-w-[30px] shadow-lg ${theme === 'dark' ? 'bg-amber-400 text-black shadow-amber-400/50' : 'bg-amber-600 text-white shadow-amber-600/30'}`}
                >
                  <div className={`absolute ${compact ? '-bottom-1.5 border-t-[6px] border-b-0' : '-top-1.5 border-b-[6px] border-t-0'} left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] transition-all ${theme === 'dark' ? (compact ? 'border-t-amber-400' : 'border-b-amber-400') : (compact ? 'border-t-amber-600' : 'border-b-amber-600')}`} />
                  j = {idx}
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Global n pointer */}
      {pointers.n !== undefined && pointers.n !== null && (
        <div className="absolute bottom-[-80px] right-0 translate-x-1/2 flex flex-col items-center h-20 pointer-events-none">
           <motion.div 
              initial={{ scale: 0, y: 10 }} 
              animate={{ scale: 1, y: 0 }} 
              className="px-4 py-1.5 bg-slate-400 text-black text-xs font-black rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.4)] relative flex items-center justify-center min-w-[50px]"
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-slate-400" />
              n = {pointers.n}
            </motion.div>
        </div>
      )}
    </div>
  );
}

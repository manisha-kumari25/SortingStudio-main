import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import Background from './components/Background';
import Landing from './components/Landing';
import Avatar from './components/Avatar';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import CodeMode from './components/CodeMode';
import PlayMode from './components/PlayMode';
import { ChevronLeft, Sun, Moon } from 'lucide-react';

type Mode = 'lobby' | 'learn' | 'algo_select' | 'sorting' | 'code' | 'play';
type Algorithm = 'bubble' | 'insertion' | 'selection' | 'merge' | 'quick' | 'radix';
type Theme = 'dark' | 'light';

interface Step {
  type: 'compare' | 'swap' | 'overwrite' | 'select' | 'done' | 'group';
  i: number;
  j?: number;
  value?: number;
}

interface ArrayItem {
  id: string;
  value: number;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mode, setMode] = useState<Mode>('lobby');
  const [algo, setAlgo] = useState<Algorithm | null>(null);
  const [array, setArray] = useState<ArrayItem[]>([
    { id: '1', value: 15 },
    { id: '2', value: 8 },
    { id: '3', value: 22 },
    { id: '4', value: 6 },
    { id: '5', value: 12 }
  ]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [speed, setSpeed] = useState(800);
  const [isSorting, setIsSorting] = useState(false);
  const [instructorMsg, setInstructorMsg] = useState('');
  const [avatarPos, setAvatarPos] = useState({ x: 200, y: 420 });
  const [interactiveQuestion, setInteractiveQuestion] = useState<{
    text: string;
    options: { label: string; value: any }[];
    onAnswer: (val: any) => void;
  } | null>(null);

  const [highlights, setHighlights] = useState<Record<number, string>>({});
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visualType, setVisualType] = useState<'balloons' | 'bars' | 'lines' | 'lollipops' | 'fun'>('balloons');
  const [isVisualDropdownOpen, setIsVisualDropdownOpen] = useState(false);

  const [isRaceMode, setIsRaceMode] = useState(false);
  const [selectedRaceAlgos, setSelectedRaceAlgos] = useState<Algorithm[]>(['bubble', 'insertion', 'selection', 'quick']);
  const [raceData, setRaceData] = useState<Record<string, {
    array: ArrayItem[],
    steps: Step[],
    currentIdx: number,
    highlights: Record<number, string>,
    sortedIndices: Set<number>,
    isFinished: boolean,
    stepCount: number
  }>>({});

  const [raceWinner, setRaceWinner] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const arrayRef = useRef<ArrayItem[]>(array);

  // Keep arrayRef in sync
  useEffect(() => {
    arrayRef.current = array;
  }, [array]);

  const generateRandomArray = useCallback(() => {
    const newArr = Array.from({ length: 8 }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      value: Math.floor(Math.random() * 40) + 5
    }));
    setArray(newArr);
    setCurrentStepIdx(-1);
    setSteps([]);
    setSortedIndices(new Set()); // Reset sorted indices
    setHighlights({}); // Reset highlights
    setIsSorting(false);
    setIsRaceMode(false);
    setInstructorMsg("New dataset generated. Ready for a new sort?");
  }, []);

  const handleStart = (m: Mode) => {
    setMode(m);
    if (m === 'learn') {
      setInstructorMsg("Hello, I am your instructor. I will guide you through sorting algorithms.");
      setTimeout(() => {
        setMode('algo_select');
      }, 2500);
    } else if (m === 'code') {
      setInstructorMsg("Welcome to Code Mode. Here we dissect the algorithms line by line. Logic is the ultimate mischief.");
    }
  };

  const selectAlgorithm = (a: Algorithm) => {
    setAlgo(a);
    setMode('sorting');
    setIsRaceMode(false);
    setInstructorMsg(`Great choice! ${a} sort is a fundamental algorithm. Let's start.`);
  };

  const fetchSteps = async (specificAlgo?: Algorithm, specificArray?: number[]) => {
    const targetAlgo = specificAlgo || algo || 'bubble';
    const targetArray = specificArray || array.map(item => item.value);
    return generateSortingSteps(targetAlgo, targetArray);
  };

  const generateSortingSteps = (algorithm: Algorithm, array: number[]) => {
    const steps: Step[] = [];
    const arr = [...array];

    switch (algorithm) {
      case 'bubble':
        bubbleSort(arr, steps);
        break;
      case 'insertion':
        insertionSort(arr, steps);
        break;
      case 'selection':
        selectionSort(arr, steps);
        break;
      case 'merge':
        mergeSort(arr, 0, arr.length - 1, steps);
        break;
      case 'quick':
        quickSort(arr, 0, arr.length - 1, steps);
        break;
      case 'radix':
        radixSort(arr, steps);
        break;
    }

    return steps;
  };

  const bubbleSort = (arr: number[], steps: Step[]) => {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ type: 'compare', i: j, j: j + 1 });
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({ type: 'swap', i: j, j: j + 1 });
        }
      }
      steps.push({ type: 'done', i: n - i - 1 });
    }
    if (n > 0) steps.push({ type: 'done', i: 0 });
  };

  const insertionSort = (arr: number[], steps: Step[]) => {
    const n = arr.length;
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      steps.push({ type: 'select', i });
      while (j >= 0 && arr[j] > key) {
        steps.push({ type: 'compare', i: j, j: j + 1 });
        arr[j + 1] = arr[j];
        steps.push({ type: 'overwrite', i: j + 1, value: arr[j] });
        j--;
      }
      arr[j + 1] = key;
      steps.push({ type: 'overwrite', i: j + 1, value: key });
    }
    for (let i = 0; i < n; i++) steps.push({ type: 'done', i });
  };

  const selectionSort = (arr: number[], steps: Step[]) => {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      steps.push({ type: 'select', i: minIdx });
      for (let j = i + 1; j < n; j++) {
        steps.push({ type: 'compare', i: minIdx, j });
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({ type: 'select', i: minIdx });
        }
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        steps.push({ type: 'swap', i, j: minIdx });
      }
      steps.push({ type: 'done', i });
    }
    if (n > 0) steps.push({ type: 'done', i: n - 1 });
  };

  const mergeSort = (arr: number[], l: number, r: number, steps: Step[]) => {
    if (l < r) {
      const m = Math.floor(l + (r - l) / 2);
      mergeSort(arr, l, m, steps);
      mergeSort(arr, m + 1, r, steps);
      merge(arr, l, m, r, steps);
    }
  };

  const merge = (arr: number[], l: number, m: number, r: number, steps: Step[]) => {
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = arr.slice(l, m + 1);
    const R = arr.slice(m + 1, r + 1);

    let i = 0;
    let j = 0;
    let k = l;

    while (i < n1 && j < n2) {
      steps.push({ type: 'compare', i: l + i, j: m + 1 + j });
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        steps.push({ type: 'overwrite', i: k, value: L[i] });
        i++;
      } else {
        arr[k] = R[j];
        steps.push({ type: 'overwrite', i: k, value: R[j] });
        j++;
      }
      k++;
    }

    while (i < n1) {
      arr[k] = L[i];
      steps.push({ type: 'overwrite', i: k, value: L[i] });
      i++;
      k++;
    }

    while (j < n2) {
      arr[k] = R[j];
      steps.push({ type: 'overwrite', i: k, value: R[j] });
      j++;
      k++;
    }

    if (l === 0 && r === arr.length - 1) {
      for (let x = l; x <= r; x++) steps.push({ type: 'done', i: x });
    }
  };

  const quickSort = (arr: number[], low: number, high: number, steps: Step[]) => {
    if (low < high) {
      const pi = partition(arr, low, high, steps);
      quickSort(arr, low, pi - 1, steps);
      quickSort(arr, pi + 1, high, steps);
    }
    if (low === 0 && high === arr.length - 1) {
      for (let x = 0; x < arr.length; x++) steps.push({ type: 'done', i: x });
    }
  };

  const partition = (arr: number[], low: number, high: number, steps: Step[]) => {
    const pivot = arr[high];
    steps.push({ type: 'select', i: high });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ type: 'compare', i: j, j: high });
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ type: 'swap', i, j });
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ type: 'swap', i: i + 1, j: high });
    steps.push({ type: 'done', i: i + 1 });
    return i + 1;
  };

  const radixSort = (arr: number[], steps: Step[]) => {
    const max = arr.length > 0 ? Math.max(...arr) : 0;
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      countSort(arr, exp, steps);
    }
    for (let i = 0; i < arr.length; i++) steps.push({ type: 'done', i });
  };

  const countSort = (arr: number[], exp: number, steps: Step[]) => {
    const n = arr.length;
    const output = new Array<number>(n);
    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
      count[Math.floor(arr[i] / exp) % 10]++;
      steps.push({ type: 'compare', i });
    }

    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }

    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      steps.push({ type: 'overwrite', i, value: arr[i] });
    }
  };

  const startRace = async () => {
    setIsSorting(false);
    setIsRaceMode(true);
    setRaceWinner(null);
    setInstructorMsg("RACING MODE INITIATED! Watch them go! Who is the most efficient?");
    
    const algos = selectedRaceAlgos.length > 0 ? selectedRaceAlgos : (['bubble', 'insertion', 'selection', 'merge', 'quick', 'radix'] as Algorithm[]);
    const initialRaceData: Record<string, {
      array: ArrayItem[],
      steps: Step[],
      currentIdx: number,
      highlights: Record<number, string>,
      sortedIndices: Set<number>,
      isFinished: boolean,
      stepCount: number
    }> = {};
    const arrayValues = array.map(i => i.value);

    // Fetch all steps in parallel
    const allSteps = await Promise.all(
      algos.map(a => fetchSteps(a, arrayValues).then(steps => ({ algo: a, steps })))
    );

    allSteps.forEach(({ algo, steps }) => {
      initialRaceData[algo as string] = {
        array: [...array],
        steps,
        currentIdx: 0,
        highlights: {},
        sortedIndices: new Set(),
        isFinished: false,
        stepCount: 0
      };
    });

    setRaceData(initialRaceData);
    setIsSorting(true);
  };

  const runTeachingFlow = async () => {
    // 1. Initial sorted check
    setInteractiveQuestion({
      text: "Is the array currently sorted?",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false }
      ],
      onAnswer: (val) => {
        const currentVals = arrayRef.current.map(i => i.value);
        const isSorted = currentVals.every((n, i, a) => !i || a[i - 1] <= n);
        if (val === isSorted) {
          setInstructorMsg("Correct! You have a keen eye.");
          setInteractiveQuestion(null);
          setTimeout(startVisualization, 2000);
        } else {
          setInstructorMsg("❌ Not quite! Look at the balloon sizes carefully. Try again!");
          // Keep interactiveQuestion open
        }
      }
    });
  };

  const startVisualization = async () => {
    const fetchedSteps = await fetchSteps();
    setSteps(fetchedSteps);
    setCurrentStepIdx(0);
    setIsSorting(true);
  };

  const applyStepLogic = useCallback((idx: number) => {
    if (idx < 0 || idx >= steps.length) return;

    const step = steps[idx];
    
    // Update instructor and position
    if (step.i !== undefined) {
      // Keep avatar relatively stationary on the left with very little displacement
      const baseStageX = 360; 
      const jitter = (step.i % 3) * 5; // Very small movement (0, 5, 10px)
      
      const safeX = baseStageX + jitter;
      const safeY = Math.min(window.innerHeight - 350, 420);
      setAvatarPos({ x: safeX, y: safeY });
    }

    // Process logic changes
    setHighlights({});
    if (step.type === 'compare') {
      setHighlights({ [step.i]: 'comparing', [step.j!]: 'comparing' });
      const valI = arrayRef.current[step.i].value;
      const valJ = arrayRef.current[step.j!].value;
      setInstructorMsg(`Comparing index ${step.i} (${valI}) and index ${step.j} (${valJ})...`);
    } else if (step.type === 'select') {
      setHighlights({ [step.i]: 'selected' });
      setInstructorMsg(`Focusing on element at index ${step.i}...`);
    } else if (step.type === 'done') {
      setSortedIndices(prev => new Set(prev).add(step.i));
      setInstructorMsg(`Index ${step.i} is now officially in its correct position.`);
    }

    setArray(prev => {
      const next = [...prev];
      if (step.type === 'swap' && step.j !== undefined) {
        [next[step.i], next[step.j]] = [next[step.j], next[step.i]];
        setInstructorMsg(`Swapping positions: Index ${step.i} ↔ Index ${step.j}. Shifted higher value right.`);
      } else if (step.type === 'overwrite' && step.value !== undefined) {
        next[step.i] = { ...next[step.i], value: step.value };
        setInstructorMsg(`Overwriting index ${step.i} with value ${step.value} as part of the recursive logic.`);
      }
      return next;
    });

    // Handle teaching questions for first few steps of bubble sort
    if (algo === 'bubble' && step.type === 'compare' && idx < 5) {
      setIsSorting(false); // Pause
      const currentVals = arrayRef.current;
      const valI = currentVals[step.i].value;
      const valJ = currentVals[step.j!].value;

      setInteractiveQuestion({
        text: `Which balloon is bigger? (${valI} or ${valJ})`,
        options: [
          { label: `${valI}`, value: step.i },
          { label: `${valJ}`, value: step.j! }
        ],
        onAnswer: (val) => {
          const correctIdx = valI > valJ ? step.i : step.j!;
          if (val === correctIdx) {
            setInstructorMsg("Exactly! The bigger one should move to the right.");
            setInteractiveQuestion(null);
            setTimeout(() => {
              setIsSorting(true);
              setCurrentStepIdx(i => i + 1);
            }, 1000);
          } else {
            setInstructorMsg("❌ Oops! Check the sizes again. Which one occupies more space?");
          }
        }
      });
    }
  }, [steps, algo]);

  // Handle Logic Application
  useEffect(() => {
    if (isSorting && currentStepIdx >= 0) {
      applyStepLogic(currentStepIdx);
    }
  }, [isSorting, currentStepIdx, applyStepLogic]);

  // Handle Multi-Algorithm Race Timing
  useEffect(() => {
    if (isSorting && isRaceMode && Object.keys(raceData).length > 0) {
      const timer = setTimeout(() => {
        setRaceData(prev => {
          const next = { ...prev };
          let allDone = true;
          let firstFinishedThisTurn: string | null = null;

          Object.keys(next).forEach(a => {
            const data = next[a];
            if (data.isFinished) return;

            const step = data.steps[data.currentIdx];
            if (!step || data.currentIdx >= data.steps.length) {
              data.isFinished = true;
              if (!raceWinner && !firstFinishedThisTurn) {
                firstFinishedThisTurn = a;
              }
              return;
            }

            allDone = false;
            
            // Apply logic to this algo's state
            const highlights: Record<number, string> = {};
            const sortedIndices = new Set(data.sortedIndices);
            const array = [...data.array];

            if (step.type === 'compare') {
              highlights[step.i] = 'comparing';
              highlights[step.j!] = 'comparing';
            } else if (step.type === 'select') {
              highlights[step.i] = 'selected';
            } else if (step.type === 'done') {
              sortedIndices.add(step.i);
            } else if (step.type === 'swap') {
              [array[step.i], array[step.j!]] = [array[step.j!], array[step.i]];
            } else if (step.type === 'overwrite') {
              array[step.i] = { ...array[step.i], value: step.value! };
            }

            next[a] = {
              ...data,
              array,
              highlights,
              sortedIndices,
              currentIdx: data.currentIdx + 1,
              stepCount: data.stepCount + 1
            };
          });

          if (firstFinishedThisTurn && !raceWinner) {
            setRaceWinner(firstFinishedThisTurn);
          }

          if (allDone) {
            setIsSorting(false);
          }

          return next;
        });
      }, Math.max(100, speed / 3)); // Slightly slower in race mode for visibility
      return () => clearTimeout(timer);
    }
  }, [isSorting, isRaceMode, raceData, speed, raceWinner]);
  // Handle Race winner announcement and confetti
  useEffect(() => {
    if (raceWinner) {
      const winnerAlgo = raceWinner.toLowerCase();
      let insight = "";
      if (['quick', 'merge'].includes(winnerAlgo)) {
        insight = " For large datasets, O(n log n) is non-negotiable. Efficiency is power.";
      } else if (['insertion', 'bubble', 'selection'].includes(winnerAlgo)) {
        insight = " Surprising! For tiny sets, simple logic sometimes sneaks ahead of the overhead.";
      } else if (winnerAlgo === 'radix') {
        insight = " Radical! Radix logic bypasses comparisons entirely. Cheating? No, just clever.";
      }
      
      setInstructorMsg(`WINNER: ${raceWinner.toUpperCase()}!${insight}`);
      
      // Winner Confetti - targeted at the winning card
      setTimeout(() => {
        const winnerCard = document.getElementById(`race-card-${raceWinner}`);
        let origin = { x: 0.5, y: 0.6 };
        
        if (winnerCard) {
          const rect = winnerCard.getBoundingClientRect();
          origin = {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          };
        }

        confetti({
          particleCount: 150,
          spread: 70,
          origin,
          colors: ['#06b6d4', '#f59e0b', '#10b981'],
          zIndex: 100
        });
      }, 100);
    }
  }, [raceWinner]);

  // Handle Timing (Progress to next step)
  useEffect(() => {
    if (isSorting && currentStepIdx >= 0 && !isRaceMode) {
      if (currentStepIdx >= steps.length) {
        setIsSorting(false);
        setInstructorMsg("Array Sorted Successfully! Fantastic job!");
        
        // Multi-burst immersive confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return;
      }
      
      // Don't auto-progress if a question is active or if isSorting was turned off
      if (!isSorting) return;

      // We only want to set the next timeout IF we aren't in a teaching pause
      const step = steps[currentStepIdx];
      const isBubblePause = algo === 'bubble' && step?.type === 'compare' && currentStepIdx < 5;
      
      if (!isBubblePause) {
        const timer = setTimeout(() => {
          setCurrentStepIdx(i => i + 1);
        }, speed);
        return () => clearTimeout(timer);
      }
    }
  }, [isSorting, currentStepIdx, speed, steps, algo, isRaceMode]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} font-sans overflow-hidden flex flex-col selection:bg-cyan-500/30 transition-colors duration-500`}>
      <Background theme={theme} />
      
      {/* Top Header */}
      <header className={`flex items-center justify-between px-10 py-6 z-30 transition-all ${mode === 'lobby' ? 'absolute top-0 left-0 right-0' : (theme === 'dark' ? 'glass' : 'bg-white/90 backdrop-blur-md border-b-2 border-slate-200 shadow-sm')}`}>
        <button 
          onClick={() => setMode('lobby')}
          className="flex items-center gap-3 group"
        >
          <div className={`${theme === 'dark' ? 'bg-cyan-500 shadow-[0_0_15px_var(--color-accent-glow)]' : 'bg-cyan-600 shadow-lg shadow-cyan-600/20'} w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <span className={`${theme === 'dark' ? 'text-black' : 'text-white'} font-black text-xl leading-none`}>L</span>
          </div>
          <h1 className={`text-2xl font-black tracking-tighter transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>LEARN.CODE.PLAY</h1>
        </button>
        
        {mode !== 'lobby' && (
          <nav className={`flex gap-1 p-1 rounded-full border-2 transition-colors ${theme === 'dark' ? 'bg-slate-900/80 border-white/5' : 'bg-slate-100 border-slate-300 shadow-inner'}`}>
            {['learn', 'code', 'play'].map((m) => (
              <button 
                key={m}
                onClick={() => handleStart(m as any)}
                className={`px-8 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${
                  (mode === m || (m === 'learn' && mode === 'algo_select')) 
                    ? (theme === 'dark' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30') 
                    : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                }`}
              >
                {m}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-3 rounded-xl border transition-all hover:scale-110 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-yellow-400 hover:bg-slate-700 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50 shadow-sm'}`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {mode !== 'lobby' && (
            <div className={`px-4 py-1.5 rounded border text-[10px] font-mono uppercase tracking-[0.2em] transition-colors ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-100 border-cyan-200 text-cyan-700'}`}>
              Status: {isSorting ? 'Processing' : (mode === 'code' ? 'Coding' : (mode === 'play' ? 'Playing' : 'Learning'))}
            </div>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mode === 'lobby' && (
          <motion.div key="lobby" exit={{ opacity: 0 }}>
            <Landing onStart={handleStart} theme={theme} />
          </motion.div>
        )}

        {mode === 'algo_select' && (
          <motion.div
            key="algo_select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center gap-12"
          >
            <div className="text-center">
              <h2 className={`text-4xl font-black mb-2 uppercase tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Select Protocol</h2>
              <p className={`text-sm font-bold uppercase tracking-[0.3em] transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Choose an algorithm to begin visualization</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full px-8">
              {['bubble', 'insertion', 'selection', 'merge', 'quick', 'radix'].map((a) => (
                <button
                  key={a}
                  onClick={() => selectAlgorithm(a as Algorithm)}
                  className={`group relative p-10 border rounded-2xl transition-all flex flex-col items-center gap-4 overflow-hidden ${theme === 'dark' ? 'bg-slate-900/40 border-white/10 hover:border-cyan-500 shadow-2xl' : 'bg-white border-slate-200 hover:border-cyan-600 shadow-sm hover:shadow-xl'}`}
                >
                  <div className={`absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'bg-cyan-500/5' : 'bg-cyan-500/10'}`} />
                  <span className={`relative text-2xl font-black capitalize transition-colors ${theme === 'dark' ? 'text-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-cyan-700'}`}>
                    {a} Sort
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_#22d3ee]' : 'bg-slate-200 group-hover:bg-cyan-600 group-hover:shadow-[0_0_8px_rgba(8,145,178,0.5)]'}`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <CodeMode 
              initialAlgo={(algo as any) || 'bubble'} 
              onAlgorithmChange={(a) => setAlgo(a as any)}
              theme={theme}
            />
          </motion.div>
        )}

        {mode === 'play' && (
          <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <PlayMode theme={theme} />
          </motion.div>
        )}

        {mode === 'sorting' && (
          <motion.div
            key="sorting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex"
          >
            {/* Sidebar */}
            <aside className={`w-80 p-8 flex flex-col gap-8 z-20 overflow-y-auto transition-colors ${theme === 'dark' ? 'glass-heavy border-r border-white/5' : 'bg-white border-r-2 border-slate-200 shadow-xl'}`}>
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="flex flex-col gap-4 mb-4">
                  <label className={`block text-sm uppercase tracking-[0.2em] font-black transition-colors ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>Protocol Competitors</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bubble', 'insertion', 'selection', 'merge', 'quick', 'radix'] as Algorithm[]).map(a => (
                      <button
                        key={a}
                        onClick={() => {
                          setSelectedRaceAlgos(prev => 
                            prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
                          );
                        }}
                        className={`text-sm py-3 rounded-xl border-2 font-black uppercase transition-all ${
                          selectedRaceAlgos.includes(a) 
                            ? (theme === 'dark' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200' : 'bg-cyan-600 border-cyan-700 text-white shadow-md')
                            : (theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300')
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`flex justify-between items-center mb-4 pt-4 border-t transition-colors ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <label className={`block text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>Active Protocol</label>
                  <button 
                    onClick={() => {
                       if (isRaceMode) {
                         setIsRaceMode(false);
                         setIsSorting(false);
                       } else {
                         startRace();
                       }
                    }}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${isRaceMode ? 'bg-orange-500 text-black' : (theme === 'dark' ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200')}`}
                  >
                    {isRaceMode ? 'Exit Race' : 'Start Race'}
                  </button>
                </div>
                <button 
                  disabled={isRaceMode}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full text-left px-5 py-4 border-2 rounded-xl flex justify-between items-center group transition-all ${isDropdownOpen ? (theme === 'dark' ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-cyan-600 shadow-md ring-2 ring-cyan-100') : (theme === 'dark' ? 'border-cyan-500/40' : 'border-slate-300 shadow-sm')} ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-white'} ${isRaceMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`font-black capitalize tracking-tight transition-colors ${theme === 'dark' ? 'text-cyan-100' : 'text-slate-900'}`}>{isRaceMode ? 'Race Mode' : `${algo} Sort`}</span>
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse ${theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full pt-2 z-30">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-xl p-2 shadow-2xl backdrop-blur-xl transition-colors ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
                    >
                      {['bubble', 'insertion', 'selection', 'merge', 'quick', 'radix'].map((a) => (
                        <button
                          key={a}
                          onClick={() => {
                            selectAlgorithm(a as Algorithm);
                            setSortedIndices(new Set());
                            setHighlights({});
                            setSteps([]);
                            setCurrentStepIdx(-1);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-bold capitalize mb-1 last:mb-0 ${
                            algo === a 
                              ? (theme === 'dark' ? 'bg-cyan-500 text-black' : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20') 
                              : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')
                          }`}
                        >
                          {a} Sort
                        </button>
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>

              <div 
                className="relative"
                onMouseEnter={() => setIsVisualDropdownOpen(true)}
                onMouseLeave={() => setIsVisualDropdownOpen(false)}
              >
                <label className={`block text-[10px] uppercase tracking-[0.2em] font-bold mb-4 transition-colors ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>Visual Object</label>
                <button 
                  onClick={() => setIsVisualDropdownOpen(!isVisualDropdownOpen)}
                  className={`w-full text-left px-5 py-4 border-2 rounded-xl flex justify-between items-center group transition-all ${isVisualDropdownOpen ? (theme === 'dark' ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-cyan-600 shadow-md ring-2 ring-cyan-100') : (theme === 'dark' ? 'border-cyan-500/40' : 'border-slate-300 shadow-sm')} ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-white'}`}
                >
                  <span className={`font-black capitalize tracking-tight transition-colors ${theme === 'dark' ? 'text-cyan-100' : 'text-slate-900'}`}>{visualType}</span>
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse ${theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'}`} />
                </button>
                
                {isVisualDropdownOpen && (
                  <div className="absolute top-full left-0 w-full pt-2 z-30">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-xl p-2 shadow-2xl backdrop-blur-xl transition-colors ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
                    >
                      {['balloons', 'bars', 'lines', 'lollipops', 'fun'].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setVisualType(t as any);
                            setIsVisualDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-bold capitalize mb-1 last:mb-0 ${
                            visualType === t 
                              ? (theme === 'dark' ? 'bg-cyan-500 text-black' : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20') 
                              : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-[10px] uppercase tracking-[0.2em] font-bold mb-4 transition-colors ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>Simulation Controls</label>
                <div className="flex flex-col gap-4">
                  <Controls
                    algorithm={algo || ''}
                    speed={speed}
                    theme={theme}
                    onSpeedChange={setSpeed}
                    onRandom={generateRandomArray}
                    onManual={(vals) => {
                      setArray(vals.map((v, i) => ({ id: `manual-${i}-${Date.now()}`, value: v })));
                      setSortedIndices(new Set());
                      setHighlights({});
                      setSteps([]);
                      setCurrentStepIdx(-1);
                      setInstructorMsg("Manual dataset accepted.");
                    }}
                    onStart={runTeachingFlow}
                    isSorting={isSorting || !!interactiveQuestion}
                    onReset={() => {
                       setIsSorting(false);
                       setCurrentStepIdx(-1);
                       setSteps([]);
                       setHighlights({});
                       setSortedIndices(new Set());
                       setInstructorMsg("Reset! Ready whenever you are.");
                    }}
                  />
                </div>
              </div>

              <div className="mt-auto">
                <div className={`p-6 rounded-2xl border-2 transition-colors ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200 shadow-sm'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 transition-colors ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'}`}>Complexity</p>
                  <p className={`text-3xl font-mono transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {algo === 'bubble' || algo === 'insertion' || algo === 'selection' ? 'O(n²)' : 'O(n log n)'}
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Stage */}
            <section className={`flex-1 relative flex flex-col items-center ${isRaceMode ? 'justify-start overflow-y-auto py-12 px-4' : 'justify-center pb-32'}`}>
              {!isRaceMode ? (
                <Visualizer
                  array={array}
                  steps={steps}
                  speed={speed}
                  highlights={highlights}
                  sortedIndices={sortedIndices}
                  visualType={visualType}
                  theme={theme}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl px-8 mt-4 auto-rows-fr">
                   {Object.entries(raceData).map(([name, data]: [string, any]) => (
                     <div key={name} id={`race-card-${name}`} className={`relative group p-6 rounded-[2rem] border transition-all flex flex-col h-[380px] overflow-hidden ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-cyan-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-cyan-600/30'}`}>
                        <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_#22d3ee] ${theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-600'}`} />
                              <h4 className={`text-xs font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{name} Sort</h4>
                           </div>
                           <span className={`text-[10px] font-mono px-3 py-1 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-500 bg-white/5' : 'text-slate-400 bg-slate-50'}`}>{data.stepCount} Operations</span>
                        </div>
                        
                        <div className="flex-1 flex items-end justify-center overflow-hidden pb-8">
                          <Visualizer
                            array={data.array}
                            steps={[]}
                            speed={speed}
                            highlights={data.highlights}
                            sortedIndices={data.sortedIndices}
                            visualType={visualType}
                            compact={true}
                            theme={theme}
                            pointers={data.pointers}
                          />
                        </div>

                        {data.isFinished && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10"
                          >
                             <div className={`px-8 py-6 rounded-3xl border-2 ${raceWinner === name ? 'border-yellow-500 bg-yellow-400/10 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-white/20 bg-white/5'} flex flex-col items-center gap-2 transform -rotate-1`}>
                                <span className="text-xs font-black uppercase tracking-widest text-white">{raceWinner === name ? '🏆 VICTOR' : 'COMPLETED'}</span>
                                <span className={raceWinner === name ? "text-3xl font-black text-yellow-400" : "text-3xl font-black text-white"}>{data.stepCount} Op</span>
                             </div>
                          </motion.div>
                        )}
                     </div>
                   ))}
                </div>
              )}

              {!isRaceMode && mode !== 'code' && (
                <>
                  {isSorting && !interactiveQuestion ? (
                    <Avatar
                      variant="bar"
                      message={instructorMsg}
                      isThinking={true}
                      theme={theme}
                    />
                  ) : (
                    <Avatar
                      message={instructorMsg}
                      position={avatarPos}
                      isThinking={!!interactiveQuestion}
                      theme={theme}
                    />
                  )}

                  {interactiveQuestion && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`p-10 rounded-[40px] text-center max-w-md w-full mx-4 shadow-3xl border-2 ${theme === 'dark' ? 'bg-slate-900 border-cyan-500 shadow-cyan-500/20' : 'bg-white border-cyan-600 shadow-xl'}`}
                      >
                        <h3 className={`text-2xl font-black mb-8 uppercase tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{interactiveQuestion.text}</h3>
                        <div className="flex gap-4 justify-center">
                          {interactiveQuestion.options.map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() => interactiveQuestion.onAnswer(opt.value)}
                              className={`px-10 py-4 font-black text-xl rounded-full transition-all hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </>
              )}
              
              {isRaceMode && (
                 <Avatar
                  variant="bar"
                  message={instructorMsg}
                  isThinking={isSorting && !raceWinner}
                  theme={theme}
                />
              )}
            </section>

            {/* Bottom Progress Bar */}
            {!isRaceMode && (
              <div className={`fixed bottom-0 left-0 right-0 h-1.5 z-50 transition-colors ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isSorting ? `${((currentStepIdx + 1) / steps.length) * 100}%` : '0%' }}
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_10px_#0891b2]" 
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

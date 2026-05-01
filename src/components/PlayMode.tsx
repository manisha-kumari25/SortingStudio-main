import { useState, useEffect, useRef, useCallback, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Shield, Heart, Coins, Play, Zap, Info, Terminal, Layout, Plus, Trash2, Code, XCircle } from 'lucide-react';

interface Enemy {
  id: string;
  value: number;
  originalValue: number;
  x: number;
  y: number;
  speed: number;
  health: number;
}

interface Tower {
  id: string;
  type: 'bubble' | 'quick' | 'merge';
  x: number;
  y: number;
  range: number;
  damage: number;
  cooldown: number;
  lastFired: number;
  level: number;
}

interface Projectile {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: string;
}

interface PlayModeProps {
  theme: 'dark' | 'light';
}

export default function PlayMode({ theme }: PlayModeProps) {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameOver'>('lobby');
  const [selectedGame, setSelectedGame] = useState<'defense' | 'matching' | 'speed' | 'recognition' | 'code_expert' | 'step_master'>('defense');
  
  // Code Expert State
  const [codeQuiz, setCodeQuiz] = useState<{ name: string, code: string, options: string[] } | null>(null);
  const [codeCorrectCount, setCodeCorrectCount] = useState(0);

  // Step Master State
  const [stepTargetAlgo, setStepTargetAlgo] = useState<string>('');
  const [stepArray, setStepArray] = useState<number[]>([]);
  const [stepMode, setStepMode] = useState<'single' | 'full'>('single');
  const [stepInstruction, setStepInstruction] = useState<string>('');
  const [stepFeedback, setStepFeedback] = useState<{ isCorrect: boolean, message: string } | null>(null);
  const [stepCurrentSwap, setStepCurrentSwap] = useState<{ i: number, j: number } | null>(null);
  const [stepPassIndex, setStepPassIndex] = useState(0);
  
  // Sort Recognition State
  const [recognizeAlgo, setRecognizeAlgo] = useState<string>('');
  const [recognizeOptions, setRecognizeOptions] = useState<string[]>([]);
  const [recognizeArray, setRecognizeArray] = useState<number[]>([]);
  const [recognizePointers, setRecognizePointers] = useState<{ i: number, j: number }>({ i: -1, j: -1 });
  const [isRecognizeSorting, setIsRecognizeSorting] = useState(false);
  const [recognizeStatus, setRecognizeStatus] = useState<string>('Analyzing...');
  const [recognizeTimer, setRecognizeTimer] = useState(15);
  const [recognizeRound, setRecognizeRound] = useState(1);
  const [recognizeQuestionIdx, setRecognizeQuestionIdx] = useState(0);
  const [recognizeFeedback, setRecognizeFeedback] = useState<{ isCorrect: boolean, message: string } | null>(null);
  const [recognizeLives, setRecognizeLives] = useState(3);
  const [recognizeCorrectCount, setRecognizeCorrectCount] = useState(0);

  // Sort Defense State
  const [health, setHealth] = useState(15); 
  const [money, setMoney] = useState(250); 
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  
  // Merge Match State
  const [fragments, setFragments] = useState<{ id: string, values: number[] }[]>([]);
  const [mergeSteps, setMergeSteps] = useState(0);
  const [targetArray, setTargetArray] = useState<number[]>([]);
  
  const [score, setScore] = useState(0);
  
  const [selectedTowerType, setSelectedTowerType] = useState<'bubble' | 'quick' | 'merge'>('bubble');

  const GAME_OVER_TEXT = {
    defense: { title: 'System Breach', subtitle: 'Unsorted data reached the core' },
    matching: { title: 'Logic Error', subtitle: 'The merge sequence was compromised' },
    speed: { title: 'Brain Freeze', subtitle: 'Complexity overwhelmed the processor' },
    recognition: { title: 'Pattern Failure', subtitle: 'Algorithm identification failed' },
    code_expert: { title: 'Syntax Error', subtitle: 'Logic recognition failed' },
    step_master: { title: 'Execution Error', subtitle: 'Incorrect step performed' },
  };

  const returnToLobby = () => {
    setGameState('lobby');
    setHealth(15);
    setMoney(250);
    setWave(1);
    setEnemies([]);
    setTowers([]);
    setProjectiles([]);
    setStreak(0);
    setScore(0);
    setQuizTimer(20);
    setIsRecognizeSorting(false);
    setRecognizeRound(1);
    setRecognizeQuestionIdx(0);
    setRecognizeLives(3);
    setRecognizeCorrectCount(0);
    setRecognizeFeedback(null);
    setCodeQuiz(null);
    setCodeCorrectCount(0);
    setStepFeedback(null);
    setStepTargetAlgo('');
    setStepArray([]);
    setStepMode('single');
  };

  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);

  const TOWER_CONFIGS = {
    bubble: { name: 'Bubble Blast', cost: 50, range: 120, damage: 6, cooldown: 700, color: '#06b6d4', desc: 'Standard sorting discharge.' },
    quick: { name: 'Quick Strike', cost: 85, range: 220, damage: 18, cooldown: 350, color: '#f59e0b', desc: 'High velocity single-target.' },
    merge: { name: 'Merge Freeze', cost: 130, range: 160, damage: 10, cooldown: 1000, color: '#8b5cf6', desc: 'Slows down packets on impact.' },
  };

  const spawnEnemy = useCallback(() => {
    const id = Math.random().toString(36).substr(2, 9);
    const value = Math.floor(Math.random() * (wave * 8)) + 12;
    const newEnemy: Enemy = {
      id,
      value,
      originalValue: value,
      x: -50,
      y: 150 + Math.random() * 100,
      speed: 0.8 + (wave * 0.08), // Slightly slower than before
      health: value,
    };
    setEnemies(prev => [...prev, newEnemy]);
  }, [wave]);

  const fireTower = useCallback((tower: Tower, target: Enemy) => {
    const projectile: Projectile = {
      id: Math.random().toString(36).substr(2, 9),
      startX: tower.x,
      startY: tower.y,
      targetX: target.x,
      targetY: target.y,
      color: TOWER_CONFIGS[tower.type].color,
    };
    
    setProjectiles(prev => [...prev, projectile]);
    setTimeout(() => {
      setProjectiles(prev => prev.filter(p => p.id !== projectile.id));
      
      setEnemies(prev => prev.map(e => {
        if (e.id === target.id) {
          const dmg = tower.type === 'merge' ? tower.damage : tower.damage;
          return { ...e, value: Math.max(0, e.value - dmg) };
        }
        return e;
      }));
    }, 100);
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (gameState !== 'playing') return;

    // Spawning logic
    if (time - lastSpawnRef.current > 2000 / (1 + wave * 0.1)) {
      spawnEnemy();
      lastSpawnRef.current = time;
    }

    // Move enemies
    setEnemies(prev => {
      const next = prev.map(e => ({ ...e, x: e.x + e.speed }))
        .filter(e => {
          if (e.x > 1000) {
            setHealth(h => {
              if (h <= 1) setGameState('gameOver');
              return Math.max(0, h - 1);
            });
            return false;
          }
          if (e.value <= 0) {
            setMoney(m => m + 10 + Math.floor(e.originalValue / 5));
            setScore(s => s + e.originalValue);
            return false;
          }
          return true;
        });
      return next;
    });

    // Tower firing logic
    setTowers(prev => {
      const nextTowers = prev.map(tower => {
        if (time - tower.lastFired > tower.cooldown) {
          // Find target in range
          const target = enemies.find(e => {
            const dist = Math.sqrt(Math.pow(e.x - tower.x, 2) + Math.pow(e.y - tower.y, 2));
            return dist < tower.range;
          });

          if (target) {
            fireTower(tower, target);
            return { ...tower, lastFired: time };
          }
        }
        return tower;
      });
      return nextTowers;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, wave, enemies, fireTower, spawnEnemy]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);

  const startMergeMatch = useCallback(() => {
    const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 50) + 1);
    setTargetArray([...base].sort((a, b) => a - b));
    
    const frags = base.map((v, i) => ({ id: `f-${i}`, values: [v] }));
    setFragments(frags);
    setMergeSteps(0);
    setGameState('playing');
  }, []);

  const handleMerge = (id1: string, id2: string) => {
    if (id1 === id2) return;
    
    setFragments(prev => {
      const f1 = prev.find(f => f.id === id1);
      const f2 = prev.find(f => f.id === id2);
      
      if (!f1 || !f2) return prev;
      
      const merged = [...f1.values, ...f2.values].sort((a, b) => a - b);
      const next = prev.filter(f => f.id !== id1 && f.id !== id2);
      next.push({ id: `merge-${Date.now()}`, values: merged });
      
      if (next.length === 1 && JSON.stringify(next[0].values) === JSON.stringify(targetArray)) {
        setScore(s => s + 1000);
        confetti();
      }
      return next;
    });
    setMergeSteps(s => s + 1);
  };

  // Big-O Speed Trial State
  const [currentQuiz, setCurrentQuiz] = useState<{ algo: string, case: string, options: string[], answer: string } | null>(null);
  const [quizTimer, setQuizTimer] = useState(10);
  const [streak, setStreak] = useState(0);

  const [showRules, setShowRules] = useState<string | null>(null);

  const QUIZ_DATA = [
     { algo: 'Bubble Sort', case: 'Worst Case', options: ['O(n)', 'O(n log n)', 'O(n²)'], answer: 'O(n²)' },
     { algo: 'Quick Sort', case: 'Average Case', options: ['O(1)', 'O(n log n)', 'O(n)'], answer: 'O(n log n)' },
     { algo: 'Merge Sort', case: 'Worst Case', options: ['O(n log n)', 'O(n²)', 'O(n)'], answer: 'O(n log n)' },
     { algo: 'Binary Search', case: 'Worst Case', options: ['O(n)', 'O(log n)', 'O(1)'], answer: 'O(log n)' },
     { algo: 'Insertion Sort', case: 'Best Case', options: ['O(n)', 'O(n²)', 'O(1)'], answer: 'O(n)' },
     { algo: 'Radix Sort', case: 'Worst Case', options: ['O(nk)', 'O(n²)', 'O(n log n)'], answer: 'O(nk)' }
  ];

  const MAX_QUIZ_TIMER = 20;

  const startBigOSpeed = useCallback((currentStreak?: number) => {
    const s = currentStreak !== undefined ? currentStreak : streak;
    const random = QUIZ_DATA[Math.floor(Math.random() * QUIZ_DATA.length)];
    setCurrentQuiz(random);
    setQuizTimer(Math.max(3, MAX_QUIZ_TIMER - s * 0.5));
    setGameState('playing');
  }, [streak]);

  const startCodeExpert = useCallback(() => {
    const snippets = [
      {
        name: 'Bubble Sort',
        code: `for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n - i - 1; j++) {\n    if (arr[j] > arr[j + 1]) {\n      [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n    }\n  }\n}`
      },
      {
        name: 'Selection Sort',
        code: `for (let i = 0; i < n; i++) {\n  let min = i;\n  for (let j = i + 1; j < n; j++) {\n    if (arr[j] < arr[min]) min = j;\n  }\n  [arr[i], arr[min]] = [arr[min], arr[i]];\n}`
      },
      {
        name: 'Insertion Sort',
        code: `for (let i = 1; i < n; i++) {\n  let curr = arr[i];\n  let j = i - 1;\n  while (j >= 0 && arr[j] > curr) {\n    arr[j + 1] = arr[j];\n    j--;\n  }\n  arr[j + 1] = curr;\n}`
      },
      {
        name: 'Quick Sort (Partition)',
        code: `let pivot = arr[high];\nlet i = low - 1;\nfor (let j = low; j < high; j++) {\n  if (arr[j] < pivot) {\n    i++;\n    [arr[i], arr[j]] = [arr[j], arr[i]];\n  }\n}`
      }
    ];
    const target = snippets[Math.floor(Math.random() * snippets.length)];
    const others = snippets.filter(s => s.name !== target.name).map(s => s.name);
    const options = [target.name, ...others.sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
    
    setCodeQuiz({ ...target, options });
    setGameState('playing');
  }, []);

  const startStepMaster = useCallback((isContinuing: boolean = false) => {
    const types = ['Bubble Sort', 'Selection Sort', 'Insertion Sort'];
    // Default to Bubble Sort if starting fresh from lobby (stepTargetAlgo is empty)
    const nextAlgo = !isContinuing 
      ? (stepTargetAlgo === '' ? 'Bubble Sort' : types[Math.floor(Math.random() * types.length)]) 
      : stepTargetAlgo;
    
    const nextMode = !isContinuing ? (Math.random() > 0.4 ? 'full' : 'single') : stepMode;
    
    if (!isContinuing) {
      const arr = Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 10);
      setStepArray(arr);
      setStepPassIndex(0);
      setStepTargetAlgo(nextAlgo);
      setStepMode(nextMode);
    }
    
    setStepCurrentSwap(null);
    setStepFeedback(null);
    
    let instruction = "";
    if (nextMode === 'full') {
      instruction = `Execution Protocol: Manually sort the entire array using ${nextAlgo}. Complete the full sort sequence.`;
    } else {
      if (nextAlgo === 'Bubble Sort') instruction = "Task: Perform the next immediate swap for Bubble Sort (find the first pair where arr[j] > arr[j+1]).";
      else if (nextAlgo === 'Selection Sort') instruction = "Task: Perform the correct Selection Sort swap (find min of remaining and swap with current start).";
      else instruction = "Task: Perform the first backward swap for Insertion Sort to shift a small element to its correct place.";
    }
    setStepInstruction(instruction);
    setGameState('playing');
  }, [stepTargetAlgo, stepMode]);

  const startRecognition = useCallback((forceRound?: number, forceIdx?: number) => {
    const algos = [
      { name: 'Bubble Sort', desc: 'Compares adjacent elements and swaps them if they are in the wrong order.' },
      { name: 'Selection Sort', desc: 'Repeatedly finds the minimum element and moves it to the beginning.' },
      { name: 'Insertion Sort', desc: 'Builds the final sorted array one item at a time, shifting larger elements.' },
      { name: 'Quick Sort', desc: 'Uses a pivot to partition the array into smaller and larger elements.' },
      { name: 'Merge Sort', desc: 'Recursively divides the array into halves until single elements, then merges back.' }
    ];
    const item = algos[Math.floor(Math.random() * algos.length)];
    const selected = item.name;
    
    // Create random small array
    const arr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 10);
    setRecognizeArray(arr);
    setRecognizeAlgo(selected);
    setRecognizePointers({ i: -1, j: -1 });
    setIsRecognizeSorting(true);
    setRecognizeTimer(15);
    setRecognizeFeedback(null);
    
    if (forceRound !== undefined) setRecognizeRound(forceRound);
    if (forceIdx !== undefined) setRecognizeQuestionIdx(forceIdx);

    // Create Distractors
    const others = algos.filter(a => a.name !== selected);
    const shuffledOptions = [selected, ...others.sort(() => Math.random() - 0.5).slice(0, 2).map(o => o.name)].sort(() => Math.random() - 0.5);
    setRecognizeOptions(shuffledOptions);
    setGameState('playing');
  }, []);

  const handleRecognitionAnswer = (ans: string | null) => {
    if (recognizeFeedback || gameState !== 'playing') return; 

    const isTimeout = ans === 'TIMEOUT' || ans === null;
    const isCorrect = ans === recognizeAlgo;
    const correctAlgoDesc = [
      { name: 'Bubble Sort', desc: 'Look for consecutive swaps of adjacent elements moving the largest to the end.' },
      { name: 'Selection Sort', desc: 'Look for a scan of the full remaining array to find the absolute minimum for the next slot.' },
      { name: 'Insertion Sort', desc: 'Look for a single element being shifted backwards into its correct position in a prefix.' },
      { name: 'Quick Sort', desc: 'Look for partitions around a pivot with larger skips across the array.' },
      { name: 'Merge Sort', desc: 'Look for structured splitting and merging of sub-blocks.' }
    ].find(a => a.name === recognizeAlgo)?.desc || '';

    if (isCorrect) {
      setScore(s => s + 1);
      setRecognizeCorrectCount(c => c + 1);
      confetti();
      setRecognizeFeedback({ isCorrect: true, message: "Perfect! You recognized the pattern." });
    } else {
      setScore(s => Math.max(0, s - 3));
      const newLives = recognizeLives - 1;
      setRecognizeLives(newLives);
      const msg = isTimeout 
        ? `Time Out! The algorithm was ${recognizeAlgo}. ${correctAlgoDesc}`
        : `Incorrect. That was ${recognizeAlgo}. ${correctAlgoDesc}`;
      setRecognizeFeedback({ isCorrect: false, message: msg });
      
      if (newLives <= 0) {
        setTimeout(() => setGameState('gameOver'), 3000);
        return;
      }
    }

    // Auto-advance
    setTimeout(() => {
      const nextIdx = recognizeQuestionIdx + 1;
      const questionsInRound = recognizeRound === 1 ? 3 : 5;

      if (nextIdx >= questionsInRound) {
        if (recognizeRound === 1) {
          setRecognizeRound(2);
          setRecognizeQuestionIdx(0);
          startRecognition(2, 0); 
        } else {
          setGameState('gameOver');
        }
      } else {
        setRecognizeQuestionIdx(nextIdx);
        startRecognition(recognizeRound, nextIdx);
      }
    }, isCorrect ? 1500 : 3500); 
  };

  const handleCodeExpertAnswer = (ans: string) => {
    if (!codeQuiz) return;
    if (ans === codeQuiz.name) {
      setScore(s => s + 1000);
      setCodeCorrectCount(c => c + 1);
      confetti();
      startCodeExpert();
    } else {
      setGameState('gameOver');
    }
  };

  const handleStepSwap = (idx: number) => {
    if (stepCurrentSwap === null) {
      setStepCurrentSwap({ i: idx, j: -1 });
    } else {
      const i = stepCurrentSwap.i;
      const j = idx;
      if (i === j) {
        setStepCurrentSwap(null);
        return;
      }

      const newArray = [...stepArray];
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];

      let isCorrect = false;
      const original = [...stepArray];
      
      if (stepTargetAlgo === 'Bubble Sort') {
        let firstSwap = null;
        for (let k = 0; k < original.length - 1; k++) {
          if (original[k] > original[k+1]) {
            firstSwap = { a: k, b: k+1 };
            break;
          }
        }
        if (firstSwap && ((i === firstSwap.a && j === firstSwap.b) || (i === firstSwap.b && j === firstSwap.a))) {
          isCorrect = true;
        }
      } else if (stepTargetAlgo === 'Selection Sort') {
        const passIdx = stepMode === 'full' ? stepPassIndex : 0;
        let actualPassIdx = passIdx;
        
        // Find the first index starting from passIdx that actually needs a swap
        while (actualPassIdx < original.length - 1) {
            let m = actualPassIdx;
            for (let k = actualPassIdx + 1; k < original.length; k++) {
                if (original[k] < original[m]) m = k;
            }
            if (m !== actualPassIdx) {
                if ((i === actualPassIdx && j === m) || (i === m && j === actualPassIdx)) {
                    isCorrect = true;
                    if (stepMode === 'full') setStepPassIndex(actualPassIdx + 1);
                }
                break;
            }
            actualPassIdx++;
        }
      } else if (stepTargetAlgo === 'Insertion Sort') {
         let targetIdx = -1;
         for (let k = 1; k < original.length; k++) {
             if (original[k] < original[k-1]) {
                 targetIdx = k;
                 break;
             }
         }
         if (targetIdx !== -1 && ((i === targetIdx && j === targetIdx - 1) || (i === targetIdx - 1 && j === targetIdx))) {
             isCorrect = true;
         }
      }

      if (isCorrect) {
        setStepArray(newArray);
        setScore(s => s + 1);
        
        const isSorted = newArray.every((val, index) => index === 0 || val >= newArray[index - 1]);
        
        if (stepMode === 'single' || (stepMode === 'full' && isSorted)) {
          setStepFeedback({ isCorrect: true, message: isSorted && stepMode === 'full' ? "System Optimized! Array fully sorted." : "Correct step! Scenario complete." });
          setTimeout(() => {
            setStepFeedback(null);
            startStepMaster(); 
          }, 1500);
        } else {
          setStepFeedback({ isCorrect: true, message: "Valid step! Keep going..." });
          setTimeout(() => {
            setStepFeedback(null);
            setStepCurrentSwap(null);
          }, 800);
        }
      } else {
        setStepFeedback({ isCorrect: false, message: `Logic Breached! Not the valid next step for ${stepTargetAlgo}.` });
        setTimeout(() => setGameState('gameOver'), 2000);
      }
      setStepCurrentSwap(null);
    }
  };
  const handleQuizAnswer = (ans: string) => {
    if (!currentQuiz || gameState !== 'playing') return;
    if (ans === currentQuiz.answer) {
      const nextStreak = streak + 1;
      setScore(s => s + Math.floor(quizTimer * 100));
      setStreak(nextStreak);
      confetti();
      startBigOSpeed(nextStreak);
    } else {
      setGameState('gameOver');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && selectedGame === 'recognition' && isRecognizeSorting) {
      let i = 0;
      let j = 0;
      let minIdx = 0;
      let localArray = [...recognizeArray];
      let state = 'init';

      interval = setInterval(() => {
        setRecognizeArray([...localArray]);
        
        switch (recognizeAlgo) {
          case 'Bubble Sort':
            if (i < localArray.length - 1) {
              if (j < localArray.length - i - 1) {
                setRecognizePointers({ i: j, j: j + 1 });
                if (localArray[j] > localArray[j+1]) {
                  setRecognizeStatus('SWAPPING');
                  [localArray[j], localArray[j+1]] = [localArray[j+1], localArray[j]];
                } else {
                  setRecognizeStatus('COMPARING');
                }
                j++;
              } else {
                i++;
                j = 0;
              }
            } else {
              setIsRecognizeSorting(false);
            }
            break;
            
          case 'Selection Sort':
            if (i < localArray.length - 1) {
              if (j < localArray.length) {
                setRecognizePointers({ i, j });
                if (localArray[j] < localArray[minIdx]) {
                  setRecognizeStatus('FOUND NEW MIN');
                  minIdx = j;
                } else {
                  setRecognizeStatus('SCANNING');
                }
                j++;
              } else {
                setRecognizeStatus('FINAL SWAP');
                [localArray[i], localArray[minIdx]] = [localArray[minIdx], localArray[i]];
                i++;
                j = i + 1;
                minIdx = i;
              }
            } else {
              setIsRecognizeSorting(false);
            }
            break;
            
          case 'Insertion Sort':
            if (i < localArray.length) {
              if (j > 0 && localArray[j-1] > localArray[j]) {
                setRecognizeStatus('INSERTING...');
                setRecognizePointers({ i, j: j-1 });
                [localArray[j], localArray[j-1]] = [localArray[j-1], localArray[j]];
                j--;
              } else {
                setRecognizeStatus('SELECTING NEXT');
                i++;
                j = i;
              }
            } else {
              setIsRecognizeSorting(false);
            }
            break;

          default:
            // Fallback for Quick/Merge: Random-ish swaps to look complex
            const idx1 = Math.floor(Math.random() * localArray.length);
            const idx2 = Math.floor(Math.random() * localArray.length);
            setRecognizePointers({ i: idx1, j: idx2 });
            if (Math.random() > 0.5) {
              [localArray[idx1], localArray[idx2]] = [localArray[idx2], localArray[idx1]];
            }
            break;
        }
      }, 600);
    }
    return () => clearInterval(interval);
  }, [gameState, selectedGame, isRecognizeSorting, recognizeAlgo, recognizeArray.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && selectedGame === 'recognition' && !recognizeFeedback) {
      interval = setInterval(() => {
        setRecognizeTimer(t => {
          if (t <= 1) {
            handleRecognitionAnswer('TIMEOUT');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, selectedGame, recognizeFeedback, recognizeAlgo, handleRecognitionAnswer]);

  useEffect(() => {
    if (gameState === 'playing' && selectedGame === 'recognition' && !isRecognizeSorting && !recognizeFeedback) {
      setRecognizeStatus('SORT COMPLETE');
      const timer = setTimeout(() => {
        const arr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 10);
        setRecognizeArray(arr);
        setRecognizePointers({ i: -1, j: -1 });
        setRecognizeStatus('RESTARTING...');
        setIsRecognizeSorting(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState, selectedGame, isRecognizeSorting]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && selectedGame === 'speed') {
       interval = setInterval(() => {
         setQuizTimer(t => {
           if (t <= 0.1) {
             setGameState('gameOver');
             return 0;
           }
           return t - 0.1;
         });
       }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, selectedGame]);

  const handleLevelRestart = () => {
    setScore(0);
    setStreak(0);
    
    if (selectedGame === 'defense') {
      setHealth(15);
      setMoney(250);
      setWave(1);
      setEnemies([]);
      setTowers([]);
      setProjectiles([]);
      setGameState('playing');
    } else if (selectedGame === 'matching') {
      setMergeSteps(0);
      startMergeMatch();
    } else if (selectedGame === 'recognition') {
      setRecognizeRound(1);
      setRecognizeQuestionIdx(0);
      setRecognizeLives(3);
      setRecognizeCorrectCount(0);
      setRecognizeFeedback(null);
      setRecognizeTimer(15);
      startRecognition(1, 0);
    } else if (selectedGame === 'speed') {
      setQuizTimer(20);
      startBigOSpeed(0);
    } else if (selectedGame === 'code_expert') {
      setCodeCorrectCount(0);
      startCodeExpert();
    } else if (selectedGame === 'step_master') {
      setStepFeedback(null);
      setStepCurrentSwap(null);
      startStepMaster();
    }
  };

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const config = TOWER_CONFIGS[selectedTowerType];
    
    if (money >= config.cost) {
      const newTower: Tower = {
        id: Math.random().toString(36).substr(2, 9),
        type: selectedTowerType,
        x,
        y,
        range: config.range,
        damage: config.damage,
        cooldown: config.cooldown,
        lastFired: 0,
        level: 1,
      };
      
      setTowers(prev => [...prev, newTower]);
      setMoney(prev => prev - config.cost);
    }
  };

  return (
    <div className={`flex-1 flex flex-col items-center p-8 transition-colors ${theme === 'dark' ? 'bg-slate-900/20' : 'bg-slate-50'}`}>
      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-6xl h-[calc(100vh-180px)] overflow-y-auto px-6 pb-20 custom-scrollbar flex flex-col items-center gap-16"
          >
            <div className="text-center shrink-0">
              <h2 className={`text-6xl font-black mb-4 uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Algorithm Nexus</h2>
              <p className={`text-sm font-bold uppercase tracking-[0.4em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Select a protocol to begin mastery</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setSelectedGame('defense'); setGameState('playing'); }}
                  className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-cyan-500' : 'bg-white border-slate-200 hover:border-cyan-600 shadow-xl'}`}
                >
                  <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'} group-hover:scale-110 transition-transform`}>
                    <Shield size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className={`text-2xl font-black mb-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Sort Defense</h3>
                    <p className={`text-sm opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Protect your system from unsorted data packets.</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-600'} scale-x-0 group-hover:scale-x-100`} />
                </button>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-2">How to Play</h4>
                  <ul className="text-[11px] space-y-1 text-slate-500 font-medium list-disc ml-3">
                    <li>Select algorithm towers from the store</li>
                    <li>Click main field to deploy them</li>
                    <li>Towers "sort" (damage) data packets</li>
                    <li>Don't let unsorted data reach the exit!</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setSelectedGame('matching'); startMergeMatch(); }}
                  className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-purple-500' : 'bg-white border-slate-200 hover:border-purple-600 shadow-xl'}`}
                >
                  <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'} group-hover:scale-110 transition-transform`}>
                    <Layout size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className={`text-2xl font-black mb-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Merge Match</h3>
                    <p className={`text-sm opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Divide and conquer to reach the target sequence.</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-600'} scale-x-0 group-hover:scale-x-100`} />
                </button>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-2">How to Play</h4>
                  <ul className="text-[11px] space-y-1 text-slate-500 font-medium list-disc ml-3">
                    <li>Drag one box onto another to merge them</li>
                    <li>They will automatically merge in sorted order</li>
                    <li>Match the "Target Sequence" at the top</li>
                    <li>Efficiency counts! Use the fewest steps</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setSelectedGame('speed'); startBigOSpeed(); }}
                  className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-orange-500' : 'bg-white border-slate-200 hover:border-orange-600 shadow-xl'}`}
                >
                  <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'} group-hover:scale-110 transition-transform`}>
                    <Terminal size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className={`text-2xl font-black mb-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Big-O Rush</h3>
                    <p className={`text-sm opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Test your complexity knowledge against time.</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${theme === 'dark' ? 'bg-orange-500' : 'bg-orange-600'} scale-x-0 group-hover:scale-x-100`} />
                </button>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">How to Play</h4>
                  <ul className="text-[11px] space-y-1 text-slate-500 font-medium list-disc ml-3">
                    <li>Identify Big-O for the given algorithm</li>
                    <li>Be quick! The timer resets on every answer</li>
                    <li>Timer gets faster as your streak increases</li>
                    <li>One wrong answer ends the run!</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setSelectedGame('recognition'); startRecognition(); }}
                  className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-600 shadow-xl'}`}
                >
                  <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} group-hover:scale-110 transition-transform`}>
                    <Code size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className={`text-2xl font-black mb-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Sort Sense</h3>
                    <p className={`text-sm opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Identify the algorithm by its visual signature.</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'} scale-x-0 group-hover:scale-x-100`} />
                </button>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">How to Play</h4>
                  <ul className="text-[11px] space-y-1 text-slate-500 font-medium list-disc ml-3">
                    <li>Watch the array being sorted</li>
                    <li>Observe the pointers and swaps</li>
                    <li>Fast identification scores high!</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setSelectedGame('code_expert'); startCodeExpert(); }}
                  className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-600 shadow-xl'}`}
                >
                  <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'} group-hover:scale-110 transition-transform`}>
                    <Terminal size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className={`text-2xl font-black mb-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Code Expert</h3>
                    <p className={`text-sm opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Recognize the algorithm from its source code.</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'} scale-x-0 group-hover:scale-x-100`} />
                </button>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">How to Play</h4>
                  <ul className="text-[11px] space-y-1 text-slate-500 font-medium list-disc ml-3">
                    <li>Analyze the provided code snippet</li>
                    <li>Identify which sorting logic it matches</li>
                    <li>Precision is key for high scores</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setSelectedGame('step_master'); startStepMaster(); }}
                  className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-rose-500' : 'bg-white border-slate-200 hover:border-rose-600 shadow-xl'}`}
                >
                  <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'} group-hover:scale-110 transition-transform`}>
                    <Zap size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className={`text-2xl font-black mb-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Step Master</h3>
                    <p className={`text-sm opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Perform manual steps for a given algorithm.</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all ${theme === 'dark' ? 'bg-rose-500' : 'bg-rose-600'} scale-x-0 group-hover:scale-x-100`} />
                </button>
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">How to Play</h4>
                  <ul className="text-[11px] space-y-1 text-slate-500 font-medium list-disc ml-3">
                    <li>Click two elements to swap them</li>
                    <li>Execute the correct next step of the algo</li>
                    <li>Master every single transition</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && selectedGame === 'defense' && (
          <motion.div 
            key="game-defense"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full max-w-7xl flex flex-col gap-6"
          >
            {/* Game UI Overlay */}
            <header className={`flex justify-between items-center px-8 py-4 rounded-[2rem] border transition-colors ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-md'}`}>
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <Heart className="text-red-500 fill-red-500" size={24} />
                  <span className={`text-2xl font-black transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{health}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Coins className="text-yellow-500 fill-yellow-500" size={24} />
                  <span className={`text-2xl font-black transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{money}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                  Score: {score}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  Wave: {wave}
                </div>
              </div>

              <button 
                onClick={returnToLobby}
                className={`p-3 rounded-xl transition-all hover:bg-red-500/10 text-red-500`}
              >
                <XCircle size={24} />
              </button>
            </header>

            <main className="flex-1 flex gap-6 min-h-0">
              {/* Sidebar - Shop */}
              <aside className={`w-80 rounded-[2.5rem] p-6 flex flex-col gap-4 border transition-colors ${theme === 'dark' ? 'bg-slate-900/60 border-white/5' : 'bg-white border-slate-200 shadow-lg'}`}>
                <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Algorithm Store</h4>
                
                {Object.entries(TOWER_CONFIGS).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTowerType(type as any)}
                    className={`p-4 rounded-3xl border-2 transition-all flex flex-col gap-2 text-left group ${selectedTowerType === type ? (theme === 'dark' ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyan-600 bg-cyan-50 shadow-md') : (theme === 'dark' ? 'border-white/5 hover:border-white/20' : 'border-slate-100 font hover:border-slate-300')}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-black uppercase tracking-tight transition-colors ${selectedTowerType === type ? (theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700') : (theme === 'dark' ? 'text-slate-200' : 'text-slate-900')}`}>{config.name}</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Coins size={14} fill="currentColor" />
                        <span className="text-xs font-black">{config.cost}</span>
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed transition-colors ${selectedTowerType === type ? (theme === 'dark' ? 'text-cyan-100/60' : 'text-cyan-800/60') : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`}>{config.desc}</p>
                  </button>
                ))}

                <div className={`mt-auto p-6 rounded-3xl border border-dashed transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] uppercase font-black tracking-widest text-center mb-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>How to Play</p>
                  <p className={`text-[11px] text-center font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Select a tower and click anywhere on the data field to deploy. Sort incoming items before they reach the exit!</p>
                </div>
              </aside>

              {/* Game Field */}
              <div 
                className={`flex-1 rounded-[3rem] border-2 relative overflow-hidden cursor-crosshair transition-all ${theme === 'dark' ? 'bg-slate-950 border-white/5 shadow-inner' : 'bg-slate-100 border-slate-200 shadow-inner'}`}
                onClick={handleCanvasClick}
              >
                {/* Visual Grid */}
                <div className={`absolute inset-0 opacity-10`} style={{ background: `linear-gradient(${theme === 'dark' ? '#334155' : '#e2e8f0'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#334155' : '#e2e8f0'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

                {/* Path Indicator */}
                <div className={`absolute left-0 right-0 h-32 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none ${theme === 'dark' ? 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'}`} />

                {/* Towers */}
                {towers.map(tower => (
                  <motion.div
                    key={tower.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute z-10"
                    style={{ left: tower.x - 20, top: tower.y - 20 }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xl border-2 transition-colors ${tower.type === 'bubble' ? 'bg-cyan-500 border-cyan-400' : tower.type === 'quick' ? 'bg-orange-500 border-orange-400' : 'bg-purple-500 border-purple-400'}`}>
                      <Zap size={20} className="text-white" />
                    </div>
                  </motion.div>
                ))}

                {/* Enemies */}
                {enemies.map(enemy => (
                  <motion.div
                    key={enemy.id}
                    className="absolute z-20 flex flex-col items-center gap-1"
                    animate={{ left: enemy.x, top: enemy.y }}
                    transition={{ duration: 0.016, ease: "linear" }}
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    <div className={`px-3 py-1 rounded-full text-xs font-black shadow-lg border-2 transition-all ${theme === 'dark' ? 'bg-slate-800 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      {enemy.value}
                    </div>
                    {/* Health Bar */}
                    <div className={`w-12 h-1 bg-black/20 rounded-full overflow-hidden border border-black/10`}>
                      <motion.div 
                        className={`h-full bg-cyan-500`} 
                        animate={{ width: `${(enemy.value / enemy.originalValue) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Projectiles */}
                {projectiles.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute z-30 pointer-events-none"
                    initial={{ left: p.startX, top: p.startY, opacity: 1, width: 0 }}
                    animate={{ left: p.targetX, top: p.targetY, opacity: 0, width: 100 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <div 
                      className="h-1 shadow-lg blur-[1px]" 
                      style={{ 
                        backgroundColor: p.color,
                        width: Math.sqrt(Math.pow(p.targetX - p.startX, 2) + Math.pow(p.targetY - p.startY, 2)),
                        transform: `rotate(${Math.atan2(p.targetY - p.startY, p.targetX - p.startX)}rad)`,
                        transformOrigin: '0 0'
                      }} 
                    />
                  </motion.div>
                ))}
              </div>
            </main>
          </motion.div>
        )}

        {gameState === 'playing' && selectedGame === 'matching' && (
          <motion.div 
            key="game-matching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full max-w-7xl flex flex-col gap-8"
          >
            {/* Header */}
            <header className={`flex justify-between items-center px-8 py-6 rounded-[2.5rem] border transition-colors ${theme === 'dark' ? 'bg-slate-900 shadow-2xl border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                  <Layout size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Merge Logic</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ops:</span>
                    <span className={`text-xs font-black ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{mergeSteps}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={returnToLobby}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                >
                  Exit
                </button>
              </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center gap-12">
              {/* Target Preview */}
              <div className="text-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 block">Target Sequence</span>
                 <div className="flex gap-2 justify-center">
                    {targetArray.map((v, i) => (
                      <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black border tracking-tighter ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        {v}
                      </div>
                    ))}
                 </div>
              </div>

              {/* Fragment Zone */}
              <div className="flex flex-wrap gap-6 justify-center max-w-5xl">
                {fragments.map((frag) => (
                  <motion.div
                    key={frag.id}
                    layout
                    draggable
                    onDragStart={(e) => {
                       e.dataTransfer.setData('fragId', frag.id);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                       const sourceId = e.dataTransfer.getData('fragId');
                       handleMerge(sourceId, frag.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-3xl border-2 cursor-grab active:cursor-grabbing transition-all flex items-center justify-center gap-2 group ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white border-slate-100 shadow-md hover:border-purple-600 hover:shadow-xl'}`}
                  >
                    {frag.values.map((v, idx) => (
                      <div key={idx} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-black' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
                        {v}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>

              {fragments.length === 1 && JSON.stringify(fragments[0].values) === JSON.stringify(targetArray) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-6"
                >
                   <div className="flex flex-col items-center">
                     <span className="text-6xl mb-4">🎉</span>
                     <h3 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Target Achieved!</h3>
                     <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Complexity: O(n log n) efficiency</p>
                   </div>
                   <button 
                     onClick={startMergeMatch}
                     className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/40' : 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'}`}
                   >
                     New Challenge
                   </button>
                </motion.div>
              )}
            </div>

            <div className={`p-8 border-t transition-colors ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
               <p className={`text-[10px] uppercase font-black tracking-widest text-center text-slate-500 italic`}>Drag one fragment onto another to merge them. They must stay sorted!</p>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && selectedGame === 'speed' && (
          <motion.div 
            key="game-speed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full max-w-2xl mx-auto flex flex-col gap-12 items-center justify-center py-20"
          >
            {/* Timer Ring */}
            <div className="relative w-48 h-48 flex items-center justify-center">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle
                   cx="96"
                   cy="96"
                   r="88"
                   fill="none"
                   stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'}
                   strokeWidth="12"
                 />
                 <motion.circle
                   cx="96"
                   cy="96"
                   r="88"
                   fill="none"
                   stroke={quizTimer < 3 ? '#ef4444' : '#f59e0b'}
                   strokeWidth="12"
                   strokeDasharray="553"
                   animate={{ strokeDashoffset: 553 - (quizTimer / MAX_QUIZ_TIMER) * 553 }}
                   transition={{ duration: 0.1, ease: 'linear' }}
                 />
               </svg>
               <div className="flex flex-col items-center">
                 <span className={`text-5xl font-black transition-colors ${quizTimer < 3 ? 'text-red-500' : (theme === 'dark' ? 'text-white' : 'text-slate-900')}`}>{quizTimer.toFixed(1)}s</span>
               </div>
            </div>

            <div className="text-center w-full">
              <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                {currentQuiz?.case} Streak: {streak}
              </div>
              <h2 className={`text-6xl font-black uppercase tracking-tighter mb-12 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{currentQuiz?.algo}</h2>
              
              <div className="grid grid-cols-1 gap-4 w-full px-8">
                {currentQuiz?.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleQuizAnswer(opt)}
                    className={`py-6 rounded-[2rem] border-2 text-2xl font-black transition-all hover:scale-[1.02] active:scale-95 ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-orange-500 hover:text-orange-400' : 'bg-white border-slate-100 shadow-md hover:border-orange-600 hover:text-orange-700'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={returnToLobby}
              className={`mt-4 px-8 py-2 rounded-full font-bold text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Forfeit Run
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && selectedGame === 'code_expert' && codeQuiz && (
          <motion.div 
            key="game-code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-6xl flex flex-col h-full bg-slate-950 text-white rounded-[3rem] border border-white/10 overflow-hidden"
          >
            <header className="p-8 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Terminal size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black">Code Expert</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mt-1">Identify the Logic</p>
                </div>
              </div>
              <button 
                onClick={returnToLobby}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-white/5 text-slate-400 hover:text-white"
              >
                Exit
              </button>
            </header>

            <div className="flex-1 flex gap-10 p-12">
              <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-8 font-mono text-sm leading-relaxed overflow-auto">
                <div className="text-slate-500 mb-6 flex items-center gap-2">
                  <Terminal size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">source_code.ts</span>
                </div>
                <pre className="text-blue-300">
                  {codeQuiz.code}
                </pre>
              </div>

              <div className="w-80 flex flex-col justify-center gap-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Select Algorithm</p>
                 {codeQuiz.options.map(opt => (
                   <button
                     key={opt}
                     onClick={() => handleCodeExpertAnswer(opt)}
                     className="w-full py-6 rounded-2xl border-2 border-white/5 bg-white/5 hover:bg-blue-500 hover:border-blue-400 hover:text-white font-black text-sm uppercase tracking-widest transition-all"
                   >
                     {opt}
                   </button>
                 ))}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && selectedGame === 'step_master' && (
          <motion.div 
            key="game-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full max-w-6xl flex flex-col h-full rounded-[3rem] border transition-colors ${theme === 'dark' ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200'}`}
          >
            <header className="p-8 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Step Master</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-1">Executing: {stepTargetAlgo}</p>
                </div>
              </div>
              <button 
                onClick={returnToLobby}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              >
                Exit
              </button>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center gap-16 p-12 relative">
               <AnimatePresence>
                {stepFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                    className={`absolute z-20 inset-x-0 mx-auto max-w-lg p-8 rounded-[2rem] border-4 flex flex-col items-center text-center shadow-2xl ${stepFeedback.isCorrect ? 'bg-emerald-500 text-white border-white/20' : 'bg-red-500 text-white border-white/20'}`}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                       {stepFeedback.isCorrect ? <Zap size={32} /> : <XCircle size={32} />}
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tight mb-2">
                       {stepFeedback.isCorrect ? 'Great Job!' : 'Execution Error'}
                    </h4>
                    <p className="font-medium text-sm leading-relaxed opacity-90">
                       {stepFeedback.message}
                    </p>
                  </motion.div>
                )}
               </AnimatePresence>

               <div className={`max-w-2xl text-center transition-opacity ${stepFeedback ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
                  <h4 className={`text-4xl font-black mb-4 uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Goal: {stepTargetAlgo}</h4>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs leading-relaxed">{stepInstruction}</p>
               </div>

               <div className={`flex items-end justify-center gap-6 w-full max-w-4xl transition-all relative ${stepFeedback ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none`} />
                  
                  {stepArray.map((val, idx) => {
                    const maxVal = Math.max(...stepArray, 80);
                    const height = (val / maxVal) * 240 + 60;
                    const isSelected = stepCurrentSwap?.i === idx;
                    
                    return (
                      <div key={idx} className="relative flex flex-col items-center">
                        <motion.button
                          layout
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          onClick={() => handleStepSwap(idx)}
                          style={{ height, width: 64 }}
                          className={`rounded-t-3xl border-4 transition-all duration-300 flex items-center justify-center relative cursor-pointer group ${
                            isSelected 
                            ? 'bg-rose-500 border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.4)] -translate-y-4' 
                            : theme === 'dark' 
                              ? 'bg-white/5 border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5' 
                              : 'bg-slate-50 border-slate-100 shadow-sm hover:border-rose-200'
                          }`}
                        >
                          <span className={`text-xl font-black transition-colors ${isSelected ? 'text-white' : (theme === 'dark' ? 'text-slate-500 group-hover:text-rose-400' : 'text-slate-400 group-hover:text-rose-500')}`}>
                            {val}
                          </span>

                          {/* Hover effect indicator */}
                          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 ${isSelected ? 'hidden' : ''}`}>
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
                          </div>
                        </motion.button>
                      </div>
                    );
                  })}
               </div>

               {!stepFeedback && (
                 <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Terminal size={14} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                        {stepCurrentSwap !== null ? 'Select partner to swap' : 'Select first element'}
                      </p>
                    </div>
                    {stepCurrentSwap !== null && (
                      <button 
                        onClick={() => setStepCurrentSwap(null)}
                        className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline"
                      >
                        Cancel Selection
                      </button>
                    )}
                 </div>
               )}
            </div>
          </motion.div>
        )}
        {gameState === 'playing' && selectedGame === 'recognition' && (
          <motion.div 
            key="game-recognition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full max-w-5xl mx-auto flex flex-col gap-12 items-center"
          >
             <header className={`w-full flex justify-between items-center px-8 py-6 rounded-[2.5rem] border transition-colors ${theme === 'dark' ? 'bg-slate-900 shadow-2xl border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Code size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Round {recognizeRound}: Q{recognizeQuestionIdx + 1}
                  </h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 transition-colors ${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'}`}>
                    {isRecognizeSorting ? `Status: ${recognizeStatus}` : 'FINISHED - OBSERVING RESULT'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Lives</span>
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Heart 
                        key={i} 
                        size={14} 
                        fill={i < recognizeLives ? "#ef4444" : "transparent"} 
                        className={i < recognizeLives ? "text-red-500" : "text-slate-700"} 
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Time Left</span>
                  <div className="flex items-center gap-3">
                    <div className={`w-32 h-2 rounded-full overflow-hidden transition-colors ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <motion.div 
                        className={`h-full ${recognizeTimer < 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        initial={false}
                        animate={{ width: `${(recognizeTimer / 15) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xl font-black w-8 ${recognizeTimer < 5 ? 'text-red-500 animate-pulse' : (theme === 'dark' ? 'text-white' : 'text-slate-900')}`}>
                      {recognizeTimer}s
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Coins</span>
                  <div className="flex items-center gap-1.5">
                    <Coins size={14} className="text-yellow-500" />
                    <span className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{score}</span>
                  </div>
                </div>
                <button 
                  onClick={returnToLobby}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                >
                  Exit
                </button>
              </div>
            </header>

            <div className="flex-1 w-full flex flex-col items-center justify-center gap-12 relative">
              {/* Feedback Overlay */}
              <AnimatePresence>
                {recognizeFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                    className={`absolute z-20 inset-x-0 mx-auto max-w-lg p-8 rounded-[2rem] border-4 flex flex-col items-center text-center shadow-2xl ${recognizeFeedback.isCorrect ? 'bg-emerald-500 text-white border-white/20' : 'bg-red-500 text-white border-white/20'}`}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                       {recognizeFeedback.isCorrect ? <Zap size={32} /> : <XCircle size={32} />}
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tight mb-2">
                       {recognizeFeedback.isCorrect ? 'Great Job!' : 'Pattern Missed'}
                    </h4>
                    <p className="font-medium text-sm leading-relaxed opacity-90">
                       {recognizeFeedback.message}
                    </p>
                    <div className="mt-6 px-6 py-2 bg-black/10 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Analyzing Next Algorithm...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actual sorting simulation visualizer */}
                <div className={`h-[350px] flex items-end justify-center gap-6 w-full max-w-4xl transition-opacity relative ${recognizeFeedback ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
                   {/* Background Glow */}
                   <div className={`absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none`} />
                   
                  {recognizeArray.map((val, idx) => {
                  const maxVal = Math.max(...recognizeArray, 100);
                  const height = (val / maxVal) * 240 + 60;
                  const isI = recognizePointers.i === idx;
                  const isJ = recognizePointers.j === idx;
                  
                  return (
                    <div key={idx} className="relative flex flex-col items-center">
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{ height, width: 48 }}
                        className={`rounded-t-2xl border-2 transition-colors duration-300 flex items-center justify-center relative ${isI ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_#06b6d4]' : isJ ? 'bg-amber-500 border-amber-400 shadow-[0_0_20px_#f59e0b]' : (theme === 'dark' ? 'bg-emerald-500/10 border-white/10' : 'bg-emerald-50 border-emerald-100 shadow-sm')}`}
                      >
                        <span className={`text-xs font-black transition-colors ${isI || isJ ? 'text-black' : (theme === 'dark' ? 'text-emerald-500/40' : 'text-emerald-600/40')}`}>
                          {val}
                        </span>
                      </motion.div>

                      {/* Pointers */}
                      <AnimatePresence>
                        {(isI || isJ) && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            className={`absolute -bottom-12 px-3 py-1 rounded-lg font-black text-[10px] shadow-lg ${isI ? 'bg-cyan-500 text-black' : 'bg-amber-500 text-black'}`}
                          >
                            <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] ${isI ? 'border-b-cyan-500' : 'border-b-amber-500'}`} />
                            {isI ? 'pointer i' : 'pointer j'}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className={`text-center w-full px-12 transition-opacity ${recognizeFeedback ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">What sorting technique is active?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {recognizeOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleRecognitionAnswer(opt)}
                      className={`py-8 rounded-[2rem] border-2 text-xl font-black transition-all hover:scale-[1.02] active:scale-95 ${theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-emerald-500 hover:text-emerald-400' : 'bg-white border-slate-100 shadow-md hover:border-emerald-600 hover:text-emerald-700'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'gameOver' && (
          <motion.div 
            key="gameOver"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-md w-full p-12 rounded-[3.5rem] text-center border-4 ${theme === 'dark' ? 'bg-slate-900 border-red-500/50 shadow-2xl shadow-red-500/20' : 'bg-white border-red-500/50 shadow-2xl'}`}
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${theme === 'dark' ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
              <XCircle size={64} />
            </div>
            <h2 className={`text-4xl font-black mb-4 uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {GAME_OVER_TEXT[selectedGame].title}
            </h2>
            <p className={`text-slate-500 font-bold uppercase tracking-[0.15em] mb-12 text-xs`}>
              {GAME_OVER_TEXT[selectedGame].subtitle}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className={`p-6 rounded-3xl border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Final Score</span>
                <span className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{score}</span>
              </div>
              <div className={`p-6 rounded-3xl border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  {selectedGame === 'defense' ? 'Wave Reached' : 
                   selectedGame === 'matching' ? 'Steps Taken' : 
                   selectedGame === 'speed' ? 'Best Streak' : 
                   selectedGame === 'recognition' ? 'Identified' :
                   selectedGame === 'code_expert' ? 'Solved' : 'Steps Mastered'}
                </span>
                <span className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {selectedGame === 'defense' ? wave : 
                   selectedGame === 'matching' ? mergeSteps : 
                   selectedGame === 'speed' ? streak : 
                   selectedGame === 'recognition' ? recognizeCorrectCount :
                   selectedGame === 'code_expert' ? codeCorrectCount : score}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLevelRestart}
              className={`w-full py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 ${theme === 'dark' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'}`}
            >
              <Play fill="currentColor" />
              RESTART PROTOCOL
            </button>
            
            <button 
              onClick={returnToLobby}
              className={`w-full py-5 mt-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Return to Nexus
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



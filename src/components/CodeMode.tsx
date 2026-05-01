import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Code, Play, CheckCircle2, XCircle } from 'lucide-react';
import type { ArrayItem } from './Visualizer';
import Avatar from './Avatar';

type Language = 'javascript' | 'python' | 'cpp' | 'java' | 'c';
type Algorithm = 'bubble' | 'insertion' | 'selection' | 'merge' | 'quick';

interface CodeWalkthroughProps {
  initialAlgo: Algorithm;
  onAlgorithmChange: (algo: Algorithm) => void;
  theme?: 'dark' | 'light';
}

const CODE_SNIPPETS: Record<Algorithm, Record<Language, { code: string[], explanations: string[] }>> = {
  bubble: {
    javascript: {
      code: [
        "for (let i = 0; i < n; i++) {",
        "  for (let j = 0; j < n - i - 1; j++) {",
        "    if (arr[j] > arr[j + 1]) {",
        "      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];",
        "    }",
        "  }",
        "}"
      ],
      explanations: [
        "The outer 'i' loop starts. It controls how many items are sorted from the end. Currently i=0.",
        "The inner 'j' loop starts at 0. This is the 'scanner' that compares adjacent items.",
        "Comparison: Is element at j (${arr[j]}) greater than j+1 (${arr[j+1]})? Watch the visual highlights.",
        "Yes! The pair is out of order. We execute a swap to push the larger item forward.",
        "This inner pass is wrapping up. The largest item in this range will 'bubble' to index n-i-1.",
        "Incrementing j to scan the next pair. This is how the sort naturally progresses.",
        "Pass complete. The array's tail is now more stable. Mischief complete!"
      ]
    },
    python: {
      code: [
        "for i in range(n):",
        "    for j in range(0, n - i - 1):",
        "        if arr[j] > arr[j + 1]:",
        "            arr[j], arr[j + 1] = arr[j + 1], arr[j]",
        ""
      ],
      explanations: [
        "Python protocol: Outer loop 'i' counts the stabilized elements at the end.",
        "Inner loop 'j' iterates through the unsorted section. Look at index j in the debugger.",
        "Check if arr[j] is bigger than its right neighbor. If so, they must swap.",
        "Executing tuple swap. Python makes this reordering elegant and fast.",
        "Inner loop 'j' finished. The largest value has been shifted to the correct boundary."
      ]
    },
    cpp: {
      code: [
        "for (int i = 0; i < n-1; i++) {",
        "    for (int j = 0; j < n-i-1; j++) {",
        "        if (arr[j] > arr[j+1]) {",
        "            swap(arr[j], arr[j+1]);",
        "        }",
        "    }",
        "}"
      ],
      explanations: [
        "Loop 'i' starts: we need n-1 passes for a full sort guarantee.",
        "Pointer 'j' loop starts. It controls the comparison scan line by line.",
        "Comparison: is arr[j] greater than arr[j+1]? Watch the highlights.",
        "Calling std::swap for the addresses at 'j' and 'j+1'.",
        "The 'j' pointer increments for next comparison.",
        "Segment pass finalized.",
        "Sorting level up."
      ]
    },
    java: {
      code: [
        "for (int i = 0; i < n - 1; i++) {",
        "    for (int j = 0; j < n - i - 1; j++) {",
        "        if (arr[j] > arr[j + 1]) {",
        "            int temp = arr[j];",
        "            arr[j] = arr[j + 1];",
        "            arr[j + 1] = temp;",
        "        }",
        "    }",
        "}"
      ],
      explanations: [
        "For loop 'i' manages the number of times we pass through the array.",
        "For loop 'j' executes the actual comparison and swapping logic.",
        "Compare index 'j' with its neighbor. Both are highlighted above.",
        "Temp variable stores the value at 'j' before it gets overwritten.",
        "The smaller neighbor moves left to index 'j'.",
        "The original 'j' value moves right. Swap complete.",
        "End of pass.",
        "The largest value of this segment is now locked."
      ]
    },
    c: {
      code: [
        "for (i = 0; i < n - 1; i++) {",
        "    for (j = 0; j < n - i - 1; j++) {",
        "        if (arr[j] > arr[j + 1]) {",
        "            int temp = arr[j];",
        "            arr[j] = arr[j + 1];",
        "            arr[j + 1] = temp;",
        "        }",
        "    }",
        "}"
      ],
      explanations: [
        "Starting the outer 'i' pass. In C, we manage indices manually for precision.",
        "Inner 'j' loop scanner initiated. It moves through the unsorted memory block.",
        "Conditional: checking if neighbor at j is larger than neighbor at j+1.",
        "Order violation! Buffering current value into a stack-allocated 'temp' variable.",
        "Shifting the smaller neighbor value leftwards into current position.",
        "Restoring the buffered 'temp' value into the rightward position.",
        "Inner loop boundary reached.",
        "One full pass complete. The heaviest element has surfaced at the end."
      ]
    }
  },
  insertion: {
    javascript: {
      code: [
        "for (let i = 1; i < n; i++) {",
        "  let key = arr[i];",
        "  let j = i - 1;",
        "  while (j >= 0 && arr[j] > key) {",
        "    arr[j + 1] = arr[j];",
        "    j = j - 1;",
        "  }",
        "  arr[j + 1] = key;",
        "}"
      ],
      explanations: [
        "Outer loop 'i': Picking the next target to insert into the sorted section.",
        "Variable 'key' captures the element at index 'i'.",
        "Initializing 'j' to scan backwards through the sorted elements.",
        "While loop 'j': We shift elements to the right until we find 'key's spot.",
        "The larger element moves forward. Watch the visual shift.",
        "Move 'j' leftward to continue the investigation.",
        "Exiting while loop. The correct insertion point is identified.",
        "Insert 'key' into its new protocol position at index j + 1.",
        "Proceed to next element in the unsorted set."
      ]
    },
    python: {
      code: [
        "for i in range(1, len(arr)):",
        "    key = arr[i]",
        "    j = i - 1",
        "    while j >= 0 and key < arr[j]:",
        "        arr[j + 1] = arr[j]",
        "        j -= 1",
        "    arr[j + 1] = key"
      ],
      explanations: [
        "Starting at index 1 with loop 'i'. Index 0 is initially sorted.",
        "Storing current element as the marker 'key'.",
        "Pointer 'j' targets the sorted portion to the left.",
        "Comparison: is 'j' greater than our 'key'? If so, it must move.",
        "Shifting the element at 'j' to the right.",
        "Backtracking 'j' to find the insertion gap.",
        "Dropping the 'key' into the sorted gap."
      ]
    },
    cpp: {
      code: [
        "for (i = 1; i < n; i++) {",
        "    key = arr[i];",
        "    j = i - 1;",
        "    while (j >= 0 && arr[j] > key) {",
        "        arr[j + 1] = arr[j];",
        "        j = j - 1;",
        "    }",
        "    arr[j + 1] = key;",
        "}"
      ],
      explanations: [
        "Traverse list from second index.",
        "Identify element to sort.",
        "Initialize pointer for sorted section.",
        "Check bounds and compare with sorted neighbors.",
        "Shift elements to make space.",
        "Iterate backwards.",
        "Inner loop exit.",
        "Assign key to unoccupied slot.",
        "Continue outer loop."
      ]
    },
    java: {
      code: [
        "for (int i = 1; i < n; ++i) {",
        "    int key = arr[i];",
        "    int j = i - 1;",
        "    while (j >= 0 && arr[j] > key) {",
        "        arr[j + 1] = arr[j];",
        "        j = j - 1;",
        "    }",
        "    arr[j + 1] = key;",
        "}"
      ],
      explanations: [
        "Iterate from index 1 to the end.",
        "Key is the element currently being processed.",
        "j tracks the position in sorted subarray.",
        "Compare key with elements in sorted sub-array.",
        "Move elements greater than key one position up.",
        "Move leftward through sorted subarray.",
        "Exit while loop when position found.",
        "Store key at the target index (j+1).",
        "Next iteration of outer loop."
      ]
    },
    c: {
      code: [
        "for (i = 1; i < n; i++) {",
        "    key = arr[i];",
        "    j = i - 1;",
        "    while (j >= 0 && arr[j] > key) {",
        "        arr[j + 1] = arr[j];",
        "        j = j - 1;",
        "    }",
        "    arr[j + 1] = key;",
        "}"
      ],
      explanations: [
        "Outer traversal starting from the second memory slot (i=1).",
        "Caching the target value into 'key' for temporary storage.",
        "Pointer 'j' targets the sorted subarray to the left.",
        "Memory shift logic: examining sorted elements in reverse order.",
        "Overwriting neighbor with larger value to create an insertion gap.",
        "Decrementing 'j' to continue the backwards search.",
        "Targeted position found. Exiting memory shift loop.",
        "Writing 'key' into its new sorted position at index j + 1.",
        "Outer loop continues to next unsorted slot."
      ]
    }
  },
  selection: {
    javascript: {
      code: [
        "for (let i = 0; i < n - 1; i++) {",
        "  let min_idx = i;",
        "  for (let j = i + 1; j < n; j++) {",
        "    if (arr[j] < arr[min_idx]) min_idx = j;",
        "  }",
        "  [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];",
        "}"
      ],
      explanations: [
        "Move the boundary of the unsorted subarray.",
        "Assume the current position holds the minimum element.",
        "Scan the remaining unsorted portion to find the actual minimum.",
        "If a smaller element is found, update min_idx.",
        "Continue checking the rest of the array.",
        "Swap the found minimum element with the current position.",
        "The current index is now strictly sorted."
      ]
    },
    python: {
      code: [
        "for i in range(len(arr)):",
        "    min_idx = i",
        "    for j in range(i + 1, len(arr)):",
        "        if arr[min_idx] > arr[j]:",
        "            min_idx = j",
        "    arr[i], arr[min_idx] = arr[min_idx], arr[i]"
      ],
      explanations: [
        "Loop through the list.",
        "Mark current position as initial minimum index.",
        "Look ahead at other elements.",
        "Find the index of the absolute minimum.",
        "Update the current minimum tracking if needed.",
        "Swap current element with the found minimum."
      ]
    },
    cpp: {
      code: [
        "for (int i = 0; i < n-1; i++) {",
        "    min_idx = i;",
        "    for (int j = i+1; j < n; j++) {",
        "        if (arr[j] < arr[min_idx])",
        "            min_idx = j;",
        "    }",
        "    swap(arr[min_idx], arr[i]);",
        "}"
      ],
      explanations: [
        "Pass through the array.",
        "Identify index for smallest value.",
        "Inner loop for range searching.",
        "Comparison to find minimum.",
        "Record index of new minimum.",
        "End search loop.",
        "Swap found value into sorted position.",
        "Repeat."
      ]
    },
    java: {
      code: [
        "for (int i = 0; i < n-1; i++) {",
        "    int min_idx = i;",
        "    for (int j = i+1; j < n; j++)",
        "        if (arr[j] < arr[min_idx])",
        "            min_idx = j;",
        "    int temp = arr[min_idx];",
        "    arr[min_idx] = arr[i];",
        "    arr[i] = temp;",
        "}"
      ],
      explanations: [
        "Outer loop for placing elements at i.",
        "min_idx stores index of smallest element found yet.",
        "Inner loop to find smallest element in unsorted array.",
        "Check if current element is smaller than min.",
        "Update index of minimum element.",
        "Store minimum value in temp.",
        "Place current element at previous min position.",
        "Place minimum value at current sorted position.",
        "Continue sorting."
      ]
    },
    c: {
      code: [
        "for (i = 0; i < n - 1; i++) {",
        "    min_idx = i;",
        "    for (j = i + 1; j < n; j++) {",
        "        if (arr[j] < arr[min_idx])",
        "            min_idx = j;",
        "    }",
        "    int temp = arr[min_idx];",
        "    arr[min_idx] = arr[i];",
        "    arr[i] = temp;",
        "}"
      ],
      explanations: [
        "Outer loop manages the boundary between sorted and unsorted memory.",
        "Tentatively marking the current index 'i' as the minimum.",
        "Inner scanner loop 'j' searches for the absolute minimum in the remaining set.",
        "Comparison: is current element smaller than our recorded minimum?",
        "Updating the 'min_idx' pointer to the new absolute minimum found.",
        "Linear scan for this pass complete.",
        "Buffering the found minimum into temporary register.",
        "Swapping current element into the far unsorted slot.",
        "Placing the absolute minimum into its final sorted position at index 'i'.",
        "Partition incremented. Mischief stabilizing."
      ]
    }
  },
  merge: {
    javascript: {
      code: [
        "function mergeSort(arr, l, r) {",
        "  if (l < r) {",
        "    let m = Math.floor(l + (r - l) / 2);",
        "    mergeSort(arr, l, m);",
        "    mergeSort(arr, m + 1, r);",
        "    merge(arr, l, m, r);",
        "  }",
        "}",
        "function merge(arr, l, m, r) {",
        "  let i = l, j = m + 1;",
        "  while (i <= m && j <= r) {",
        "    if (arr[i] <= arr[j]) i++;",
        "    else {",
        "      let val = arr[j];",
        "      for (let k = j; k > i; k--) arr[k] = arr[k-1];",
        "      arr[i] = val; i++; m++; j++;",
        "    }",
        "  }",
        "}"
      ],
      explanations: [
        "Recursive entry: Defining the range [l, r].",
        "Base case: Checking if the segment has more than one element.",
        "Divide: Calculating the midpoint 'm' for partitioning.",
        "Conquer: Recursively sorting the left sub-array [l, m].",
        "Conquer: Recursively sorting the right sub-array [m+1, r].",
        "Combine: Merging the two sorted sub-arrays back into one.",
        "Branch resolution.",
        "Recursion complete.",
        "Merge function: Combining sorted segments.",
        "Initialize pointers i and j for both segments.",
        "Scanning loop: Comparing elements from both halves.",
        "Case: Left element is smaller. Moving pointer i.",
        "Case: Right element is smaller. In-place shift required.",
        "Pick value from the right segment.",
        "Shift elements to the right to make room for insertion.",
        "Insert value and update boundary pointers.",
        "Inner logic completion.",
        "Merge loop completion."
      ]
    },
    python: {
      code: [
        "def mergeSort(arr, l, r):",
        "    if l < r:",
        "        m = l + (r - l) // 2",
        "        mergeSort(arr, l, m)",
        "        mergeSort(arr, m + 1, r)",
        "        merge(arr, l, m, r)",
        "",
        "def merge(arr, l, m, r):",
        "    n1 = m - l + 1",
        "    n2 = r - m",
        "    L = arr[l:l+n1]",
        "    R = arr[m+1:m+1+n2]",
        "    i = j = 0",
        "    k = l",
        "    while i < n1 and j < n2:",
        "        if L[i] <= R[j]:",
        "            arr[k] = L[i]; i += 1",
        "        else:",
        "            arr[k] = R[j]; j += 1",
        "        k += 1"
      ],
      explanations: [
        "Python protocol: Recursive splitting initialization.",
        "Condition: Segment length > 1.",
        "Finding midpoint using floor division.",
        "Sorting left partition.",
        "Sorting right partition.",
        "Merging both.",
        "",
        "Internal merge logic.",
        "Calculating segment sizes.",
        "Slicing left and right temp arrays.",
        "Pointers setup.",
        "Main merge loop.",
        "Comparison and assignment."
      ]
    },
    cpp: {
      code: [
        "void mergeSort(int arr[], int l, int r) {",
        "    if (l < r) {",
        "        int m = l + (r - l) / 2;",
        "        mergeSort(arr, l, m);",
        "        mergeSort(arr, m + 1, r);",
        "        merge(arr, l, m, r);",
        "    }",
        "}",
        "void merge(int arr[], int l, int m, int r) {",
        "    int i, j, k;",
        "    int n1 = m - l + 1;",
        "    int n2 = r - m;",
        "    int L[n1], R[n2];",
        "    for (i = 0; i < n1; i++) L[i] = arr[l + i];",
        "    for (j = 0; j < n2; j++) R[j] = arr[m + 1 + j];",
        "    i = 0; j = 0; k = l;",
        "    while (i < n1 && j < n2) {",
        "        if (L[i] <= R[j]) arr[k++] = L[i++];",
        "        else arr[k++] = R[j++];",
        "    }",
        "}"
      ],
      explanations: [
        "C++ recursive template.",
        "Bound validation.",
        "Mid calculation.",
        "Left recursive call.",
        "Right recursive call.",
        "Merge utility call.",
        "",
        "",
        "Merge implementation using stack arrays.",
        "Loop variables.",
        "Sizes for temp storage.",
        "Array allocation.",
        "Copy data to L.",
        "Copy data to R.",
        "Reset pointers.",
        "Zipping loop.",
        "Comparison sort."
      ]
    },
    java: {
      code: [
        "void sort(int arr[], int l, int r) {",
        "    if (l < r) {",
        "        int m = l + (r - l) / 2;",
        "        sort(arr, l, m);",
        "        sort(arr, m + 1, r);",
        "        merge(arr, l, m, r);",
        "    }",
        "}",
        "void merge(int arr[], int l, int m, int r) {",
        "    int n1 = m - l + 1;",
        "    int n2 = r - m;",
        "    int L[] = new int[n1];",
        "    int R[] = new int[n2];",
        "    for (int i = 0; i < n1; ++i) L[i] = arr[l + i];",
        "    for (int j = 0; j < n2; ++j) R[j] = arr[m + 1 + j];",
        "    int i = 0, j = 0, k = l;",
        "    while (i < n1 && j < n2) {",
        "        if (L[i] <= R[j]) arr[k++] = L[i++];",
        "        else arr[k++] = R[j++];",
        "    }",
        "}"
      ],
      explanations: [
        "Java entry method.",
        "Condition check.",
        "Median index.",
        "Left recursion.",
        "Right recursion.",
        "Merge call.",
        "",
        "",
        "Merge logic with heap-allocated arrays.",
        "Sizes setup.",
        "Space allocation.",
        "Transferring left segment.",
        "Transferring right segment.",
        "Initializing merge pointers.",
        "Comparison loop.",
        "Sorting elements back to original array."
      ]
    },
    c: {
      code: [
        "void mergeSort(int arr[], int l, int r) {",
        "    if (l < r) {",
        "        int m = l + (r - l) / 2;",
        "        mergeSort(arr, l, m);",
        "        mergeSort(arr, m + 1, r);",
        "        merge(arr, l, m, r);",
        "    }",
        "}"
      ],
      explanations: [
        "Protocol signature for recursive Merge Sort utilizing raw index pointers.",
        "Base Case check: validating that the current range contains data to sort.",
        "Calculating pivot 'm' with overflow protection for large memory ranges.",
        "Recursive Branch: Processing the left memory segment.",
        "Recursive Branch: Processing the right memory segment.",
        "Merging the two sorted bisections back into the master array.",
        "Branch resolution.",
        "Recursion level complete."
      ]
    }
  },
  quick: {
    javascript: {
      code: [
        "function quickSort(arr, low, high) {",
        "  if (low < high) {",
        "    let pi = partition(arr, low, high);",
        "    quickSort(arr, low, pi - 1);",
        "    quickSort(arr, pi + 1, high);",
        "  }",
        "}",
        "function partition(arr, low, high) {",
        "  let pivot = arr[high];",
        "  let i = low - 1;",
        "  for (let j = low; j < high; j++) {",
        "    if (arr[j] < pivot) {",
        "      i++;",
        "      [arr[i], arr[j]] = [arr[j], arr[i]];",
        "    }",
        "  }",
        "  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];",
        "  return i + 1;",
        "}"
      ],
      explanations: [
        "QuickSort entry point.",
        "Recursive base condition.",
        "Partitioning segment and obtaining pivot index.",
        "Recursively sorting left half.",
        "Recursively sorting right half.",
        "Returning control to stack frame.",
        "Partition Logic: Selecting pivot and reordering.",
        "Choosing the rightmost element as the pivot.",
        "Initializing index 'i' for smaller elements tracker.",
        "Iterating through the segment with scanner 'j'.",
        "Check: is current element smaller than the pivot?",
        "Yes! Increment smaller element index.",
        "Swap current element into the smaller elements section.",
        "Loop continue.",
        "Pivot placement: moving pivot to its final sorted position.",
        "Exiting partition with pivot index."
      ]
    },
    python: {
      code: [
        "def quickSort(arr, low, high):",
        "    if low < high:",
        "        pi = partition(arr, low, high)",
        "        quickSort(arr, low, pi - 1)",
        "        quickSort(arr, pi + 1, high)",
        "",
        "def partition(arr, low, high):",
        "    pivot = arr[high]",
        "    i = low - 1",
        "    for j in range(low, high):",
        "        if arr[j] < pivot:",
        "            i += 1",
        "            arr[i], arr[j] = arr[j], arr[i]",
        "    arr[i+1], arr[high] = arr[high], arr[i+1]",
        "    return i + 1"
      ],
      explanations: [
        "Recursive logic.",
        "Check bounds.",
        "Get pivot.",
        "Left recursive sort.",
        "Right recursive sort.",
        "",
        "Lomuto partition scheme.",
        "Pivot is last element.",
        "Boundary pointer.",
        "Linear scan.",
        "Comparison.",
        "Increment pointer.",
        "Swap elements.",
        "Pivot swap.",
        "Return index."
      ]
    },
    cpp: {
      code: [
        "void quickSort(int arr[], int low, int high) {",
        "    if (low < high) {",
        "        int pi = partition(arr, low, high);",
        "        quickSort(arr, low, pi - 1);",
        "        quickSort(arr, pi + 1, high);",
        "    }",
        "}",
        "int partition(int arr[], int low, int high) {",
        "    int pivot = arr[high];",
        "    int i = (low - 1);",
        "    for (int j = low; j <= high - 1; j++) {",
        "        if (arr[j] < pivot) {",
        "            i++;",
        "            swap(arr[i], arr[j]);",
        "        }",
        "    }",
        "    swap(arr[i + 1], arr[high]);",
        "    return (i + 1);",
        "}"
      ],
      explanations: [
        "Standard QuickSort.",
        "Recurrence limit.",
        "Find partitioning index.",
        "Sort LHS.",
        "Sort RHS.",
        "",
        "Partition utility.",
        "Lomuto pivot choice.",
        "Index tracker.",
        "Looping through segment.",
        "Comparison check.",
        "Move tracker.",
        "std::swap.",
        "End loop.",
        "Final pivot swap.",
        "Return result."
      ]
    },
    java: {
      code: [
        "void sort(int arr[], int low, int high) {",
        "    if (low < high) {",
        "        int pi = partition(arr, low, high);",
        "        sort(arr, low, pi - 1);",
        "        sort(arr, pi + 1, high);",
        "    }",
        "}",
        "int partition(int arr[], int low, int high) {",
        "    int pivot = arr[high];",
        "    int i = (low - 1);",
        "    for (int j = low; j < high; j++) {",
        "        if (arr[j] < pivot) {",
        "            i++;",
        "            int temp = arr[i];",
        "            arr[i] = arr[j];",
        "            arr[j] = temp;",
        "        }",
        "    }",
        "    int temp = arr[i + 1];",
        "    arr[i + 1] = arr[high];",
        "    arr[high] = temp;",
        "    return i + 1;",
        "}"
      ],
      explanations: [
        "Java divide and conquer.",
        "Recursion check.",
        "Obtaining partition.",
        "Left tree sort.",
        "Right tree sort.",
        "",
        "Partition implementation.",
        "Pivot selection.",
        "Pointer offset.",
        "Iterative scan.",
        "Condition logic.",
        "Offset increment.",
        "Temporary swap storage.",
        "Writing back swap.",
        "Closing gap.",
        "Finishing loop.",
        "Placing pivot.",
        "Restoring array state.",
        "Returning pivot index."
      ]
    },
    c: {
      code: [
        "void quickSort(int arr[], int low, int high) {",
        "    if (low < high) {",
        "        int pi = partition(arr, low, high);",
        "        quickSort(arr, low, pi - 1);",
        "        quickSort(arr, pi + 1, high);",
        "    }",
        "}"
      ],
      explanations: [
        "QuickSort protocol initiated using recursion and index-based partitioning.",
        "Checking boundaries to ensure segment still requires processing.",
        "Executing partitioning logic: pivot selection and memory reordering.",
        "Recursive Call: Sorting elements smaller than the pivot.",
        "Recursive Call: Sorting elements larger than the pivot.",
        "Returning control to previous stack frame.",
        "Partition strategy complete."
      ]
    }
  }
};

interface SimulationStep {
  line: number;
  array: ArrayItem[];
  pointers: { i: number | null, j: number | null, n: number | null };
  highlights: Record<number, string>;
  sortedIndices: Set<number>;
  explanation?: string;
}

export default function CodeMode({ initialAlgo, onAlgorithmChange, theme = 'dark' }: CodeWalkthroughProps) {
  const [algo, setAlgo] = useState<Algorithm>(initialAlgo);
  const [lang, setLang] = useState<Language>('java');
  const [walkthroughSpeed, setWalkthroughSpeed] = useState(2500);
  const [currentLine, setCurrentLine] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  
  // Larger array for code visual walkthrough to fill the space better
  const INITIAL_ARRAY = [
    { id: 'c1', value: 45 },
    { id: 'c2', value: 20 },
    { id: 'c3', value: 12 },
    { id: 'c4', value: 28 },
    { id: 'c5', value: 15 },
    { id: 'c6', value: 35 },
    { id: 'c7', value: 18 },
    { id: 'c8', value: 42 }
  ];

  const [array, setArray] = useState<ArrayItem[]>(INITIAL_ARRAY);
  const [pointers, setPointers] = useState<{ i: number | null, j: number | null, n: number | null }>({ i: null, j: null, n: INITIAL_ARRAY.length });
  const [highlights, setHighlights] = useState<Record<number, string>>({});
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  
  // Detailed simulation steps
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const snippet = CODE_SNIPPETS[algo][lang];

  useEffect(() => {
    setAlgo(initialAlgo);
    handleReset();
  }, [initialAlgo]);

  const generateBubbleSortSteps = (arr: ArrayItem[]) => {
    const steps: SimulationStep[] = [];
    const n = arr.length;
    let currentArr = [...arr];
    let sorted = new Set<number>();

    // Initial Line
    steps.push({ 
      line: 0, 
      array: [...currentArr], 
      pointers: { i: 0, j: null, n }, 
      highlights: {}, 
      sortedIndices: new Set(sorted) 
    });

    for (let i = 0; i < n - 1; i++) {
      steps.push({ 
        line: 0, 
        array: [...currentArr], 
        pointers: { i, j: null, n }, 
        highlights: {}, 
        sortedIndices: new Set(sorted) 
      });

      for (let j = 0; j < n - i - 1; j++) {
        // Line 1: inner loop start
        steps.push({ 
          line: 1, 
          array: [...currentArr], 
          pointers: { i, j, n }, 
          highlights: { [j]: 'comparing', [j+1]: 'comparing' }, 
          sortedIndices: new Set(sorted) 
        });

        // Line 2: if condition
        steps.push({ 
          line: 2, 
          array: [...currentArr], 
          pointers: { i, j, n }, 
          highlights: { [j]: 'selected', [j+1]: 'selected' }, 
          sortedIndices: new Set(sorted) 
        });

        if (currentArr[j].value > currentArr[j+1].value) {
          // Lines 3-5: Swap
          const temp = currentArr[j];
          currentArr[j] = currentArr[j+1];
          currentArr[j+1] = temp;
          currentArr = [...currentArr];

          steps.push({ 
            line: 4, 
            array: [...currentArr], 
            pointers: { i, j, n }, 
            highlights: { [j]: 'selected', [j+1]: 'selected' }, 
            sortedIndices: new Set(sorted) 
          });
        }
      }
      sorted.add(n - i - 1);
      steps.push({ 
        line: 7, 
        array: [...currentArr], 
        pointers: { i, j: null, n }, 
        highlights: {}, 
        sortedIndices: new Set(sorted) 
      });
    }
    sorted.add(0);
    steps.push({ 
      line: 7, 
      array: [...currentArr], 
      pointers: { i: n-1, j: null, n }, 
      highlights: {}, 
      sortedIndices: new Set(sorted) 
    });
    return steps;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying) {
      const stepsToUse = simulationSteps.length > 0 ? simulationSteps : [];
      const isSimulation = stepsToUse.length > 0;
      const max = isSimulation ? stepsToUse.length : snippet.code.length;
      const current = isSimulation ? stepIndex : currentLine;

      if (current < max) {
        timer = setTimeout(() => {
          handleNext();
        }, walkthroughSpeed);
      } else {
        setIsAutoPlaying(false);
        setShowQuestion(true);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentLine, stepIndex, simulationSteps, walkthroughSpeed]);

  const handleNext = () => {
    if (simulationSteps.length > 0) {
      if (stepIndex < simulationSteps.length - 1) {
        const nextStep = simulationSteps[stepIndex + 1];
        setStepIndex(prev => prev + 1);
        setArray(nextStep.array);
        setPointers(nextStep.pointers);
        setHighlights(nextStep.highlights);
        setSortedIndices(nextStep.sortedIndices);
        setCurrentLine(nextStep.line);
      } else {
        setIsAutoPlaying(false);
        setShowQuestion(true);
      }
    } else {
      if (currentLine < snippet.code.length - 1) {
        const nextLine = currentLine + 1;
        setCurrentLine(nextLine);
        // Fallback for static steps if any
      } else {
        setIsAutoPlaying(false);
        setShowQuestion(true);
      }
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setCurrentLine(0);
    setArray([...INITIAL_ARRAY]);
    setHighlights({});
    setSortedIndices(new Set());
    setPointers({ i: null, j: null, n: INITIAL_ARRAY.length });
    setShowQuestion(false);
    setIsAutoPlaying(false);
    setSimulationSteps([]);
  };

  const generateSelectionSortSteps = (arr: ArrayItem[]) => {
    const steps: SimulationStep[] = [];
    const n = arr.length;
    let currentArr = [...arr];
    let sortedIndices = new Set<number>();

    for (let i = 0; i < n - 1; i++) {
        // Line 0: outer loop
        steps.push({ line: 0, array: [...currentArr], pointers: { i, j: null, n }, highlights: { [i]: 'selected' }, sortedIndices: new Set(sortedIndices) });

        let min_idx = i;
        // Line 1: min_idx = i
        steps.push({ line: 1, array: [...currentArr], pointers: { i, j: i, n }, highlights: { [i]: 'selected' }, sortedIndices: new Set(sortedIndices) });

        for (let j = i + 1; j < n; j++) {
            // Line 2: inner loop
            steps.push({ line: 2, array: [...currentArr], pointers: { i, j, n }, highlights: { [min_idx]: 'selected', [j]: 'comparing' }, sortedIndices: new Set(sortedIndices) });

            // Line 3: if check
            steps.push({ line: 3, array: [...currentArr], pointers: { i, j, n }, highlights: { [min_idx]: 'selected', [j]: 'comparing' }, sortedIndices: new Set(sortedIndices) });

            if (currentArr[j].value < currentArr[min_idx].value) {
                min_idx = j;
                // Line 3: update min_idx
                steps.push({ line: 3, array: [...currentArr], pointers: { i, j, n }, highlights: { [min_idx]: 'selected' }, sortedIndices: new Set(sortedIndices) });
            }
        }

        // Line 5: Swap
        const temp = currentArr[min_idx];
        currentArr[min_idx] = currentArr[i];
        currentArr[i] = temp;
        currentArr = [...currentArr];
        
        sortedIndices.add(i);
        steps.push({ line: 5, array: [...currentArr], pointers: { i, j: min_idx, n }, highlights: { [i]: 'selected', [min_idx]: 'selected' }, sortedIndices: new Set(sortedIndices) });
    }
    
    sortedIndices.add(n - 1);
    steps.push({ line: 6, array: [...currentArr], pointers: { i: n - 1, j: null, n }, highlights: {}, sortedIndices: new Set(sortedIndices) });
    return steps;
  };

  const generateInsertionSortSteps = (arr: ArrayItem[]) => {
    const steps: SimulationStep[] = [];
    const n = arr.length;
    let currentArr = [...arr];
    let sortedIndices = new Set<number>([0]);

    for (let i = 1; i < n; i++) {
        // Line 0: outer loop
        steps.push({ line: 0, array: [...currentArr], pointers: { i, j: null, n }, highlights: { [i]: 'selected' }, sortedIndices: new Set(sortedIndices) });

        let key = currentArr[i];
        // Line 1: key = arr[i]
        steps.push({ line: 1, array: [...currentArr], pointers: { i, j: null, n }, highlights: { [i]: 'selected' }, sortedIndices: new Set(sortedIndices) });

        let j = i - 1;
        // Line 2: j = i - 1
        steps.push({ line: 2, array: [...currentArr], pointers: { i, j: j >= 0 ? j : null, n }, highlights: { [i]: 'selected' }, sortedIndices: new Set(sortedIndices) });

        while (j >= 0 && currentArr[j].value > key.value) {
            // Line 3: while loop check
            steps.push({ line: 3, array: [...currentArr], pointers: { i, j, n }, highlights: { [j]: 'comparing', [i]: 'selected' }, sortedIndices: new Set(sortedIndices) });

            // Line 4: Shift
            currentArr[j + 1] = currentArr[j];
            currentArr = [...currentArr];
            steps.push({ line: 4, array: [...currentArr], pointers: { i, j, n }, highlights: { [j+1]: 'selected' }, sortedIndices: new Set(sortedIndices) });

            j = j - 1;
            // Line 5: j = j - 1
            steps.push({ line: 5, array: [...currentArr], pointers: { i, j: j >= 0 ? j : null, n }, highlights: {}, sortedIndices: new Set(sortedIndices) });
        }

        // Line 7: Insert
        currentArr[j + 1] = key;
        currentArr = [...currentArr];
        
        for (let k = 0; k <= i; k++) sortedIndices.add(k);
        
        steps.push({ line: 7, array: [...currentArr], pointers: { i, j: null, n }, highlights: { [j+1]: 'selected' }, sortedIndices: new Set(sortedIndices) });
    }
    return steps;
  };

  const generateMergeSortSteps = (arr: ArrayItem[]) => {
    const steps: SimulationStep[] = [];
    const n = arr.length;
    let currentArr = [...arr];
    
    // In-place merge simulation for visualization
    const merge = (l: number, m: number, r: number) => {
        // Line 8: merge entry
        steps.push({ line: 8, array: [...currentArr], pointers: { i: l, j: r, n }, highlights: { [l]: 'comparing', [r]: 'comparing' }, sortedIndices: new Set() });
        
        let i = l, j = m + 1;
        // Line 9: initialize pointers
        steps.push({ line: 9, array: [...currentArr], pointers: { i, j, n }, highlights: { [i]: 'selected', [j]: 'selected' }, sortedIndices: new Set() });

        while (i <= m && j <= r) {
            // Line 10: while condition
            steps.push({ line: 10, array: [...currentArr], pointers: { i, j, n }, highlights: { [i]: 'comparing', [j]: 'comparing' }, sortedIndices: new Set() });
            
            // Line 11: comparison
            steps.push({ line: 11, array: [...currentArr], pointers: { i, j, n }, highlights: { [i]: 'selected', [j]: 'selected' }, sortedIndices: new Set() });
            
            if (currentArr[i].value <= currentArr[j].value) {
                i++;
                // Line 11: i++
                steps.push({ line: 11, array: [...currentArr], pointers: { i, j, n }, highlights: { [i-1]: 'selected' }, sortedIndices: new Set() });
            } else {
                const val = currentArr[j];
                // Line 13: val = arr[j]
                steps.push({ line: 13, array: [...currentArr], pointers: { i, j, n }, highlights: { [j]: 'selected' }, sortedIndices: new Set() });

                // Line 14: shift loop
                for (let k = j; k > i; k--) {
                    currentArr[k] = currentArr[k-1];
                }
                currentArr[i] = val;
                currentArr = [...currentArr];
                
                // Line 15: update pointers
                steps.push({ line: 15, array: [...currentArr], pointers: { i, j, n }, highlights: { [i]: 'selected' }, sortedIndices: new Set() });
                i++; m++; j++;
            }
        }
    };

    const recursiveMergeSort = (l: number, r: number) => {
        if (l < r) {
            // Line 0: entry
            steps.push({ line: 0, array: [...currentArr], pointers: { i: l, j: r, n }, highlights: { [l]: 'comparing', [r]: 'comparing' }, sortedIndices: new Set() });
            
            const m = Math.floor(l + (r - l) / 2);
            // Line 2: mid
            steps.push({ line: 2, array: [...currentArr], pointers: { i: m, j: null, n }, highlights: { [m]: 'selected' }, sortedIndices: new Set() });
            
            // Line 3: sort left
            steps.push({ line: 3, array: [...currentArr], pointers: { i: l, j: m, n }, highlights: { [l]: 'selected', [m]: 'selected' }, sortedIndices: new Set() });
            recursiveMergeSort(l, m);
            
            // Line 4: sort right
            steps.push({ line: 4, array: [...currentArr], pointers: { i: m+1, j: r, n }, highlights: { [m+1]: 'selected', [r]: 'selected' }, sortedIndices: new Set() });
            recursiveMergeSort(m + 1, r);
            
            // Line 5: merge
            steps.push({ line: 5, array: [...currentArr], pointers: { i: l, j: r, n }, highlights: { [l]: 'comparing', [r]: 'comparing' }, sortedIndices: new Set() });
            merge(l, m, r);
        }
    };

    recursiveMergeSort(0, n - 1);
    
    const allSorted = new Set<number>();
    for (let k = 0; k < n; k++) allSorted.add(k);
    steps.push({ line: 7, array: [...currentArr], pointers: { i: null, j: null, n }, highlights: {}, sortedIndices: allSorted });

    return steps;
  };

  const generateQuickSortSteps = (arr: ArrayItem[]) => {
    const steps: SimulationStep[] = [];
    const n = arr.length;
    let currentArr = [...arr];
    let sortedIndices = new Set<number>();

    const partition = (low: number, high: number): number => {
        // Line 7: partition entry
        steps.push({ line: 7, array: [...currentArr], pointers: { i: low, j: high, n }, highlights: { [low]: 'comparing', [high]: 'comparing' }, sortedIndices: new Set(sortedIndices) });
        
        let pivot = currentArr[high].value;
        // Line 8: pivot selection
        steps.push({ line: 8, array: [...currentArr], pointers: { i: null, j: high, n }, highlights: { [high]: 'selected' }, sortedIndices: new Set(sortedIndices) });
        
        let i = low - 1;
        // Line 9: i initialization
        steps.push({ line: 9, array: [...currentArr], pointers: { i: null, j: high, n }, highlights: { [high]: 'selected' }, sortedIndices: new Set(sortedIndices) });

        for (let j = low; j < high; j++) {
            // Line 10: j loop
            steps.push({ line: 10, array: [...currentArr], pointers: { i: i >= 0 ? i : null, j, n }, highlights: { [j]: 'comparing', [high]: 'selected' }, sortedIndices: new Set(sortedIndices) });
            
            // Line 11: compare
            if (currentArr[j].value < pivot) {
                i++;
                // Line 12: i++
                const [itemI, itemJ] = [currentArr[i], currentArr[j]];
                currentArr[i] = itemJ;
                currentArr[j] = itemI;
                currentArr = [...currentArr];
                // Line 13: swap
                steps.push({ line: 13, array: [...currentArr], pointers: { i, j, n }, highlights: { [i]: 'selected', [j]: 'selected' }, sortedIndices: new Set(sortedIndices) });
            }
        }
        
        // Line 16: final pivot swap
        const [itemI1, itemHigh] = [currentArr[i+1], currentArr[high]];
        currentArr[i+1] = itemHigh;
        currentArr[high] = itemI1;
        currentArr = [...currentArr];
        
        steps.push({ line: 16, array: [...currentArr], pointers: { i: i + 1, j: high, n }, highlights: { [i+1]: 'selected', [high]: 'selected' }, sortedIndices: new Set(sortedIndices) });
        
        return i + 1;
    };

    const recursiveQuickSort = (low: number, high: number) => {
        if (low < high) {
            // Line 1: condition check
            steps.push({ line: 1, array: [...currentArr], pointers: { i: low, j: high, n }, highlights: {}, sortedIndices: new Set(sortedIndices) });
            
            // Line 2: partition call
            let pi = partition(low, high);
            sortedIndices.add(pi);
            
            // Line 3: sort left
            steps.push({ line: 3, array: [...currentArr], pointers: { i: low, j: pi - 1, n }, highlights: {}, sortedIndices: new Set(sortedIndices) });
            recursiveQuickSort(low, pi - 1);
            
            // Line 4: sort right
            steps.push({ line: 4, array: [...currentArr], pointers: { i: pi + 1, j: high, n }, highlights: {}, sortedIndices: new Set(sortedIndices) });
            recursiveQuickSort(pi + 1, high);
        } else if (low === high) {
            sortedIndices.add(low);
        }
    };

    recursiveQuickSort(0, n - 1);
    
    const allSorted = new Set<number>();
    for (let k = 0; k < n; k++) allSorted.add(k);
    steps.push({ line: 5, array: [...currentArr], pointers: { i: null, j: null, n }, highlights: {}, sortedIndices: allSorted });

    return steps;
  };

  const startIteration = () => {
    handleReset();
    let steps: SimulationStep[] = [];
    if (algo === 'bubble') {
      steps = generateBubbleSortSteps(INITIAL_ARRAY);
    } else if (algo === 'selection') {
      steps = generateSelectionSortSteps(INITIAL_ARRAY);
    } else if (algo === 'insertion') {
      steps = generateInsertionSortSteps(INITIAL_ARRAY);
    } else if (algo === 'merge') {
      steps = generateMergeSortSteps(INITIAL_ARRAY);
    } else if (algo === 'quick') {
      steps = generateQuickSortSteps(INITIAL_ARRAY);
    }
    
    if (steps.length > 0) {
      setSimulationSteps(steps);
      const first = steps[0];
      setArray(first.array);
      setPointers(first.pointers);
      setHighlights(first.highlights);
      setSortedIndices(first.sortedIndices);
      setCurrentLine(first.line);
      setIsAutoPlaying(true);
    }
  };

  return (
    <div className={`flex-1 flex flex-col p-8 overflow-hidden relative transition-colors duration-500 ${theme === 'dark' ? '' : 'bg-slate-50/50'}`}>
      {/* Top Bar - Config */}
      <div className={`flex flex-wrap items-end gap-6 mb-8 p-6 rounded-3xl border-2 transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-lg ring-1 ring-slate-100'}`}>
        <div className="flex-1 min-w-[200px]">
          <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 px-1 transition-colors ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>Sort Protocol</label>
          <div className="relative">
            <select 
              value={algo}
              onChange={(e) => {
                onAlgorithmChange(e.target.value as Algorithm);
                handleReset();
              }}
              className={`w-full border rounded-xl px-5 py-4 font-bold appearance-none cursor-pointer focus:outline-none transition-all ${theme === 'dark' ? 'bg-slate-950 border-cyan-500/30 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-600'}`}
            >
              <option value="bubble">Bubble Sort</option>
              <option value="insertion">Insertion Sort</option>
              <option value="selection">Selection Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
            </select>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${theme === 'dark' ? 'text-cyan-500' : 'text-cyan-600'}`} />
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 px-1 transition-colors ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}`}>Architecture</label>
          <div className="relative">
            <select 
              value={lang}
              onChange={(e) => {
                setLang(e.target.value as Language);
                handleReset();
              }}
              className={`w-full border rounded-xl px-5 py-4 font-bold appearance-none cursor-pointer focus:outline-none transition-all ${theme === 'dark' ? 'bg-slate-950 border-amber-500/30 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-600'}`}
            >
              <option value="java">Java (JDK)</option>
              <option value="javascript">JavaScript (ES6)</option>
              <option value="python">Python (3.x)</option>
              <option value="c">C (ANSI)</option>
              <option value="cpp">C++ (STL)</option>
            </select>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}`} />
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className={`block text-[10px] uppercase tracking-widest font-black mb-2 px-1 transition-colors ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>Clock Speed</label>
          <div className="relative">
            <select 
              value={walkthroughSpeed}
              onChange={(e) => setWalkthroughSpeed(Number(e.target.value))}
              className={`w-full border rounded-xl px-5 py-4 font-bold appearance-none cursor-pointer focus:outline-none transition-all ${theme === 'dark' ? 'bg-slate-950 border-orange-500/30 text-white focus:border-orange-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-orange-600'}`}
            >
              <option value={4000}>Sub-Sonic (Slow)</option>
              <option value={2500}>Standard</option>
              <option value={1000}>Overclock (Fast)</option>
            </select>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${theme === 'dark' ? 'text-orange-500' : 'text-orange-600'}`} />
          </div>
        </div>

        <button 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`px-10 py-4 h-[58px] rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all ${isAutoPlaying ? 'bg-orange-500 text-black' : (theme === 'dark' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30')}`}
        >
          {isAutoPlaying ? <Play className="w-4 h-4 fill-current rotate-90" /> : <Play className="w-4 h-4 fill-current" />}
          {isAutoPlaying ? 'Stop' : 'Run Walkthrough'}
        </button>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left Side - Visual Debugger */}
        <div className={`flex-1 rounded-[2.5rem] border-2 p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="absolute top-8 left-8 flex items-center gap-4">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Live Execution Space</h4>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400 border-white/5' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>n = {array.length}</span>
            </div>
          </div>

          <div className="absolute top-8 right-8">
            <button 
              onClick={startIteration}
              className={`px-6 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-cyan-500 hover:bg-cyan-400 border-cyan-400 text-black shadow-[0_8px_25px_rgba(34,211,238,0.4)]' : 'bg-cyan-600 hover:bg-cyan-700 border-cyan-600 text-white shadow-lg shadow-cyan-600/30'}`}
            >
              <Play className="w-3 h-3 fill-current" />
              Iterate Protocol
            </button>
          </div>

          <div className="relative pt-12 w-full h-[400px] flex items-end justify-center gap-4 px-4 overflow-visible">
            {array.map((item, idx) => {
              const isSelected = highlights[idx] === 'selected';
              const isComparing = highlights[idx] === 'comparing';
              const isSorted = sortedIndices.has(idx);
              const val = item.value;
              const maxVal = Math.max(...array.map(a => a.value));
              const height = (val / maxVal) * 240 + 60;
              
              let colorClasses = theme === 'dark' 
                ? 'bg-gradient-to-t from-slate-800 to-slate-700 border-white/5' 
                : 'bg-gradient-to-t from-slate-200 to-slate-100 border-slate-300 shadow-sm';
                
              if (isSorted) {
                colorClasses = theme === 'dark' 
                  ? 'bg-gradient-to-t from-green-600 to-green-400 border-green-400/30' 
                  : 'bg-gradient-to-t from-green-500 to-green-400 border-green-600/20 shadow-md';
              } else if (isSelected) {
                colorClasses = theme === 'dark' 
                  ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.5)]' 
                  : 'bg-gradient-to-t from-cyan-600 to-cyan-500 border-cyan-700/30 shadow-xl';
              } else if (isComparing) {
                colorClasses = theme === 'dark' 
                  ? 'bg-gradient-to-t from-amber-600 to-amber-400 border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.5)]' 
                  : 'bg-gradient-to-t from-amber-600 to-amber-500 border-amber-700/30 shadow-xl';
              }

              return (
                <div key={item.id} className="relative flex flex-col items-center group">
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ height, width: 52 }}
                    className={`rounded-t-2xl border-2 transition-all duration-300 flex items-center justify-center relative ${colorClasses} ${isSelected || isComparing ? 'scale-110 -translate-y-6 z-10' : ''}`}
                  >
                    <span className={`text-lg font-black transition-colors ${isSelected || isComparing || isSorted ? (theme === 'dark' ? 'text-black' : 'text-white') : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>
                      {val}
                    </span>
                  </motion.div>

                  {/* Enhanced Pointers for Code Mode - Moved to top to avoid overlapping with commentary */}
                  <div className="absolute -top-16 flex flex-col items-center w-full pointer-events-none z-20">
                    <AnimatePresence>
                      {pointers.i === idx && (
                        <motion.div
                          key="p-i"
                          initial={{ opacity: 0, y: -15, scale: 0.5 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -15, scale: 0.5 }}
                          className={`px-4 py-1.5 bg-cyan-500 text-black text-xs font-black rounded-xl shadow-xl relative whitespace-nowrap mb-1`}
                        >
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-t-cyan-500" />
                          i = {idx}
                        </motion.div>
                      )}
                      {pointers.j === idx && (
                        <motion.div
                          key="p-j"
                          initial={{ opacity: 0, y: -15, scale: 0.5 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -15, scale: 0.5 }}
                          className={`px-4 py-1.5 bg-amber-500 text-black text-xs font-black rounded-xl shadow-xl relative whitespace-nowrap`}
                        >
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-t-amber-500" />
                          j = {idx}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Code Panel */}
        <div className={`w-[48%] border-2 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden transition-all shadow-2xl ${theme === 'dark' ? 'bg-slate-950/60 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className={`flex items-center gap-3 mb-6 p-3 rounded-2xl w-fit transition-colors ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-100 border border-slate-200 shadow-sm'}`}>
             <div className="w-2 h-2 rounded-full bg-red-500/50" />
             <div className="w-2 h-2 rounded-full bg-amber-500/50" />
             <div className="w-2 h-2 rounded-full bg-green-500/50" />
             <span className={`ml-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{algo}.{lang === 'python' ? 'py' : lang === 'cpp' ? 'cpp' : lang === 'java' ? 'java' : lang === 'c' ? 'c' : 'js'}</span>
          </div>

          <div className="flex-1 font-mono text-base space-y-2.5 overflow-y-auto pr-4 scrollbar-hide">
             {snippet.code.map((line, idx) => (
                <motion.div 
                  key={idx}
                  animate={{ 
                    opacity: currentLine === idx ? 1 : 0.3,
                    x: currentLine === idx ? 12 : 0,
                    scale: currentLine === idx ? 1.02 : 1
                  }}
                  className={`flex gap-4 items-start px-4 py-2 rounded-xl transition-all ${currentLine === idx ? (theme === 'dark' ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'bg-cyan-50 border-l-4 border-cyan-600 shadow-sm') : ''}`}
                >
                  <span className={`text-xs mt-1 w-4 select-none transition-colors ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>{idx + 1}</span>
                  <span className={`block transition-colors ${currentLine === idx ? (theme === 'dark' ? 'text-white font-bold' : 'text-slate-900 font-bold') : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>
                    {line}
                  </span>
                </motion.div>
             ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Avatar 
          variant="bar"
          message={snippet.explanations[currentLine] || "Analyzing logic..."}
          isThinking={isAutoPlaying}
          theme={theme}
        />
      </div>


      {/* Understood Question Overlay */}
      <AnimatePresence>
        {showQuestion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className={`p-12 rounded-[3.5rem] max-w-lg w-full text-center shadow-3xl border-2 transition-all ${theme === 'dark' ? 'bg-slate-900 border-cyan-500 shadow-cyan-500/20' : 'bg-white border-cyan-600 shadow-xl'}`}
             >
                <div className={`w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center rotate-3 transition-all ${theme === 'dark' ? 'bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'bg-cyan-600 shadow-xl shadow-cyan-600/30'}`}>
                   <Code className={`w-10 h-10 stroke-[3px] ${theme === 'dark' ? 'text-black' : 'text-white'}`} />
                </div>
                <h3 className={`text-3xl font-black mb-4 uppercase tracking-tighter transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Understood the logic?</h3>
                <p className={`mb-10 text-lg transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Mischief wants to make sure your processor is synced with this code protocol.</p>
                
                <div className="flex gap-4 justify-center">
                   <button 
                     onClick={() => {
                        onAlgorithmChange(algo);
                        handleReset();
                     }}
                     className={`px-8 py-4 font-bold rounded-2xl flex items-center gap-3 transition-all ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm'}`}
                   >
                     <XCircle className="w-5 h-5 text-red-500" />
                     Repeat
                   </button>
                   <button 
                     onClick={() => setShowQuestion(false)}
                     className={`px-10 py-4 font-black rounded-2xl flex items-center gap-3 transition-all shadow-lg ${theme === 'dark' ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/40' : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/30'}`}
                   >
                     <CheckCircle2 className="w-5 h-5" />
                     Fully Synced
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

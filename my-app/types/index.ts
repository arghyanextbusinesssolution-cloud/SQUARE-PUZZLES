// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

// Puzzle types
export interface CellPosition {
  row: number;
  col: number;
}

export interface VisibleLetter extends CellPosition {
  letter: string;
}

export interface Word {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
}

export interface Puzzle {
  id: string;
  puzzleDate: string;
  gridSize: number;
  visibleLetters: VisibleLetter[];
  dailyMessage: string;
}

export interface PuzzleAttempt {
  currentGrid: string[][];
  hintUsed: boolean;
  status: 'incomplete' | 'correct' | 'incorrect';
}

export interface PuzzleData {
  puzzle: Puzzle;
  attempt: PuzzleAttempt | null;
}

export interface CheckResult {
  status: 'incomplete' | 'correct' | 'incorrect';
  message: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  errors?: { field: string; message: string }[];
  data?: T;
}

export interface UserResponse extends ApiResponse {
  user: User;
}

export interface PuzzleResponse extends ApiResponse {
  puzzle: Puzzle;
  attempt: PuzzleAttempt | null;
}

export interface CheckResponse extends ApiResponse {
  result: CheckResult;
}

export interface HintResponse extends ApiResponse {
  hintCells: CellPosition[];
  message: string;
}

// Admin types
export interface AdminPuzzle {
  _id: string;
  puzzleDate: string;
  gridSize: number;
  words: Word[];
  visibleCells: CellPosition[];
  hintCells: CellPosition[];
  dailyMessage: string;
  solutionGrid?: string[][];
  createdBy: {
    _id: string;
    email: string;
    name?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Report {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name?: string;
  };
  puzzleId: {
    _id: string;
    puzzleDate: string;
    gridSize: number;
  };
  userGrid: string[][];
  hintUsed: boolean;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reportType: string;
  description?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalPuzzles: number;
  pendingReports: number;
  todayAttempts: number;
}

// User Stats
export interface UserStats {
  totalAttempts: number;
  completed: number;
  hintsUsed: number;
}

export interface UserStreak {
  current: number;
  max: number;
  totalCompleted: number;
}

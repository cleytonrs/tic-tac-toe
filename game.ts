// Type definitions for Tic Tac Toe game

export type Mark = 'X' | 'O' | null;

export type Board = [Mark, Mark, Mark, Mark, Mark, Mark, Mark, Mark, Mark];

export type Screen = 'start' | 'game' | 'result' | 'end';

export interface GameState {
  board: Board;
  currentMark: 'X' | 'O';
  roundStartingMark: 'X' | 'O';
  isRoundOver: boolean;
  winningCells: number[] | null;
}

export interface Scores {
  playerXWins: number;
  playerOWins: number;
  draws: number;
}

export interface SessionState {
  playerXName: string;
  playerOName: string;
  scores: Scores;
  roundNumber: number;
  gameState: GameState;
}

export interface RoundResult {
  outcome: 'win' | 'draw';
  winner: 'X' | 'O' | null;
  winningCells: number[] | null;
}

export interface ScreenState {
  currentScreen: Screen;
  previousScreen: Screen | null;
}

// Win detection lines: rows, columns, diagonals
const WIN_LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

/**
 * Checks the board for a winner.
 * Returns the winning mark and the indices of the winning cells,
 * or null if there is no winner.
 */
export function checkWinner(board: Board): { winner: 'X' | 'O'; winningCells: number[] } | null {
  for (const [a, b, c] of WIN_LINES) {
    const mark = board[a];
    if (mark !== null && mark === board[b] && mark === board[c]) {
      return { winner: mark, winningCells: [a, b, c] };
    }
  }
  return null;
}

/**
 * Checks the board for a draw.
 * A draw occurs when all 9 cells are filled and there is no winner.
 * Win detection takes priority — if the last move wins, this returns false.
 */
export function checkDraw(board: Board): boolean {
  if (checkWinner(board) !== null) {
    return false;
  }
  return board.every(cell => cell !== null);
}

// --- Player Name Validation ---

const MAX_NAME_LENGTH = 20;

/**
 * Validates and sanitizes a player name.
 * - Trims the input
 * - Returns the trimmed name if it's 1-20 characters and not all whitespace
 * - Returns defaultName if input is empty or only whitespace after trimming
 * - Truncates to 20 characters if the trimmed result exceeds the max length
 */
export function validatePlayerName(name: string, defaultName: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return defaultName;
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return trimmed.slice(0, MAX_NAME_LENGTH);
  }
  return trimmed;
}

/**
 * Checks whether a name (after trimming) is valid:
 * between 1 and 20 characters and not composed entirely of whitespace.
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= MAX_NAME_LENGTH;
}

/**
 * Enforces a maximum character length on an HTML input element.
 * Truncates the input value if it exceeds the specified maxLength.
 */
export function enforceMaxLength(input: HTMLInputElement, maxLength: number): void {
  if (input.value.length > maxLength) {
    input.value = input.value.slice(0, maxLength);
  }
}

/**
 * Places a mark on the board at the given cell index.
 * Returns a new board with the mark placed if the cell is empty (null).
 * Returns null if the cell is already occupied.
 * Does not mutate the original board.
 */
export function placeMark(board: Board, cellIndex: number, mark: 'X' | 'O'): Board | null {
  if (board[cellIndex] !== null) {
    return null;
  }
  const newBoard = [...board] as Board;
  newBoard[cellIndex] = mark;
  return newBoard;
}

/**
 * Returns the next mark to play.
 * Alternates between 'X' and 'O'.
 */
export function getNextMark(currentMark: 'X' | 'O'): 'X' | 'O' {
  return currentMark === 'X' ? 'O' : 'X';
}

// --- Score Manager ---

export interface ScoreManager {
  incrementWin(player: 'X' | 'O'): void;
  incrementDraw(): void;
  getScores(): Scores;
  reset(): void;
}

/**
 * Creates a score manager that tracks wins and draws across rounds.
 * All scores are initialized to zero.
 */
export function createScoreManager(): ScoreManager {
  let scores: Scores = { playerXWins: 0, playerOWins: 0, draws: 0 };

  return {
    incrementWin(player: 'X' | 'O'): void {
      if (player === 'X') {
        scores.playerXWins++;
      } else {
        scores.playerOWins++;
      }
    },

    incrementDraw(): void {
      scores.draws++;
    },

    getScores(): Scores {
      return { ...scores };
    },

    reset(): void {
      scores = { playerXWins: 0, playerOWins: 0, draws: 0 };
    },
  };
}

// --- Round Management ---

/**
 * Creates a fresh empty board.
 */
export function createEmptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

/**
 * Creates an initial game state for a new round.
 */
export function createInitialGameState(startingMark: 'X' | 'O' = 'X'): GameState {
  return {
    board: createEmptyBoard(),
    currentMark: startingMark,
    roundStartingMark: startingMark,
    isRoundOver: false,
    winningCells: null,
  };
}

/**
 * Resets the game state for "Play Again":
 * - Clears the board to all-null cells
 * - Preserves scores (handled externally)
 * - Alternates the starting mark from the previous round's starting mark
 * - Increments round number (handled externally)
 */
export function resetForNewRound(previousGameState: GameState): GameState {
  const newStartingMark = getNextMark(previousGameState.roundStartingMark);
  return createInitialGameState(newStartingMark);
}

// --- Share Service ---

/**
 * Generates a shareable text message containing both player names,
 * their win counts, and the draw count. Maximum 280 characters.
 */
export function generateShareText(playerXName: string, playerOName: string, scores: Scores): string {
  const text = `🎮 Tic Tac Toe Results!\n${playerXName}: ${scores.playerXWins} wins\n${playerOName}: ${scores.playerOWins} wins\nDraws: ${scores.draws}`;
  if (text.length <= 280) {
    return text;
  }
  // Truncate names if needed to stay within 280 chars
  const template = `🎮 Tic Tac Toe Results!\n: ${scores.playerXWins} wins\n: ${scores.playerOWins} wins\nDraws: ${scores.draws}`;
  const available = 280 - template.length;
  const halfAvailable = Math.floor(available / 2);
  const truncX = playerXName.slice(0, halfAvailable);
  const truncO = playerOName.slice(0, available - halfAvailable);
  return `🎮 Tic Tac Toe Results!\n${truncX}: ${scores.playerXWins} wins\n${truncO}: ${scores.playerOWins} wins\nDraws: ${scores.draws}`;
}

/**
 * Opens Twitter with pre-filled share text.
 * Returns true if the window opened successfully, false otherwise.
 */
export function shareToTwitter(text: string): boolean {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  const win = window.open(url, '_blank');
  return win !== null;
}

/**
 * Opens Facebook with pre-filled share text.
 * Returns true if the window opened successfully, false otherwise.
 */
export function shareToFacebook(text: string): boolean {
  const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
  const win = window.open(url, '_blank');
  return win !== null;
}

/**
 * Copies text to clipboard as fallback when popup is blocked.
 * Returns a promise that resolves to true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

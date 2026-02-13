/**
 * Puzzle Service
 * Handles puzzle grid building and validation
 */

/**
 * Build solution grid from words
 * @param {number} gridSize - Size of the grid (NxN)
 * @param {Array} words - Array of word objects with position and direction
 * @returns {Object} - { grid, errors }
 */
const buildSolutionGrid = (gridSize, words) => {
  const errors = [];

  // Initialize empty grid
  const grid = Array(gridSize).fill(null).map(() =>
    Array(gridSize).fill('')
  );

  // Place each word on the grid
  for (const wordObj of words) {
    const { word, startRow, startCol, direction } = wordObj;
    const upperWord = word.toUpperCase();

    // Validate word fits in grid
    if (direction === 'horizontal') {
      if (startCol + upperWord.length > gridSize) {
        errors.push(`Word "${word}" extends beyond grid horizontally`);
        continue;
      }
    } else if (direction === 'vertical') {
      if (startRow + upperWord.length > gridSize) {
        errors.push(`Word "${word}" extends beyond grid vertically`);
        continue;
      }
    }

    // Place letters
    for (let i = 0; i < upperWord.length; i++) {
      const row = direction === 'vertical' ? startRow + i : startRow;
      const col = direction === 'horizontal' ? startCol + i : startCol;

      // Check for conflicts
      if (grid[row][col] !== '' && grid[row][col] !== upperWord[i]) {
        errors.push(`Letter conflict at position (${row}, ${col}): "${grid[row][col]}" vs "${upperWord[i]}"`);
        continue;
      }

      grid[row][col] = upperWord[i];
    }
  }

  return { grid, errors };
};

/**
 * Validate puzzle configuration
 * @param {Object} puzzleData - Puzzle data to validate
 * @returns {Object} - { valid, errors }
 */
const validatePuzzleConfig = (puzzleData) => {
  const errors = [];
  const { gridSize, words, visibleCells, hintCells } = puzzleData;

  // Check grid size
  if (gridSize < 3 || gridSize > 10) {
    errors.push('Grid size must be between 3 and 10');
  }

  // Check words
  if (!words || words.length === 0) {
    errors.push('At least one word is required');
  }

  // Validate visible cells are within bounds
  if (visibleCells) {
    for (const cell of visibleCells) {
      if (cell.row < 0 || cell.row >= gridSize || cell.col < 0 || cell.col >= gridSize) {
        errors.push(`Visible cell (${cell.row}, ${cell.col}) is out of bounds`);
      }
    }
  }

  // Validate hint cells are within bounds
  if (hintCells) {
    for (const cell of hintCells) {
      if (cell.row < 0 || cell.row >= gridSize || cell.col < 0 || cell.col >= gridSize) {
        errors.push(`Hint cell (${cell.row}, ${cell.col}) is out of bounds`);
      }
    }
  }

  // Ensure hint cells do not overlap visible cells
  if (hintCells && visibleCells) {
    const visibleSet = new Set(visibleCells.map(c => `${c.row},${c.col}`));
    for (const cell of hintCells) {
      if (visibleSet.has(`${cell.row},${cell.col}`)) {
        errors.push(`Hint cell (${cell.row}, ${cell.col}) overlaps a visible cell`);
      }
    }
  }

  // Build grid to check for word conflicts
  const { grid, errors: gridErrors } = buildSolutionGrid(gridSize, words);
  errors.push(...gridErrors);

  return {
    valid: errors.length === 0,
    errors,
    solutionGrid: grid
  };
};

/**
 * Compare user grid with solution
 * @param {Array} userGrid - User's submitted grid
 * @param {Array} solutionGrid - Correct solution grid
 * @returns {Object} - { status, message }
 */
const compareGrids = (userGrid, solutionGrid) => {
  if (!userGrid || !solutionGrid) {
    return { status: 'incomplete', message: 'Invalid grid data', incorrectCells: [], correctCells: [] };
  }

  // Ensure grids are arrays
  if (!Array.isArray(userGrid) || !Array.isArray(solutionGrid)) {
    return { status: 'incomplete', message: 'Invalid grid format', incorrectCells: [], correctCells: [] };
  }

  const gridSize = solutionGrid.length;
  let allFilled = true;
  let allCorrect = true;
  let cellsChecked = 0;
  const incorrectCells = [];
  const correctCells = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const solutionLetter = solutionGrid[row]?.[col]?.toUpperCase().trim() || '';
      const userLetter = userGrid[row]?.[col]?.toUpperCase().trim() || '';

      // Skip empty cells in solution (non-playable cells)
      if (!solutionLetter) continue;

      cellsChecked++;

      if (!userLetter) {
        console.log(`[Puzzle] Empty cell found at (${row}, ${col}), expected: ${solutionLetter}`);
        allFilled = false;
        incorrectCells.push({ row, col });
      } else if (userLetter !== solutionLetter) {
        console.log(`[Puzzle] Wrong letter at (${row}, ${col}): got "${userLetter}", expected "${solutionLetter}"`);
        allCorrect = false;
        incorrectCells.push({ row, col });
      } else {
        // Cell is correct
        correctCells.push({ row, col });
      }
    }
  }

  console.log(`[Puzzle] Grid check: ${cellsChecked} cells checked, allFilled: ${allFilled}, allCorrect: ${allCorrect}`);
  console.log(`[Puzzle] incorrectCells:`, incorrectCells);
  console.log(`[Puzzle] correctCells:`, correctCells);

  if (!allFilled) {
    return { status: 'incomplete', message: 'Please fill in all cells', incorrectCells, correctCells };
  }

  if (!allCorrect) {
    return { status: 'incorrect', message: 'Some letters are incorrect. Keep trying!', incorrectCells, correctCells };
  }

  return { status: 'correct', message: 'Congratulations! You solved the puzzle!', incorrectCells: [], correctCells };
};

/**
 * Generate clipboard text for sharing
 * @param {Array} grid - The puzzle grid
 * @param {Array} hintCells - Cells that were hinted
 * @param {Date} puzzleDate - Date of the puzzle
 * @param {boolean} hintUsed - Whether hint was used
 * @returns {string} - Formatted text for clipboard
 */
const generateClipboardText = (grid, hintCells, puzzleDate, hintUsed) => {
  const dateStr = new Date(puzzleDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let text = `SQUARE PUZZLES - ${dateStr}\n\n`;

  // Create a set of hint positions for quick lookup
  const hintPositions = new Set(
    hintCells.map(cell => `${cell.row},${cell.col}`)
  );

  // Build grid visualization
  for (let row = 0; row < grid.length; row++) {
    let rowStr = '';
    for (let col = 0; col < grid[row].length; col++) {
      const letter = grid[row][col] || ' ';
      const isHint = hintPositions.has(`${row},${col}`);
      rowStr += isHint ? `[${letter}]` : ` ${letter} `;
    }
    text += rowStr + '\n';
  }

  text += `\n${hintUsed ? '(Used hint)' : '(No hint used)'}\n`;
  text += `\nPlay at: ${process.env.FRONTEND_URL}`;

  return text;
};

module.exports = {
  buildSolutionGrid,
  validatePuzzleConfig,
  compareGrids,
  generateClipboardText
};

const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  startRow: {
    type: Number,
    required: true,
    min: 0
  },
  startCol: {
    type: Number,
    required: true,
    min: 0
  },
  direction: {
    type: String,
    enum: ['horizontal', 'vertical'],
    required: true
  }
}, { _id: false });

const cellPositionSchema = new mongoose.Schema({
  row: {
    type: Number,
    required: true,
    min: 0
  },
  col: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const puzzleSchema = new mongoose.Schema({
  puzzleDate: {
    type: Date,
    required: [true, 'Puzzle date is required'],
    unique: true
  },
  gridSize: {
    type: Number,
    required: true,
    min: 3,
    max: 10,
    default: 5
  },
  solutionGrid: {
    type: [[String]], // 2D array of letters
    required: true,
    select: false // Don't return solution by default
  },
  visibleCells: {
    type: [cellPositionSchema],
    default: []
  },
  hintCells: {
    type: [cellPositionSchema],
    default: []
  },
  words: {
    type: [wordSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one word is required'
    }
  },
  dailyMessage: {
    type: String,
    default: '',
    maxlength: [500, 'Daily message cannot exceed 500 characters']
  },
  acrossClues: {
    type: [
      {
        number: Number,
        text: { type: String, maxlength: [250, 'Clue cannot exceed 250 characters'] }
      }
    ],
    default: []
  },
  downClues: {
    type: [
      {
        number: Number,
        text: { type: String, maxlength: [250, 'Clue cannot exceed 250 characters'] }
      }
    ],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast date lookups
puzzleSchema.index({ puzzleDate: 1 });
puzzleSchema.index({ createdBy: 1 });

// Virtual to check if puzzle is for today
puzzleSchema.virtual('isToday').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const puzzleDay = new Date(this.puzzleDate);
  puzzleDay.setHours(0, 0, 0, 0);
  return today.getTime() === puzzleDay.getTime();
});

// Static method to get today's puzzle
puzzleSchema.statics.getTodaysPuzzle = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.findOne({
    puzzleDate: { $gte: today, $lt: tomorrow },
    isActive: true
  });
};

// Static method to get yesterday's puzzle
puzzleSchema.statics.getYesterdaysPuzzle = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return this.findOne({
    puzzleDate: { $gte: yesterday, $lt: today },
    isActive: true
  }).select('+solutionGrid'); // Include solution for yesterday
};

// Method to get puzzle data without solution
puzzleSchema.methods.getSafeData = function() {
  return {
    _id: this._id,
    puzzleDate: this.puzzleDate,
    gridSize: this.gridSize,
    visibleCells: this.visibleCells,
    hintCells: this.hintCells,
    dailyMessage: this.dailyMessage
  };
};

// Method to get visible letters from solution
puzzleSchema.methods.getVisibleLetters = function() {
  const visibleLetters = [];
  if (!this.solutionGrid) return visibleLetters;
  
  for (const cell of this.visibleCells) {
    if (this.solutionGrid[cell.row] && this.solutionGrid[cell.row][cell.col]) {
      visibleLetters.push({
        row: cell.row,
        col: cell.col,
        letter: this.solutionGrid[cell.row][cell.col]
      });
    }
  }
  return visibleLetters;
};

module.exports = mongoose.model('Puzzle', puzzleSchema);

const { Puzzle, PuzzleAttempt, Report, User, AdminLog } = require('../models');
const { validatePuzzleConfig, buildSolutionGrid } = require('../services/puzzleService');

/**
 * @desc    Create new puzzle
 * @route   POST /api/admin/puzzle
 * @access  Admin
 */
const createPuzzle = async (req, res, next) => {
  try {
    const { puzzleDate, gridSize, words, visibleCells, hintCells, dailyMessage, acrossClues, downClues } = req.body;
    
    // Check if puzzle already exists for this date
    const existingPuzzle = await Puzzle.findOne({
      puzzleDate: {
        $gte: new Date(new Date(puzzleDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(puzzleDate).setHours(23, 59, 59, 999))
      }
    });
    
    if (existingPuzzle) {
      return res.status(400).json({
        success: false,
        error: 'A puzzle already exists for this date'
      });
    }
    
    // Validate puzzle configuration
    const validation = validatePuzzleConfig({
      gridSize,
      words,
      visibleCells,
      hintCells
    });
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Create puzzle
    const puzzle = await Puzzle.create({
      puzzleDate: new Date(puzzleDate),
      gridSize,
      solutionGrid: validation.solutionGrid,
      words,
      visibleCells: visibleCells || [],
      hintCells: hintCells || [],
      dailyMessage: dailyMessage || '',
      acrossClues: acrossClues || [],
      downClues: downClues || [],
      createdBy: req.user._id
    });
    
    // Log admin action
    await AdminLog.logAction(
      req.user._id,
      'puzzle_created',
      'puzzle',
      puzzle._id,
      { puzzleDate, gridSize, wordCount: words.length },
      req
    );
    
    res.status(201).json({
      success: true,
      message: 'Puzzle created successfully',
      puzzle: {
        id: puzzle._id,
        puzzleDate: puzzle.puzzleDate,
        gridSize: puzzle.gridSize
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all puzzles
 * @route   GET /api/admin/puzzles
 * @access  Admin
 */
const getAllPuzzles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const puzzles = await Puzzle.find()
      .populate('createdBy', 'email name')
      .sort({ puzzleDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Puzzle.countDocuments();
    
    res.status(200).json({
      success: true,
      data: puzzles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single puzzle with full details
 * @route   GET /api/admin/puzzle/:id
 * @access  Admin
 */
const getPuzzle = async (req, res, next) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id)
      .select('+solutionGrid')
      .populate('createdBy', 'email name');
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    // Get attempt statistics
    const attemptStats = await PuzzleAttempt.aggregate([
      { $match: { puzzleId: puzzle._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      puzzle,
      stats: {
        attempts: attemptStats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update puzzle
 * @route   PUT /api/admin/puzzle/:id
 * @access  Admin
 */
const updatePuzzle = async (req, res, next) => {
  try {
    const { gridSize, words, visibleCells, hintCells, dailyMessage, isActive, acrossClues, downClues } = req.body;
    
    let puzzle = await Puzzle.findById(req.params.id);
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    // If words or gridSize changed, rebuild solution grid
    if (words || gridSize) {
      const newGridSize = gridSize || puzzle.gridSize;
      const newWords = words || puzzle.words;
      
      const validation = validatePuzzleConfig({
        gridSize: newGridSize,
        words: newWords,
        visibleCells: visibleCells || puzzle.visibleCells,
        hintCells: hintCells || puzzle.hintCells
      });
      
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }
      
      puzzle.solutionGrid = validation.solutionGrid;
      puzzle.gridSize = newGridSize;
      puzzle.words = newWords;
    }
    
    if (visibleCells) puzzle.visibleCells = visibleCells;
    if (hintCells) puzzle.hintCells = hintCells;
    if (dailyMessage !== undefined) puzzle.dailyMessage = dailyMessage;
    if (isActive !== undefined) puzzle.isActive = isActive;
    if (acrossClues) puzzle.acrossClues = acrossClues;
    if (downClues) puzzle.downClues = downClues;
    
    await puzzle.save();
    
    // Log admin action
    await AdminLog.logAction(
      req.user._id,
      'puzzle_updated',
      'puzzle',
      puzzle._id,
      { updatedFields: Object.keys(req.body) },
      req
    );
    
    res.status(200).json({
      success: true,
      message: 'Puzzle updated successfully',
      puzzle: {
        id: puzzle._id,
        puzzleDate: puzzle.puzzleDate,
        gridSize: puzzle.gridSize
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete puzzle
 * @route   DELETE /api/admin/puzzle/:id
 * @access  Admin
 */
const deletePuzzle = async (req, res, next) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    // Delete associated attempts
    await PuzzleAttempt.deleteMany({ puzzleId: puzzle._id });
    
    // Delete puzzle
    await puzzle.deleteOne();
    
    // Log admin action
    await AdminLog.logAction(
      req.user._id,
      'puzzle_deleted',
      'puzzle',
      req.params.id,
      { puzzleDate: puzzle.puzzleDate },
      req
    );
    
    res.status(200).json({
      success: true,
      message: 'Puzzle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports
 * @route   GET /api/admin/reports
 * @access  Admin
 */
const getReports = async (req, res, next) => {
  try {
    const status = req.query.status || 'pending';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = status === 'all' ? {} : { status };
    
    const reports = await Report.find(query)
      .populate('userId', 'email name')
      .populate('puzzleId', 'puzzleDate gridSize')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Report.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve a report
 * @route   PUT /api/admin/report/:id
 * @access  Admin
 */
const resolveReport = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    report.status = status;
    report.adminNotes = adminNotes;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    
    await report.save();
    
    // Log admin action
    await AdminLog.logAction(
      req.user._id,
      'report_resolved',
      'report',
      report._id,
      { newStatus: status },
      req
    );
    
    res.status(200).json({
      success: true,
      message: 'Report updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalUsers,
      totalPuzzles,
      pendingReports,
      todayAttempts,
      recentActivity
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Puzzle.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      PuzzleAttempt.countDocuments({ createdAt: { $gte: today } }),
      AdminLog.find()
        .populate('adminId', 'email name')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPuzzles,
        pendingReports,
        todayAttempts
      },
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments({ role: 'user' });
    
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPuzzle,
  getAllPuzzles,
  getPuzzle,
  updatePuzzle,
  deletePuzzle,
  getReports,
  resolveReport,
  getDashboardStats,
  getUsers
};

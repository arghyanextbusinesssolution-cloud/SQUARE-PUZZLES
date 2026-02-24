const { User, PuzzleAttempt } = require('../models');

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Get user stats
    const stats = await PuzzleAttempt.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'correct'] }, 1, 0] }
          },
          hintsUsed: {
            $sum: { $cond: ['$hintUsed', 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      stats: stats[0] || {
        totalAttempts: 0,
        completed: 0,
        hintsUsed: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's streak
 * @route   GET /api/user/streak
 * @access  Private
 */
const getStreak = async (req, res, next) => {
  try {
    // Get all completed puzzles
    const attempts = await PuzzleAttempt.find({
      userId: req.user._id,
      status: 'correct'
    }).populate('puzzleId', 'puzzleDate');

    // Sort by puzzle date descending (newest first)
    // We must sort in JS because we can't sort by a populated field in Mongoose
    const completedAttempts = attempts
      .filter(a => a.puzzleId && a.puzzleId.puzzleDate)
      .sort((a, b) => new Date(b.puzzleId.puzzleDate) - new Date(a.puzzleId.puzzleDate));

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let lastDate = null;
    let isCurrentChain = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const attempt of completedAttempts) {
      if (!attempt.puzzleId) continue;

      const puzzleDate = new Date(attempt.puzzleId.puzzleDate);
      puzzleDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        tempStreak = 1;
        lastDate = puzzleDate;

        // If the newest solve is today, tomorrow, or even further in the future, it's a current streak
        // Also allow yesterday if they haven't solved today's puzzle yet
        if (puzzleDate >= yesterday) {
          currentStreak = 1;
        } else {
          isCurrentChain = false;
        }
      } else {
        const diffMs = lastDate.getTime() - puzzleDate.getTime();
        const dayDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
          tempStreak++;
          if (isCurrentChain) currentStreak++;
        } else if (dayDiff === 0) {
          // Already counted this day (multiple puzzles for same day)
          continue;
        } else {
          // Gap found
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
          isCurrentChain = false;
        }

        lastDate = puzzleDate;
      }
    }

    maxStreak = Math.max(maxStreak, tempStreak);

    res.status(200).json({
      success: true,
      streak: {
        current: currentStreak,
        max: maxStreak,
        totalCompleted: completedAttempts.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getStreak
};

const { generateClipboardText } = require('./backend/src/services/puzzleService');

const mockData = {
    solutionGrid: [
        ['H', 'E', 'L', 'L'],
        ['H', 'E', 'L', 'L'],
        ['H', 'E', 'L', 'L'],
        ['H', 'E', 'L', 'L']
    ],
    userGrid: [
        ['H', 'E', 'L', 'X'], // Error at (0, 3)
        ['H', 'E', 'L', 'L'],
        ['H', 'E', 'L', 'L'],
        ['H', 'E', 'L', 'L']
    ],
    hintCells: [],
    puzzleDate: new Date(),
    timeTakenSeconds: 0,
    hintUsed: false,
};

console.log("--- CROSSHAIR PERFORMANCE SHARE (Error at 0,3) ---");
console.log(generateClipboardText({
    ...mockData,
    type: 'performance'
}));

const mockData2 = {
    ...mockData,
    userGrid: [
        ['H', 'E', 'L', 'L'],
        ['H', 'E', 'L', 'L'],
        ['H', 'E', 'L', 'L'],
        ['H', 'X', 'L', 'L'] // Error at (3, 1)
    ]
};

console.log("\n--- CROSSHAIR PERFORMANCE SHARE (Error at 3,1) ---");
console.log(generateClipboardText({
    ...mockData2,
    type: 'performance'
}));

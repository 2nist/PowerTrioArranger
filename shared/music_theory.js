// shared/music_theory.js

// 1. Define Scale Intervals (C Major)
// We calculate everything relative to Major, then shift for modes if needed later.
const SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// 2. Define Rows (Complexity)
// row 0-4 corresponds to APC64 Grid Rows 1-5
const CHORD_ROWS = {
  POWER: 0, // Root + 5th
  TRIAD: 1, // Root + 3rd + 5th
  SEVENTH: 2, // Root + 3rd + 5th + 7th
  NINTH: 3, // Root + 3rd + 5th + 7th + 9th
  ALTERED: 4, // Modal Interchange (Swap 3rd) + 7th
};

/**
 * Returns the Semitone Intervals for a specific degree and row.
 * @param {number} degreeIndex - 0-6 (0=I, 1=ii, etc.)
 * @param {number} rowIndex - 0-4 (Complexity)
 * @returns {Array} Array of semitone offsets from the root [0, 4, 7...]
 */
function getChordIntervals(degreeIndex, rowIndex) {
  // Generate the diatonic "Stack of Thirds" for this degree
  // We grab 2 octaves of scale degrees to handle 9ths/11ths easily
  let diatonicStack = [];
  for (let i = 0; i < 14; i++) {
    let scaleIndex = (degreeIndex + i) % 7;
    let octave = Math.floor((degreeIndex + i) / 7);
    diatonicStack.push(SCALE_INTERVALS[scaleIndex] + octave * 12);
  }

  // Determine the diatonic root for subtraction
  let rootPitch = diatonicStack[0];

  // Select the indices we want from the stack (0=Root, 2=Third, 4=Fifth, 6=Seventh, 8=Ninth)
  let indices = [];

  switch (rowIndex) {
    case CHORD_ROWS.POWER:
      indices = [0, 4]; // 1, 5
      break;
    case CHORD_ROWS.TRIAD:
      indices = [0, 2, 4]; // 1, 3, 5
      break;
    case CHORD_ROWS.SEVENTH:
      indices = [0, 2, 4, 6]; // 1, 3, 5, 7
      break;
    case CHORD_ROWS.NINTH:
      indices = [0, 2, 4, 6, 8]; // 1, 3, 5, 7, 9
      break;
    case CHORD_ROWS.ALTERED:
      // SPECIAL LOGIC: Secondary Dominant / Mode Mixture
      // We take the 1-3-5-7, but we force the 3rd to change quality
      indices = [0, 2, 4, 6];
      break;
    default:
      indices = [0, 2, 4];
  }

  // Convert indices to Semitone Intervals relative to Root
  let intervals = indices.map((idx) => diatonicStack[idx] - rootPitch);

  // --- APPLY "ALTERED" LOGIC (Row 5) ---
  if (rowIndex === CHORD_ROWS.ALTERED) {
    // Find the 3rd (index 1 in our intervals array usually, but check value)
    // Major 3rd is 4 semitones, Minor 3rd is 3 semitones.
    // SWAP THEM.
    let thirdIdx = intervals.findIndex((i) => i === 3 || i === 4);

    if (thirdIdx !== -1) {
      if (intervals[thirdIdx] === 3)
        intervals[thirdIdx] = 4; // Min -> Maj
      else if (intervals[thirdIdx] === 4) intervals[thirdIdx] = 3; // Maj -> Min
    }

    // OPTIONAL: Flatten the 7th if it became a Major 7 on a Major chord
    // to make it a Dominant 7 (Blues/Rock standard)
    let seventhIdx = intervals.findIndex((i) => i === 11);
    if (seventhIdx !== -1) intervals[seventhIdx] = 10;
  }

  return intervals;
}

module.exports = { SCALE_INTERVALS, CHORD_ROWS, getChordIntervals };

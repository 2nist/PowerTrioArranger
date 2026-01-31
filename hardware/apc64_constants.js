// ============================================
// APC64 HARDWARE SPECIFICATION
// ============================================
// Author: PowerTrioArranger System
// Last Updated: 2025-01-30
// ============================================

// GRID CONFIGURATION
const GRID_MIN_NOTE = 36;
const GRID_MAX_NOTE = 99;
const GRID_COLUMNS = 8;
const GRID_ROWS = 8;

// TRACK 1: CHORD LAB
const T1_CC_VOICING_SPREAD = 20;
const T1_CC_INVERSION = 21;
const T1_CC_RESERVED_3 = 22;
const T1_CC_RESERVED_4 = 23;
const T1_CC_RESERVED_5 = 24;
const T1_CC_RESERVED_6 = 25;
const T1_CC_RESERVED_7 = 26;
const T1_CC_RESERVED_8 = 27;

// TRACK 2: SEQUENCER
const T2_CC_STEP_VELOCITY = 28;
const T2_CC_GATE_LENGTH = 29;
const T2_CC_SWING = 30;
const T2_CC_RESERVED_4 = 31;
const T2_CC_RESERVED_5 = 32;
const T2_CC_RESERVED_6 = 33;
const T2_CC_RESERVED_7 = 34;
const T2_CC_RESERVED_8 = 35;

// TRACK 3: CONDUCTOR
const T3_CC_SCENE_XFADE = 36;
const T3_CC_PATTERN_FADE = 37;
const T3_CC_RESERVED_3 = 38;
const T3_CC_RESERVED_4 = 39;
const T3_CC_RESERVED_5 = 40;
const T3_CC_RESERVED_6 = 41;
const T3_CC_RESERVED_7 = 42;
const T3_CC_MASTER_TEMPO = 43;

// TRACK 5: BASS FOLLOWER (Shares T2 range)
const T5_CC_HARMONIC_FILTER = 28;
const T5_CC_RHYTHM_DENSITY = 29;
const T5_CC_OCTAVE_RANGE = 30;

// GRID ZONES (Note ranges)
const CHORD_GRID_START = 36;
const CHORD_GRID_END = 75;

const SEQUENCER_GRID_START = 36;
const SEQUENCER_GRID_END = 51;

const PATTERN_PALETTE_START = 92;
const PATTERN_PALETTE_END = 99;

const TIMELINE_GRID_START = 36;
const TIMELINE_GRID_END = 91;

// CHORD MATRIX ROWS (Track 1)
const CHORD_ROW_POWER = 0;
const CHORD_ROW_TRIAD = 1;
const CHORD_ROW_SEVENTH = 2;
const CHORD_ROW_NINTH = 3;
const CHORD_ROW_ALTERED = 4;

// HELPER FUNCTIONS
function gridNoteToPosition(note) {
  const offset = note - GRID_MIN_NOTE;
  return {
    column: offset % GRID_COLUMNS,
    row: Math.floor(offset / GRID_COLUMNS),
  };
}

function positionToGridNote(column, row) {
  return GRID_MIN_NOTE + row * GRID_COLUMNS + column;
}

// EXPORT (CommonJS for Max's Node.js)
module.exports = {
  // Grid
  GRID_MIN_NOTE,
  GRID_MAX_NOTE,
  GRID_COLUMNS,
  GRID_ROWS,

  // Track 1 CCs
  T1_CC_VOICING_SPREAD,
  T1_CC_INVERSION,

  // Track 2 CCs
  T2_CC_STEP_VELOCITY,
  T2_CC_GATE_LENGTH,
  T2_CC_SWING,

  // Track 3 CCs
  T3_CC_SCENE_XFADE,
  T3_CC_PATTERN_FADE,
  T3_CC_MASTER_TEMPO,

  // Track 5 CCs
  T5_CC_HARMONIC_FILTER,
  T5_CC_RHYTHM_DENSITY,
  T5_CC_OCTAVE_RANGE,

  // Grid Zones
  CHORD_GRID_START,
  CHORD_GRID_END,
  SEQUENCER_GRID_START,
  SEQUENCER_GRID_END,
  PATTERN_PALETTE_START,
  PATTERN_PALETTE_END,
  TIMELINE_GRID_START,
  TIMELINE_GRID_END,

  // Matrix
  CHORD_ROW_POWER,
  CHORD_ROW_TRIAD,
  CHORD_ROW_SEVENTH,
  CHORD_ROW_NINTH,
  CHORD_ROW_ALTERED,

  // Helpers
  gridNoteToPosition,
  positionToGridNote,
};

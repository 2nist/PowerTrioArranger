/**
 * Track 1 - Chord Lab: APC64 grid → harmonic data → clipboard::active_chord
 */

const maxApi = require("max-api");
const path = require("path");
const HW = require(
  path.join(__dirname, "..", "hardware", "apc64_constants.js"),
);
const { SCALE_INTERVALS, CHORD_ROWS, getChordIntervals } = require(
  path.join(__dirname, "..", "shared", "music_theory.js"),
);
const { setActiveChord } = require(
  path.join(__dirname, "..", "shared", "dict_helpers.js"),
);

const DICT_NAME = "---power_trio_brain";
const BASE_MIDI = 60; // C4
const ROOT_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
// Degree index 0-6 → Roman numeral (I, ii, ...)
const DEGREE_ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
// Degree → mode for quality string: 0,3,4 = major; 1,2,5 = minor; 6 = diminished
const DEGREE_MODE = [
  "major",
  "minor",
  "minor",
  "major",
  "major",
  "minor",
  "diminished",
];

let voicingSpreadValue = 0;
let inversionValue = 0;
let lastColumn = 0;
let lastRow = 1;

/**
 * Chord quality string for display (root + quality).
 */
function getChordQualityString(degreeIndex, rowIndex) {
  const mode = DEGREE_MODE[degreeIndex] || "major";
  if (rowIndex === CHORD_ROWS.POWER) return "power";
  if (rowIndex === CHORD_ROWS.TRIAD)
    return mode === "minor" ? "min" : mode === "diminished" ? "dim" : "maj";
  if (rowIndex === CHORD_ROWS.SEVENTH)
    return mode === "minor" ? "min7" : mode === "diminished" ? "dim7" : "maj7";
  if (rowIndex === CHORD_ROWS.NINTH)
    return mode === "minor" ? "min9" : mode === "diminished" ? "dim7" : "maj9";
  if (rowIndex === CHORD_ROWS.ALTERED) return "alt";
  return "maj";
}

/**
 * Build chord object from grid column (0-6 = scale degree) and row (0-4 = complexity).
 */
function buildChord(column, row) {
  if (column > 6) return null;
  if (row > 4) row = 4;

  const degreeIndex = column;
  const rowIndex = row;

  const intervals = getChordIntervals(degreeIndex, rowIndex);
  const rootMidi = BASE_MIDI + (SCALE_INTERVALS[degreeIndex] ?? 0);
  const root = ROOT_NAMES[degreeIndex] ?? "C";
  const quality = getChordQualityString(degreeIndex, rowIndex);

  let notes = intervals.map((interval) => rootMidi + interval);

  notes = applyInversion(notes, inversionValue);
  notes = applyVoicingSpread(notes, voicingSpreadValue);

  // Constraint 2: voicing_style is string only — "closed" (0-63) or "open" (64-127)
  const voicingStyle =
    voicingSpreadValue >= 64 ? "open" : "closed";

  // DICTIONARY_SCHEMA shape: root_midi, root_name, quality, degree, midi_notes, voicing_style
  const chord = {
    root_midi: rootMidi,
    root_name: root,
    quality,
    degree: DEGREE_ROMAN[degreeIndex] ?? "I",
    midi_notes: notes,
    voicing_style: voicingStyle,
  };
  return chord;
}

/**
 * Map CC 0-127 to octave spread; transpose upper notes up by octaves.
 */
function applyVoicingSpread(notes, spreadValue) {
  if (!notes.length) return notes;
  const normalized = notes.slice();
  if (spreadValue <= 31) return normalized; // close
  const octaves = spreadValue <= 63 ? 2 : spreadValue <= 95 ? 3 : 4;
  const spread = Math.min(octaves, 4);
  for (let i = 1; i < normalized.length; i++) {
    const octaveUp = Math.min(
      Math.floor(i / (normalized.length / spread)),
      spread - 1,
    );
    normalized[i] += octaveUp * 12;
  }
  return normalized.sort((a, b) => a - b);
}

/**
 * Inversion: 0 = root, 1 = first, 2 = second, 3 = third (if 4+ notes).
 */
function applyInversion(notes, invValue) {
  if (!notes.length) return notes;
  const inv = invValue <= 31 ? 0 : invValue <= 63 ? 1 : invValue <= 95 ? 2 : 3;
  const maxInv = Math.min(3, notes.length - 1);
  const k = Math.min(inv, maxInv);
  if (k === 0) return notes.slice();
  const rotated = notes.slice(k).concat(notes.slice(0, k).map((n) => n + 12));
  return rotated.sort((a, b) => a - b);
}

// Grid pad presses (Note On)
maxApi.addHandler("note_input", (note, velocity) => {
  if (velocity <= 0) return;
  const column = (note - 36) % 8;
  const row = Math.floor((note - 36) / 8);
  if (column > 6 || row > 4) return;
  lastColumn = column;
  lastRow = row;
  const chord = buildChord(column, row);
  if (chord) {
    maxApi.outlet(
      "dict",
      "replace",
      DICT_NAME,
      "clipboard::active_chord",
      JSON.stringify(chord),
    );
  }
});

// Fader changes: re-build chord with new spread/inversion from last grid position
maxApi.addHandler("cc_input", (cc_number, value) => {
  if (cc_number === HW.T1_CC_VOICING_SPREAD) {
    voicingSpreadValue = value;
  } else if (cc_number === HW.T1_CC_INVERSION) {
    inversionValue = value;
  } else return;
  const chord = buildChord(lastColumn, lastRow);
  if (chord) {
    maxApi.outlet(
      "dict",
      "replace",
      DICT_NAME,
      "clipboard::active_chord",
      JSON.stringify(chord),
    );
  }
});

module.exports = { buildChord, applyVoicingSpread, applyInversion };

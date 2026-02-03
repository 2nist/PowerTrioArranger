/**
 * Track 1 - Chord Lab: APC64 grid → harmonic data → clipboard::active_chord
 *
 * Supports two input modes:
 * 1. Grid mode (Custom): Single note = degree + row → build chord from theory
 * 2. Note mode (Ableton): Multi-note chord → infer root + quality from intervals
 *
 * Updated 2026-02-01: Added multi-note capture, LED/display feedback
 *
 * REQUIRED MAX PATCHER WIRING:
 * 
 * INPUTS (to node.script left inlet):
 *   [notein] → [prepend note_input] → inlet (for pad presses)
 *   [ctlin] → [prepend cc_input] → inlet (for CC 20, 21 faders)
 *
 * OUTLETS (from node.script):
 *   outlet → [route dict sysex led note_out]
 *      |         |      |     |        |
 *      |         |      |     |        └→ [noteout] (LED feedback)
 *      |         |      |     └→ [pack] → [noteout] (LED control)
 *      |         |      └→ [midiout] (APC64 display SysEx)
 *      |         └→ [dict ---power_trio_brain]
 *      └→ [dict ---power_trio_brain] left outlet → [prepend dict_response] → inlet
 *
 * OPTIONAL (for future dict reads):
 *   [dict] left outlet → [prepend dict_response] → [node.script] left inlet
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
const comms = require(
  path.join(__dirname, "..", "shared", "apc64_comms.js"),
);

const BASE_MIDI = 60; // C4
const ROOT_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
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

// ============================================
// MULTI-NOTE CHORD CAPTURE (for APC64 Note Mode)
// ============================================
// When APC64 is in Note Mode with chord type 1-3-5, it sends multiple
// simultaneous note-ons. We buffer them and infer the chord.

let chordBuffer = [];
let chordTimer = null;
const CHORD_BUFFER_MS = 25; // Buffer window for simultaneous notes
let lastCapturedPadNote = null; // For LED feedback

// Interval-to-quality mapping (semitones from root)
const QUALITY_MAP = {
  "4,7": "maj",
  "3,7": "min",
  "3,6": "dim",
  "4,8": "aug",
  "4,7,11": "maj7",
  "4,7,10": "dom7",
  "3,7,10": "min7",
  "3,6,9": "dim7",
  "3,6,10": "m7b5",
  "2,7": "sus2",
  "5,7": "sus4",
  "4,7,11,14": "maj9",
  "4,7,10,14": "dom9",
  "3,7,10,14": "min9",
};

/**
 * Infer chord quality from intervals (semitones from root)
 */
function inferQuality(intervals) {
  const key = intervals.join(",");
  return QUALITY_MAP[key] || "?";
}

/**
 * Get note name from MIDI number
 */
function midiToNoteName(midi) {
  return NOTE_NAMES[midi % 12];
}

/**
 * Process buffered notes as a chord (for Note Mode multi-note input)
 */
function processChordBuffer() {
  if (chordBuffer.length === 0) return;

  // Sort notes
  const notes = [...chordBuffer].sort((a, b) => a - b);
  chordBuffer = [];

  if (notes.length === 1) {
    // Single note - might be a duration pad or other control
    // Don't process as chord
    return;
  }

  // Calculate intervals from root
  const root = notes[0];
  const intervals = notes.slice(1).map((n) => n - root);

  // Infer quality
  const quality = inferQuality(intervals);
  const rootName = midiToNoteName(root);

  // Build chord object
  const chord = {
    root_midi: root,
    root_name: rootName,
    quality: quality,
    degree: "?", // Unknown degree when using Note Mode (not scale-based)
    midi_notes: notes,
    voicing_style: voicingSpreadValue >= 64 ? "open" : "closed",
  };

  // Apply CC modifiers (extension/alteration)
  applyChordModifiers(chord);

  // Store in clipboard
  maxApi.outlet(
    "dict",
    "replace",
    "clipboard::active_chord",
    JSON.stringify(chord),
  );

  // LED feedback: light up a pad to show chord captured
  // Use pad 56 (top-left area) as chord indicator
  comms.setLedColor(maxApi, 56, HW.COLOR_BLUE, HW.LED_CH_FULL);

  // Display feedback
  const displayText = `${chord.root_name}${chord.quality}`;
  comms.updateDisplay(maxApi, "Chord Lab", displayText, "Captured");

  maxApi.post(`Chord captured: ${displayText} [${notes.join(", ")}]`);
}

/**
 * Apply CC modifiers to extend/alter chord
 * This lets faders add 7ths, 9ths, etc. to the base triad
 */
function applyChordModifiers(chord) {
  // Future: Use additional CCs to add extensions
  // For now, just apply voicing spread
  if (voicingSpreadValue > 31) {
    chord.midi_notes = applyVoicingSpread(chord.midi_notes, voicingSpreadValue);
  }
}

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

// ============================================
// NOTE INPUT HANDLER
// ============================================
// Handles both:
// 1. Grid mode (notes 36-75): Single note → degree + row → build chord
// 2. Note mode (any range): Multi-note → buffer and infer chord

maxApi.addHandler("note_input", (note, velocity) => {
  if (velocity <= 0) return;

  // Check for Shift button
  const shiftEvent = comms.updateShiftState(note, velocity);
  if (shiftEvent) {
    // Shift state changed - handled by Sequencer
    return;
  }

  // Grid mode: notes 36-75 (7 columns x 5 rows)
  if (note >= 36 && note <= 75) {
    const column = (note - 36) % 8;
    const row = Math.floor((note - 36) / 8);

    // If within our chord grid (columns 0-6, rows 0-4)
    if (column <= 6 && row <= 4) {
      lastColumn = column;
      lastRow = row;
      const chord = buildChord(column, row);
      if (chord) {
        maxApi.outlet(
          "dict",
          "replace",
          "clipboard::active_chord",
          JSON.stringify(chord),
        );

        // LED feedback: light up the pressed pad
        comms.setLedColor(maxApi, note - 36, HW.COLOR_BLUE, HW.LED_CH_FULL);
        if (lastCapturedPadNote !== null && lastCapturedPadNote !== note - 36) {
          comms.setLedOff(maxApi, lastCapturedPadNote);
        }
        lastCapturedPadNote = note - 36;

        // Display feedback
        const displayText = `${chord.root_name}${chord.quality}`;
        comms.updateDisplay(maxApi, "Chord Lab", displayText, chord.degree);
      }
      return;
    }
  }

  // Note mode: buffer notes for multi-note chord capture
  // This handles when APC64 is in Note Mode sending chord notes (36-99 range)
  if (note >= 36 && note <= 99) {
    chordBuffer.push(note);

    // Clear existing timer
    if (chordTimer) clearTimeout(chordTimer);

    // Set new timer to process buffer
    chordTimer = setTimeout(() => {
      processChordBuffer();
      chordTimer = null;
    }, CHORD_BUFFER_MS);
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
      "clipboard::active_chord",
      JSON.stringify(chord),
    );
  }
});

// Initialization: Send startup message to verify APC64 output wiring
maxApi.post("Chord Lab loaded. Listening for grid input (notes 36-75).");
try {
  comms.updateDisplay(maxApi, "Chord Lab", "Ready", "Press pad");
} catch (e) {
  maxApi.post("Note: APC64 display output not wired (optional)");
}

module.exports = {
  buildChord,
  applyVoicingSpread,
  applyInversion,
  inferQuality,
  midiToNoteName,
  processChordBuffer,
};

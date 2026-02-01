/**
 * Track 2 - Sequencer: Chord duration selection + progression locking
 *
 * New workflow (2026-02-01):
 * - Bottom row (pads 0-7): Duration selection (1beat, 2beats, 1bar, 2bars, 4bars, 8bars, 16bars, custom)
 * - Press pad: Set clipboard duration
 * - Shift+pad: Lock chord+duration to progression
 * - Double-shift+pad: Remove from progression
 *
 * Legacy mode (backward compat):
 * - Pads 36-51: 16-step chord sequencer with paste/clear
 */

const maxApi = require("max-api");
const path = require("path");
const HW = require(
  path.join(__dirname, "..", "hardware", "apc64_constants.js"),
);
const {
  getActiveChord,
  getSequencerBuffer,
  setSequencerBuffer,
  dictReplace,
} = require(path.join(__dirname, "..", "shared", "dict_helpers.js"));
const comms = require(
  path.join(__dirname, "..", "shared", "apc64_comms.js"),
);

const DICT_NAME = "---power_trio_brain";
const NUM_STEPS = 16; // use first 16 of 64 events

// ============================================
// DURATION CONFIGURATION
// ============================================
// Duration presets for bottom row (pads 0-7)
const DURATION_PRESETS = [
  { beats: 1, label: "1 beat" },
  { beats: 2, label: "2 beats" },
  { beats: 4, label: "1 bar" },
  { beats: 8, label: "2 bars" },
  { beats: 16, label: "4 bars" },
  { beats: 32, label: "8 bars" },
  { beats: 64, label: "16 bars" },
  { beats: 0, label: "Custom" }, // 0 = use encoder to set
];

// Duration row pads (bottom row of 8x8 grid)
const DURATION_ROW_START = 0;
const DURATION_ROW_END = 7;

// ============================================
// STATE
// ============================================
let pendingPasteStep = null;
let pendingChordData = null; // chord from clipboard when paste in progress
let pendingPlayStep = null;
let pendingClearStep = null;
let currentStep = 0;
let previousStep = -1;

// Duration state
let selectedDurationIndex = 2; // Default: 1 bar (4 beats)
let customDuration = 4; // For "custom" slot

// Progression state
let progression = []; // Array of { chord_ref, duration_beats, slot_index }
let pendingLockChord = null;
let pendingRemoveSlot = null;

function pasteChordToStep(step, chordData) {
  getSequencerBuffer();
  pendingPasteStep = step;
  pendingChordData = chordData;
}

function clearStep(step) {
  pendingClearStep = step;
  getSequencerBuffer();
}

function applyBufferResponse(bufferJson) {
  let buffer;
  try {
    buffer =
      typeof bufferJson === "string" ? JSON.parse(bufferJson) : bufferJson;
  } catch (e) {
    buffer = { section_name: "Working_Draft", length_beats: 16, events: Array(64).fill(null) };
  }
  if (!buffer.events || buffer.events.length < NUM_STEPS) {
    buffer.events = Array(64).fill(null).slice(0, 64);
  }
  return buffer;
}

function playStep(step) {
  pendingPlayStep = step;
  getSequencerBuffer();
}

function updateLEDs(current_step, previous_step) {
  if (previous_step >= 0 && previous_step < NUM_STEPS) {
    const prevNote = HW.SEQUENCER_GRID_START + previous_step;
    maxApi.outlet("note_out", prevNote, 64);
  }
  if (current_step >= 0 && current_step < NUM_STEPS) {
    maxApi.outlet("note_out", HW.SEQUENCER_GRID_START + current_step, 127);
  }
}

// ============================================
// DURATION SELECTION
// ============================================

/**
 * Get current duration in beats
 */
function getCurrentDuration() {
  const preset = DURATION_PRESETS[selectedDurationIndex];
  return preset.beats === 0 ? customDuration : preset.beats;
}

/**
 * Handle duration pad press (pads 0-7)
 */
function handleDurationPad(padIndex, isShiftHeld, isDoubleShift) {
  if (padIndex < 0 || padIndex > 7) return;

  if (isDoubleShift) {
    // Double-shift: Remove mode
    if (progression.length > 0) {
      // Remove last chord from progression
      const removed = progression.pop();
      updateProgressionDisplay();
      updateProgressionLEDs();
      maxApi.post(`Removed chord from slot ${removed.slot_index}`);
    }
    return;
  }

  if (isShiftHeld) {
    // Shift+pad: Lock chord to progression
    lockChordToProgression();
    return;
  }

  // Normal press: Select duration
  selectedDurationIndex = padIndex;
  const preset = DURATION_PRESETS[padIndex];
  const duration = preset.beats === 0 ? customDuration : preset.beats;

  // Update clipboard duration
  dictReplace("clipboard::duration_beats", duration);

  // Update duration row LEDs
  updateDurationLEDs();

  // Update display
  comms.updateDisplay(maxApi, "Duration", preset.label, `${duration} beats`);

  maxApi.post(`Duration set to ${preset.label} (${duration} beats)`);
}

/**
 * Lock current clipboard chord to progression with selected duration
 */
function lockChordToProgression() {
  // Request clipboard chord
  pendingLockChord = true;
  getActiveChord();
}

/**
 * Process locking after receiving chord data
 */
function processLockChord(chordData) {
  if (!chordData || !chordData.root_name) {
    maxApi.post("No chord to lock");
    return;
  }

  const duration = getCurrentDuration();
  const slotIndex = progression.length;

  // Create progression event
  const event = {
    chord_ref: { ...chordData },
    duration_beats: duration,
    slot_index: slotIndex,
  };

  // Add to progression
  progression.push(event);

  // Update dict
  updateProgressionDict();

  // Update LEDs
  updateProgressionLEDs();

  // Update display
  updateProgressionDisplay();

  // Visual feedback
  comms.setLedColor(maxApi, selectedDurationIndex, HW.COLOR_GREEN, HW.LED_CH_FULL);

  const chordName = `${chordData.root_name}${chordData.quality}`;
  maxApi.post(`Locked ${chordName} for ${duration} beats at slot ${slotIndex}`);
}

/**
 * Update progression in dictionary
 */
function updateProgressionDict() {
  const totalBeats = progression.reduce((sum, e) => sum + e.duration_beats, 0);
  const progressionData = {
    name: "Untitled",
    total_beats: totalBeats,
    chords: progression,
  };
  dictReplace("progression", progressionData);
}

/**
 * Update duration row LEDs to show selected duration
 */
function updateDurationLEDs() {
  for (let i = 0; i <= 7; i++) {
    if (i === selectedDurationIndex) {
      comms.setLedColor(maxApi, i, HW.COLOR_WHITE, HW.LED_CH_FULL);
    } else {
      comms.setLedColor(maxApi, i, HW.COLOR_GREY, HW.LED_CH_HALF);
    }
  }
}

/**
 * Update LEDs to show locked progression slots
 */
function updateProgressionLEDs() {
  // Use row 1 (pads 8-15) to show progression slots
  for (let i = 0; i < 8; i++) {
    const padNote = 8 + i; // Row 1
    if (i < progression.length) {
      comms.setLedColor(maxApi, padNote, HW.COLOR_GREEN, HW.LED_CH_FULL);
    } else {
      comms.setLedOff(maxApi, padNote);
    }
  }
}

/**
 * Update display with progression info
 */
function updateProgressionDisplay() {
  const totalBeats = progression.reduce((sum, e) => sum + e.duration_beats, 0);
  const chordCount = progression.length;

  if (chordCount === 0) {
    comms.updateDisplay(maxApi, "Progression", "Empty", "Shift+pad lock");
  } else {
    const lastChord = progression[chordCount - 1];
    const chordName = `${lastChord.chord_ref.root_name}${lastChord.chord_ref.quality}`;
    comms.updateDisplay(
      maxApi,
      `${chordCount} chords`,
      chordName,
      `${totalBeats} beats`
    );
  }
}

// ============================================
// SHIFT STATE TRACKING
// ============================================
let shiftHeld = false;
let lastShiftTime = 0;
let doubleShiftActive = false;
const DOUBLE_SHIFT_THRESHOLD = 300; // ms

// Legacy shift handler (from Max patcher)
maxApi.addHandler("shift", (held) => {
  shiftHeld = !!held;
});

// ============================================
// NOTE INPUT HANDLER
// ============================================
maxApi.addHandler("note_input", (note, velocity) => {
  if (velocity <= 0) return;

  // Check for Shift button (note 120)
  if (note === HW.BTN_SHIFT) {
    const now = Date.now();
    const wasHeld = shiftHeld;
    shiftHeld = true;

    // Detect double-shift
    if (!wasHeld && now - lastShiftTime < DOUBLE_SHIFT_THRESHOLD) {
      doubleShiftActive = true;
      maxApi.post("Double-shift: Remove mode");
    }
    lastShiftTime = now;
    return;
  }

  // Shift release detection (note off handled separately)
  // For now, we rely on the separate shift handler or timeout

  // Duration row (pads 0-7, bottom row)
  if (note >= DURATION_ROW_START && note <= DURATION_ROW_END) {
    handleDurationPad(note, shiftHeld, doubleShiftActive);
    doubleShiftActive = false; // Reset after use
    return;
  }

  // Legacy: Sequencer grid (notes 36-51, pads for 16-step view)
  if (note >= HW.SEQUENCER_GRID_START && note <= HW.SEQUENCER_GRID_END) {
    const step = note - HW.SEQUENCER_GRID_START;
    if (step >= NUM_STEPS) return;

    if (shiftHeld) {
      clearStep(step);
      return;
    }

    // Paste clipboard chord to step
    getActiveChord();
    pendingPasteStep = step;
    return;
  }
});

// Handle Shift release
maxApi.addHandler("note_off", (note, velocity) => {
  if (note === HW.BTN_SHIFT) {
    shiftHeld = false;
  }
});

// ============================================
// DICTIONARY RESPONSE HANDLER
// ============================================
// Constraint 1: dict_response loop must be wired or this never fires.
maxApi.addHandler("dict_response", (key, value) => {
  const k = String(key || "");

  // Parse chord data from response
  const parseChordData = (val) => {
    if (val === "null" || val == null) return null;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch (e) {
        return null;
      }
    }
    return val;
  };

  // Lock chord flow: received clipboard -> lock to progression
  if (pendingLockChord && k.includes("clipboard::active_chord")) {
    const chordData = parseChordData(value);
    pendingLockChord = false;
    if (chordData) {
      processLockChord(chordData);
    }
    return;
  }

  // Paste flow: received clipboard -> now get buffer (pendingPasteStep already set)
  if (pendingPasteStep !== null && k.includes("clipboard::active_chord")) {
    const chordData = parseChordData(value);
    if (chordData) {
      pendingChordData = chordData;
      getSequencerBuffer();
    } else {
      pendingPasteStep = null;
      pendingChordData = null;
    }
    return;
  }

  // Buffer response: handle paste, clear, or play
  if (k.includes("sequencer_buffer")) {
    const buffer = applyBufferResponse(value);

    if (pendingClearStep !== null) {
      buffer.events[pendingClearStep] = null;
      setSequencerBuffer(buffer);
      maxApi.outlet("note_out", HW.SEQUENCER_GRID_START + pendingClearStep, 0);
      pendingClearStep = null;
      return;
    }

    if (pendingPasteStep !== null && pendingChordData) {
      buffer.events[pendingPasteStep] = pendingChordData;
      setSequencerBuffer(buffer);
      maxApi.outlet("note_out", HW.SEQUENCER_GRID_START + pendingPasteStep, 127);
      pendingPasteStep = null;
      pendingChordData = null;
      return;
    }

    if (pendingPlayStep !== null) {
      const chordAtStep = buffer.events[pendingPlayStep];
      const chordData =
        chordAtStep && typeof chordAtStep === "object"
          ? chordAtStep
          : typeof chordAtStep === "string" && chordAtStep !== "null"
            ? (() => {
                try {
                  return JSON.parse(chordAtStep);
                } catch (e) {
                  return null;
                }
              })()
            : null;
      if (chordData && chordData.midi_notes) {
        dictReplace("transport::current_chord", chordData);
        chordData.midi_notes.forEach((n) =>
          maxApi.outlet("note_out", n, 100),
        );
      }
      pendingPlayStep = null;
      return;
    }
  }
});

// Transport tick (0-15). Constraint 3: beat position elsewhere uses 1-based (1.0 = bar start); step index here remains 0-15 for grid.
maxApi.addHandler("transport_tick", (step) => {
  const s = Number(step);
  if (s < 0 || s > NUM_STEPS - 1) return;
  previousStep = currentStep;
  currentStep = s;
  playStep(s);
  updateLEDs(currentStep, previousStep);
});

// ============================================
// INITIALIZATION
// ============================================
// Initialize duration row LEDs on load
maxApi.addHandler("init", () => {
  updateDurationLEDs();
  updateProgressionLEDs();
  comms.updateDisplay(maxApi, "Sequencer", "Ready", "Select duration");
});

module.exports = {
  // Legacy functions
  pasteChordToStep,
  clearStep,
  playStep,
  updateLEDs,
  // New functions
  handleDurationPad,
  lockChordToProgression,
  getCurrentDuration,
  DURATION_PRESETS,
};

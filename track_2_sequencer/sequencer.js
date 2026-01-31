/**
 * Track 2 - Sequencer: 16-step chord sequencer, copy/paste, transport-synced playback
 * Schema: sequencer_buffer = { section_name, length_beats, events[0..63] }; clipboard/transport use DICTIONARY_SCHEMA chord shape (root_midi, root_name, quality, degree, midi_notes, voicing_style).
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

const DICT_NAME = "---power_trio_brain";
const NUM_STEPS = 16; // use first 16 of 64 events

let pendingPasteStep = null;
let pendingChordData = null; // chord from clipboard when paste in progress
let pendingPlayStep = null;
let pendingClearStep = null;
let currentStep = 0;
let previousStep = -1;

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

// Shift state (Max patcher sends shift+note when modifier held)
let shiftHeld = false;
maxApi.addHandler("shift", (held) => {
  shiftHeld = !!held;
});

// Pad press: paste clipboard into step, or clear step if Shift held
maxApi.addHandler("note_input", (note, velocity) => {
  if (
    velocity <= 0 ||
    note < HW.SEQUENCER_GRID_START ||
    note > HW.SEQUENCER_GRID_END
  )
    return;
  const step = note - HW.SEQUENCER_GRID_START;
  if (step >= NUM_STEPS) return;
  if (shiftHeld) {
    clearStep(step);
    return;
  }
  getActiveChord();
  pendingPasteStep = step;
});

// Dictionary responses (async). Constraint 1: dict_response loop must be wired or this never fires.
maxApi.addHandler("dict_response", (key, value) => {
  const k = String(key || "");

  // Paste flow: received clipboard -> now get buffer (pendingPasteStep already set)
  if (pendingPasteStep !== null && k.includes("clipboard::active_chord")) {
    const chordData =
      value === "null" || value == null
        ? null
        : typeof value === "string"
          ? (() => {
              try {
                return JSON.parse(value);
              } catch (e) {
                return null;
              }
            })()
          : value;
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

module.exports = { pasteChordToStep, clearStep, playStep, updateLEDs };

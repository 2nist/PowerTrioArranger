/**
 * dict_init.js - Creates and initializes ---power_trio_brain with schema.
 * Schema aligned with Application Docs/DICTIONARY_SCHEMA.json.
 * Run from Max (node.script) on project load, or: node shared/dict_init.js
 * Reset during dev: node shared/dict_init.js --reset
 */

const DICT_NAME = "---power_trio_brain";

// Canonical schema: transport (1-based beat), clipboard (voicing_style string), sequencer_buffer (64 events), song_structure (timeline + pattern_bank), rhythm_pulses (0/1)
const SCHEMA = {
  transport: {
    is_playing: 0,
    global_tempo: 120.0,
    current_bar: 1,
    current_beat: 1.0, // 1-based musical time: 1.0 = bar start, 2.0, 3.0, 4.0
    current_chord: {},
  },
  clipboard: {
    active_chord: {
      root_midi: 60,
      root_name: "C",
      quality: "maj7",
      degree: "I",
      midi_notes: [60, 64, 67, 71],
      voicing_style: "open", // string only: "closed" | "open" (Constraint 2)
    },
  },
  sequencer_buffer: {
    section_name: "Working_Draft",
    length_beats: 16.0,
    events: Array(64).fill(null), // 64 slots; null = empty, else { step_index, chord_ref }
  },
  song_structure: {
    timeline: [],
    pattern_bank: {},
  },
  rhythm_pulses: {
    kick_pulse: 0, // 0 or 1 (Constraint: integer, not boolean)
    snare_pulse: 0,
  },
};

function getSchema() {
  return JSON.parse(JSON.stringify(SCHEMA));
}

// When running inside Max, use max-api to send dict commands
function initFromMax() {
  try {
    const maxApi = require("max-api");
    maxApi.outlet("dict", "clear", DICT_NAME);
    maxApi.outlet(
      "dict",
      "replace",
      DICT_NAME,
      "transport",
      JSON.stringify(SCHEMA.transport),
    );
    maxApi.outlet(
      "dict",
      "replace",
      DICT_NAME,
      "clipboard",
      JSON.stringify(SCHEMA.clipboard),
    );
    maxApi.outlet(
      "dict",
      "replace",
      DICT_NAME,
      "sequencer_buffer",
      JSON.stringify(SCHEMA.sequencer_buffer),
    );
    maxApi.outlet(
      "dict",
      "replace",
      DICT_NAME,
      "song_structure",
      JSON.stringify(SCHEMA.song_structure),
    );
    maxApi.outlet(
      "dict",
      "replace",
      DICT_NAME,
      "rhythm_pulses",
      JSON.stringify(SCHEMA.rhythm_pulses),
    );
    maxApi.post("---power_trio_brain initialized with schema.");
  } catch (e) {
    // Not in Max - standalone
    console.log("---power_trio_brain schema (run from Max to apply):");
    console.log(JSON.stringify(SCHEMA, null, 2));
  }
}

function resetFromMax() {
  try {
    const maxApi = require("max-api");
    initFromMax();
    maxApi.post("---power_trio_brain reset.");
  } catch (e) {
    console.log("Reset: re-run init from Max.");
  }
}

// When run inside Max: register handlers so Max can send "init" or "reset"
try {
  const maxApi = require("max-api");
  maxApi.addHandler("init", () => initFromMax());
  maxApi.addHandler("reset", () => resetFromMax());
} catch (e) {
  // Not in Max - ignore
}

// Standalone: print schema for copy into Max dict
if (typeof require !== "undefined" && require.main === module) {
  const reset = process.argv.includes("--reset");
  if (reset) {
    console.log('Use "reset" from Max node.script to reset dictionary.');
  }
  console.log(JSON.stringify(getSchema(), null, 2));
}

module.exports = {
  DICT_NAME,
  SCHEMA: getSchema,
  initFromMax,
  resetFromMax,
};

/**
 * Track 3 - Conductor: Pattern palette and timeline editor
 * Schema: song_structure = { timeline: string[], pattern_bank: {} }; sequencer_buffer = { section_name, length_beats, events }.
 */

const maxApi = require("max-api");
const path = require("path");
const HW = require(
  path.join(__dirname, "..", "hardware", "apc64_constants.js"),
);
const {
  getSequencerBuffer,
  getSongStructure,
  setSongStructure,
  setSequencerBuffer,
  dictReplace,
} = require(path.join(__dirname, "..", "shared", "dict_helpers.js"));

const DICT_NAME = "---power_trio_brain";

let selectedPatternId = 0;
let pendingPatternSaveId = null;
let pendingSavedBuffer = null;
let pendingPlaceSlot = null;
let pendingPlacePatternId = null;
let pendingRecallPatternId = null;
let shiftHeld = false;

function savePattern(pattern_id) {
  pendingPatternSaveId = pattern_id;
  getSequencerBuffer();
}

function recallPattern(pattern_id) {
  pendingRecallPatternId = pattern_id;
  getSongStructure();
}

function placePattern(slot_id, pattern_id) {
  pendingPlaceSlot = slot_id;
  pendingPlacePatternId = pattern_id;
  getSongStructure();
}

function getCurrentlySelectedPattern() {
  return selectedPatternId;
}

function parseSongStructure(value) {
  let song = { timeline: [], pattern_bank: {} };
  try {
    const v = typeof value === "string" ? JSON.parse(value) : value;
    if (v && typeof v === "object") {
      song.timeline = Array.isArray(v.timeline) ? v.timeline.slice() : [];
      song.pattern_bank =
        v.pattern_bank && typeof v.pattern_bank === "object"
          ? { ...v.pattern_bank }
          : {};
    }
  } catch (e) {}
  return song;
}

function updatePatternPaletteLEDs(song) {
  const bank = song && song.pattern_bank ? song.pattern_bank : {};
  const numSlots = HW.PATTERN_PALETTE_END - HW.PATTERN_PALETTE_START + 1;
  for (let i = 0; i < numSlots; i++) {
    const key = `pattern_${i}`;
    const exists = bank[key] != null;
    const note = HW.PATTERN_PALETTE_START + i;
    maxApi.outlet("note_out", note, exists ? 64 : 0);
  }
}

maxApi.addHandler("shift", (held) => {
  shiftHeld = !!held;
});

// Refresh pattern palette LEDs on load (init from loadbang, or self-init)
maxApi.addHandler("init", () => {
  getSongStructure();
});
getSongStructure(); // Self-init: refresh LEDs when script loads

// Top row: pattern palette — Normal = save, Shift = recall
maxApi.addHandler("note_input", (note, velocity) => {
  if (velocity <= 0) return;
  if (note >= HW.PATTERN_PALETTE_START && note <= HW.PATTERN_PALETTE_END) {
    const pattern_id = note - HW.PATTERN_PALETTE_START;
    selectedPatternId = pattern_id;
    if (shiftHeld) {
      recallPattern(pattern_id);
    } else {
      savePattern(pattern_id);
    }
    maxApi.outlet("note_out", note, 127);
    return;
  }
  if (note >= HW.TIMELINE_GRID_START && note < HW.TIMELINE_GRID_END) {
    const slot_id = note - HW.TIMELINE_GRID_START;
    placePattern(slot_id, getCurrentlySelectedPattern());
  }
});

// Dictionary responses (Constraint 1: dict_response loop must be wired)
maxApi.addHandler("dict_response", (key, value) => {
  const k = String(key || "");

  // Save pattern: received sequencer_buffer -> save to patterns::, store buffer, get song_structure
  if (pendingPatternSaveId !== null && k.includes("sequencer_buffer")) {
    let data;
    try {
      data = typeof value === "string" && value !== "null" ? JSON.parse(value) : value;
    } catch (e) {
      data = value;
    }
    pendingSavedBuffer = data;
    dictReplace(`patterns::pattern_${pendingPatternSaveId}`, data);
    getSongStructure();
    return;
  }

  // After saving: received song_structure -> update pattern_bank with pendingSavedBuffer, set song_structure
  if (pendingPatternSaveId !== null && pendingSavedBuffer !== null && k.includes("song_structure")) {
    const song = parseSongStructure(value);
    song.pattern_bank[`pattern_${pendingPatternSaveId}`] = pendingSavedBuffer;
    setSongStructure(song);
    pendingPatternSaveId = null;
    pendingSavedBuffer = null;
    updatePatternPaletteLEDs(song);
    return;
  }

  // Recall pattern: received song_structure -> load pattern into sequencer_buffer
  if (pendingRecallPatternId !== null && k.includes("song_structure")) {
    const song = parseSongStructure(value);
    const patternData = song.pattern_bank[`pattern_${pendingRecallPatternId}`];
    if (patternData && typeof patternData === "object") {
      setSequencerBuffer(patternData);
    }
    pendingRecallPatternId = null;
    updatePatternPaletteLEDs(song);
    return;
  }

  // Place pattern: received song_structure -> update timeline[slot], set song_structure
  if (pendingPlaceSlot !== null && pendingPlacePatternId !== null && k.includes("song_structure")) {
    const song = parseSongStructure(value);
    while (song.timeline.length <= pendingPlaceSlot) song.timeline.push(null);
    song.timeline[pendingPlaceSlot] = `pattern_${pendingPlacePatternId}`;
    setSongStructure(song);
    const led_velocity = 32 + pendingPlacePatternId * 12;
    maxApi.outlet("note_out", HW.TIMELINE_GRID_START + pendingPlaceSlot, Math.min(127, led_velocity));
    pendingPlaceSlot = null;
    pendingPlacePatternId = null;
    updatePatternPaletteLEDs(song);
    return;
  }

  // Standalone LED update (e.g. on load or after non-pending song_structure read)
  if (k.includes("song_structure") && !pendingPatternSaveId && !pendingPlaceSlot && !pendingRecallPatternId) {
    const song = parseSongStructure(value);
    updatePatternPaletteLEDs(song);
  }
</think>
Storing the saved buffer when saving a pattern so we can update pattern_bank. Fixing the flow:
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace
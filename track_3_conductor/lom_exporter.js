/**
 * Track 3 - LOM Exporter: Converts song_structure to Live Session View scenes
 * Creates Session View scenes; does NOT write to Arrangement View.
 */

const maxApi = require("max-api");
const path = require("path");
const { dictGet } = require(
  path.join(__dirname, "..", "shared", "dict_helpers.js"),
);

const DICT_NAME = "---power_trio_brain";

let pendingSongStructure = null;
let exportQueue = [];
let processingExport = false;

function exportToLive() {
  pendingSongStructure = true;
  maxApi.outlet("dict", "get", DICT_NAME, "song_structure");
}

function createScene(scene_index, scene_name, pattern_data) {
  maxApi.outlet("call_lom", "call", "create_scene", scene_index);
  maxApi.outlet("call_lom", "set", "name", scene_name);
  for (let track_index = 1; track_index <= 5; track_index++) {
    maxApi.outlet(
      "call_lom",
      "path",
      `live_set tracks ${track_index} clip_slots ${scene_index}`,
    );
    maxApi.outlet("call_lom", "call", "create_clip", 4.0);
    if (track_index === 1 && pattern_data) {
      populateChordClip(pattern_data);
    }
  }
}

function processNextExport() {
  if (exportQueue.length === 0) {
    processingExport = false;
    return;
  }
  processingExport = true;
  const { index, scene_name, pattern_id } = exportQueue.shift();
  maxApi.outlet("dict", "get", DICT_NAME, `patterns::pattern_${pattern_id}`);
  pendingPatternData = { index, scene_name };
}

let pendingPatternData = null;

function populateChordClip(pattern_data) {
  // Schema: pattern_data = { section_name, length_beats, events } with events[i] = chord object { root_midi, root_name, quality, degree, midi_notes, voicing_style }
  const events = pattern_data && pattern_data.events && Array.isArray(pattern_data.events) ? pattern_data.events : [];
  events.forEach((chord, step) => {
    if (chord != null && chord.midi_notes && chord.midi_notes.length) {
      const time_position = step * 0.25;
      chord.midi_notes.forEach((midi_note) => {
        maxApi.outlet(
          "call_lom",
          "call",
          "set_notes",
          time_position,
          midi_note,
          0.25,
          100,
          0,
        );
      });
    }
  });
}

maxApi.addHandler("export_to_live", () => {
  exportToLive();
});

maxApi.addHandler("dict_response", (key, value) => {
  const k = String(key || "");
  if (pendingSongStructure && k.includes("song_structure")) {
    let song = typeof value === "string" ? (() => { try { return JSON.parse(value); } catch (e) { return {}; } })() : (value || {});
    const timeline = Array.isArray(song.timeline) ? song.timeline : [];
    pendingSongStructure = null;
    exportQueue = timeline.map((patternKey, index) => ({
      index,
      scene_name: `Scene_${index}`,
      pattern_id: typeof patternKey === "number" ? patternKey : (patternKey && String(patternKey).replace("pattern_", "")) || 0,
      pattern_key: patternKey,
    }));
    processNextExport();
    return;
  }
  if (pendingPatternData && k.includes("patterns::pattern_")) {
    let pattern_data = value;
    if (typeof value === "string" && value !== "null")
      try {
        pattern_data = JSON.parse(value);
      } catch (e) {
        pattern_data = null;
      }
    createScene(
      pendingPatternData.index,
      pendingPatternData.scene_name,
      pattern_data,
    );
    pendingPatternData = null;
    processingExport = false;
    processNextExport();
  }
});

maxApi.addHandler("lom_response", (object, property, value) => {
  // Handle responses from Live API for debugging
  if (typeof maxApi.post === "function")
    maxApi.post("lom_response", object, property, value);
});

module.exports = { exportToLive, createScene, populateChordClip };

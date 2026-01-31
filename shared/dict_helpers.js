/**
 * dict_helpers.js - Common functions for reading/writing to ---power_trio_brain
 * All Node.js scripts MUST use max-api and :: notation for nested key paths.
 */

const maxApi = require("max-api");

const DICT_NAME = "---power_trio_brain";

/**
 * Read a value from the global dictionary (async - response via handler).
 * @param {string} path - Key path using :: notation (e.g. 'transport::bpm')
 */
function dictGet(path) {
  maxApi.outlet("dict", "get", DICT_NAME, path);
}

/**
 * Write a value to the global dictionary.
 * @param {string} path - Key path using :: notation
 * @param {string|object} value - Value (object will be JSON.stringify'd)
 */
function dictReplace(path, value) {
  const out = typeof value === "object" ? JSON.stringify(value) : String(value);
  maxApi.outlet("dict", "replace", DICT_NAME, path, out);
}

/**
 * Append to an array in the dictionary.
 * @param {string} path - Key path (e.g. 'song_structure')
 * @param {string|object} value - Value to append
 */
function dictAppend(path, value) {
  const out = typeof value === "object" ? JSON.stringify(value) : String(value);
  maxApi.outlet("dict", "append", DICT_NAME, path, out);
}

/**
 * Get transport sub-path.
 */
function getTransport(path) {
  dictGet(`transport::${path}`);
}

/**
 * Set transport value.
 */
function setTransport(path, value) {
  dictReplace(`transport::${path}`, value);
}

/**
 * Get clipboard active chord (async).
 */
function getActiveChord() {
  dictGet("clipboard::active_chord");
}

/**
 * Set clipboard active chord.
 */
function setActiveChord(chordObject) {
  dictReplace("clipboard::active_chord", chordObject);
}

/**
 * Get full sequencer buffer (async). Schema: { section_name, length_beats, events } with events[0..63].
 */
function getSequencerBuffer() {
  dictGet("sequencer_buffer");
}

/**
 * Set full sequencer buffer.
 * @param {object} buffer - { section_name, length_beats, events } (events length 64)
 */
function setSequencerBuffer(buffer) {
  dictReplace("sequencer_buffer", buffer);
}

/**
 * Get full song_structure (async). Schema: { timeline: string[], pattern_bank: {} }.
 */
function getSongStructure() {
  dictGet("song_structure");
}

/**
 * Set full song_structure.
 * @param {object} value - { timeline: string[], pattern_bank: {} }
 */
function setSongStructure(value) {
  dictReplace("song_structure", value);
}

/**
 * Set rhythm pulse (kick or snare). Schema: 0 or 1 (integer), not boolean.
 * @param {string} pulse - 'kick_pulse' | 'snare_pulse'
 * @param {number|boolean} value - 0 or 1 (or true/false, normalized to 1/0)
 */
function setRhythmPulse(pulse, value) {
  const v = value === true || value === 1 ? 1 : 0;
  dictReplace(`rhythm_pulses::${pulse}`, v);
}

module.exports = {
  DICT_NAME,
  dictGet,
  dictReplace,
  dictAppend,
  getTransport,
  setTransport,
  getActiveChord,
  setActiveChord,
  getSequencerBuffer,
  setSequencerBuffer,
  getSongStructure,
  setSongStructure,
  setRhythmPulse,
};

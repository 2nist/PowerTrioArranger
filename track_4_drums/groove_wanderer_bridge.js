/**
 * Track 4 - GrooveWanderer Bridge: Extracts rhythm pulses from all 4 drum layers
 * Monitors GrooveWanderer output and updates rhythm_pulses in ---power_trio_brain.
 * Schema: rhythm_pulses use 0/1 (integer), not boolean.
 * ARCHITECTURE: kick, snare, hats_ride, percussion (4 layers).
 */

const maxApi = require("max-api");
const path = require("path");
const { setRhythmPulse } = require(
  path.join(__dirname, "..", "shared", "dict_helpers.js"),
);

const PULSE_MS = 50;

// Layer note mappings (ARCHITECTURE.md)
const KICK_NOTES = [35, 36];
const SNARE_NOTES = [37, 38, 40];
const HATS_RIDE_NOTES = [42, 44, 46, 51, 59]; // closed hat, pedal, open, ride, ride bell
const PERC_NOTES = [41, 43, 45, 47, 48, 49, 52, 55, 57]; // low tom, high tom, mid tom, etc.

let kickTimeout = null;
let snareTimeout = null;
let hatsTimeout = null;
let percTimeout = null;

function onKickHit(velocity) {
  setRhythmPulse("kick_pulse", true);
  maxApi.outlet("kick_trigger", velocity != null ? velocity : 127);
  if (kickTimeout) clearTimeout(kickTimeout);
  kickTimeout = setTimeout(() => {
    setRhythmPulse("kick_pulse", false);
    kickTimeout = null;
  }, PULSE_MS);
}

function onSnareHit() {
  setRhythmPulse("snare_pulse", true);
  if (snareTimeout) clearTimeout(snareTimeout);
  snareTimeout = setTimeout(() => {
    setRhythmPulse("snare_pulse", false);
    snareTimeout = null;
  }, PULSE_MS);
}

function onHatsHit() {
  setRhythmPulse("hats_pulse", true);
  if (hatsTimeout) clearTimeout(hatsTimeout);
  hatsTimeout = setTimeout(() => {
    setRhythmPulse("hats_pulse", false);
    hatsTimeout = null;
  }, PULSE_MS);
}

function onPercHit() {
  setRhythmPulse("perc_pulse", true);
  if (percTimeout) clearTimeout(percTimeout);
  percTimeout = setTimeout(() => {
    setRhythmPulse("perc_pulse", false);
    percTimeout = null;
  }, PULSE_MS);
}

function handleDrumNote(note, velocity) {
  if (velocity <= 0) return;
  if (KICK_NOTES.includes(note)) onKickHit(velocity);
  else if (SNARE_NOTES.includes(note)) onSnareHit();
  else if (HATS_RIDE_NOTES.includes(note)) onHatsHit();
  else if (PERC_NOTES.includes(note)) onPercHit();
}

// Drum trigger from GrooveWanderer MIDI output (or Max send)
maxApi.addHandler("drum_trigger", (note, velocity) => {
  handleDrumNote(note, velocity);
});

// Alternative: raw note_input when this script receives GrooveWanderer notes
maxApi.addHandler("note_input", (note, velocity) => {
  handleDrumNote(note, velocity);
});

module.exports = { onKickHit, onSnareHit, onHatsHit, onPercHit };

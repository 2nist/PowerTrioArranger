/**
 * Track 4 - GrooveWanderer Bridge: Outputs timing pulses for bass from drum triggers
 * Monitors GrooveWanderer output and updates rhythm_pulses in ---power_trio_brain.
 * Schema: rhythm_pulses use 0/1 (integer), not boolean.
 */

const maxApi = require("max-api");
const path = require("path");
const { setRhythmPulse } = require(
  path.join(__dirname, "..", "shared", "dict_helpers.js"),
);

const PULSE_MS = 50;
const KICK_NOTE = 36;
// Snare: GM 37, 38, 40 (ARCHITECTURE.md)
const SNARE_NOTES = [37, 38, 40];

let kickTimeout = null;
let snareTimeout = null;

function onKickHit() {
  setRhythmPulse("kick_pulse", true);
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

// Drum trigger from GrooveWanderer MIDI output (or Max send)
maxApi.addHandler("drum_trigger", (note, velocity) => {
  if (velocity > 0) {
    if (note === KICK_NOTE) onKickHit();
    else if (SNARE_NOTES.includes(note)) onSnareHit();
  }
});

// Alternative: raw note_input when this script receives GrooveWanderer notes
maxApi.addHandler("note_input", (note, velocity) => {
  if (velocity > 0) {
    if (note === KICK_NOTE) onKickHit();
    else if (SNARE_NOTES.includes(note)) onSnareHit();
  }
});

module.exports = { onKickHit, onSnareHit };

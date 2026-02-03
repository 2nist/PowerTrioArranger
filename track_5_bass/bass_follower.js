/**
 * Track 5 - Bass Follower: Kick-triggered bass from Global Brain
 * Integrates with ---power_trio_brain: reads transport::current_chord and responds to kick_trigger.
 * Constraint 3: Beat position uses 1-based musical time (1.0 = bar start, 2.0, 3.0, 4.0).
 *
 * REQUIRED MAX PATCHER WIRING:
 * 
 * INPUTS (to node.script left inlet):
 *   [r ---kick_pulse_global] → [prepend kick_trigger] → inlet (from Track 4 Bridge)
 *   [ctlin] → [prepend cc_input] → inlet (optional: CC 28 for hierarchy control)
 *
 * OUTLETS (from node.script):
 *   outlet → [route dict note_out]
 *      |         |        |
 *      |         |        └→ [noteout] (bass notes to synth)
 *      |         └→ [dict ---power_trio_brain]
 *      └→ CRITICAL: [dict] left outlet → [prepend dict_response] → inlet
 *
 * ⚠️  CRITICAL: Dict response loop is MANDATORY - bass won't play without it!
 *               Script reads transport::current_chord on every kick trigger.
 */

const maxApi = require("max-api");
const path = require("path");
const { getTransport } = require(
  path.join(__dirname, "..", "shared", "dict_helpers.js"),
);

const BASS_OCTAVE = 2; // MIDI octave for bass (C2 = 36)
const BASS_VELOCITY_DEFAULT = 90;
const BASS_CHANNEL = 1; // MIDI channel for bass (0-indexed in noteout)
const DICT_RESPONSE_TIMEOUT = 1000; // 1 second

let pendingKickTrigger = false;
let lastKickVelocity = BASS_VELOCITY_DEFAULT;
let dictResponseReceived = false;
let wiringWarningShown = false;

/**
 * Get bass note from chord (DICTIONARY_SCHEMA shape: root_midi, root_name, midi_notes, quality, degree, voicing_style).
 * Puts root in bass register (BASS_OCTAVE).
 */
function bassNoteFromChord(chord) {
  if (!chord) return null;
  const rootMidi = chord.root_midi != null ? chord.root_midi : (chord.midi_notes && chord.midi_notes[0]);
  if (rootMidi == null) return null;
  // Put in bass octave: root is often 60 (C4), bass = same pitch class, BASS_OCTAVE
  const pitchClass = rootMidi % 12;
  return pitchClass + BASS_OCTAVE * 12;
}

/**
 * On kick_trigger: request current chord, then in dict_response output bass note.
 */
function onKickTrigger(velocity) {
  pendingKickTrigger = true;
  const v = velocity != null ? Math.max(1, Math.min(127, velocity)) : BASS_VELOCITY_DEFAULT;
  getTransport("current_chord");
  // Store velocity for use in dict_response (we don't have a direct way to pass it, so use default or last)
  lastKickVelocity = v;
  
  // Check if dict response loop is wired
  if (!dictResponseReceived && !wiringWarningShown) {
    setTimeout(() => {
      if (!dictResponseReceived && !wiringWarningShown) {
        wiringWarningShown = true;
        maxApi.post("\n\u26a0\ufe0f  BASS FOLLOWER WIRING ERROR:");
        maxApi.post("   Dict response loop not wired! Bass won't play.");
        maxApi.post("   Required: [dict] left outlet → [prepend dict_response] → node.script inlet");
        maxApi.post("   See AMXD_BUILD_INSTRUCTIONS.md for wiring diagram.\n");
      }
    }, DICT_RESPONSE_TIMEOUT);
  }
}

// Constraint 1: dict_response loop must be wired or this never fires
maxApi.addHandler("dict_response", (key, value) => {
  dictResponseReceived = true; // Mark that wiring is correct
  const k = String(key || "");
  if (!pendingKickTrigger || !k.includes("transport::current_chord")) return;
  pendingKickTrigger = false;

  let chord = null;
  try {
    chord = typeof value === "string" && value !== "null" ? JSON.parse(value) : value;
  } catch (e) {
    chord = null;
  }
  if (!chord || (!chord.midi_notes && chord.root_midi == null)) return;

  const bassNote = bassNoteFromChord(chord);
  if (bassNote == null) return;

  const vel = lastKickVelocity;
  maxApi.outlet("note_out", bassNote, vel);
});

// Kick trigger from Max patcher (e.g. [r ---kick_pulse_global] -> prepend kick_trigger -> this script). Optional velocity as first arg.
maxApi.addHandler("kick_trigger", (...args) => {
  const vel = args.length >= 1 && typeof args[0] === "number" ? args[0] : BASS_VELOCITY_DEFAULT;
  onKickTrigger(vel);
});

// Initialization
maxApi.post("Bass Follower loaded. Listening for kick triggers from Track 4 Bridge.");

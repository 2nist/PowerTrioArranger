/**
 * Transport Clock Manager
 * Primary Job: Handle Stop/Start resets and Manual Testing.
 * Note: Actual timing ticks come from [plugsync~] or [metro]/[counter] in the Patcher (Method A/B).
 * See Application Docs/TRANSPORT_CLOCK_BUILD.md
 */

const maxApi = require("max-api");

let isPlaying = false;
let currentStep = -1;

// HANDLER: Transport State (Play/Stop)
// Wire from [live.observer playing] or equivalent
maxApi.addHandler("transport_state", (playing) => {
  const newState = !!playing;

  // If we just Stopped
  if (isPlaying && !newState) {
    currentStep = -1;
    maxApi.outlet("transport_reset", "bang");
  }

  isPlaying = newState;
});

// HANDLER: Manual Step (For debugging without playing)
// Wire from [live.numbox] or [int] for step 0-15
maxApi.addHandler("manual_step", (step) => {
  if (!isPlaying) {
    const s = Math.floor(step) % 16;
    maxApi.outlet("transport_tick", s);
  }
});

// HANDLER: Reset
maxApi.addHandler("reset", () => {
  currentStep = -1;
  isPlaying = false;
  maxApi.outlet("transport_reset", "bang");
});

maxApi.post("Transport Clock Manager Ready");

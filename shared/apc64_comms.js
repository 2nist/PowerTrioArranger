/**
 * apc64_comms.js - APC64 Display and LED Communication Module
 *
 * Provides helper functions for controlling the APC64's display and LEDs
 * from Max for Live devices via the max-api module.
 *
 * Protocol: See Application Docs/APC64_PROTOCOL.md
 * Last Updated: 2026-02-01
 */

const path = require("path");
const HW = require(path.join(__dirname, "..", "hardware", "apc64_constants.js"));

// ============================================
// SYSEX MESSAGE BUILDERS
// ============================================

/**
 * Build a SysEx message for the APC64
 * @param {number} msgId - Message ID (MSG_DISPLAY, MSG_MODE, etc.)
 * @param  {...number} payload - Message payload bytes
 * @returns {number[]} Complete SysEx message as array
 */
function makeSysexMessage(msgId, ...payload) {
  const msgSize = payload.length;
  return [
    HW.SYSEX_START,
    HW.SYSEX_MANUFACTURER,
    HW.SYSEX_DEVICE_ID,
    HW.SYSEX_PRODUCT_ID,
    msgId,
    (msgSize >> 7) & 0x7f, // Length MSB
    msgSize & 0x7f, // Length LSB
    ...payload,
    HW.SYSEX_END,
  ];
}

/**
 * Convert a string to ASCII byte array for display
 * @param {string} text - Text to convert (max 8 chars recommended)
 * @returns {number[]} ASCII bytes
 */
function textToBytes(text) {
  const bytes = [];
  for (let i = 0; i < text.length && i < 16; i++) {
    bytes.push(text.charCodeAt(i) & 0x7f);
  }
  return bytes;
}

// ============================================
// DISPLAY CONTROL
// ============================================

/**
 * Take ownership of the APC64 display
 * Must be called before writing to display lines
 * @param {object} maxApi - max-api module instance
 */
function takeDisplayOwnership(maxApi) {
  const msg = makeSysexMessage(HW.MSG_DISPLAY_OWNER, 1);
  maxApi.outlet("sysex", ...msg);
}

/**
 * Release ownership of the APC64 display
 * Returns display control to the device
 * @param {object} maxApi - max-api module instance
 */
function releaseDisplayOwnership(maxApi) {
  const msg = makeSysexMessage(HW.MSG_DISPLAY_OWNER, 0);
  maxApi.outlet("sysex", ...msg);
}

/**
 * Write text to a display line
 * @param {object} maxApi - max-api module instance
 * @param {number} lineIndex - Line number (0, 1, or 2)
 * @param {string} text - Text to display (max ~8 chars)
 */
function sendDisplayLine(maxApi, lineIndex, text) {
  const textBytes = textToBytes(text);
  const payload = [lineIndex, ...textBytes, 0]; // null terminator
  const msg = makeSysexMessage(HW.MSG_DISPLAY, ...payload);
  maxApi.outlet("sysex", ...msg);
}

/**
 * Update all three display lines at once
 * @param {object} maxApi - max-api module instance
 * @param {string} line1 - First line text
 * @param {string} line2 - Second line text
 * @param {string} line3 - Third line text
 */
function updateDisplay(maxApi, line1, line2, line3) {
  takeDisplayOwnership(maxApi);
  sendDisplayLine(maxApi, 0, line1 || "");
  sendDisplayLine(maxApi, 1, line2 || "");
  sendDisplayLine(maxApi, 2, line3 || "");
}

/**
 * Clear the display and release ownership
 * @param {object} maxApi - max-api module instance
 */
function clearDisplay(maxApi) {
  sendDisplayLine(maxApi, 0, "");
  sendDisplayLine(maxApi, 1, "");
  sendDisplayLine(maxApi, 2, "");
  releaseDisplayOwnership(maxApi);
}

// ============================================
// LED CONTROL
// ============================================

/**
 * Set an LED to a specific color
 * @param {object} maxApi - max-api module instance
 * @param {number} note - LED note number (0-126)
 * @param {number} color - Color velocity value (0-127)
 * @param {number} [channel=LED_CH_FULL] - LED channel for brightness/animation
 */
function setLedColor(maxApi, note, color, channel = HW.LED_CH_FULL) {
  maxApi.outlet("led", note, color, channel);
}

/**
 * Set an LED to pulse animation
 * @param {object} maxApi - max-api module instance
 * @param {number} note - LED note number
 * @param {number} color - Color velocity value
 */
function setLedPulse(maxApi, note, color) {
  setLedColor(maxApi, note, color, HW.LED_CH_PULSE);
}

/**
 * Set an LED to blink animation
 * @param {object} maxApi - max-api module instance
 * @param {number} note - LED note number
 * @param {number} color - Color velocity value
 */
function setLedBlink(maxApi, note, color) {
  setLedColor(maxApi, note, color, HW.LED_CH_BLINK);
}

/**
 * Set an LED to half brightness
 * @param {object} maxApi - max-api module instance
 * @param {number} note - LED note number
 * @param {number} color - Color velocity value
 */
function setLedHalf(maxApi, note, color) {
  setLedColor(maxApi, note, color, HW.LED_CH_HALF);
}

/**
 * Turn off an LED
 * @param {object} maxApi - max-api module instance
 * @param {number} note - LED note number
 */
function setLedOff(maxApi, note) {
  setLedColor(maxApi, note, HW.COLOR_OFF, HW.LED_CH_FULL);
}

/**
 * Set multiple LEDs to the same color
 * @param {object} maxApi - max-api module instance
 * @param {number[]} notes - Array of LED note numbers
 * @param {number} color - Color velocity value
 * @param {number} [channel=LED_CH_FULL] - LED channel
 */
function setLedsColor(maxApi, notes, color, channel = HW.LED_CH_FULL) {
  for (const note of notes) {
    setLedColor(maxApi, note, color, channel);
  }
}

/**
 * Turn off multiple LEDs
 * @param {object} maxApi - max-api module instance
 * @param {number[]} notes - Array of LED note numbers
 */
function setLedsOff(maxApi, notes) {
  for (const note of notes) {
    setLedOff(maxApi, note);
  }
}

/**
 * Set a row of pads (8 pads) to a color
 * @param {object} maxApi - max-api module instance
 * @param {number} row - Row number (0-7, 0 = bottom)
 * @param {number} color - Color velocity value
 * @param {number} [channel=LED_CH_FULL] - LED channel
 */
function setRowColor(maxApi, row, color, channel = HW.LED_CH_FULL) {
  const startNote = row * 8;
  for (let i = 0; i < 8; i++) {
    setLedColor(maxApi, startNote + i, color, channel);
  }
}

/**
 * Turn off a row of pads
 * @param {object} maxApi - max-api module instance
 * @param {number} row - Row number (0-7)
 */
function setRowOff(maxApi, row) {
  setRowColor(maxApi, row, HW.COLOR_OFF);
}

// ============================================
// TRACK TYPE CONTROL
// ============================================

/**
 * Set the track type indicator on the APC64
 * @param {object} maxApi - max-api module instance
 * @param {boolean} isDrum - true for Drum track, false for Note track
 */
function setTrackType(maxApi, isDrum) {
  const msg = makeSysexMessage(HW.MSG_TRACK_TYPE, isDrum ? 1 : 0);
  maxApi.outlet("sysex", ...msg);
}

// ============================================
// SHIFT STATE TRACKING
// ============================================

let shiftState = false;
let lastShiftTime = 0;
const DOUBLE_SHIFT_THRESHOLD = 300; // ms

/**
 * Update shift state from note input
 * @param {number} note - Note number
 * @param {number} velocity - Velocity (>0 = pressed)
 * @returns {object|null} - {pressed, released, double} or null if not shift
 */
function updateShiftState(note, velocity) {
  if (note !== HW.BTN_SHIFT) return null;

  const now = Date.now();
  const wasPressed = shiftState;
  shiftState = velocity > 0;

  if (shiftState && !wasPressed) {
    // Shift just pressed
    const isDouble = now - lastShiftTime < DOUBLE_SHIFT_THRESHOLD;
    lastShiftTime = now;
    return { pressed: true, released: false, double: isDouble };
  } else if (!shiftState && wasPressed) {
    // Shift just released
    return { pressed: false, released: true, double: false };
  }
  return null;
}

/**
 * Get current shift state
 * @returns {boolean} - true if shift is currently held
 */
function isShiftPressed() {
  return shiftState;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // SysEx
  makeSysexMessage,
  textToBytes,

  // Display
  takeDisplayOwnership,
  releaseDisplayOwnership,
  sendDisplayLine,
  updateDisplay,
  clearDisplay,

  // LEDs
  setLedColor,
  setLedPulse,
  setLedBlink,
  setLedHalf,
  setLedOff,
  setLedsColor,
  setLedsOff,
  setRowColor,
  setRowOff,

  // Track Type
  setTrackType,

  // Shift State
  updateShiftState,
  isShiftPressed,
};

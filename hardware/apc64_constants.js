// ============================================
// APC64 HARDWARE SPECIFICATION
// ============================================
// Device: Akai Professional APC64 (akapro.com)
// Protocol: See Application Docs/APC64_PROTOCOL.md for full reference
// Source: Decompiled from Ableton Live 12 MIDI Remote Scripts
// Last Updated: 2026-02-01
// ============================================

// ============================================
// SYSEX PROTOCOL
// ============================================
// Header: F0 47 00 53 [msg_id] [len_msb] [len_lsb] [payload...] F7
const SYSEX_START = 0xf0;
const SYSEX_END = 0xf7;
const SYSEX_MANUFACTURER = 0x47; // Akai
const SYSEX_DEVICE_ID = 0x00;
const SYSEX_PRODUCT_ID = 0x53; // APC64 (83 decimal)

// SysEx Message IDs
const MSG_DISPLAY = 0x10; // Write text to display line
const MSG_MODE = 0x19; // Set device mode (0=generic, 1=Live)
const MSG_TRACK_TYPE = 0x1b; // Set track type (0=Note, 1=Drum)
const MSG_DISPLAY_OWNER = 0x1c; // Take/release display (0=release, 1=take)
const MSG_RTC_START = 0x20; // Render to Clip: start
const MSG_RTC_DATA = 0x21; // Render to Clip: data
const MSG_RTC_END = 0x22; // Render to Clip: end

// ============================================
// LED CHANNELS (MIDI channel determines LED behavior)
// ============================================
const LED_CH_HALF = 0; // Half brightness
const LED_CH_FULL = 6; // Full brightness
const LED_CH_PULSE = 10; // Pulsing animation
const LED_CH_BLINK = 14; // Blinking animation

// ============================================
// COLOR PALETTE (Note velocity values)
// ============================================
const COLOR_OFF = 0;
const COLOR_GREY = 1;
const COLOR_WHITE = 3;
const COLOR_RED = 5;
const COLOR_AMBER = 9;
const COLOR_YELLOW = 13;
const COLOR_GREEN = 21;
const COLOR_BLUE = 45;
const COLOR_PURPLE = 48;
const COLOR_PINK = 53;

// ============================================
// BUTTON NOTE MAPPING (from elements.py)
// ============================================
// Pad Grid: 0-63 (8x8 matrix, bottom-left = 0)
const PAD_GRID_START = 0;
const PAD_GRID_END = 63;

// Track State Buttons
const BTN_TRACK_STATE_START = 64;
const BTN_TRACK_STATE_END = 71;

// Transport & Modifiers
const BTN_TEMPO = 72;
const BTN_CLEAR = 73;
const BTN_DUPLICATE = 74;
const BTN_QUANTIZE = 75;
const BTN_FIXED_LENGTH = 76;
const BTN_UNDO = 77;

// Touch Strip Touch Detection
const BTN_TOUCH_START = 82;
const BTN_TOUCH_END = 89;

// Encoder & Transport
const BTN_ENCODER = 90;
const BTN_PLAY = 91;
const BTN_RECORD = 92;
const BTN_STOP = 93;

// Navigation
const BTN_UP = 94;
const BTN_DOWN = 95;
const BTN_LEFT = 96;
const BTN_RIGHT = 97;

// Track Select
const BTN_TRACK_SELECT_START = 100;
const BTN_TRACK_SELECT_END = 107;

// Control Row
const BTN_RECORD_ARM = 108;
const BTN_MUTE = 109;
const BTN_SOLO = 110;
const BTN_CLIP_STOP = 111;

// Scene Launch
const BTN_SCENE_LAUNCH_START = 112;
const BTN_SCENE_LAUNCH_END = 119;

// Shift & Mode Buttons
const BTN_SHIFT = 120;
const BTN_DEVICE = 121;
const BTN_VOLUME = 122;
const BTN_PAN = 123;
const BTN_SEND = 124;
const BTN_CHANNEL_STRIP = 125;
const BTN_OFF = 126;

// ============================================
// GRID CONFIGURATION (for backward compatibility)
// ============================================
const GRID_MIN_NOTE = 36; // Note mode sends 36-99
const GRID_MAX_NOTE = 99;
const GRID_COLUMNS = 8;
const GRID_ROWS = 8;

// TRACK 1: CHORD LAB
const T1_CC_VOICING_SPREAD = 20;
const T1_CC_INVERSION = 21;
const T1_CC_RESERVED_3 = 22;
const T1_CC_RESERVED_4 = 23;
const T1_CC_RESERVED_5 = 24;
const T1_CC_RESERVED_6 = 25;
const T1_CC_RESERVED_7 = 26;
const T1_CC_RESERVED_8 = 27;

// TRACK 2: SEQUENCER
const T2_CC_STEP_VELOCITY = 28;
const T2_CC_GATE_LENGTH = 29;
const T2_CC_SWING = 30;
const T2_CC_RESERVED_4 = 31;
const T2_CC_RESERVED_5 = 32;
const T2_CC_RESERVED_6 = 33;
const T2_CC_RESERVED_7 = 34;
const T2_CC_RESERVED_8 = 35;

// TRACK 3: CONDUCTOR
const T3_CC_SCENE_XFADE = 36;
const T3_CC_PATTERN_FADE = 37;
const T3_CC_RESERVED_3 = 38;
const T3_CC_RESERVED_4 = 39;
const T3_CC_RESERVED_5 = 40;
const T3_CC_RESERVED_6 = 41;
const T3_CC_RESERVED_7 = 42;
const T3_CC_MASTER_TEMPO = 43;

// TRACK 5: BASS FOLLOWER (Shares T2 range)
const T5_CC_HARMONIC_FILTER = 28;
const T5_CC_RHYTHM_DENSITY = 29;
const T5_CC_OCTAVE_RANGE = 30;

// GRID ZONES (Note ranges)
const CHORD_GRID_START = 36;
const CHORD_GRID_END = 75;

const SEQUENCER_GRID_START = 36;
const SEQUENCER_GRID_END = 51;

const PATTERN_PALETTE_START = 92;
const PATTERN_PALETTE_END = 99;

const TIMELINE_GRID_START = 36;
const TIMELINE_GRID_END = 91;

// CHORD MATRIX ROWS (Track 1)
const CHORD_ROW_POWER = 0;
const CHORD_ROW_TRIAD = 1;
const CHORD_ROW_SEVENTH = 2;
const CHORD_ROW_NINTH = 3;
const CHORD_ROW_ALTERED = 4;

// HELPER FUNCTIONS
function gridNoteToPosition(note) {
  const offset = note - GRID_MIN_NOTE;
  return {
    column: offset % GRID_COLUMNS,
    row: Math.floor(offset / GRID_COLUMNS),
  };
}

function positionToGridNote(column, row) {
  return GRID_MIN_NOTE + row * GRID_COLUMNS + column;
}

// EXPORT (CommonJS for Max's Node.js)
module.exports = {
  // SysEx Protocol
  SYSEX_START,
  SYSEX_END,
  SYSEX_MANUFACTURER,
  SYSEX_DEVICE_ID,
  SYSEX_PRODUCT_ID,
  MSG_DISPLAY,
  MSG_MODE,
  MSG_TRACK_TYPE,
  MSG_DISPLAY_OWNER,
  MSG_RTC_START,
  MSG_RTC_DATA,
  MSG_RTC_END,

  // LED Channels
  LED_CH_HALF,
  LED_CH_FULL,
  LED_CH_PULSE,
  LED_CH_BLINK,

  // Colors
  COLOR_OFF,
  COLOR_GREY,
  COLOR_WHITE,
  COLOR_RED,
  COLOR_AMBER,
  COLOR_YELLOW,
  COLOR_GREEN,
  COLOR_BLUE,
  COLOR_PURPLE,
  COLOR_PINK,

  // Buttons
  PAD_GRID_START,
  PAD_GRID_END,
  BTN_TRACK_STATE_START,
  BTN_TRACK_STATE_END,
  BTN_TEMPO,
  BTN_CLEAR,
  BTN_DUPLICATE,
  BTN_QUANTIZE,
  BTN_FIXED_LENGTH,
  BTN_UNDO,
  BTN_TOUCH_START,
  BTN_TOUCH_END,
  BTN_ENCODER,
  BTN_PLAY,
  BTN_RECORD,
  BTN_STOP,
  BTN_UP,
  BTN_DOWN,
  BTN_LEFT,
  BTN_RIGHT,
  BTN_TRACK_SELECT_START,
  BTN_TRACK_SELECT_END,
  BTN_RECORD_ARM,
  BTN_MUTE,
  BTN_SOLO,
  BTN_CLIP_STOP,
  BTN_SCENE_LAUNCH_START,
  BTN_SCENE_LAUNCH_END,
  BTN_SHIFT,
  BTN_DEVICE,
  BTN_VOLUME,
  BTN_PAN,
  BTN_SEND,
  BTN_CHANNEL_STRIP,
  BTN_OFF,

  // Grid (backward compatibility)
  GRID_MIN_NOTE,
  GRID_MAX_NOTE,
  GRID_COLUMNS,
  GRID_ROWS,

  // Track 1 CCs
  T1_CC_VOICING_SPREAD,
  T1_CC_INVERSION,

  // Track 2 CCs
  T2_CC_STEP_VELOCITY,
  T2_CC_GATE_LENGTH,
  T2_CC_SWING,

  // Track 3 CCs
  T3_CC_SCENE_XFADE,
  T3_CC_PATTERN_FADE,
  T3_CC_MASTER_TEMPO,

  // Track 5 CCs
  T5_CC_HARMONIC_FILTER,
  T5_CC_RHYTHM_DENSITY,
  T5_CC_OCTAVE_RANGE,

  // Grid Zones
  CHORD_GRID_START,
  CHORD_GRID_END,
  SEQUENCER_GRID_START,
  SEQUENCER_GRID_END,
  PATTERN_PALETTE_START,
  PATTERN_PALETTE_END,
  TIMELINE_GRID_START,
  TIMELINE_GRID_END,

  // Matrix
  CHORD_ROW_POWER,
  CHORD_ROW_TRIAD,
  CHORD_ROW_SEVENTH,
  CHORD_ROW_NINTH,
  CHORD_ROW_ALTERED,

  // Helpers
  gridNoteToPosition,
  positionToGridNote,
};

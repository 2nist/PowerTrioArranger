# APC64 MIDI/SysEx Protocol Reference

> **Source:** Decompiled from Ableton Live 12 MIDI Remote Scripts (APC64/)  
> **Last Updated:** 2026-02-01  
> **Repository:** [gluon/AbletonLive12_MIDIRemoteScripts](https://github.com/gluon/AbletonLive12_MIDIRemoteScripts)

---

## Overview

The APC64 communicates with Ableton Live via standard MIDI and proprietary SysEx messages. This document covers:

1. SysEx Protocol (display, mode, track type)
2. LED Control (channels, colors)
3. Complete Note/CC Mapping
4. Color Palette

---

## 1. SysEx Protocol

### Header

All APC64 SysEx messages use this header:

```
F0 47 00 53 [msg_id] [len_msb] [len_lsb] [payload...] F7
```

| Byte | Value | Description |
|------|-------|-------------|
| F0 | - | SysEx Start |
| 47 | 0x47 | Akai Manufacturer ID |
| 00 | 0x00 | Device ID (broadcast) |
| 53 | 0x53 | APC64 Product ID (83 decimal) |
| msg_id | varies | Message type identifier |
| len_msb | varies | Payload length (high 7 bits) |
| len_lsb | varies | Payload length (low 7 bits) |
| payload | varies | Message-specific data |
| F7 | - | SysEx End |

### Message IDs

| ID (hex) | ID (dec) | Name | Description |
|----------|----------|------|-------------|
| 0x10 | 16 | DISPLAY_MESSAGE | Write text to display line |
| 0x19 | 25 | MODE_MESSAGE | Set device mode (0=generic, 1=Live) |
| 0x1B | 27 | TRACK_TYPE_MESSAGE | Set track type (0=Note, 1=Drum) |
| 0x1C | 28 | SET_DISPLAY_OWNER | Take/release display ownership |
| 0x20 | 32 | RTC_START_MESSAGE | Render to Clip: start |
| 0x21 | 33 | RTC_DATA_MESSAGE | Render to Clip: note data |
| 0x22 | 34 | RTC_END_MESSAGE | Render to Clip: end |

### Display Messages

**Take Display Ownership (before writing):**
```
F0 47 00 53 1C 00 01 01 F7
```

**Release Display Ownership:**
```
F0 47 00 53 1C 00 01 00 F7
```

**Write Display Line:**
```
F0 47 00 53 10 [len_msb] [len_lsb] [line_index] [ascii_chars...] 00 F7
```

- `line_index`: 0, 1, or 2 (three display lines)
- `ascii_chars`: Text as ASCII bytes (max ~8 chars per line)
- `00`: Null terminator

**Example - Write "Cmaj7" to line 2:**
```
F0 47 00 53 10 00 07 01 43 6D 61 6A 37 00 F7
                  │  │  └─────────────────┴─ "Cmaj7" + null
                  │  └─ Line index 1 (second line)
                  └─ Length = 7 bytes
```

### Track Type Message

Tell APC64 whether the selected track is Note or Drum:

```
F0 47 00 53 1B 00 01 [type] F7
```

- `type`: 0 = Note track, 1 = Drum track

---

## 2. LED Control

### LED Channels

LED behavior is controlled by the MIDI channel used when sending Note On messages:

| Channel | Constant | Effect |
|---------|----------|--------|
| 0 | LED_CH_HALF | Half brightness |
| 6 | LED_CH_FULL | Full brightness |
| 10 | LED_CH_PULSE | Pulsing animation |
| 14 | LED_CH_BLINK | Blinking animation |

### Sending LED Colors

To set an LED color, send a **Note On** message:

```
Channel: LED channel (0, 6, 10, or 14)
Note: LED note number (see mapping below)
Velocity: Color value (see palette below)
```

**Example - Set pad 0 to GREEN, pulsing:**
```
Note On, Channel 10, Note 0, Velocity 21
```

**Example - Set Shift button to RED, blinking:**
```
Note On, Channel 14, Note 120, Velocity 5
```

### Turning Off LEDs

Send velocity 0 to turn off an LED:
```
Note On, Channel 6, Note [led], Velocity 0
```

---

## 3. Complete Note Mapping

### Pad Grid (8x8)

Notes 0-63, arranged in rows (bottom to top):

```
Row 7: 56 57 58 59 60 61 62 63
Row 6: 48 49 50 51 52 53 54 55
Row 5: 40 41 42 43 44 45 46 47
Row 4: 32 33 34 35 36 37 38 39
Row 3: 24 25 26 27 28 29 30 31
Row 2: 16 17 18 19 20 21 22 23
Row 1:  8  9 10 11 12 13 14 15
Row 0:  0  1  2  3  4  5  6  7  (bottom row)
```

### Control Buttons

| Note | Button |
|------|--------|
| 64-71 | Track State Buttons (1-8) |
| 72 | Tempo |
| 73 | Clear |
| 74 | Duplicate |
| 75 | Quantize |
| 76 | Fixed Length |
| 77 | Undo |
| 82-89 | Touch Strip Touch (1-8) |
| 90 | Encoder Button |
| 91 | Play |
| 92 | Record |
| 93 | Stop |
| 94 | Up |
| 95 | Down |
| 96 | Left |
| 97 | Right |
| 100-107 | Track Select (1-8) |
| 108 | Record Arm |
| 109 | Mute |
| 110 | Solo |
| 111 | Clip Stop |
| 112-119 | Scene Launch (1-8) |
| **120** | **Shift** |
| 121 | Device |
| 122 | Volume |
| 123 | Pan |
| 124 | Send |
| 125 | Channel Strip |
| 126 | Off |

### Touch Strips (Pitch Bend)

Touch strips send Pitch Bend messages on channels 0-7:

| Strip | Channel | Note (touch) |
|-------|---------|--------------|
| 1 | 0 | 82 |
| 2 | 1 | 83 |
| 3 | 2 | 84 |
| 4 | 3 | 85 |
| 5 | 4 | 86 |
| 6 | 5 | 87 |
| 7 | 6 | 88 |
| 8 | 7 | 89 |

---

## 4. Color Palette

### Basic Colors (velocity values)

| Velocity | Color |
|----------|-------|
| 0 | Off |
| 1 | Grey |
| 3 | White |
| 5 | Red |
| 9 | Amber |
| 13 | Yellow |
| 21 | Green |
| 45 | Blue |
| 48 | Purple |
| 53 | Pink |

### Extended Palette

The APC64 supports a 128-color palette. Key values:

| Range | Colors |
|-------|--------|
| 0-3 | Off, Grey, Grey, White |
| 4-7 | Red shades |
| 8-11 | Orange/Amber shades |
| 12-15 | Yellow shades |
| 16-23 | Green shades |
| 24-31 | Cyan shades |
| 32-39 | Blue shades |
| 40-47 | Blue/Purple shades |
| 48-55 | Purple/Pink shades |
| 56-63 | Pink/Red shades |
| 64-127 | Additional colors (Live track colors) |

### Live Track Color Index Mapping

The script maps Ableton Live's 70 track colors to APC64 velocity values. See `colors.py` for the complete `LIVE_COLOR_INDEX_TO_RGB` dictionary.

---

## 5. Usage Examples

### Initialize Display

```javascript
// Take ownership
sendSysex([0xF0, 0x47, 0x00, 0x53, 0x1C, 0x00, 0x01, 0x01, 0xF7]);

// Write line 1: "Power"
sendSysex([0xF0, 0x47, 0x00, 0x53, 0x10, 0x00, 0x07, 0x00, 
           0x50, 0x6F, 0x77, 0x65, 0x72, 0x00, 0xF7]);

// Write line 2: "Trio"
sendSysex([0xF0, 0x47, 0x00, 0x53, 0x10, 0x00, 0x06, 0x01,
           0x54, 0x72, 0x69, 0x6F, 0x00, 0xF7]);
```

### Set Pad Colors

```javascript
// Pad 0 = Green (full brightness)
sendNoteOn(6, 0, 21);

// Pad 7 = Red (blinking)
sendNoteOn(14, 7, 5);

// Shift button = White
sendNoteOn(6, 120, 3);
```

### Detect Shift

```javascript
// Shift pressed: Note On, Ch 0/6, Note 120, Vel 127
// Shift released: Note Off, Ch 0/6, Note 120, Vel 0

function handleNote(channel, note, velocity) {
  if (note === 120) {
    shiftState = velocity > 0;
  }
}
```

---

## 6. References

- **Ableton Script Source:** [APC64/__init__.py](https://github.com/gluon/AbletonLive12_MIDIRemoteScripts/blob/main/APC64/__init__.py)
- **MIDI Constants:** [APC64/midi.py](https://github.com/gluon/AbletonLive12_MIDIRemoteScripts/blob/main/APC64/midi.py)
- **Elements Mapping:** [APC64/elements.py](https://github.com/gluon/AbletonLive12_MIDIRemoteScripts/blob/main/APC64/elements.py)
- **Color Definitions:** [APC64/colors.py](https://github.com/gluon/AbletonLive12_MIDIRemoteScripts/blob/main/APC64/colors.py)
- **APC40 Mk2 Protocol (similar):** [Akai Official PDF](https://cdn.inmusicbrands.com/akai/attachments/apc40II/APC40Mk2_Communications_Protocol_v1.2.pdf)

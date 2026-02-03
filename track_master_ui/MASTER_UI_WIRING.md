# Master UI Panel - Max Wiring Instructions

## Overview
The Master UI Panel provides visual feedback and manual controls for the Power Trio system.

## Required Max Objects

### 1. Script Runner
```
[node.script master_panel.js @autostart 1]
```

### 2. Display Objects (connect to outlet 0 via route)
```
[node.script] outlet 0
    |
[route display dict]
    |           |
[route chord notes sequencer bass]    [dict ---power_trio_brain]
    |      |        |         |
[textedit] [textedit] [textedit] [textedit]
```

### 3. Manual Control Buttons
```
[button "Clear Chord"] → [prepend clear_chord] → [node.script] inlet 0
[button "Clear Seq"] → [prepend clear_sequencer] → [node.script] inlet 0  
[button "Trigger Bass"] → [prepend trigger_bass] → [node.script] inlet 0
[button "Refresh"] → [prepend refresh_display] → [node.script] inlet 0
```

## Complete Patch Layout

```
┌─────────────────────────────────────────────┐
│         POWER TRIO MASTER PANEL             │
├─────────────────────────────────────────────┤
│                                             │
│  Current Chord: [C Major      ]            │
│  Notes: [60 64 67            ]            │
│  Sequencer: [4/16            ]            │
│  Bass State: [active         ]            │
│                                             │
│  [Clear Chord] [Clear Seq]                 │
│  [Trigger Bass] [Refresh]                  │
│                                             │
└─────────────────────────────────────────────┘

WIRING DIAGRAM:

[textfile track_master_ui/master_panel.js]
        |
[node.script @autostart 1]
    |           |
  out 0       out 1
    |           |
[route display dict]
    |                   |
[route chord notes      [dict ---power_trio_brain]
       sequencer bass]
    |    |    |    |
   [textedit displays...]

[bang] ──> [clear_chord] ──┐
[bang] ──> [clear_sequencer]│
[bang] ──> [trigger_bass] ──┼──> [node.script] inlet 0
[bang] ──> [refresh_display]┘
```

## Display Formatting

### Chord Display
- Empty: "No Chord"  
- With chord: "C Major", "G7", "Dmin"

### Notes Display
- Empty: "---"
- With notes: "60 64 67" (MIDI note numbers)

### Sequencer Display
- Format: "4/16" (filled slots / total slots)

### Bass Display
- States: "idle", "active", "waiting"

## UI Recommendations

1. **Large text displays** for chord/notes (users need to see from distance)
2. **Color coding**: 
   - Chord = Yellow
   - Sequencer = Orange
   - Bass = Green
3. **Momentary buttons** for triggers
4. **Status LEDs** to show active state

## Integration with Other Devices

The Master UI reads from the same `---power_trio_brain` dictionary that all other devices use. No special wiring needed between devices - the dictionary is the central hub.

## Troubleshooting

**Display not updating?**
- Check dictionary name matches: `---power_trio_brain`
- Verify @autostart 1 is set
- Check Max Console for "MASTER UI PANEL LOADED"

**Controls not working?**
- Verify button messages are prepended correctly
- Check connections to node.script inlet 0
- Look for console errors

## Optional Enhancements

- Add tempo display from transport
- Show APC64 connection status
- Add preset save/load buttons
- Display last MIDI input

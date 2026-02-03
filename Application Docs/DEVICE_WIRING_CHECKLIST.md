# Power Trio Arranger — Device Wiring Checklist

**Purpose**: Step-by-step verification guide for building/fixing Max for Live devices  
**Date**: 2026-02-01  
**Critical**: All dict-reading devices MUST have response loop or will hang

---

## 🔴 CRITICAL: Load Order

1. **Track_3_Global_Brain.amxd** — Load FIRST (creates dictionary)
2. All other devices — Load after Global Brain exists
3. Verify: Open Max Console before loading any device

---

## Track 3: Global Brain ⭐ MUST WORK FIRST

### Required Objects

- [ ] `[node.script shared/dict_init.js @autostart 1]`
- [ ] `[dict ---power_trio_brain]`
- [ ] `[route dict]`

### Wiring Pattern A: Minimal (Write-Only)

```
[node.script shared/dict_init.js @autostart 1]
         |
    [route dict]
         |
[dict ---power_trio_brain]
```

### Configuration

- [ ] Node.script Inspector: `@autostart` set to `1`
- [ ] Script path: `shared/dict_init.js` (relative to Max search path)
- [ ] OR absolute: `/Users/Matthew/PowerTrioArranger/shared/dict_init.js`

### Validation

Open Max Console (Window → Max Console):

- [ ] Load device
- [ ] Console shows: `Power Trio Brain Initialized: Schema Loaded.`
- [ ] Double-click `[dict ---power_trio_brain]` to inspect
- [ ] Dict contains keys: `transport`, `clipboard`, `sequencer_buffer`, `progression`, `song_structure`, `rhythm_pulses`

### Troubleshooting

| Issue | Fix |
|-------|-----|
| "No such object" | Add `/Users/Matthew/PowerTrioArranger` to Max search path; restart Max/Ableton |
| "Cannot find module 'max-api'" | Run `npm uninstall max-api` in project root; restart |
| Dict is empty | Click script to select it, check Inspector for errors; ensure @autostart 1 |
| Script doesn't run | Wire `[loadbang]` → `[message "script start"]` → node.script inlet |

---

## Track 1: Chord Lab

### Required Objects

- [ ] `[node.script track_1_chord_lab/logic.js @autostart 1]`
- [ ] `[notein]` (for pad input)
- [ ] `[ctlin]` (for CC 20, 21 faders)
- [ ] `[route dict sysex led note_out]`
- [ ] `[dict ---power_trio_brain]` (reference, not new)
- [ ] `[midiout]` (for APC64 display)
- [ ] `[noteout]` (for LED feedback)

### Wiring Pattern B: Standard Client (Write-Only)

```
[notein]           [ctlin]
   |                  |
[prepend note_input] [prepend cc_input]
   |                  |
   +-------+----------+
           |
[node.script track_1_chord_lab/logic.js @autostart 1]
           |
    [route dict sysex led note_out]
      |      |      |        |
      |      |      |        └→ [noteout] (LED feedback)
      |      |      └→ [pack 0 0 0] → [noteout] (LED control)
      |      └→ [midiout] (APC64 display SysEx)
      └→ [dict ---power_trio_brain]
```

### Optional: Dict Response Loop (for future reads)

```
[dict ---power_trio_brain] left outlet
              |
   [prepend dict_response]
              |
   [node.script] left inlet
```

### Validation

- [ ] Press APC64 pad → Max Console shows chord info
- [ ] Inspect dict → `clipboard::active_chord` updates
- [ ] APC64 display shows chord name (if sysex wired)
- [ ] Pad LED lights up (if LED output wired)

---

## Track 2: Sequencer 🔴 CRITICAL WIRING

### Required Objects

- [ ] `[node.script track_2_sequencer/sequencer.js @autostart 1]`
- [ ] `[r ---transport_tick]` (from Transport_Clock device)
- [ ] `[notein]` (for pads 36-51)
- [ ] `[route dict sysex led note_out]`
- [ ] `[dict ---power_trio_brain]` (reference)
- [ ] `[prepend dict_response]` ⚠️ MANDATORY

### Wiring Pattern C: Client with Dict Reads (MANDATORY LOOP)

```
[r ---transport_tick]  [notein]
         |                |
[prepend transport_tick] [prepend note_input]
         |                |
         +-------+--------+
                 |
[node.script track_2_sequencer/sequencer.js @autostart 1]
                 |
      [route dict sysex led note_out]
         |      |      |        |
         |      |      |        └→ [noteout]
         |      |      └→ [pack] → [noteout]
         |      └→ [midiout]
         |
    [dict ---power_trio_brain]
      |              |
      | (left outlet)|
      |              ↓
      |    [prepend dict_response]
      |              |
      └──────────────┴→ [node.script] LEFT INLET ⚠️ CRITICAL
```

### Configuration

- [ ] Transport input connected: `[r ---transport_tick]`
- [ ] Shift detection: Capture note 120 from `[notein]`
- [ ] Dict response loop: MUST be wired or script hangs

### Validation

- [ ] Load device with transport running
- [ ] Step LEDs advance (pads 36-51)
- [ ] Press pad → chord pastes to step
- [ ] Shift+pad → step clears
- [ ] Max Console: If error appears about dict wiring, fix response loop

### Troubleshooting

| Issue | Fix |
|-------|-----|
| "SEQUENCER WIRING ERROR" in console | Wire [dict] left outlet → [prepend dict_response] → node.script inlet |
| Steps don't advance | Verify transport_tick is being received; check Transport_Clock device |
| Paste doesn't work | Check dict response loop; inspect dict for sequencer_buffer |
| Shift doesn't work | Ensure note 120 is routed through [notein] |

---

## Track 4: Bridge

### Required Objects

- [ ] `[node.script track_4_drums/groove_wanderer_bridge.js @autostart 1]`
- [ ] `[notein]` (from GrooveWanderer output)
- [ ] `[route dict kick_pulse]`
- [ ] `[dict ---power_trio_brain]` (reference)
- [ ] `[send ---kick_pulse_global]` (for Bass trigger)

### Wiring Pattern B: Write-Only with Global Send

```
[notein] (from GrooveWanderer)
    |
[prepend drum_trigger]
    |
[node.script track_4_drums/groove_wanderer_bridge.js @autostart 1]
    |
[route dict kick_pulse]
    |        |
    |        └→ [send ---kick_pulse_global] (to Bass)
    |
[dict ---power_trio_brain]
```

### Configuration

- [ ] Input: MIDI notes from GrooveWanderer device
- [ ] Kick notes: 35, 36
- [ ] Snare notes: 37, 38, 40
- [ ] Hats: 42, 44, 46, 51, 59
- [ ] Perc: 41, 43, 45, 47, 48, 49, 52, 55, 57

### Validation

- [ ] GrooveWanderer plays → Bridge receives MIDI
- [ ] Inspect dict → `rhythm_pulses` updates
- [ ] Kick triggers → global send fires

---

## Track 5: Bass Follower 🔴 CRITICAL WIRING

### Required Objects

- [ ] `[node.script track_5_bass/bass_follower.js @autostart 1]`
- [ ] `[r ---kick_pulse_global]` (from Track 4)
- [ ] `[route dict note_out]`
- [ ] `[dict ---power_trio_brain]` (reference)
- [ ] `[prepend dict_response]` ⚠️ MANDATORY
- [ ] `[noteout]` (to bass synth)

### Wiring Pattern C: Client with Dict Reads (MANDATORY LOOP)

```
[r ---kick_pulse_global]
         |
[prepend kick_trigger]
         |
[node.script track_5_bass/bass_follower.js @autostart 1]
         |
   [route dict note_out]
      |        |
      |        └→ [noteout] (to bass synth)
      |
   [dict ---power_trio_brain]
      |              |
      | (left outlet)|
      |              ↓
      |    [prepend dict_response]
      |              |
      └──────────────┴→ [node.script] LEFT INLET ⚠️ CRITICAL
```

### Validation

- [ ] Load device after Track 4 Bridge
- [ ] Kick plays → Bass note plays
- [ ] Bass follows current chord from sequencer
- [ ] Max Console: If error appears, fix response loop

### Troubleshooting

| Issue | Fix |
|-------|-----|
| "BASS FOLLOWER WIRING ERROR" in console | Wire [dict] left outlet → [prepend dict_response] → node.script inlet |
| Bass doesn't play | Check kick_pulse_global receive; verify Bridge is sending |
| Wrong notes | Inspect dict transport::current_chord; verify Sequencer is running |
| No trigger | Verify Track 4 Bridge device is loaded and receiving drum MIDI |

---

## 🎛️ APC64 Hardware Integration

### All Track Devices (1, 2, 3)

For full APC64 feedback, add these outlets:

```
[node.script]
     |
[route dict sysex led note_out]
     |      |     |       |
     |      |     |       └→ [noteout] (basic LED)
     |      |     └→ [pack 0 0 0] → [noteout] (LED with channel)
     |      └→ [midiout] (display SysEx messages)
     └→ [dict ---power_trio_brain]
```

### LED Control Format

Script sends: `maxApi.outlet("led", note, color, channel)`

Max wiring option 1 (simple):
```
[route led]
    |
[noteout]  (assumes script formats as note-on)
```

Max wiring option 2 (explicit):
```
[route led]
    |
[unpack 0 0 0]
    |  |  |
[pack 0 0 0]  (note, velocity, channel)
    |
[noteout]
```

### SysEx Display Format

Script sends: `maxApi.outlet("sysex", ...bytes)`

Max wiring:
```
[route sysex]
    |
[midiout]  (sends SysEx to APC64)
```

---

## 🧪 Testing Sequence

### Phase 1: Global Brain
- [ ] Load Global Brain device
- [ ] Check Max Console for init message
- [ ] Inspect dict (double-click object)
- [ ] Verify all top-level keys exist

### Phase 2: Chord Lab
- [ ] Load Chord Lab device
- [ ] Press APC64 pad
- [ ] Check Console for chord info
- [ ] Inspect dict → clipboard::active_chord

### Phase 3: Sequencer
- [ ] Load Sequencer device (after Global Brain)
- [ ] Start transport
- [ ] Verify step LEDs advance
- [ ] Press pad → paste chord
- [ ] Check Console for any wiring errors

### Phase 4: Drums & Bass
- [ ] Load GrooveWanderer device
- [ ] Load Bridge device
- [ ] Load Bass Follower device
- [ ] Start playback
- [ ] Verify bass triggers on kicks
- [ ] Check bass follows chords

---

## 📝 Common Issues Reference

### "Cannot find module 'max-api'"

**Cause**: max-api installed via npm (wrong!)  
**Fix**: 
```bash
cd /Users/Matthew/PowerTrioArranger
npm uninstall max-api
```
Restart Max and Ableton.

### "No such object" when loading script

**Cause**: Max can't find PowerTrioArranger folder  
**Fix**: Add to Max search path:
1. Max → Preferences → File Preferences
2. Add: `/Users/Matthew/PowerTrioArranger`
3. Restart Max and Ableton

**OR**: Create Max Package symlink:
```bash
ln -s /Users/Matthew/PowerTrioArranger ~/Documents/Max\ 9/Packages/PowerTrioArranger
```

### Dict stays empty after Global Brain loads

**Causes**:
1. Script didn't run → Check @autostart 1 in Inspector
2. Init didn't execute → Wire loadbang → "script start"
3. Error in script → Check Max Console for error messages

### Sequencer/Bass "WIRING ERROR" in console

**Cause**: Dict response loop not wired  
**Fix**: Wire the critical return path:
```
[dict] left outlet → [prepend dict_response] → [node.script] left inlet
```

### APC64 display doesn't update

**Causes**:
1. SysEx outlet not wired → Add [route sysex] → [midiout]
2. MIDI port not set → Check midiout device settings
3. APC64 not in correct mode → Check APC64_SETUP.md

---

## 📚 Reference Documents

- **WIRING_GUIDE.md** — Detailed explanation of dict response loop
- **AMXD_BUILD_INSTRUCTIONS.md** — Build patterns A, B, C
- **APC64_PROTOCOL.md** — Complete hardware protocol
- **TROUBLESHOOTING.md** — max-api and path issues
- **USER_GUIDE.md** — Usage and functionality

---

## ✅ Final Checklist

Before reporting "devices work":

- [ ] Global Brain loads without errors
- [ ] Dict contains all required keys
- [ ] Chord Lab captures pad input
- [ ] Sequencer advances with transport
- [ ] Sequencer paste/clear operations work
- [ ] Bridge captures drum triggers
- [ ] Bass plays on kick triggers
- [ ] Bass follows chord changes
- [ ] No wiring errors in Max Console
- [ ] APC64 feedback working (display + LEDs)

# Device Alignment Checklist — Applying Code Enhancements to .amxd Files

**Purpose**: Align existing Max for Live devices with the enhanced JavaScript code  
**Time Required**: ~45-60 minutes (10-15 min per device)  
**Date**: 2026-02-01

---

## 📁 Device Locations

Your devices are in:
```
/Users/Matthew/Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect/
```

Files to update:
- Track_1_Chord_Lab.amxd
- Track_2_Sequencer.amxd
- Track_3_Global_Brain.amxd
- Track_4_Bridge.amxd
- Track_5_Bass_Follower.amxd

---

## 🔄 Alignment Process

### For Each Device:

1. **Open** the .amxd file in Max (right-click → Edit in Max for Live)
2. **Unlock** the patcher (click lock icon in bottom-left)
3. **Follow** the checklist for that specific device below
4. **Lock** the patcher when done
5. **Save** the device
6. **Test** the device (load it in Ableton and check Max Console)

---

## Device 1: Track_3_Global_Brain.amxd ⭐ DO THIS FIRST!

### Critical Changes:

#### ✅ 1. Update node.script Settings
- [ ] Click the `[node.script]` object to select it
- [ ] Open Inspector (Cmd+I or View → Inspector)
- [ ] Verify/set these properties:
  - **Script file**: `shared/dict_init.js` (NOT `../shared/dict_init.js`)
  - **@autostart**: `1` (must be 1, not 0)
  - **npminstall**: `0` (do not install packages)

#### ✅ 2. Remove Old Init Wiring (if present)
- [ ] Delete any `[loadbang]` → `[message init]` connection (no longer needed)
- [ ] Script self-initializes when @autostart is 1

#### ✅ 3. Verify Dict Wiring
Check these connections exist:
- [ ] `[node.script]` outlet → `[route dict]` inlet
- [ ] `[route dict]` outlet → `[dict ---power_trio_brain]` inlet

#### ✅ 4. Dict Response Loop (Optional for Global Brain)
This is optional since dict_init only writes. But if you want to add it:
- [ ] `[dict ---power_trio_brain]` LEFT outlet → `[prepend dict_response]` inlet
- [ ] `[prepend dict_response]` outlet → `[node.script]` LEFT inlet

### Testing:
```
1. Save and lock device
2. Load device in Ableton
3. Open Max Console (View → Max Console in patcher window)
4. Should see: "Power Trio Brain Initialized: Schema Loaded."
5. Double-click [dict ---power_trio_brain] → should see all keys with data
```

---

## Device 2: Track_1_Chord_Lab.amxd

### Critical Changes:

#### ✅ 1. Update node.script Settings
- [ ] Script file: `track_1_chord_lab/logic.js`
- [ ] @autostart: `1`
- [ ] npminstall: `0`

#### ✅ 2. Verify Input Wiring
- [ ] `[notein]` → `[prepend note_input]` → `[node.script]` left inlet
- [ ] `[ctlin]` → `[prepend cc_input]` → `[node.script]` left inlet

#### ✅ 3. Verify Output Routing
Add if missing:
- [ ] `[node.script]` outlet → `[route dict sysex led note_out]`

Route each output:
- [ ] `[route dict]` → `[dict ---power_trio_brain]` (NOT a new dict!)
- [ ] `[route sysex]` → `[midiout]` (for APC64 display)
- [ ] `[route led]` → LED handling → `[noteout]` (for APC64 LEDs)
- [ ] `[route note_out]` → `[noteout]` (basic feedback)

#### ✅ 4. Dict Response Loop (Optional)
Currently Chord Lab only writes to dict, but for future-proofing:
- [ ] `[dict ---power_trio_brain]` LEFT outlet → `[prepend dict_response]` → `[node.script]` LEFT inlet

### Testing:
```
1. Load device (AFTER Global Brain)
2. Max Console should show: "Chord Lab loaded. Listening for grid input (notes 36-75)."
3. Press APC64 pad → console shows chord info
4. Double-click dict → clipboard::active_chord updates
5. APC64 display shows chord name (if sysex wired)
```

---

## Device 3: Track_2_Sequencer.amxd 🔴 CRITICAL LOOP!

### Critical Changes:

#### ✅ 1. Update node.script Settings
- [ ] Script file: `track_2_sequencer/sequencer.js`
- [ ] @autostart: `1`
- [ ] npminstall: `0`

#### ✅ 2. Verify Input Wiring
- [ ] `[r ---transport_tick]` → `[prepend transport_tick]` → `[node.script]` left inlet
- [ ] `[notein]` → `[prepend note_input]` → `[node.script]` left inlet
- [ ] `[ctlin]` → `[prepend cc_input]` → `[node.script]` left inlet (optional)

#### ✅ 3. Verify Output Routing
- [ ] `[node.script]` outlet → `[route dict sysex led note_out]`
- [ ] `[route dict]` → `[dict ---power_trio_brain]`
- [ ] `[route sysex]` → `[midiout]`
- [ ] `[route led]` → `[noteout]`
- [ ] `[route note_out]` → `[noteout]`

#### ✅ 4. Dict Response Loop (MANDATORY!) 🔴
**This is the most important fix for Sequencer!**

Check if this loop exists:
```
[dict ---power_trio_brain]
      |
      | (LEFT outlet - red outlet on left side)
      |
      V
[prepend dict_response]
      |
      V
[node.script] (LEFT inlet - connect to leftmost inlet)
```

To add it:
- [ ] Click `[dict ---power_trio_brain]` object
- [ ] Find its LEFT outlet (leftmost outlet)
- [ ] Create a `[prepend dict_response]` object
- [ ] Connect: dict LEFT outlet → prepend inlet
- [ ] Connect: prepend outlet → node.script LEFT inlet

**Without this loop, the script will show "SEQUENCER WIRING ERROR" and won't work!**

### Testing:
```
1. Load device (AFTER Global Brain)
2. Console: "Sequencer loaded. Waiting for transport ticks and note input."
3. Start transport → step LEDs should advance (pads 36-51)
4. Press pad → chord pastes to step
5. Shift+pad → step clears
6. Console should NOT show "SEQUENCER WIRING ERROR"
7. If error shows: Dict response loop is missing! Go back to step 4.
```

---

## Device 4: Track_4_Bridge.amxd

### Critical Changes:

#### ✅ 1. Update node.script Settings
- [ ] Script file: `track_4_drums/groove_wanderer_bridge.js`
- [ ] @autostart: `1`
- [ ] npminstall: `0`

#### ✅ 2. Verify Input Wiring
Choose one input method:

**Method A: Direct MIDI from GrooveWanderer**
- [ ] `[notein]` → `[prepend drum_trigger]` → `[node.script]` left inlet
- [ ] Set `[notein]` to receive from GrooveWanderer device

**Method B: Global Receive**
- [ ] `[r ---drum_triggers]` → `[prepend drum_trigger]` → `[node.script]`

#### ✅ 3. Verify Output Routing
- [ ] `[node.script]` outlet → `[route dict kick_pulse]`
- [ ] `[route dict]` → `[dict ---power_trio_brain]`
- [ ] `[route kick_pulse]` → `[send ---kick_pulse_global]` (critical for bass!)

#### ✅ 4. Verify Global Send
Make sure this exists:
- [ ] `[send ---kick_pulse_global]` object (Bass Follower listens for this)

### Testing:
```
1. Load device (AFTER GrooveWanderer)
2. Console: "GrooveWanderer Bridge loaded. Monitoring drum triggers (notes 35-59)."
3. Play GrooveWanderer → Bridge receives MIDI
4. Double-click dict → rhythm_pulses updates (kick_pulse, snare_pulse, etc.)
5. Test global send: Add temp `[r ---kick_pulse_global]` → `[print KICK]` to see kicks
```

---

## Device 5: Track_5_Bass_Follower.amxd 🔴 CRITICAL LOOP!

### Critical Changes:

#### ✅ 1. Update node.script Settings
- [ ] Script file: `track_5_bass/bass_follower.js`
- [ ] @autostart: `1`
- [ ] npminstall: `0`

#### ✅ 2. Verify Input Wiring
- [ ] `[r ---kick_pulse_global]` → `[prepend kick_trigger]` → `[node.script]` left inlet
- [ ] Optional: `[ctlin]` → `[prepend cc_input]` (for hierarchy control)

#### ✅ 3. Verify Output Routing
- [ ] `[node.script]` outlet → `[route dict note_out]`
- [ ] `[route dict]` → `[dict ---power_trio_brain]`
- [ ] `[route note_out]` → `[noteout]` (to bass synth/sampler on same track)

#### ✅ 4. Dict Response Loop (MANDATORY!) 🔴
**This is critical for bass to play!**

Same as Sequencer:
```
[dict ---power_trio_brain]
      |
      | (LEFT outlet)
      |
      V
[prepend dict_response]
      |
      V
[node.script] (LEFT inlet)
```

To add:
- [ ] Find `[dict ---power_trio_brain]` object
- [ ] Create `[prepend dict_response]` object below it
- [ ] Connect: dict LEFT outlet → prepend inlet
- [ ] Connect: prepend outlet → node.script LEFT inlet

**Without this loop, bass won't play and console will show error!**

### Testing:
```
1. Load device (AFTER Global Brain and Bridge)
2. Console: "Bass Follower loaded. Listening for kick triggers from Track 4 Bridge."
3. Play GrooveWanderer + start Sequencer
4. When kick plays → bass note should play
5. Bass should follow chord changes
6. Console should NOT show "BASS FOLLOWER WIRING ERROR"
7. If error shows: Dict response loop is missing! Go back to step 4.
```

---

## 🎨 Optional: APC64 LED/Display Enhancement

If you want full APC64 integration (display + LED feedback), add this to Tracks 1, 2:

### LED Control (for blinking/pulsing pads)

Add after `[route led]`:
```
[route led]
    |
[unpack 0 0 0]  (note, velocity, channel)
    |  |  |
[pack 0 0 0]    (repack for MIDI)
    |
[noteout]       (send with channel for animation)
```

### Display Control (for chord names on screen)

Already routed if you have:
```
[route sysex] → [midiout]
```

Make sure `[midiout]` is set to send to your APC64 MIDI port.

---

## 📋 Final Verification

After updating all devices:

### 1. Load Sequence Test
- [ ] Close all devices in Ableton
- [ ] Load Global Brain → check console
- [ ] Load Chord Lab → check console
- [ ] Load Sequencer → check console
- [ ] Load Bridge → check console
- [ ] Load Bass Follower → check console

All should show their startup messages with NO errors.

### 2. Functionality Test
- [ ] **Chord Lab**: Press pad → chord appears in dict
- [ ] **Sequencer**: Transport runs → steps advance
- [ ] **Sequencer**: Press pad → chord pastes
- [ ] **Bridge**: GrooveWanderer plays → pulses captured
- [ ] **Bass**: Kicks play → bass notes play
- [ ] **Bass**: Chord changes → bass notes change

### 3. Error Check
Open Max Console and verify NO errors like:
- ❌ "SEQUENCER WIRING ERROR"
- ❌ "BASS FOLLOWER WIRING ERROR"
- ❌ "Cannot find module 'max-api'"
- ❌ "No such object"

If any errors appear, go back to that device's section above.

---

## 🔧 Common Issues & Quick Fixes

### Issue: "Cannot find module 'max-api'"
**Fix**: 
```bash
cd /Users/Matthew/PowerTrioArranger
npm uninstall max-api
```
Restart Max and Ableton.

### Issue: "No such object" when loading script
**Fix**: 
1. Max → Preferences → File Preferences
2. Add: `/Users/Matthew/PowerTrioArranger`
3. Restart Max and Ableton

### Issue: "SEQUENCER WIRING ERROR" or "BASS FOLLOWER WIRING ERROR"
**Fix**: Add dict response loop (see steps 4 in Sequencer/Bass sections)

### Issue: Node script doesn't start
**Fix**: Set @autostart 1 in Inspector, or add:
```
[loadbang] → [message "script start"] → [node.script]
```

### Issue: Dict stays empty
**Fix**: Check Global Brain @autostart setting and script path

### Issue: Bass doesn't play
**Fix 1**: Check dict response loop is connected
**Fix 2**: Verify kick trigger input: `[r ---kick_pulse_global]`
**Fix 3**: Check Bridge is sending: `[send ---kick_pulse_global]`

---

## 📚 Reference

- **Templates**: See `max_templates/` folder for complete wiring diagrams
- **Quick Fix**: [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md)
- **Detailed Wiring**: [DEVICE_WIRING_CHECKLIST.md](DEVICE_WIRING_CHECKLIST.md)
- **Changes**: [IMPLEMENTATION_CHANGES_SUMMARY.md](IMPLEMENTATION_CHANGES_SUMMARY.md)

---

## ✅ Success Criteria

When properly aligned, you'll see in Max Console:

```
Power Trio Brain Initialized: Schema Loaded.
Chord Lab loaded. Listening for grid input (notes 36-75).
Sequencer loaded. Waiting for transport ticks and note input.
GrooveWanderer Bridge loaded. Monitoring drum triggers (notes 35-59).
Bass Follower loaded. Listening for kick triggers from Track 4 Bridge.
```

And the system will work end-to-end:
- Pads control chords
- Sequencer plays progression
- Drums trigger bass
- Bass follows harmony

Good luck! 🎉

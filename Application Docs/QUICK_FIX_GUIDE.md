# Quick Fix Guide for Max for Live Devices

**Goal**: Get all 5 devices working correctly in < 30 minutes

---

## ⚡ Quick Checks (5 minutes)

### 1. Verify max-api is NOT installed via npm
```bash
cd /Users/Matthew/PowerTrioArranger
npm uninstall max-api  # If it exists, this will remove it
```
**Restart Max and Ableton after this.**

### 2. Verify Max can find the project
```bash
ls ~/Documents/Max\ 9/Packages/ | grep PowerTrioArranger
```

If nothing appears, create symlink:
```bash
ln -s /Users/Matthew/PowerTrioArranger ~/Documents/Max\ 9/Packages/PowerTrioArranger
```
**Restart Max and Ableton after this.**

---

## 🔧 Device Fixes (25 minutes, 5 min per device)

### Track 3: Global Brain (5 min)

**Open** `Track_3_Global_Brain.amxd` in Max

**Check/Fix**:
1. [ ] Node.script script path is `shared/dict_init.js`
2. [ ] Select node.script → Inspector (cmd+I) → `@autostart` = `1`
3. [ ] Wiring: node.script outlet → `[route dict]` → `[dict ---power_trio_brain]`
4. [ ] **Remove** any `[loadbang] → [message init]` wiring (not needed)

**Test**: Load device → Max Console should show:
```
Power Trio Brain Initialized: Schema Loaded.
```

**If error**: Check script path, verify Max can find PowerTrioArranger folder.

---

### Track 1: Chord Lab (5 min)

**Open** `Track_1_Chord_Lab.amxd` in Max

**Check/Fix**:
1. [ ] Node.script path is `track_1_chord_lab/logic.js`
2. [ ] @autostart = 1
3. [ ] `[notein] → [prepend note_input] → node.script`
4. [ ] `[ctlin] → [prepend cc_input] → node.script`
5. [ ] `node.script outlet → [route dict] → [dict ---power_trio_brain]`

**Optional (for APC64 display)**:
6. [ ] `node.script → [route sysex] → [midiout]`
7. [ ] `node.script → [route note_out] → [noteout]`

**Test**: Load device → Console shows:
```
Chord Lab loaded. Listening for grid input (notes 36-75).
```

**Test functionality**: Press an APC64 pad → Console shows chord info.

---

### Track 2: Sequencer (5 min) 🔴 CRITICAL WIRING

**Open** `Track_2_Sequencer.amxd` in Max

**Check/Fix**:
1. [ ] Node.script path is `track_2_sequencer/sequencer.js`
2. [ ] @autostart = 1
3. [ ] `[r ---transport_tick] → [prepend transport_tick] → node.script`
4. [ ] `[notein] → [prepend note_input] → node.script`
5. [ ] `node.script outlet → [route dict] → [dict ---power_trio_brain]`

**CRITICAL (dict response loop)**:
6. [ ] **Find** the `[dict ---power_trio_brain]` object
7. [ ] **Find** its LEFT outlet (should have a cable coming out)
8. [ ] **Add** `[prepend dict_response]` object
9. [ ] **Wire**: dict LEFT outlet → prepend → node.script LEFT inlet

```
        [node.script]
             |
        [route dict]
             |
    [dict ---power_trio_brain]
      |              |
      | (left outlet)|
      ↓              ↓
(to other stuff) [prepend dict_response]
                     |
                     ↓
              [node.script] ← LEFT INLET
```

**Test**: Load device → Console shows:
```
Sequencer loaded. Waiting for transport ticks and note input.
```

**Test functionality**: 
- Start transport → step LEDs should advance
- Press pad → chord should paste
- **If "WIRING ERROR" appears**: Fix step 6-9 above

---

### Track 4: Bridge (5 min)

**Open** `Track_4_Bridge.amxd` in Max

**Check/Fix**:
1. [ ] Node.script path is `track_4_drums/groove_wanderer_bridge.js`
2. [ ] @autostart = 1
3. [ ] Input: `[notein]` (from GrooveWanderer) → `[prepend drum_trigger]` → node.script
4. [ ] `node.script → [route dict kick_pulse] → [dict ---power_trio_brain]`
5. [ ] **Add**: `[route kick_pulse]` → `[send ---kick_pulse_global]`

**Test**: Load device → Console shows:
```
GrooveWanderer Bridge loaded. Monitoring drum triggers (notes 35-59).
```

**Test functionality**: Play GrooveWanderer → Bridge should receive triggers.

---

### Track 5: Bass Follower (5 min) 🔴 CRITICAL WIRING

**Open** `Track_5_Bass_Follower.amxd` in Max

**Check/Fix**:
1. [ ] Node.script path is `track_5_bass/bass_follower.js`
2. [ ] @autostart = 1
3. [ ] `[r ---kick_pulse_global] → [prepend kick_trigger] → node.script`
4. [ ] `node.script → [route dict note_out]`
5. [ ] `[route note_out] → [noteout]` (to bass synth)

**CRITICAL (dict response loop)**:
6. [ ] Same as Sequencer: dict LEFT outlet → `[prepend dict_response]` → node.script LEFT inlet

```
        [node.script]
             |
        [route dict note_out]
          |          |
          |          └→ [noteout]
          |
    [dict ---power_trio_brain]
      |              |
      | (left outlet)|
      ↓              ↓
(to other stuff) [prepend dict_response]
                     |
                     ↓
              [node.script] ← LEFT INLET
```

**Test**: Load device → Console shows:
```
Bass Follower loaded. Listening for kick triggers from Track 4 Bridge.
```

**Test functionality**: 
- Play GrooveWanderer + Sequencer → Bass should play on kicks
- **If "WIRING ERROR" appears**: Fix step 6 above

---

## ✅ Final Test (5 min)

### Load Order Test
1. [ ] Close all devices
2. [ ] Load Global Brain FIRST
3. [ ] Check Console for init message
4. [ ] Load all other devices
5. [ ] Check Console for each device's startup message

### Functionality Test
1. [ ] **Chord Lab**: Press pad → chord in dict
2. [ ] **Sequencer**: Start transport → steps advance
3. [ ] **Sequencer**: Press pad → chord pastes
4. [ ] **Bridge**: GrooveWanderer plays → pulses captured
5. [ ] **Bass**: Kick triggers → bass note plays

### Console Check
Open Max Console and verify NO ERROR messages like:
- ❌ "WIRING ERROR"
- ❌ "Cannot find module"
- ❌ "No such object"

If errors appear, check the specific device section above.

---

## 🆘 Emergency Troubleshooting

### "Cannot find module 'max-api'"
```bash
cd /Users/Matthew/PowerTrioArranger
npm uninstall max-api
rm -rf node_modules/max-api
```
Restart Max/Ableton.

### "No such object" when loading script
1. Max → Preferences → File Preferences
2. Add path: `/Users/Matthew/PowerTrioArranger`
3. Restart Max/Ableton

### Dict stays empty after Global Brain loads
1. Select node.script object
2. Inspector → Check @autostart is `1`
3. Try: `[loadbang] → [message "script start"] → node.script`

### "SEQUENCER WIRING ERROR" or "BASS FOLLOWER WIRING ERROR"
**Fix**: Add dict response loop (steps 6-9 in respective sections above).

This is the #1 issue. Without it, scripts that read from dict will hang.

### Sequencer steps don't advance
**Fix**: Verify transport input is connected:
```
[r ---transport_tick] → [prepend transport_tick] → node.script
```

### Bass doesn't play
**Fix 1**: Check dict response loop (step 6 above)  
**Fix 2**: Verify kick trigger input:
```
[r ---kick_pulse_global] → [prepend kick_trigger] → node.script
```
**Fix 3**: Check Bridge is sending: add `[send ---kick_pulse_global]`

---

## 📄 More Help

- Full guide: [DEVICE_WIRING_CHECKLIST.md](DEVICE_WIRING_CHECKLIST.md)
- Changes summary: [IMPLEMENTATION_CHANGES_SUMMARY.md](IMPLEMENTATION_CHANGES_SUMMARY.md)
- Original instructions: [AMXD_BUILD_INSTRUCTIONS.md](AMXD_BUILD_INSTRUCTIONS.md)
- Troubleshooting: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

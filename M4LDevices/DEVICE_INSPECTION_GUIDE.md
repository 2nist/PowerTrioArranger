# Device Analysis & Alignment Instructions

## Status: Binary Files Detected

The .amxd files in `/Users/Matthew/PowerTrioArranger/Application Docs/M4LDevices/` are in binary format (compressed Max patchers) and cannot be directly edited as text files.

---

## How to Align Devices

### Option 1: Manual Alignment in Max (Recommended)

Follow these steps for each device:

1. **Open** the .amxd file from: `/Users/Matthew/PowerTrioArranger/Application Docs/M4LDevices/Track_X_*.amxd`
   - Double-click to open in Ableton
   - Right-click → "Edit" to open in Max

2. **Follow** the detailed checklist in: [DEVICE_ALIGNMENT_PROCEDURE.md](DEVICE_ALIGNMENT_PROCEDURE.md)

3. **Save** the changes

4. **Test** according to the validation steps

---

## Option 2: Rebuild from Templates

If devices are broken or heavily modified, rebuild them:

1. **Create** new Max Audio Effect patcher
2. **Copy** the wiring from templates in `max_templates/` folder:
   - Track_1_ChordLab_Template.txt
   - Track_2_Sequencer_Template.txt
   - Track_3_GlobalBrain_Template.txt
   - Track_4_Bridge_Template.txt
   - Track_5_BassFollower_Template.txt

3. **Save as** .amxd file with correct name
4. **Replace** old device in Ableton

---

## Critical Alignment Points

For each device, verify these specific items:

### Track_3_Global_Brain.amxd
✅ **Must Fix**:
- [ ] node.script path: `shared/dict_init.js`
- [ ] @autostart: 1
- [ ] Remove any [loadbang] → [message init] wiring
- [ ] Wiring: node.script → [route dict] → [dict ---power_trio_brain]

### Track_1_Chord_Lab.amxd
✅ **Must Fix**:
- [ ] node.script path: `track_1_chord_lab/logic.js`
- [ ] @autostart: 1
- [ ] Input: [notein] → [prepend note_input] → node.script
- [ ] Input: [ctlin] → [prepend cc_input] → node.script
- [ ] Output: node.script → [route dict sysex led note_out]
- [ ] Dict: [route dict] → [dict ---power_trio_brain] (reference, not new!)

### Track_2_Sequencer.amxd
✅ **Must Fix**:
- [ ] node.script path: `track_2_sequencer/sequencer.js`
- [ ] @autostart: 1
- [ ] Input: [r ---transport_tick] → [prepend transport_tick] → node.script
- [ ] Input: [notein] → [prepend note_input] → node.script
- [ ] Output: node.script → [route dict sysex led note_out]
- [ ] 🔴 **CRITICAL**: Dict response loop:
  ```
  [dict ---power_trio_brain] LEFT outlet 
  → [prepend dict_response] 
  → [node.script] LEFT inlet
  ```

### Track_4_Bridge.amxd
✅ **Must Fix**:
- [ ] node.script path: `track_4_drums/groove_wanderer_bridge.js`
- [ ] @autostart: 1
- [ ] Input: [notein] → [prepend drum_trigger] → node.script
- [ ] Output: node.script → [route dict kick_pulse]
- [ ] Global send: [route kick_pulse] → [send ---kick_pulse_global]

### Track_5_Bass_Follower.amxd
✅ **Must Fix**:
- [ ] node.script path: `track_5_bass/bass_follower.js`
- [ ] @autostart: 1
- [ ] Input: [r ---kick_pulse_global] → [prepend kick_trigger] → node.script
- [ ] Output: node.script → [route dict note_out] → [noteout]
- [ ] 🔴 **CRITICAL**: Dict response loop:
  ```
  [dict ---power_trio_brain] LEFT outlet 
  → [prepend dict_response] 
  → [node.script] LEFT inlet
  ```

---

## Validation Script

After aligning devices, run this test sequence:

1. **Open Ableton** with empty set
2. **Load devices** in order:
   - Track 3: Global Brain (wait for init message)
   - Track 1: Chord Lab
   - Track 2: Sequencer
   - Track 4: Bridge
   - Track 5: Bass Follower

3. **Check Max Console** for these messages:
   ```
   Power Trio Brain Initialized: Schema Loaded.
   Chord Lab loaded. Listening for grid input (notes 36-75).
   Sequencer loaded. Waiting for transport ticks and note input.
   GrooveWanderer Bridge loaded. Monitoring drum triggers (notes 35-59).
   Bass Follower loaded. Listening for kick triggers from Track 4 Bridge.
   ```

4. **Test functionality**:
   - Press APC64 pad → chord in dict
   - Start transport → sequencer steps advance
   - Press sequencer pad → chord pastes
   - Play drums → bass triggers

5. **Check for errors**:
   - NO "WIRING ERROR" messages should appear
   - If they do: Follow the fix in the error message

---

## Quick Inspection Tool

To quickly check if a device needs alignment, open it and verify:

1. **Script path** (click node.script, check Inspector):
   - Should be relative: `shared/dict_init.js`
   - NOT absolute or `../` paths

2. **@autostart** (in Inspector):
   - Should be `1`
   - NOT `0`

3. **Response loop** (for Sequencer and Bass only):
   - Look for `[prepend dict_response]` object
   - Trace connection from dict LEFT outlet to node.script LEFT inlet
   - If missing: ADD IT (critical for operation)

---

## Next Steps

1. Open each .amxd file in Max
2. Follow [DEVICE_ALIGNMENT_PROCEDURE.md](DEVICE_ALIGNMENT_PROCEDURE.md)
3. Make the critical fixes listed above
4. Save and test
5. Verify with validation script

The enhanced JavaScript code is already in place and will automatically:
- Show helpful console messages when devices load
- Detect missing wiring and show error messages
- Initialize APC64 display (if wired)
- Clear LEDs on startup

All you need to do is align the Max patcher wiring to match! 🎯

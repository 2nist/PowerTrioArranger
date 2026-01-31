# PowerTrioArranger - Master Build Order

## 🎯 Mission Overview

You are building a **5-track intelligent music arranger** for Ableton Live using Max for Live, Node.js, and the APC64 controller.

**Build Duration**: ~6-8 hours (including testing)  
**Deployment Method**: Sequential job tickets fed to Cursor AI  
**Architecture**: Max for Live + Node.js (max-api) + Global Dictionary

---

## 📋 Pre-Flight Checklist

Before starting, ensure you have:

- [ ] Ableton Live 11+ installed
- [ ] Max for Live installed
- [ ] Node.js installed (v14+ recommended)
- [ ] Akai APC64 controller connected
- [ ] Text editor or Cursor AI ready
- [ ] All 7 job ticket .md files downloaded

---

## 🚀 Build Sequence

### **Phase 0: Setup (15 minutes)**

**Action**: Create workspace and install dependencies

```bash
# Create project directory
mkdir PowerTrioArranger
cd PowerTrioArranger

# Initialize npm project
npm init -y

# Install max-api
npm install max-api

# Create folder structure (will be automated in Phase 1)
mkdir -p shared track_1_chord_lab track_2_sequencer track_3_conductor track_4_drums track_5_bass hardware
```

**Validation**:
- [ ] `node_modules/max-api` exists
- [ ] `package.json` created
- [ ] All folders exist

---

### **Phase 1: Infrastructure (30 minutes)**

**Job Ticket**: Feed `00_MAX_PATCHER_TEMPLATE.md` to Cursor

**What Gets Built**:
1. Max patcher template (`PowerTrioArranger_Template.maxpat`)
2. JavaScript boilerplate (`shared/script_template.js`)
3. Test patcher (`_test_dictionary_loop.maxpat`)

**Manual Steps After Cursor Completes**:
1. Open `_test_dictionary_loop.maxpat` in Max
2. Create a `[dict ---power_trio_brain]` object
3. Test the response loop:
   ```
   Click [loadbang] → Check Max console for "Script loaded"
   ```

**Validation**:
- [ ] Template patcher opens without errors
- [ ] Node.js script loads (check Max console)
- [ ] Dictionary object exists
- [ ] Response loop works (test by sending manual messages)

---

**Job Ticket**: Feed `01_INFRASTRUCTURE.md` to Cursor

**What Gets Built**:
1. Complete folder structure
2. Global dictionary schema (JSON)
3. `shared/dict_helpers.js` - Dictionary utility functions
4. `shared/music_theory.js` - Music theory stubs
5. Dictionary initialization script or patcher

**Manual Steps After Cursor Completes**:
1. Run the dictionary initialization script
2. Verify schema in Max:
   ```
   Create [dict ---power_trio_brain]
   Double-click to view contents
   ```

**Validation**:
- [ ] Dictionary contains all keys: `transport`, `clipboard`, `sequencer_buffer`, `song_structure`
- [ ] `dict_helpers.js` exports read/write functions
- [ ] All folders from design doc exist

**Expected Output Structure**:
```
PowerTrioArranger/
├── package.json
├── node_modules/
├── shared/
│   ├── script_template.js
│   ├── dict_helpers.js
│   └── music_theory.js
├── track_1_chord_lab/
├── track_2_sequencer/
├── track_3_conductor/
├── track_4_drums/
├── track_5_bass/
└── hardware/
```

---

### **Phase 2: Harmonic Engine (45 minutes)**

**Job Ticket**: Feed `02_TRACK_1_CHORD_LAB.md` to Cursor

**What Gets Built**:
1. `track_1_chord_lab/logic.js` - Main script
2. Functions:
   - `buildChord(column, row)` - Converts grid input to chord data
   - `applyVoicingSpread(notes, spreadValue)` - Octave spreading
   - `applyInversion(notes, inversionValue)` - Chord inversions

**Manual Steps After Cursor Completes**:
1. Copy `PowerTrioArranger_Template.maxpat` → `Track_1_ChordLab.maxpat`
2. Update `[node.script PLACEHOLDER.js]` → `[node.script track_1_chord_lab/logic.js]`
3. Add MIDI routing:
   ```
   [notein] → [prepend note_input] → [node.script] inlet
   [ctlin] → [prepend cc_input] → [node.script] inlet
   ```
4. Save as Max for Live device (`.amxd`)
5. Drag into Ableton Track 1

**Testing Protocol**:
```
Test 1: Press APC64 pad (Column 0, Row 1) - should be C Major Triad
  → Check Max console for log
  → Check dictionary: clipboard::active_chord should show:
     {"root":"C", "quality":"maj", "notes":[60,64,67]}

Test 2: Move Fader 1 (CC 20) to 127
  → Check dictionary: voicing_spread should update
  → Notes should spread across octaves

Test 3: Move Fader 2 (CC 21) to 64
  → Notes array should reorder (1st inversion)
```

**Validation**:
- [ ] Any pad press updates `clipboard::active_chord`
- [ ] Column 0-6 map to correct scale degrees (I-vii)
- [ ] Row 0-4 produce correct chord complexities
- [ ] Fader 1 spreads voicing
- [ ] Fader 2 inverts chord

---

### **Phase 3: Rhythm Engine (45 minutes)**

**Job Ticket**: Feed `03_TRACK_2_SEQUENCER.md` to Cursor

**What Gets Built**:
1. `track_2_sequencer/sequencer.js` - Main script
2. Functions:
   - `pasteChordToStep(step, chordData)` - Copy/paste workflow
   - `clearStep(step)` - Erases step data
   - `playStep(step)` - Transport playback
   - `updateLEDs(current_step)` - Visual feedback

**Manual Steps After Cursor Completes**:
1. Copy template → `Track_2_Sequencer.maxpat`
2. Update node.script path
3. Add transport routing:
   ```
   [live.step] or [metro] → [counter 0 15] → [prepend transport_tick] → [node.script]
   ```
4. Add MIDI feedback routing:
   ```
   [node.script] outlet 2 → [route midiout] → [noteout] (back to APC64)
   ```
5. Save as `.amxd`, drag to Ableton Track 2

**Testing Protocol**:
```
Test 1: Paste Workflow
  → Press Track 1 pad (select C Major)
  → Press Track 2 pad (note 36 = step 0)
  → Check dictionary: sequencer_buffer[0] should contain chord data
  → APC64 pad should light up

Test 2: Playback
  → Start Ableton transport
  → Verify transport_tick increments (0-15 loop)
  → Step 0 plays → Should hear/see MIDI note output
  → Check dictionary: transport::current_chord updates

Test 3: Clear Step
  → Press Shift + Track 2 pad
  → Dictionary entry should become null
  → LED should turn off
```

**Validation**:
- [ ] Pads store chords correctly
- [ ] Transport plays back stored steps
- [ ] Empty steps are skipped
- [ ] LEDs provide visual feedback
- [ ] All 16 steps function independently

---

### **Phase 4: Arrangement Engine (60 minutes)**

**Job Ticket**: Feed `04_TRACK_3_CONDUCTOR.md` to Cursor

**What Gets Built**:
1. `track_3_conductor/arranger_playlist.js` - Pattern palette & timeline
2. `track_3_conductor/lom_exporter.js` - Live Object Model integration
3. Functions:
   - `savePattern(pattern_id)` - Stores sequencer_buffer
   - `placePattern(slot_id, pattern_id)` - Timeline placement
   - `exportToLive()` - Creates Session View scenes
   - `createScene(index, name, data)` - LOM scene creation
   - `populateChordClip(data)` - MIDI note writing

**Manual Steps After Cursor Completes**:
1. Copy template → `Track_3_Conductor.maxpat`
2. Update node.script path
3. Add LOM routing:
   ```
   [node.script] outlet → [route call_lom] → [live.path] → [live.object]
   ```
4. Add export trigger:
   ```
   [button "Export to Live"] → [prepend export_to_live] → [node.script]
   ```
5. Save as `.amxd`, drag to Ableton Track 3

**Testing Protocol**:
```
Test 1: Save Pattern
  → Create a chord sequence in Track 2 (steps 0-7)
  → Press Top Row Pad (note 92 = pattern 0)
  → Check dictionary: patterns::pattern_0 should exist
  → Top row LED should light up

Test 2: Timeline Placement
  → Press main grid pad (note 36 = bar 0, layer 0)
  → Check dictionary: song_structure array should have entry
  → Grid LED should light with color indicating pattern

Test 3: Export to Live
  → Click "Export" button
  → Check Ableton Session View
  → New scenes should appear with MIDI clips
  → Clips should contain chord data from patterns
```

**Validation**:
- [ ] Patterns save successfully (8 slots)
- [ ] Timeline grid accepts pattern placement
- [ ] song_structure array populates correctly
- [ ] LOM export creates actual Live scenes
- [ ] MIDI clips contain correct note data

**Common Issues**:
- **LOM fails silently**: Add `maxApi.post()` logging in lom_exporter.js
- **Clips are empty**: Verify note timing is in quarter-note units (0.25 per 16th)
- **Wrong track**: Double-check track indices (0-indexed in LOM)

---

### **Phase 5: Rhythm Section (60 minutes)**

**Job Ticket**: Feed `05_RHYTHM_SECTION_LOGIC.md` to Cursor

**What Gets Built**:
1. `track_4_drums/groove_wanderer_bridge.js` - Pulse broadcaster
2. `track_5_bass/bass_follower.js` - Harmonic follower
3. Functions (Bass):
   - `filterByHierarchy(chord, fader_value)` - Tone selection
   - `generateBassNote(chord, beat_position)` - Note picker
   - `calculateApproachNote(current, next)` - Chromatic motion
   - `onKickHit()` / `onSnareHit()` - Rhythm responders

**Manual Steps After Cursor Completes**:

**Track 4 (Drums)**:
1. Open existing GrooveWanderer device
2. Create new patcher next to it: `Drum_Pulse_Bridge.maxpat`
3. Route GrooveWanderer MIDI output:
   ```
   [GrooveWanderer noteout] → [split 36 38] 
       ↓ (note 36)          ↓ (note 38)
   [s ---kick_pulse]    [s ---snare_pulse]
   ```
4. Add node.script with bridge.js if needed
5. Save, drag to Track 4

**Track 5 (Bass)**:
1. Copy template → `Track_5_Bass.maxpat`
2. Update node.script → `track_5_bass/bass_follower.js`
3. Add pulse receivers:
   ```
   [r ---kick_pulse] → [prepend kick_pulse] → [node.script]
   [r ---snare_pulse] → [prepend snare_pulse] → [node.script]
   ```
4. Add chord listener:
   ```
   [dict ---power_trio_brain] → (watch transport::current_chord)
   ```
5. Add MIDI output to bass synth:
   ```
   [node.script] outlet → [route midiout] → [noteout] → [Bass Synth]
   ```
6. Map Faders (CC 28, 29) for controls
7. Save as `.amxd`, drag to Track 5

**Testing Protocol**:
```
Test 1: Drum Pulses
  → Play GrooveWanderer
  → Check Max console: Should see kick_pulse/snare_pulse messages
  → Check dictionary: rhythm_pulses should update

Test 2: Bass Follows Kicks
  → Ensure Track 2 sequencer is playing (has chords)
  → Start transport
  → On kick hit → Bass should play root note
  → Check MIDI monitor on bass track

Test 3: Harmonic Filtering
  → Set Fader 1 (CC 28) to 0
  → Bass should only play root/5th
  → Set Fader 1 to 127
  → Bass should play all chord tones (3rds, 7ths)

Test 4: Approach Notes
  → Create sequence with chord change at bar 2
  → On last 16th of bar 1 → Bass plays chromatic approach
  → Should be half-step below next chord root
```

**Validation**:
- [ ] Kick pulses trigger bass root notes
- [ ] Snare pulses create ghosts or mutes
- [ ] Fader 1 filters harmonic content
- [ ] Fader 2 changes rhythm density
- [ ] Approach notes add melodic motion
- [ ] Bass stays in proper register (MIDI 28-52)

---

### **Phase 6: Hardware Integration (30 minutes)**

**Job Ticket**: Feed `06_APC64_HARDWARE_MAP.md` to Cursor

**What Gets Built**:
1. `hardware/apc64_constants.js` - Complete CC map + helpers

**Manual Steps After Cursor Completes**:
1. **Refactor ALL existing scripts**:
   ```javascript
   // In every .js file, add at top:
   const HW = require('../hardware/apc64_constants.js');
   
   // Replace all magic numbers:
   if (cc_number === 20) { ... }  // OLD
   if (cc_number === HW.T1_CC_VOICING_SPREAD) { ... }  // NEW
   ```

2. **Update all 5 track scripts**:
   - `track_1_chord_lab/logic.js`
   - `track_2_sequencer/sequencer.js`
   - `track_3_conductor/arranger_playlist.js`
   - `track_4_drums/groove_wanderer_bridge.js`
   - `track_5_bass/bass_follower.js`

**Testing Protocol**:
```
Test 1: Constant Validation
  → Open each .js file
  → Search for any number 20-43 or 36-99 (should find none)
  → All should use HW.CONSTANT_NAME

Test 2: Grid Helpers
  → Test: HW.gridNoteToPosition(60)
  → Should return: {column: 0, row: 3}
  → Test: HW.positionToGridNote(4, 2)
  → Should return: 60

Test 3: Full System Check
  → Press every pad → Verify all 64 respond correctly
  → Move every fader → Verify CC numbers match documentation
  → Check LED feedback → All pads light up on press
```

**Validation**:
- [ ] No magic numbers remain in any script
- [ ] All CC references use constants
- [ ] Grid math is centralized
- [ ] Helper functions work correctly
- [ ] System behaves identically to Phase 5

---

## 🧪 Final Integration Test

### **Full Workflow Test (30 minutes)**

Run this end-to-end scenario:

```
1. CHORD CREATION (Track 1)
   → Press Column 0, Row 1 (C Major Triad)
   → Press Column 4, Row 2 (G Dominant 7th)
   → Verify both appear in clipboard

2. SEQUENCE BUILDING (Track 2)
   → Paste C Major to steps 0-3
   → Paste G7 to steps 4-7
   → Start transport → Verify playback

3. PATTERN WORKFLOW (Track 3)
   → Save sequence as Pattern 0 (top row pad 0)
   → Place Pattern 0 in timeline slot (0, 0)
   → Export to Live → Verify scene creation

4. RHYTHM INTERACTION (Tracks 4 & 5)
   → Start full playback
   → Drums trigger → Bass follows kicks
   → Verify bass plays chord tones from sequencer
   → Test fader controls (harmonic filter, density)

5. ARRANGEMENT (Track 3)
   → Create 4 different patterns
   → Build 16-bar arrangement
   → Export full song structure
   → Play Session View scenes
```

**Success Criteria**:
- [ ] All 5 tracks respond to APC64 input
- [ ] Chord data flows through entire system
- [ ] Dictionary updates propagate correctly
- [ ] MIDI output is musical and correct
- [ ] Session View scenes play back arrangement
- [ ] No Max errors in console
- [ ] No JavaScript errors in console

---

## 📊 Validation Test Scripts

See `TEST_SCRIPTS.md` for automated validation code.

---

## 🐛 Troubleshooting Guide

### **"Script won't load" (node.script errors)**

**Symptoms**: Max console shows "Script not found" or JavaScript errors

**Solutions**:
1. Check file path in `[node.script]` is relative to patcher location
2. Verify `require('max-api')` is first line
3. Check `package.json` has max-api dependency
4. Try absolute path temporarily to verify script exists

---

### **"Dictionary not updating" (async issues)**

**Symptoms**: Values written but not appearing, or reads return undefined

**Solutions**:
1. Add logging to dict_response handler:
   ```javascript
   maxApi.addHandler('dict_response', (key, value) => {
     maxApi.post(`Received: ${key} = ${value}`);
   });
   ```
2. Verify `[route dict]` → `[dict]` → `[prepend dict_response]` loop exists
3. Check dictionary name is exactly `---power_trio_brain` (three dashes)
4. Ensure you're waiting for async response, not reading immediately

---

### **"No MIDI output" (routing issues)**

**Symptoms**: Pads pressed but no sound, LEDs don't light

**Solutions**:
1. Check `[noteout]` object is connected to outlet 2
2. Verify MIDI routing in Ableton (track monitoring = IN)
3. Add logging before midiout:
   ```javascript
   maxApi.post(`Sending MIDI: ${note}, ${velocity}`);
   maxApi.outlet('midiout', note, velocity);
   ```
4. Test with `[makenote]` → `[noteout]` to isolate issue

---

### **"LOM export fails" (Live API issues)**

**Symptoms**: No scenes created, or Max errors mentioning "path"

**Solutions**:
1. Verify Max for Live device is in an Ableton track
2. Check `[live.path]` syntax: `path live_set` not `live.set`
3. Add error handling in lom_exporter.js
4. Test with simpler LOM calls first (get BPM, track count)
5. Reference `Max9-LOM-en.pdf` for correct API syntax

---

### **"Transport not syncing" (timing issues)**

**Symptoms**: Sequencer plays wrong steps, or timing is off

**Solutions**:
1. Verify `[live.step]` is set to 16th note resolution
2. Check counter range is `[counter 0 15]` (16 steps)
3. Add transport logging:
   ```javascript
   maxApi.addHandler('transport_tick', (step) => {
     maxApi.post(`Step: ${step}`);
   });
   ```
4. Ensure Ableton's global quantization isn't interfering

---

## 📦 Deliverables Checklist

After completing all phases, you should have:

### **Max Patchers** (5 track devices + 1 template)
- [ ] `PowerTrioArranger_Template.maxpat`
- [ ] `Track_1_ChordLab.amxd`
- [ ] `Track_2_Sequencer.amxd`
- [ ] `Track_3_Conductor.amxd`
- [ ] `Track_4_DrumBridge.amxd` (optional)
- [ ] `Track_5_Bass.amxd`

### **JavaScript Files** (10+ scripts)
- [ ] `shared/script_template.js`
- [ ] `shared/dict_helpers.js`
- [ ] `shared/music_theory.js`
- [ ] `track_1_chord_lab/logic.js`
- [ ] `track_2_sequencer/sequencer.js`
- [ ] `track_3_conductor/arranger_playlist.js`
- [ ] `track_3_conductor/lom_exporter.js`
- [ ] `track_4_drums/groove_wanderer_bridge.js`
- [ ] `track_5_bass/bass_follower.js`
- [ ] `hardware/apc64_constants.js`

### **Ableton Project**
- [ ] 5-track template set
- [ ] Global dictionary initialized
- [ ] APC64 mapped correctly
- [ ] Test patterns saved
- [ ] Session View scenes functional

### **Documentation**
- [ ] README.md (project overview)
- [ ] HARDWARE_MAP.md (CC reference)
- [ ] WORKFLOW_GUIDE.md (user manual)
- [ ] This build order document

---

## 🎓 Learning Resources

- **Max for Live API**: `Max9-LOM-en.pdf` (included in project files)
- **max-api Docs**: https://github.com/Cycling74/max-api
- **Max Documentation**: Inside Max → Help → Max Documentation
- **Music Theory Reference**: `shared/music_theory.js` has inline comments

---

## 🎉 Success Metrics

Your system is complete when:

1. ✅ You can create a chord with one button press
2. ✅ You can sequence 16 chords in under 30 seconds
3. ✅ You can build an 8-bar arrangement in under 2 minutes
4. ✅ The bass and drums respond musically to your chord choices
5. ✅ You can export the entire arrangement to Ableton with one click
6. ✅ The system is stable (no crashes in 30-minute session)
7. ✅ The workflow feels intuitive (no reference to docs needed)

---

## 🚀 Next Steps After Build

Once the core system works:

1. **Add Key Selection** (Track 1): Allow changing from C Major to other keys
2. **Add Drum Patterns** (Track 4): GrooveWanderer preset recall
3. **Add Bass Articulations** (Track 5): Slides, hammer-ons, muted notes
4. **Add Undo/Redo** (All Tracks): Dictionary history stack
5. **Add Preset System** (Track 3): Save/load full arrangements
6. **Add Tempo Changes** (Track 3): Automate BPM in timeline
7. **Add Swing Control** (Track 2): Global groove feel

---

## 📞 Support

If you get stuck:

1. Check the `Troubleshooting Guide` section above
2. Review the specific job ticket for the phase you're on
3. Check Max console for errors (View → Max Console)
4. Add `maxApi.post()` logging liberally
5. Test each component in isolation before integration

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Total Estimated Time**: 6-8 hours (experienced) / 10-12 hours (learning)

---

## 🎯 Quick Start (If You're Impatient)

```bash
# 1. Setup
npm install max-api

# 2. Feed all 7 job tickets to Cursor in order

# 3. Create Max patchers from template

# 4. Test each track individually

# 5. Run full integration test

# 6. Make music!
```

Good luck, and enjoy building your intelligent arranger! 🎹🥁🎸

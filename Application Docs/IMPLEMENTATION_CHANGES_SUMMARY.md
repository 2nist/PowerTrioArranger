# Device Implementation Changes — Summary

**Date**: 2026-02-01  
**Goal**: Make Max for Live devices run as intended with proper wiring validation

---

## ✅ Changes Implemented

### 1. **Added Comprehensive Wiring Documentation**

All JavaScript files now have detailed header comments showing:
- Required Max patcher wiring diagrams (ASCII art)
- Input requirements (notein, ctlin, receives)
- Output routing (dict, sysex, led, note_out)
- Critical warnings about mandatory dict response loops

**Files updated:**
- [track_1_chord_lab/logic.js](track_1_chord_lab/logic.js)
- [track_2_sequencer/sequencer.js](track_2_sequencer/sequencer.js)
- [track_4_drums/groove_wanderer_bridge.js](track_4_drums/groove_wanderer_bridge.js)
- [track_5_bass/bass_follower.js](track_5_bass/bass_follower.js)
- [shared/dict_init.js](shared/dict_init.js)

### 2. **Automatic Wiring Validation**

Added timeout-based detection for missing dict response loops:

**Sequencer** (`track_2_sequencer/sequencer.js`):
- Detects if dict response loop is missing within 2 seconds
- Prints clear error message to Max Console with fix instructions
- Prevents silent failures where script appears to load but doesn't work

**Bass Follower** (`track_5_bass/bass_follower.js`):
- Detects if dict response loop is missing within 1 second
- Shows warning on first kick trigger if wiring incomplete
- Helps diagnose why bass isn't playing

### 3. **Improved dict_init.js Initialization**

Updated Global Brain initialization script:
- Added wiring diagram in header
- Clarified that NO init message is needed (self-initializes)
- Documented @autostart 1 requirement
- Added validation instructions

### 4. **Startup Console Messages**

All track scripts now print confirmation messages when loaded:
- **Chord Lab**: "Chord Lab loaded. Listening for grid input (notes 36-75)."
- **Sequencer**: "Sequencer loaded. Waiting for transport ticks and note input."
- **Bridge**: "GrooveWanderer Bridge loaded. Monitoring drum triggers (notes 35-59)."
- **Bass Follower**: "Bass Follower loaded. Listening for kick triggers from Track 4 Bridge."

Helps verify scripts are actually running and Max can find the files.

### 5. **APC64 Display Initialization**

Track scripts now attempt to send initial display messages:
- Tests if sysex output is properly wired
- Gracefully handles missing APC64 output (optional feature)
- Shows "Ready" message on successful wiring

### 6. **Comprehensive Documentation**

Created [DEVICE_WIRING_CHECKLIST.md](Application%20Docs/DEVICE_WIRING_CHECKLIST.md):
- Step-by-step wiring verification for each device
- Visual ASCII art diagrams for all wiring patterns
- Troubleshooting section for common issues
- Testing sequence to validate full system
- Quick reference for error messages

---

## 🎯 How This Helps

### Before Changes:
❌ Script loads but silently fails  
❌ No indication of missing wiring  
❌ Sequencer appears to work but hangs on paste  
❌ Bass doesn't play with no error message  
❌ Unclear why dict stays empty  

### After Changes:
✅ Clear console messages confirm scripts loaded  
✅ Automatic detection of missing dict response loop  
✅ Helpful error messages with exact fix instructions  
✅ Wiring diagrams in source code headers  
✅ Comprehensive checklist document for device building  
✅ Initialization tests for APC64 output  

---

## 📋 User Action Required

To apply these changes to the .amxd devices:

### 1. **Update Script Paths** (if needed)
Open each device in Max and verify node.script paths:
- Should be: `shared/dict_init.js`, `track_1_chord_lab/logic.js`, etc.
- NOT: `../shared/dict_init.js` or absolute paths

### 2. **Wire Dict Response Loops** (CRITICAL)

For **Track 2 Sequencer** and **Track 5 Bass Follower**:

```
[dict ---power_trio_brain] LEFT OUTLET
              ↓
   [prepend dict_response]
              ↓
   [node.script] LEFT INLET
```

Without this, scripts will show "WIRING ERROR" in console and won't work.

### 3. **Set Autostart**
For all node.script objects:
- Select the object
- Open Inspector (cmd+I)
- Set `@autostart` to `1`

### 4. **Wire APC64 Outputs** (optional but recommended)

For visual feedback, add to all track devices:

```
[node.script]
     |
[route dict sysex led note_out]
     |      |     |       |
     └→ dict   |     |       └→ [noteout]
           └→ [midiout]  |
                    └→ [pack] → [noteout]
```

### 5. **Test Load Order**
1. Load Global Brain FIRST
2. Check Max Console for "Power Trio Brain Initialized"
3. Load other devices in any order
4. Check Console for each device's startup message

---

## 🔍 Validation

After reopening the devices with updated scripts, check Max Console for:

```
Power Trio Brain Initialized: Schema Loaded.
Chord Lab loaded. Listening for grid input (notes 36-75).
Sequencer loaded. Waiting for transport ticks and note input.
GrooveWanderer Bridge loaded. Monitoring drum triggers (notes 35-59).
Bass Follower loaded. Listening for kick triggers from Track 4 Bridge.
```

If you see "WIRING ERROR" messages, follow the instructions in the error to fix the dict response loop.

---

## 📚 Reference Documents

- **[DEVICE_WIRING_CHECKLIST.md](Application%20Docs/DEVICE_WIRING_CHECKLIST.md)** — Complete wiring guide with troubleshooting
- **[AMXD_BUILD_INSTRUCTIONS.md](Application%20Docs/AMXD_BUILD_INSTRUCTIONS.md)** — Original build patterns
- **[WIRING_GUIDE.md](Application%20Docs/WIRING_GUIDE.md)** — Dict response loop explanation
- **[TROUBLESHOOTING.md](Application%20Docs/TROUBLESHOOTING.md)** — Common issues (max-api, paths)
- **[APC64_PROTOCOL.md](Application%20Docs/APC64_PROTOCOL.md)** — Hardware protocol reference

---

## 🚀 Next Steps

1. Open each .amxd device in Max
2. Verify script paths are correct
3. Add missing dict response loops (Sequencer + Bass)
4. Set @autostart 1 on all node.script objects
5. Add APC64 output routing (optional)
6. Test load sequence and check console messages
7. Follow DEVICE_WIRING_CHECKLIST.md for complete validation

The scripts will now actively help diagnose wiring issues instead of failing silently!

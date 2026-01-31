# Groove Wanderer M4L Device - Setup Guide

## 📦 Package Contents

Your Groove Wanderer device consists of:

1. **GrooveWanderer.amxd** - Max for Live device
2. **pattern_loader.js** - Library loading module
3. **pattern_selector.js** - Pattern selection engine
4. **note_generator.js** - MIDI note generator
5. **pattern_library_REFINED.json** - 1,844 analyzed drum patterns

---

## 🚀 Installation

### Step 1: Place Files in Max Search Path

**Mac:**
```
~/Documents/Max 8/Library/
  ├── pattern_loader.js
  ├── pattern_selector.js
  ├── note_generator.js
  └── pattern_library_REFINED.json
```

**Windows:**
```
Documents\Max 8\Library\
  ├── pattern_loader.js
  ├── pattern_selector.js
  ├── note_generator.js
  └── pattern_library_REFINED.json
```

### Step 2: Install the Device

1. Place `GrooveWanderer.amxd` anywhere in your Ableton User Library
2. Recommended location:
   - Mac: `~/Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect/`
   - Windows: `Documents\Ableton\User Library\Presets\MIDI Effects\Max MIDI Effect\`

### Step 3: Set Up in Ableton Live

1. Create a new MIDI track
2. Add `GrooveWanderer.amxd` to the track
3. Add a **Drum Rack** after the device
4. Map drum sounds to MIDI notes 35-59 (GM drum mapping):
   - 35-36: Kick
   - 37-38, 40: Snare
   - 42, 44, 46, 51: Hats/Ride
   - 41, 43, 45, 47, 48, 49, 52, 55, 57: Percussion/Toms/Crashes

---

## 🎛️ Device Controls

### Knob Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    GROOVE WANDERER v1.0                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Kick Cmplx    Kick Rate    Snare Cmplx  Snare Rate            │
│     [●--]        [--●]        [--●]        [●--]                │
│                                                                 │
│  Hats Cmplx    Hats Rate    Perc Cmplx   Perc Rate             │
│     [--●]        [●--]        [●--]        [--●]                │
│                                                                 │
│  Probabilistic Pattern Generator                               │
└─────────────────────────────────────────────────────────────────┘
```

### Knob Functions

**Kick Complexity** (0-127)
- Controls which kick patterns are selected
- 0 = Simple patterns (sparse, few notes)
- 64 = Medium complexity
- 127 = Complex patterns (syncopated, dense)

**Kick Change Rate** (0-127)
- How often the kick pattern changes
- 0 = Locked (never changes)
- 64 = Changes occasionally
- 127 = Changes every bar

**Snare Complexity** (0-127)
- Same as kick but for snare patterns

**Snare Change Rate** (0-127)
- Same as kick but for snare patterns

**Hats Complexity** (0-127)
- Same as kick but for hats/ride patterns

**Hats Change Rate** (0-127)
- Same as kick but for hats/ride patterns

**Percussion Complexity** (0-127)
- Same as kick but for percussion patterns

**Percussion Change Rate** (0-127)
- Same as kick but for percussion patterns

---

## 🎵 How It Works

### Pattern Library

The device loads 1,844 unique drum patterns from E-GMD dataset:
- **438 kick patterns** (complexity 0.05-1.0)
- **481 snare patterns** (complexity 0.05-1.0)
- **471 hats/ride patterns** (complexity 0.05-1.0)
- **454 percussion patterns** (fills and accents)

### Probabilistic Selection

When you adjust the complexity knob:
1. Device calculates "distance" from each pattern to target complexity
2. Patterns **closer** to target are **more likely** to be selected
3. Random weighted selection creates variation within the target range
4. Change rate controls selection probability per bar

### Example Flow

```
You set Kick Complexity = 80 (0.63 normalized)
                ↓
Device finds all kick patterns near 0.63 complexity
                ↓
Weights: Pattern @0.65 = high weight
         Pattern @0.62 = high weight
         Pattern @0.30 = low weight
         Pattern @0.90 = low weight
                ↓
Random selection favors high-weight patterns
                ↓
Pattern selected and sent to note generator
                ↓
MIDI notes output on transport beat
```

---

## ⚙️ Configuration

### Change Pattern Library Path

If your JSON file is not in the Max search path:

1. Open `GrooveWanderer.amxd` in Max (Edit button)
2. Find the `[message loadLibrary ...]` object
3. Change to absolute path:
   - Mac: `/Users/YourName/Documents/Max 8/Library/pattern_library_REFINED.json`
   - Windows: `C:/Users/YourName/Documents/Max 8/Library/pattern_library_REFINED.json`

### Adjust Timing Resolution

The device generates notes at **16th note** resolution. To change:

1. Open `note_generator.js`
2. Find: `var tolerance = 0.0625; // One 16th note`
3. Modify:
   - 8th notes: `0.125`
   - 32nd notes: `0.03125`
   - Triplets: `0.0833` (1/12 of a beat)

---

## 🐛 Troubleshooting

### "Library not loaded" Error

**Symptom:** Max console shows "File not found"

**Solution:**
1. Check file path in loadbang message
2. Verify `pattern_library_REFINED.json` is in Max search path
3. Try absolute path (see Configuration section)
4. Check Max console: `Options > Max Window` (Cmd+M / Ctrl+M)

---

### No MIDI Output

**Symptom:** Device loaded but no drum sounds

**Solution:**
1. Check transport is playing (space bar)
2. Verify Drum Rack is after the device
3. Check Max console for errors
4. Test: Open device editor and look for "beat" messages in console
5. Verify `midiout` is connected in patch

---

### Pattern Not Changing

**Symptom:** Same pattern plays continuously

**Solution:**
1. Increase "Change Rate" knob (should be > 0)
2. Check Max console for "pattern_selected" messages
3. Verify pattern_selector.js is loaded (no errors)
4. Try moving complexity knob to different value

---

### Wrong Timing / Notes Off-Beat

**Symptom:** Notes sound quantized incorrectly

**Solution:**
1. Verify transport is running
2. Check tempo in Live matches device tempo
3. Open note_generator.js and verify `beat()` function is being called
4. Increase tolerance if notes are missing: `var tolerance = 0.1;`

---

### Patterns Sound Identical

**Symptom:** Different patterns don't sound different

**Solution:**
1. This may be correct - patterns with similar complexity sound similar
2. Try extreme knob positions (0 and 127) to hear contrast
3. Increase Change Rate to cycle through more patterns
4. Check that library has variety: Look at STATS file

---

## 📊 Understanding Pattern Metadata

Each pattern has analysis metadata:

```json
{
  "id": "kick_6_rock_100_beat_4-4_1",
  "complexity_score": 0.45,
  "density_score": 0.78,
  "_analysis": {
    "genre_hint": "rock",
    "function": "fill",
    "feel": "straight"
  }
}
```

**Complexity Score** (0.0-1.0)
- Calculated from: syncopation (40%) + velocity variation (30%) + note density (30%)
- Low (0.0-0.3): Simple, on-beat, minimal variation
- Mid (0.3-0.7): Moderate syncopation and dynamics
- High (0.7-1.0): Complex, off-beat, dynamic

**Density Score** (0.0-1.0)
- Notes per beat normalized
- Low: Sparse (few hits)
- High: Busy (many notes)

**Genre Hint**
- Detected style: rock, funk, jazz, electronic, latin, general
- Based on backbeat, syncopation, and timing patterns

**Function**
- "beat": Foundation pattern (steady)
- "fill": Variation/transition pattern (punctuation)

**Feel**
- "straight": Quantized to grid
- "shuffled": Swung/off-grid timing

---

## 🎯 Usage Tips

### Creating Evolving Grooves

```
1. Set all Change Rates to 25-50 (moderate change)
2. Set Kick Complexity low (20-40)
3. Set Snare Complexity medium (50-70)
4. Let it play for 32 bars
5. Gradually increase all complexity knobs
6. Result: Groove builds from simple to complex
```

### Locking Foundation, Varying Fills

```
1. Set Kick Change Rate to 0 (locked)
2. Set Snare Change Rate to 0 (locked)
3. Set Hats/Perc rates to 80-100 (high variation)
4. Result: Steady foundation with varying top layer
```

### Finding "The One"

```
1. Set Complexity to target range
2. Set Change Rate to 100 (rapid change)
3. Listen for interesting patterns
4. When you hear a good one:
   - Set Change Rate to 0 (lock it)
   - Record MIDI output
   - Drag to clip slot
```

---

## 🔮 Next Steps

### Phase 2 Features (Coming Soon)

- **Ring Buffer**: Retroactive capture (Bird Birds style)
- **8 Buttons**: Freeze, Capture, Loop, Save, Export, Clear
- **Groove Pool**: Save/recall snapshots
- **Pattern Length Control**: Time signature morphing
- **Swing/Humanization**: Real-time feel adjustment
- **Velocity Scaling**: Dynamic range control

### Extending the Device

The modular JavaScript architecture makes it easy to add features:

1. **pattern_loader.js**: Handles library I/O
2. **pattern_selector.js**: Selection logic
3. **note_generator.js**: MIDI output

Want to add groove quantization? Modify `note_generator.js`
Want to add density control? Extend `pattern_selector.js`

---

## 📝 Developer Notes

### JavaScript Module Communication

```
pattern_loader.js
    ↓ (outlet 1: layer_patterns)
pattern_selector.js
    ↓ (outlet 1: set_pattern)
note_generator.js
    ↓ (outlet 0: MIDI)
makenote → midiout
```

### Adding New Knobs

1. Add `live.dial` object in Max patch
2. Connect to `prepend <param_name>`
3. Route to `pattern_selector.js`
4. Add to `knob_values` object in selector
5. Use in `selectPattern()` function

### Debugging

Enable verbose logging:
```javascript
// In any .js file, add:
function post_debug(msg) {
    post("[DEBUG] " + msg + "\n");
}

// Use throughout code:
post_debug("Pattern selected: " + pattern.id);
```

View in Max console: `Options > Max Window`

---

## 🆘 Support

### Check These First

1. **Max Console** - Most errors appear here
2. **File Paths** - 90% of issues are file not found
3. **Transport** - Device requires Live transport running
4. **MIDI Routing** - Verify Drum Rack is after device

### Still Stuck?

Check:
- Max version (requires Max 8.5+)
- Live version (requires Live 11+)
- File permissions (read access to JSON)
- Max search path settings

---

## 📜 Version History

**v1.0 (Current)**
- Initial release
- 4-layer pattern library (kick, snare, hats, percussion)
- Probabilistic complexity-based selection
- 1,844 patterns from E-GMD dataset
- Real-time MIDI generation

**v1.1 (Planned)**
- Ring buffer capture
- 8-button control
- Groove Pool snapshots
- Pattern length control
- Humanization

---

## 🙏 Credits

- **E-GMD Dataset**: Extended Groove MIDI Dataset
- **Rhythm Theory**: "Mastering Odd, Complex Time Signatures" by Kevin Ferguson
- **Concept**: Inspired by Bird Birds global sampler for REAPER
- **Architecture**: Four-layer independent drum pattern system
- **Analysis**: Python-based pattern characterization pipeline

---

## 📄 License

This device and associated pattern library are provided as-is for personal and commercial use.

Pattern data derived from E-GMD dataset - please respect original dataset license terms.

---

**Have fun wandering through groove space!** 🎶

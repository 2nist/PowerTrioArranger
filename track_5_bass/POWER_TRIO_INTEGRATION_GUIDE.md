# Power Trio Integration Guide
## Groove Wanderer + Bass Follower + Ableton Arranger

---

## 🎯 System Overview

The **Power Trio** is a three-part generative music system for Ableton Live:

1. **Groove Wanderer** - Drum pattern generator (4 layers: kick, snare, hats, percussion)
2. **Bass Follower** - Kick-triggered bass generator with harmonic awareness
3. **Ableton Arranger** (Python app) - Section/chord progression manager via OSC

Together they create cohesive, harmonically-aware grooves that follow your song structure.

---

## 📦 Complete File List

### M4L Devices
- `GrooveWanderer_COMPLETE.amxd` - Drum pattern generator
- `BassFollower.amxd` - Bass note generator

### JavaScript Modules
- `pattern_loader.js` - Loads pattern library
- `pattern_selector.js` - Probabilistic pattern selection
- `note_generator.js` - MIDI drum note generation
- `bass_follower.js` - Bass note generation logic
- `arranger_bridge.js` - OSC bridge to Ableton Arranger

### Data Files
- `pattern_library_REFINED.json` - 1,844 analyzed drum patterns

### Python Application (External)
- Ableton Arranger (from https://github.com/2nist/Live-Dev-Workspace)

---

## 🔌 Signal Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ABLETON LIVE                             │
│                                                             │
│  ┌────────────────────┐         ┌─────────────────────┐   │
│  │ Groove Wanderer    │         │  Bass Follower      │   │
│  │ (MIDI Track 1)     │         │  (MIDI Track 2)     │   │
│  │                    │         │                     │   │
│  │ • Kick (35-36)    ──────────→ Kick Detection       │   │
│  │ • Snare (37-40)    │         │    ↓                │   │
│  │ • Hats (42-51)     │         │ Velocity Threshold  │   │
│  │ • Perc (41-57)     │         │    ↓                │   │
│  │                    │         │ Bass Note Gen       │   │
│  │  ↓ MIDI Ch 1       │         │    ↓                │   │
│  │ Drum Rack          │         │  ↓ MIDI Ch 2        │   │
│  └────────────────────┘         │ Bass Synth          │   │
│           ↑                      └─────────────────────┘   │
│           │                              ↑                  │
│    Live Transport                   Key/Scale/Progression  │
│      (beat/bar)                                             │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                           OSC
                                            │
┌──────────────────────────────────────────↓──────────────────┐
│              ABLETON ARRANGER (Python App)                  │
│                                                             │
│  • Section Manager (Intro/Verse/Chorus)                    │
│  • Chord Progression Editor                                │
│  • Key/Scale Selection                                     │
│  • Sends arrangement data via OSC → arranger_bridge.js    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### Step 1: Install M4L Devices

1. **Place JavaScript files** in Max search path:
   ```
   Mac: ~/Documents/Max 8/Library/
   Windows: Documents\Max 8\Library\
   
   Files:
   ├── pattern_loader.js
   ├── pattern_selector.js
   ├── note_generator.js
   ├── bass_follower.js
   ├── arranger_bridge.js
   └── pattern_library_REFINED.json
   ```

2. **Install M4L devices** in User Library:
   ```
   Mac: ~/Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect/
   Windows: Documents\Ableton\User Library\Presets\MIDI Effects\Max MIDI Effect\
   
   Files:
   ├── GrooveWanderer_COMPLETE.amxd
   └── BassFollower.amxd
   ```

### Step 2: Create Ableton Live Tracks

**Track 1: Drums (Groove Wanderer)**
1. Create MIDI track
2. Add `GrooveWanderer_COMPLETE.amxd`
3. Add **Drum Rack** after device
4. Map drum samples to MIDI notes 35-59:
   - 35-36: Kick drums
   - 37-38, 40: Snare/rim
   - 42, 44, 46, 51: Hi-hats/ride
   - 41-57: Toms/percussion

**Track 2: Bass (Bass Follower)**
1. Create MIDI track
2. Add `BassFollower.amxd`
3. Add **Bass Synth** after device (any synth/sampler)
4. Important: MIDI output is on **Channel 2** (auto-configured)

### Step 3: Install Ableton Arranger (Optional)

For full harmonic control via section-based arrangement:

1. **Clone repository:**
   ```bash
   git clone https://github.com/2nist/Live-Dev-Workspace.git
   cd Live-Dev-Workspace/ableton_arranger
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install AbletonOSC:**
   - Download from https://github.com/ideoforms/AbletonOSC
   - Add `AbletonOSC.amxd` to your Live set

4. **Run Arranger:**
   ```bash
   python ableton_arranger/main.py
   ```

---

## 🎛️ Device Controls

### Groove Wanderer (8 Knobs)

**Bank A: Layer Complexity**
- Kick Complexity (0-127): Simple → Complex kick patterns
- Snare Complexity (0-127): Simple → Complex snare patterns
- Hats Complexity (0-127): Simple → Complex hat patterns
- Perc Complexity (0-127): Simple → Complex fills

**Bank B: Layer Change Rates**
- Kick Rate (0-127): 0=locked → 127=changes every bar
- Snare Rate (0-127): Pattern evolution speed
- Hats Rate (0-127): Pattern evolution speed
- Perc Rate (0-127): Pattern evolution speed

### Bass Follower (6 Controls)

**Musical Settings:**
- **Key** (dropdown): C, C#, D... B (default: C)
- **Scale** (dropdown): Major, Minor, Dorian, etc. (default: Major)

**Generation Controls:**
- **Threshold** (1-127): Only follow kicks above this velocity (default: 80)
- **Octave** (0-5): Bass note octave (default: 2 = C2-B2)
- **Vel Scale** (0.1-2.0): Scale kick velocity for bass (default: 0.8)
- **Root Notes** (toggle): Use chord roots vs. scale tones (default: ON)

**Status:**
- **Arranger Status**: Shows OSC connection to Ableton Arranger

---

## 🎵 How It Works

### 1. Drum Generation (Groove Wanderer)

```
User sets complexity knobs → Pattern Selector chooses patterns
                           → Note Generator outputs MIDI (Ch 1)
                           → Drum Rack plays sounds
```

**Key Concepts:**
- **Probabilistic selection**: Patterns near target complexity have higher probability
- **Change rate**: Controls how often patterns evolve (0=locked, 127=every bar)
- **4-layer independence**: Each layer evolves separately for variety

### 2. Kick Detection → Bass (Bass Follower)

```
Groove Wanderer outputs kick (35/36) → Bass Follower detects kick
                                     → Checks velocity threshold
                                     → Generates bass note (Ch 2)
                                     → Bass Synth plays note
```

**Two Follow Modes:**
- **Threshold Mode**: Only follow kicks above velocity threshold (default)
- **1-to-1 Mode**: Follow every kick (currently manual via JS edit)

**Note Selection:**
- **Root Notes ON**: Uses current chord root from progression
- **Root Notes OFF**: Cycles through scale tones based on beat position

### 3. Harmonic Awareness (Arranger Bridge)

```
Ableton Arranger (Python) → OSC messages → arranger_bridge.js
                                         → Extracts key/scale/progression
                                         → Forwards to bass_follower.js
                                         → Bass follows chord changes
```

**Arrangement Sections:**
- Each section (Verse/Chorus/etc.) can have its own chord progression
- Bass automatically follows progression on bar boundaries
- Bars per chord configurable (default: 4 bars per chord)

---

## 🎼 Example Workflows

### Workflow 1: Simple Kick + Bass (No Arranger)

**Setup:**
1. Load Groove Wanderer + Bass Follower
2. Set Bass Follower to C Major
3. Set Kick Complexity to 40 (medium)
4. Set Threshold to 80

**Result:**
- Groove Wanderer generates varied kick patterns
- Bass Follower plays C root notes following strong kicks
- Simple, driving groove perfect for techno/house

---

### Workflow 2: Progression-Based Groove (With Arranger)

**Setup:**
1. Run Ableton Arranger Python app
2. Create sections: Intro (4 bars) → Verse (8 bars) → Chorus (8 bars)
3. Set key to D minor in Arranger
4. Add chord progression to Verse: i-iv-VII-III (D minor progression)
5. Click "Rebuild" in Arranger

**Result:**
- Groove Wanderer plays drums as usual
- Bass Follower receives key/scale/progression from Arranger
- Bass plays D-G-C-F following the i-iv-VII-III progression
- Changes sections automatically based on arrangement

---

### Workflow 3: Build-Up with Complexity Control

**Setup:**
1. Set all Complexity knobs to 20 (sparse)
2. Set all Change Rates to 50 (moderate)
3. Record automation: gradually increase all Complexity to 100 over 32 bars
4. Bass Threshold at 70 (more responsive)

**Result:**
- Groove starts simple and sparse
- Gradually builds to complex, dense patterns
- Bass follows the intensity increase
- Perfect for intro → drop transitions

---

### Workflow 4: Locked Foundation + Varying Top

**Setup:**
1. Set Kick Complexity to 30, Rate to 0 (locked simple kick)
2. Set Snare Complexity to 50, Rate to 0 (locked backbeat)
3. Set Hats Complexity to 80, Rate to 100 (complex, rapidly changing)
4. Set Perc Complexity to 60, Rate to 80 (fills, often changing)
5. Bass Threshold to 90 (only strong kicks)

**Result:**
- Solid, steady kick + snare foundation
- Hats and percussion constantly evolving
- Bass locks to consistent kick pattern
- Organic variation without losing groove

---

## 🔧 Advanced Configuration

### Modify Bass Follow Behavior

Edit `bass_follower.js`:

**Change to 1-to-1 mode (follow every kick):**
```javascript
var follow_mode = "1to1";  // Change from "threshold"
```

**Adjust velocity scaling:**
```javascript
var bass_velocity_scale = 1.0;  // 1.0 = match kick velocity exactly
```

**Change bass note range:**
```javascript
var bass_octave = 1;  // C1-B1 (sub-bass territory)
```

### Customize Scale Behavior

Edit `bass_follower.js` to add custom scales:

```javascript
var SCALE_INTERVALS = {
    // ... existing scales ...
    "harmonic_minor": [0, 2, 3, 5, 7, 8, 11],
    "melodic_minor": [0, 2, 3, 5, 7, 9, 11],
    "phrygian_dominant": [0, 1, 4, 5, 7, 8, 10]
};
```

Then update the Scale dropdown in BassFollower.amxd.

### Add Chord Types

Currently Bass Follower uses scale degrees for chord roots. To add specific chord types (maj/min/7th), edit `arranger_bridge.js`:

```javascript
function getChordsInSection(section) {
    // Add chord quality detection
    var chord = {
        root: note,
        quality: "maj7",  // Add this
        duration_bars: 2
    };
}
```

Then update `bass_follower.js` to use chord intervals instead of just roots.

---

## 🐛 Troubleshooting

### Issue: No Bass Output

**Check:**
1. Bass Follower MIDI output on Ch 2 (not Ch 1)
2. Bass synth receives MIDI Ch 2
3. Threshold knob not too high (try 60)
4. Kick patterns are playing (check Groove Wanderer)
5. Console shows "Generated X bass notes" messages

**Fix:**
- Lower Threshold to 40-60
- Increase Kick Complexity to generate more kicks
- Check MIDI routing in Live

---

### Issue: Bass Notes Wrong Pitch

**Check:**
1. Key selector matches your song key
2. Scale selector correct (Major vs Minor)
3. Octave knob not too low/high
4. Root Notes toggle state

**Fix:**
- Set Key to match your track
- Use Major for happy/bright, Minor for sad/dark
- Octave 2 is standard bass range (C2-B2)

---

### Issue: Arranger Not Connecting

**Check:**
1. Ableton Arranger Python app running
2. AbletonOSC.amxd loaded in Live set
3. OSC port 11000 not blocked by firewall
4. Console shows "OSC connection established"

**Fix:**
- Restart Python app and Live
- Check AbletonOSC is enabled
- Try different OSC port in config

---

### Issue: Bass Too Busy/Sparse

**Solutions:**

**Too busy (bass on every kick):**
- Increase Threshold to 90-100
- Set Kick Change Rate to 0 (lock simpler pattern)
- Lower Kick Complexity to 20-40

**Too sparse (not enough bass notes):**
- Lower Threshold to 40-60
- Increase Kick Complexity to 60-80
- Set Kick Change Rate higher for more variation

---

## 📊 Parameter Quick Reference

### Groove Wanderer

| Parameter | Range | Effect | Sweet Spot |
|-----------|-------|--------|------------|
| Kick Complexity | 0-127 | Sparse → Dense | 40-60 |
| Kick Rate | 0-127 | Locked → Changing | 30-70 |
| Snare Complexity | 0-127 | Simple → Complex | 50-70 |
| Snare Rate | 0-127 | Locked → Changing | 30-70 |

### Bass Follower

| Parameter | Range | Effect | Sweet Spot |
|-----------|-------|--------|------------|
| Threshold | 1-127 | Follow all → Strong kicks | 70-90 |
| Octave | 0-5 | C0 → C5 | 2 (C2-B2) |
| Vel Scale | 0.1-2.0 | Quieter → Louder | 0.7-0.9 |
| Root Notes | Off/On | Scale tones / Chord roots | On |

---

## 🎯 Musical Applications

### Genre: Techno/House
```
Kick: Complexity 30, Rate 0 (locked four-on-floor)
Bass: Threshold 90, Root Notes ON
Key: A Minor, Progression: i-i-i-i (stay on root)
```

### Genre: Funk/Breakbeat
```
Kick: Complexity 70, Rate 80 (syncopated, evolving)
Bass: Threshold 60, Root Notes ON
Key: E Minor, Progression: i-iv-i-v
```

### Genre: Drum & Bass
```
Kick: Complexity 40, Rate 30 (simple, occasional change)
Snare: Complexity 80, Rate 100 (complex, rapid change)
Bass: Threshold 50, Octave 1 (sub-bass)
```

### Genre: Jazz
```
All layers: Medium complexity (50-70)
Bass: Threshold 70, Root Notes ON
Key: Bb Major, Progression: ii-V-I-vi (jazz turnaround)
```

---

## 🔮 Future Enhancements (Roadmap)

### Phase 2: Advanced Bass Features
- **Walking bass**: Chromatic approach notes
- **Chord inversions**: Use 1st/2nd/3rd inversions
- **Rhythmic patterns**: Preset bass rhythms (1/8, 1/16, etc.)
- **Ghost notes**: Add velocity-variant passing notes

### Phase 3: Arranger Integration
- **Section markers**: Auto-detect Live arrangement sections
- **Clip launcher sync**: Follow scene changes
- **MIDI learn**: Map external controller to all parameters
- **Preset system**: Save/recall complete trio configurations

### Phase 4: Advanced Harmony
- **Voice leading**: Smooth bass note transitions
- **Scale suggestions**: Auto-suggest scales from chord progressions
- **Tension/release**: Analyze and follow harmonic function
- **Poly-bass**: Generate multiple bass voices

---

## 📝 Credits

**Groove Wanderer:**
- E-GMD pattern dataset
- Probabilistic selection algorithm
- 4-layer drum architecture

**Bass Follower:**
- Kick-triggered bass generation
- Harmonic scale/chord awareness
- Velocity threshold system

**Ableton Arranger:**
- Section-based arrangement
- OSC communication protocol
- Chord progression editor

---

**Version:** 1.0 (Power Trio)  
**Date:** 2026-01-30  
**Compatible With:** Max 8.5+, Live 11+, Python 3.7+

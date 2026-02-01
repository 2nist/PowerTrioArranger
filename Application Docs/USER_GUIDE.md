# Power Trio Arranger — User Guide

**Version:** 1.0  
**Hardware:** Akai APC64 (8×8 grid, 8 touch faders)

> **Note:** Power Trio expects Custom Mode mapping. See **APC64_SETUP.md** for pad/CC configuration via the APC64 Project Editor.

---

## System Overview

Power Trio Arranger is a generative performance system: **Drums**, **Bass**, and **Chords** controlled by the APC64. All devices share state via a global dictionary (`---power_trio_brain`).

| Track | Device | Role |
|-------|--------|------|
| Master | **Transport_Clock** | Sends step count (0–15) for Sequencer playback |
| Track 1 | **Chord Lab** | Harmonic input → chord generation → clipboard |
| Track 2 | **Sequencer** | 16-step chord timeline; paste/play/clear |
| Track 3 | **Global Brain** | Initializes dictionary (load first) |
| Track 3 | **Conductor** | Pattern palette + timeline + LOM export |
| Track 4 | **GrooveWanderer** | Probabilistic drum patterns (4 layers) |
| Track 4 | **Bridge** | Extracts kick/snare/hats/perc pulses → Bass trigger |
| Track 5 | **Bass Follower** | Kick-triggered bass from current chord |

---

## Load Order

1. **Global Brain** (Track 3) — Must load first
2. **Transport_Clock** (Master) — Before Sequencer
3. All other devices in any order

---

## Track 1: Chord Lab

### Grid (Notes 36–75)

**Layout:** 7 columns × 5 rows (columns 0–6, rows 0–4)

| Column | Scale degree | Roman |
|--------|--------------|-------|
| 0 | C / I | I |
| 1 | D / ii | ii |
| 2 | E / iii | iii |
| 3 | F / IV | IV |
| 4 | G / V | V |
| 5 | A / vi | vi |
| 6 | B / vii° | vii° |

| Row | Chord type |
|-----|------------|
| 0 | Power (5ths) |
| 1 | Triad (maj/min/dim) |
| 2 | Seventh (maj7/min7) |
| 3 | Ninth (maj9/min9) |
| 4 | Altered |

**Action:** Press pad → builds chord from degree + row → writes to clipboard (for Sequencer paste).

### Faders (CC)

| CC | Name | Range | Function |
|----|------|-------|----------|
| 20 | Voicing spread | 0–127 | 0–31: closed; 32–63: 2 octaves; 64–95: 3 octaves; 96–127: 4 octaves |
| 21 | Inversion | 0–127 | 0–31: root; 32–63: 1st; 64–95: 2nd; 96–127: 3rd |

---

## Track 2: Sequencer

### Grid (Notes 36–51)

**Layout:** 16 pads (first two rows of 8×8 grid)

**Step 0** = pad 36 (bottom-left) … **Step 15** = pad 51 (bottom-right).

| Action | Control |
|--------|---------|
| **Paste** | Press pad (no Shift) → pastes clipboard chord to that step |
| **Clear** | Shift + press pad → clears that step |

**LED feedback:** Current step lights bright (127); previous step dims (64).

**Playback:** Transport Clock drives steps 0–15. Chord at current step is written to `transport::current_chord` (used by Bass).

---

## Track 3: Conductor

### Pattern Palette (Notes 92–99)

**Layout:** 8 pads (top row)

| Action | Control |
|--------|---------|
| **Save** | Press pad → saves current Sequencer buffer as pattern_N (N = pad index) |
| **Recall** | Shift + press pad → loads pattern_N into Sequencer buffer |

**LED feedback:** Lit (64) = pattern exists; off (0) = empty slot.

### Timeline (Notes 36–91)

**Layout:** 56 pads (7 rows × 8 columns)

**Action:** Press pad → places currently selected pattern on timeline slot.

**LED feedback:** Lit pads show placed patterns (velocity reflects pattern ID).

### Export to Live

**Trigger:** Send `export_to_live` to LOM Exporter (e.g. via a Max button or message).

**Result:** Creates Session View scenes from `song_structure.timeline`; chord clips from patterns.

---

## Track 4: GrooveWanderer

### 4 Drum Layers

| Layer | MIDI notes | Role |
|-------|------------|------|
| Kick | 35, 36 | Foundation |
| Snare | 37, 38, 40 | Backbeat |
| Hats/Ride | 42, 44, 46, 51, 59 | Timekeeping |
| Percussion | 41, 43, 45, 47, 48, 49, 52, 55, 57 | Fills, color |

### Knob Controls (via GrooveWanderer device UI)

| Knob | Layer | Function |
|------|-------|----------|
| Kick complexity | Kick | 0 = simple, 127 = complex |
| Kick change rate | Kick | How often kick pattern changes (0 = locked) |
| Snare complexity | Snare | Same logic |
| Snare change rate | Snare | Same logic |
| Hats complexity | Hats/Ride | Same logic |
| Hats change rate | Hats/Ride | Same logic |
| Perc complexity | Percussion | Same logic |
| Perc change rate | Percussion | Same logic |

**Pattern selection:** Probabilistic; prefers patterns near target complexity. Changes on bar boundaries (or at change-rate intervals).

---

## Track 5: Bass Follower

**No direct APC64 controls.** Bass is kick-triggered:

- Bridge detects kick (note 36) → sends `kick_trigger`
- Bass reads `transport::current_chord` (from Sequencer playback)
- Bass outputs root note in octave 2

**Velocity:** Uses kick velocity when available.

---

## Modifier: Shift

| Context | Without Shift | With Shift |
|---------|---------------|------------|
| Sequencer | Paste chord to step | Clear step |
| Conductor palette | Save pattern | Recall pattern |

**Wiring:** APC64 Shift modifier → `[prepend shift]` → node.script inlet (Tracks 2 and 3).

---

## Quick Reference: APC64 Layout

```
APC64 8×8 Grid (Note 36 = bottom-left)

Track 1 (Chord Lab):         Track 2 (Sequencer):       Track 3 (Conductor):
Columns 0–6, Rows 0–4        Steps 0–15 (2 rows)        Palette 92–99 (top row)
                             (notes 36–51)              Timeline 36–91 (7 rows)

        [7] [6] [5] [4] [3] [2] [1] [0]   ← Row 7 (notes 92–99: Pattern palette)
        [7] [6] [5] [4] [3] [2] [1] [0]   ← Row 6 (Timeline)
        ...
        [7] [6] [5] [4] [3] [2] [1] [0]   ← Row 0 (notes 36–43: Chord row 0 / Seq 0–7 / Timeline)
```

---

## CC Map Summary

| CC | Track | Function |
|----|-------|----------|
| 20 | Chord Lab | Voicing spread |
| 21 | Chord Lab | Inversion |
| 28 | Sequencer | Step velocity (reserved) |
| 29 | Sequencer | Gate length (reserved) |
| 30 | Sequencer | Swing (reserved) |
| 36–42 | Conductor | Scene/pattern faders (reserved) |
| 43 | Conductor | Master tempo (reserved) |
| 28–30 | Bass | Harmonic filter, rhythm density, octave (reserved) |

---

## Typical Workflow

1. **Load** Global Brain → Transport Clock → Chord Lab → Sequencer → GrooveWanderer + Bridge → Bass Follower → Conductor.
2. **Chord Lab:** Build chords on grid; adjust voicing/inversion with faders.
3. **Sequencer:** Paste chords to steps 0–15; clear with Shift + pad.
4. **Transport:** Start Live transport → Sequencer advances; Bass plays on kicks.
5. **GrooveWanderer:** Adjust complexity/change rate per layer; drums evolve.
6. **Conductor:** Save Sequencer buffer to pattern slots; place patterns on timeline; export to Live when ready.

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| No chords paste | Chord Lab loaded? Clipboard has chord? |
| Sequencer doesn’t advance | Transport Clock loaded? Live transport playing? |
| Bass doesn’t play | Bridge kick_trigger → `[s ---kick_pulse_global]` wired? Sequencer has chord on current step? |
| Pattern recall fails | Shift wired to Conductor? Pattern exists (LED lit)? |
| LEDs wrong | Dict response loop wired? See AMXD_BUILD_INSTRUCTIONS.md |

---

---

## Complete Control Reference

| Device | Control | Type | Action |
|--------|---------|------|--------|
| **Chord Lab** | Grid (36–75) | Pad | Build chord: column = degree (0–6), row = type (0–4) |
| **Chord Lab** | CC 20 | Fader | Voicing spread: closed ↔ open |
| **Chord Lab** | CC 21 | Fader | Inversion: root ↔ 3rd |
| **Sequencer** | Grid (36–51) | Pad | Paste chord to step 0–15 |
| **Sequencer** | Shift + Grid | Pad | Clear step |
| **Sequencer** | CC 28 | Fader | Step velocity (reserved) |
| **Sequencer** | CC 29 | Fader | Gate length (reserved) |
| **Sequencer** | CC 30 | Fader | Swing (reserved) |
| **Conductor** | Palette (92–99) | Pad | Save Sequencer buffer as pattern_N |
| **Conductor** | Shift + Palette | Pad | Recall pattern_N into Sequencer |
| **Conductor** | Timeline (36–91) | Pad | Place selected pattern on slot |
| **Conductor** | `export_to_live` | Message | Export song structure to Session View |
| **GrooveWanderer** | Kick complexity | Knob | Target complexity for kick patterns |
| **GrooveWanderer** | Kick change rate | Knob | How often kick changes |
| **GrooveWanderer** | Snare complexity | Knob | Target complexity for snare |
| **GrooveWanderer** | Snare change rate | Knob | How often snare changes |
| **GrooveWanderer** | Hats complexity | Knob | Target complexity for hats/ride |
| **GrooveWanderer** | Hats change rate | Knob | How often hats change |
| **GrooveWanderer** | Perc complexity | Knob | Target complexity for percussion |
| **GrooveWanderer** | Perc change rate | Knob | How often percussion changes |
| **Bass Follower** | — | — | Kick-triggered only (no direct controls) |
| **Global Brain** | — | — | Auto-init (no user controls) |
| **Transport Clock** | — | — | Auto-step (no user controls) |

---

## Reference Documents

- **APC64_SETUP.md** — APC64 (Akai) mapping for Power Trio; Custom Mode configuration
- **AMXD_BUILD_INSTRUCTIONS.md** — Wiring per device
- **TROUBLESHOOTING.md** — Init, search path, dict
- **DICTIONARY_SCHEMA.json** — Global state structure

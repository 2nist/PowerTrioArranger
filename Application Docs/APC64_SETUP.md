# APC64 Setup for Power Trio Arranger

**Device:** Akai Professional APC64 (not Novation)  
**Reference:** APC64 User Guide v1.1 (Application Docs/)

---

## Compatibility

Power Trio expects MIDI from the **Akai APC64**. The APC64 has:

- **8×8 pad grid** (64 pads, velocity-sensitive)
- **8 touch faders** (assignable to CCs in Custom Mode)
- **SHIFT** button (modifier for secondary functions)
- **TRACK SELECT** 1–8, **Control Row**, **Scene LAUNCH**, etc.

---

## Default vs Custom Mode

**Ableton Live mode (default):** APC64 uses Live’s built-in control surface. Pads control clips, Note Mode, Chord Mode, or Step Sequencer. Touch faders control Device/Volume/Pan/Send.

**Power Trio:** Needs a different mapping. Either:

1. **Custom Mode** — Use the **APC64 Project Editor** to create a project that sends the exact notes and CCs Power Trio expects, or  
2. **MIDI mapping in Live** — Route APC64 MIDI to Power Trio devices and map pads/faders manually.

This document describes the mapping Power Trio expects so you can set it up in Custom Mode or in Live.

---

## Pad Grid Mapping (Notes 36–99)

APC64 pads are assumed to use note numbers in row-major order:

- **Note 36** = bottom-left (row 0, col 0)
- **Note 43** = bottom-right (row 0, col 7)
- **Note 92–99** = top row (row 7)

| Zone            | Notes   | Pads  | Use                          |
|-----------------|---------|-------|------------------------------|
| Chord Lab       | 36–75   | 40    | 7 cols × 5 rows (cols 0–6 only) |
| Sequencer       | 36–51   | 16    | Steps 0–15 (first 2 rows)    |
| Timeline        | 36–91   | 56    | 7 rows × 8 cols              |
| Pattern palette | 92–99   | 8     | Top row                      |

In the **APC64 Project Editor** (Custom Mode), assign the pad grid so that:

- Bottom-left pad = note 36
- Top-right pad = note 99
- Layout: column increases left-to-right, row increases bottom-to-top

---

## Touch Fader CC Mapping

Power Trio expects these CCs from the 8 touch faders:

| Fader | CC   | Track    | Function              |
|-------|------|----------|------------------------|
| 1     | 20   | Chord Lab| Voicing spread         |
| 2     | 21   | Chord Lab| Inversion              |
| 3     | 28   | Sequencer| Step velocity (reserved) |
| 4     | 29   | Sequencer| Gate length (reserved) |
| 5     | 30   | Sequencer| Swing (reserved)       |
| 6     | 36   | Conductor| Scene xfade (reserved) |
| 7     | 37   | Conductor| Pattern fade (reserved)|
| 8     | 43   | Conductor| Master tempo (reserved)|

In the **APC64 Project Editor**, for each touch fader:

- **Message Type:** Single (1 CC)
- **CC 1:** Use the values in the table
- **MIDI Channel:** 1 (or whatever channel your Power Trio devices listen on)
- **Fader Style:** Volume (for unidirectional parameters)

---

## SHIFT Modifier

Power Trio uses SHIFT for:

- **Sequencer:** Shift + pad = clear step (vs paste)
- **Conductor:** Shift + palette pad = recall pattern (vs save)

APC64 has a dedicated **SHIFT** button. The Max patcher must receive SHIFT state (e.g. from APC64 MIDI or a separate button) and send it as `prepend shift` to the Sequencer and Conductor scripts.

---

## Track Routing in Ableton

If using Ableton Live mode instead of Custom Mode:

1. Create a MIDI track that receives from APC64.
2. Add Power Trio devices (Chord Lab, Sequencer, etc.) as MIDI effects on that track or on separate tracks.
3. Use Live’s **MIDI Map Mode** or **User Remote Scripts** to map APC64 pads and faders to the inputs Power Trio expects.

The APC64 sends different note ranges in Note Mode, Chord Mode, and Step Sequencer. Power Trio assumes a fixed 36–99 note layout, so Custom Mode with an explicit mapping is the most predictable option.

---

## Reference

- **apc64_constants.js** — Full CC and note range definitions
- **USER_GUIDE.md** — Control reference
- **APC64 User Guide v1.1** — Official hardware and modes

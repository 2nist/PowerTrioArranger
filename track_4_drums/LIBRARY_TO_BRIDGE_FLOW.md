# Pattern Library → note_input: Data Flow & Where the Disconnect Is

## Intended flow (library as source)

The **pattern_library_REFINED.json** is the source of every note the bridge sees. Flow:

```
pattern_library_REFINED.json
  │  layers.kick[], layers.snare[], etc.
  │  each pattern.pattern.notes[] = { beat, velocity, note }  (e.g. note: 36, 38)
  ▼
pattern_loader.js  [loadLibrary(filepath)]
  │  outlets: layer_patterns (kick, snare, hats_ride, percussion)
  ▼
pattern_selector.js  [loadLayerPatterns + knobs]
  │  outlets: set_pattern (layer, JSON)
  ▼
note_generator.js  [setPattern(layer, json) + beat(beat_position) from Live]
  │  For each note in current patterns in the current 16th-note window:
  │  outlet(0, note.note, note.velocity, 100, delay_ticks)
  │  ↑ note and velocity come directly from the library
  ▼
  ├── [tap A] → makenote → midiout  (play drums)
  └── [tap B] → prepend drum_trigger → node.script groove_wanderer_bridge.js  (note_input)
```

So **note_input** to the bridge is the same stream as “library → note_generator”: the bridge is supposed to receive the (note, velocity) that the note_generator emits, which are the same values that came from the library.

---

## Where the disconnect is

There is **no** disconnect in the data model: the library is the source; the note_generator turns it into real-time (note, velocity) events; the bridge should receive those events.

The disconnect is **in the Max patcher**, in one or both of these places:

### 1. Bridge never receives the note_generator output

- **note_generator** outlet 0 is the only place that emits the library-sourced (note, velocity).
- If that outlet is **only** connected to makenote → midiout, the bridge never sees those events.
- **Fix:** Add a **tap** from the same stream that feeds makenote: take (note, velocity) and send them into the bridge.

So the patcher must look like this (conceptually):

```
note_generator outlet 0  →  [trigger i i i i]  (or similar: take first two for MIDI)
       │                            │
       │     first two (note, vel)   │
       ├────────────────────────────┼──→ [makenote …] → midiout
       │                            │
       └────────────────────────────┼──→ [prepend drum_trigger] → [node.script groove_wanderer_bridge.js]
                                    │
                                    └── (same note, velocity)
```

If the branch to `prepend drum_trigger` → `node.script` is missing, that’s the disconnect: the bridge has no way to receive the library-sourced note_input.

### 2. Message format mismatch

- **note_generator** sends **four** numbers per hit: `(note, velocity, 100, delay_ticks)`.
- The bridge expects a **list** with selector + two numbers: `(drum_trigger note velocity)` or `(note_input note velocity)`.
- So the patcher must:
  - Use only the **first two** elements (note, velocity) for the bridge.
  - Prepend the selector (`drum_trigger` or `note_input`) and send that list to the node.script inlet.

If the patcher sends all four numbers, or doesn’t prepend the selector, the bridge won’t see correct note_input.

---

## Summary

| Question                                         | Answer                                                                                                                                                                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is the pattern library the source of note_input? | Yes. The (note, velocity) that the bridge should see come from the library via loader → selector → note_generator.                                                                                          |
| Where is the disconnect?                         | In the **patcher**: either (1) note_generator output is not connected to the bridge, or (2) the message to the bridge is not (selector, note, velocity) with only the first two numbers from the generator. |
| What to do?                                      | Ensure note_generator outlet 0 is tapped; take (note, velocity) only; prepend `drum_trigger` (or `note_input`); connect to [node.script groove_wanderer_bridge.js].                                         |

No code change is required in the library, loader, selector, note_generator, or bridge script for the library to be the source of note_input; the fix is **wiring in the .amxd** so the bridge receives that stream.

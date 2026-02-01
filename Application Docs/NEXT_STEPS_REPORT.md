# Power Trio Arranger — Codebase Review & Next Steps

**Date:** 2025-01-31  
**Devices:** Track_1_Chord_Lab, Track_2_Sequencer, Track_3_Global_Brain, Track_4_Bridge, Track_5_Bass_Follower

---

## ✅ Fixes applied (this session)

### 1. **dict message format (critical bug)**

The Max `[dict]` object expects messages without the dict name when routing to a named dict. Fixed in:

- **shared/dict_helpers.js** — `dictGet`, `dictReplace`, `dictAppend` now send `("get", path)` and `("replace", path, value)` instead of including `DICT_NAME`.
- **track_1_chord_lab/logic.js** — Removed `DICT_NAME` from outlet calls.
- **track_3_conductor/lom_exporter.js** — Removed `DICT_NAME` from outlet calls.

Without this fix, dict operations would fail or target the wrong keys.

### 2. **Kick trigger: Bridge → Bass**

The Bass Follower needs `kick_trigger` messages, but the Bridge only wrote to the dict. Added:

- **track_4_drums/groove_wanderer_bridge.js** — `maxApi.outlet("kick_trigger", velocity)` on kick hit.
- **AMXD_BUILD_INSTRUCTIONS.md** — Updated Track 4 wiring: `route kick_trigger` → `prepend kick_trigger` → `[s ---kick_pulse_global]`.

**Patcher change:** In Track_4_Bridge.amxd, add `[route kick_trigger]` and connect it to `[prepend kick_trigger]` → `[s ---kick_pulse_global]`.

---

## Transport Clock (added)

**File:** `Transport_Clock.maxpat` — Open in Max, save as `Transport_Clock.amxd`, place on Master track.

**Needed:** A Transport Clock device that:

1. Syncs to Live’s transport (e.g. via `[plugsync~]` or `[transport]`).
2. Computes the current step (0–15) from bars/beats.
3. Sends `[s transport_tick]` with the step value.

**Suggested Max objects (one option):**

```
[transport]
   |
   get bar beat
   |
[expr ($f1-1)*4 + floor($f2)]  ; bar*4 + beat → step 0–15
   |
[mod 16]
   |
[change]
   |
[prepend transport_tick]
   |
[s transport_tick]
```

Alternatively: `[plugsync~ 4]` (4 pulses per beat) with a counter and modulo to derive steps.

**Placement:** Add this device to the Master track or a utility track; Track 2’s `[r transport_tick]` will receive it.

---

## 🟡 Integration checklist

| Item | Status | Action |
|------|--------|--------|
| Global Brain on Track 3 | ✅ | Ensure it loads before other devices |
| Chord Lab → clipboard | ✅ | Track 1 writes `clipboard::active_chord` |
| Sequencer transport | ✅ | Use Transport_Clock.maxpat |
| Sequencer → dict | ✅ | Paste/play update `sequencer_buffer`, `transport::current_chord` |
| Bridge → rhythm_pulses | ✅ | Track 4 writes `rhythm_pulses` |
| Bridge → Bass kick | ✅ | Track 4 outlets `kick_trigger`; wire to `[s ---kick_pulse_global]` |
| Bass chord source | ✅ | Sequencer writes `transport::current_chord` during playback |
| Conductor pattern save/place | ✅ | arranger_playlist reads/writes `song_structure` |
| Pattern recall | ✅ | Shift + palette pad loads pattern into sequencer |
| Pattern palette LEDs | ✅ | Shows which slots have saved patterns |
| LOM export | ✅ | lom_exporter reads `song_structure`, `patterns::*` |

---

## 🟡 Track 4: Bridge + GrooveWanderer

**Data flow:** GrooveWanderer (drums) → Bridge (extracts kick/snare) → dict + `[s ---kick_pulse_global]`.

**Options:**

1. **Single device:** Bridge as subpatcher inside GrooveWanderer.amxd, fed by its MIDI output.
2. **Separate device:** Bridge on its own MIDI track, receiving GrooveWanderer via routing or `[r]`.

Ensure Bridge receives GrooveWanderer MIDI (notes 36, 37, 38, 40) so kick triggers reach the Bass.

---

## 🟡 Conductor vs Global Brain

Track 3 can host both:

- **Global Brain** — `dict_init.js` only; initializes `---power_trio_brain`.
- **Conductor** — `arranger_playlist.js` (and optionally `lom_exporter.js`); pattern palette and timeline.

They can be:

- Two devices on Track 3, or
- Combined in one device with two `[node.script]` objects.

---

## 🟢 Schema and behavior notes

- **song_structure.timeline:** Holds pattern IDs (`"pattern_0"`, etc.); `pattern_bank` holds the actual buffers.
- **arranger_playlist:** Writes to both `patterns::pattern_X` and `song_structure.pattern_bank` for compatibility.
- **Sequencer events:** Stored as full chord objects (e.g. `{ root_midi, midi_notes, ... }`), not references.
- **dict_response:** All scripts that call `dictGet` / `getTransport` / `getActiveChord` / `getSequencerBuffer` / `getSongStructure` must have the dict response loop wired.

---

## 📋 Suggested next steps (order)

1. **Transport Clock** — Open `Transport_Clock.maxpat` in Max, save as `.amxd`, place on Master.
2. **Update Track_4_Bridge.amxd** — Add `route kick_trigger` → `prepend kick_trigger` → `[s ---kick_pulse_global]`.
3. **End-to-end test:**
   - Load Global Brain on Track 3.
   - Chord Lab: play a chord on the grid → check `clipboard::active_chord`.
   - Sequencer: paste chord to a step, start transport → verify `transport::current_chord` updates and chord plays.
   - Bridge: play drums → verify Bass receives kick triggers and plays root notes.
4. **Conductor test:** Save a pattern from the Sequencer, place it on the timeline, then run LOM export.

---

## 📁 Reference

- **TRANSPORT_CLOCK_BUILD.md** — Transport Clock build options
- **AMXD_BUILD_INSTRUCTIONS.md** — Per-track wiring and routes
- **TROUBLESHOOTING.md** — Init issues, search path, `max-api`
- **07_Wiring_SOP.md** — Pattern definitions
- **DICTIONARY_SCHEMA.json** — Dict structure

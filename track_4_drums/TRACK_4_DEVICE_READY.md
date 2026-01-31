# Track 4: GrooveWanderer M4L Device — What’s There & What’s Left

## What’s in the directory

| Item                                                         | Role                                                                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **data/pattern_library_REFINED.json**                        | e-gmd pattern library (1844 patterns: kick, snare, hats_ride, percussion). Loaded at init.                                                              |
| **js/pattern_loader.js**                                     | Max [js]. `loadLibrary(filepath)` → reads JSON, outlets `layer_patterns` (kick, snare, hats_ride, percussion) to selector.                              |
| **js/pattern_selector.js**                                   | Max [js]. Receives layer patterns + knob values (kick/snare/hats/perc complexity & change_rate). Outlets `set_pattern` (layer, JSON) to note_generator. |
| **js/note_generator.js**                                     | Max [js]. Receives `set_pattern` + `beat(beat_position)` from Live. Outlet 0: **(note, velocity, 100, delay_ticks)** per hit.                           |
| **groove_wanderer_bridge.js**                                | Node [node.script]. Listens for `drum_trigger` or `note_input` (note, velocity). Writes kick 36 / snare 38 → `---power_trio_brain` `rhythm_pulses`.     |
| **GrooveWanderer_COMPLETE.amxd** / **GrooveWanderer.maxpat** | The M4L device / Max patcher.                                                                                                                           |
| **GROOVEWANDERER_BRIDGE_PATCH.md**                           | How to tap drum output into the bridge (Option A in-device, Option B separate device).                                                                  |

---

## What still needs to be done

### 1. Library path so the device finds the JSON

- **Current:** Load message is something like `loadLibrary pattern_library_REFINED.json` or `loadLibrary data/pattern_library_REFINED.json`.
- **Need:** When the .amxd is loaded in Live, Max must resolve that path to `track_4_drums/data/pattern_library_REFINED.json`.
- **Options:**
  - **A.** Put the device’s “home” in the Max File Path so the patcher’s default directory is the folder that contains `data/` and `js/`. Then use **`loadLibrary data/pattern_library_REFINED.json`** in the loadbang message.
  - **B.** Use a full path in the message (e.g. `loadLibrary "C:/Users/.../PowerTrioArranger/track_4_drums/data/pattern_library_REFINED.json"`) — works but not portable.
  - **C.** Use Max’s **Search Path** (File → Search Path): add the folder that contains `track_4_drums` (e.g. PowerTrioArranger), and in the patcher use a path relative to that, e.g. **`loadLibrary track_4_drums/data/pattern_library_REFINED.json`** (or whatever path from a search-path root to the file).
- **Check:** Open device → loadbang runs → Max console shows “Library loaded successfully!” and pattern counts. If you see “Cannot open file”, fix the path.

---

### 2. [js] script paths

- **Current:** Patcher has [js pattern_loader.js], [js pattern_selector.js], [js note_generator.js].
- **Need:** Max must find those files. Same idea as (1): either the device’s current directory is the folder that contains `js/`, or Search Path includes a folder such that `js/pattern_loader.js` etc. resolve.
- **Check:** After loadbang, loader and selector run without “file not found” and layers are received.

---

### 3. Note generator → MIDI out (and makenote)

- **Current:** note_generator outlet 0 sends **four** numbers per hit: **(pitch, velocity, 100, delay_ticks)**.
- **Need:** [makenote] expects **(pitch, velocity)** or **(pitch, velocity, duration)**. So the patcher must use only the first two for MIDI.
- **Patch:** e.g. note_generator outlet 0 → [trigger i i i i] → use only the first two outlets (pitch, velocity) → [makenote 100 10] (or your chosen duration/gate) → [midiout]. Optionally use the 4th outlet (delay_ticks) for a [delay] if you want sub-beat timing.
- **Check:** Transport running, beat feeding note_generator → you hear kick/snare/hats/perc on the correct MIDI channel.

---

### 4. Bridge integration (kick/snare → `---power_trio_brain`)

- **Current:** groove_wanderer_bridge.js is in track_4_drums; it uses `require('../shared/dict_helpers.js')` and writes to `---power_trio_brain`.
- **Need:**
  - **4a.** Patcher must send **(drum_trigger pitch velocity)** into a [node.script] that runs groove_wanderer_bridge.js. Same tap as in GROOVEWANDERER_BRIDGE_PATCH.md: from the **same** (pitch, velocity) that go to makenote, add: [prepend drum_trigger] → [node.script groove_wanderer_bridge.js].
  - **4b.** Max **Search Path** must include the **PowerTrioArranger** folder (parent of track_4_drums) so that inside the device, `require('../shared/dict_helpers.js')` resolves when the script lives in track_4_drums.
  - **4c.** The **Global Brain** device (Track 3) must have been inited so **---power_trio_brain** exists before this device runs; otherwise the bridge’s dict writes have nowhere to go.
- **Check:** Play the device; in another device that reads `rhythm_pulses` (e.g. bass_follower), confirm kick/snare pulses update (e.g. bass reacts to kick/snare).

---

### 5. Beat from Live

- **Current:** Patcher has live.thisdevice → route beat → / 4. → prepend beat → note_generator.
- **Need:** live.thisdevice must be in the patcher and connected so note_generator receives `beat(beat_position)` (e.g. quarter-note or 16th-note grid). Often this is “beat” or “phase” from a [live.observer] or similar.
- **Check:** With transport playing, note_generator gets beat messages and drums advance in time.

---

### 6. Knobs → selector

- **Current:** pattern_selector expects messages like **kick_complexity**, **kick_change_rate**, **snare_complexity**, etc. (0–127).
- **Need:** Each [live.dial] (or similar) must send its value with the right selector, e.g. [prepend kick_complexity] → pattern_selector. Your existing patcher already had dials and prepend objects; ensure every dial is wired to the selector with the correct parameter name.
- **Check:** Changing complexity/rate dials changes pattern selection over time (and/or on beat).

---

## Order of operations

1. **Paths:** Set Search Path (or device folder) so `data/pattern_library_REFINED.json` and `js/*.js` resolve. Fix loadLibrary message if needed.
2. **Drum engine:** Confirm loader → selector → note_generator → (trigger i i …) → makenote → midiout. Drums play when transport runs.
3. **Bridge:** Add drum_trigger tap → node.script (groove_wanderer_bridge.js). Ensure PowerTrioArranger is on Search Path so require('../shared/…') works. Ensure ---power_trio_brain exists (Track 3 inited).
4. **Polish:** Beat source, knobs, presentation, and levels.

---

## Quick checklist

- [ ] loadLibrary resolves to track_4_drums/data/pattern_library_REFINED.json (Max console: “Library loaded successfully!”).
- [ ] [js] objects find pattern_loader.js, pattern_selector.js, note_generator.js (no script errors).
- [ ] note_generator outlet → only (pitch, velocity) to makenote → midiout; drums sound.
- [ ] live.thisdevice (or equivalent) feeds beat into note_generator.
- [ ] All complexity/change_rate dials wired to pattern_selector with correct prepend names.
- [ ] (pitch, velocity) also sent as (drum_trigger pitch velocity) to [node.script groove_wanderer_bridge.js].
- [ ] PowerTrioArranger on Max Search Path so bridge’s require('../shared/dict_helpers') works.
- [ ] ---power_trio_brain inited (Track 3 / Global Brain) so bridge can write rhythm_pulses.
- [ ] Bass (or other consumer) sees rhythm_pulses when kick/snare play.

Once these are done, the GrooveWanderer M4L device is in place and integrated with the PowerTrioArranger brain and bass.

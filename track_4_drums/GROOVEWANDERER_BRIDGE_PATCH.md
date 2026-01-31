# GrooveWanderer → Bridge Patch (Track 4)

Your **groovewanderer.amxd** patcher is correct as the drum generator. To feed the PowerTrioArranger bridge (so bass gets kick/snare pulses), add the following **inside** the same patcher.

## Option A: Tap inside groovewanderer.amxd (single device)

1. **Tap note/velocity from makenote**
   - `makenote` outlet 0 sends **pitch** then **velocity** (two successive integers on note-on).
   - Use: `[trigger i i]` — connect **makenote outlet 0** to `trigger` inlet.
   - `trigger` has two outlets: first outlet = pitch, second = velocity.

2. **Bundle and label for the bridge**
   - Use: `[pack 0 0]` — connect `trigger` outlet 0 (pitch) → `pack` inlet 1, `trigger` outlet 1 (velocity) → `pack` inlet 2.
   - Use: `[prepend drum_trigger]` — connect `pack` outlet → `prepend` inlet.
   - Result: every note-on sends `(drum_trigger pitch velocity)`.

3. **Send to the bridge script**
   - Use: `[node.script groove_wanderer_bridge.js]` (or the correct path to `PowerTrioArranger/track_4_drums/groove_wanderer_bridge.js` relative to the device).
   - Connect `prepend drum_trigger` outlet → `node.script` inlet.
   - Ensure the device’s **Search Path** (or Max’s) includes the PowerTrioArranger folder so `require('../shared/dict_helpers.js')` resolves.

4. **Bridge script**
   - The bridge only reacts to note **36** (kick) and **38** (snare); other notes are ignored. No need to filter in Max.

**Summary:**  
`makenote 0` → `trigger i i` → `pack 0 0` (pitch, velocity) → `prepend drum_trigger` → `node.script groove_wanderer_bridge.js`

## Option B: Separate bridge device (no change to groovewanderer.amxd)

- Leave **groovewanderer.amxd** exactly as it is.
- Create a second M4L device (e.g. “GrooveWanderer Bridge”) on the **same track** (or on a track that receives the drum MIDI).
- In that device: use `[midiin]` or track MIDI to get note/velocity, filter for 36 and 38 if you like, then `prepend drum_trigger` → `node.script` (bridge script). The bridge script path must still point to PowerTrioArranger.

## Bridge script expectations

- **Handlers:** `drum_trigger` (note, velocity) or `note_input` (note, velocity).
- **Message format:** list `(drum_trigger pitch velocity)` or `(note_input pitch velocity)`.
- **Notes used:** 36 = kick → `rhythm_pulses::kick_pulse`, 38 = snare → `rhythm_pulses::snare_pulse`.

Your current patcher is correct for the drum engine; add the tap above (Option A) or a separate device (Option B) to satisfy Track 4.

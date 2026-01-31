# Power Trio — Max for Live Device Build Instructions

Use this document with **07_Wiring_SOP.md** to build each `.amxd` device.  
**Constraint 1 (dict_response):** Any device whose script does a dictionary **get** will hang indefinitely unless the Response Loop is wired.

---

## Integrity constraint: The dict_response loop

**All scripts that call `getDict` / `dictGet` / `getTransport` / `getActiveChord` / `getSequencerBuffer` / `getSongStructure` depend on the Response Loop.**

You **must** do this for every client device (Tracks 1, 2, 4, 5) and for any script that reads from the dictionary:

1. **Request:** Node Script **Outlet 1** → `[route dict]` → **Inlet 1** of `[dict ---power_trio_brain]`.
2. **Return (do not skip):** **Left outlet** of `[dict ---power_trio_brain]` → `[prepend dict_response]` → **Left inlet** of `[node.script]`.

**In short:** Connect the **left outlet** of the `[dict]` object to a `[prepend dict_response]` object, and connect that back to the **left inlet** of the `[node.script]`.

Without this return path, `dict_response` handlers never run and the script will hang on any dictionary read.

---

## Track 3: Conductor (Global Brain) — PATTERN A

**Device:** One per set. Holds `[dict ---power_trio_brain]` and initializes it.

1. Create `[loadbang]` → `[message init]` → **Inlet 1** of `[node.script shared/dict_init.js]`.
2. **Outlet 1** of Node Script → `[route dict]` → **Inlet 1** of `[dict ---power_trio_brain]`.
3. **No Response Loop** needed here (dict_init only writes; it does not read back).

Save as `Track_3_Conductor.amxd` (or `Arranger_Structure.amxd`).

For LOM export (PATTERN D): Node Outlet 1 → `[route call_lom]` → … as in 07_Wiring_SOP.md.

---

## Track 1: Chord Lab — PATTERN B + C

**Script:** `track_1_chord_lab/logic.js`. Reads nothing from dict; writes `clipboard::active_chord`.

1. **Grid input:** `[notein]` (or `[ctlin]` for grid) → `[prepend note_input]` or `[prepend cc_input]` → Node Inlet 1.
2. **Dictionary:** Node Outlet 1 → `[route dict]` → `[dict ---power_trio_brain]`.  
   **Response Loop (required if you add any dict get later):** Left outlet of `[dict]` → `[prepend dict_response]` → Node Inlet 1.
3. **MIDI/LED:** Node Outlet 1 → `[route note_out]` (or `midi_out`) → `[noteout]` as needed.

Save as `Track_1_ChordLab.amxd`.

---

## Track 2: Sequencer — PATTERN B + C

**Script:** `track_2_sequencer/sequencer.js`. **Does dict get** (clipboard, sequencer_buffer). Response Loop is **mandatory**.

1. **Transport:** `[plugsync~]` or `[metro]` + counter → `[prepend transport_tick]` → Node Inlet 1.
2. **Grid:** `[notein]` → `[prepend note_input]` → Node Inlet 1. (Shift state from patcher if needed.)
3. **Dictionary request:** Node Outlet 1 → `[route dict]` → `[dict ---power_trio_brain]`.
4. **Response Loop (mandatory):** **Left outlet** of `[dict ---power_trio_brain]` → `[prepend dict_response]` → **Left inlet** of `[node.script]`.
5. **MIDI/LED:** Node Outlet 1 → `[route note_out]` → `[noteout]`.

Save as `Track_2_Sequencer.amxd`.

---

## Track 4: GrooveWanderer Bridge — PATTERN B (dict only)

**Script:** `track_4_drums/groove_wanderer_bridge.js`. Only writes `rhythm_pulses`; no dict get. Response Loop optional unless you add reads.

1. **Drum input:** GrooveWanderer MIDI or `[r ---drum_triggers]` → `[prepend drum_trigger]` (with note, velocity) → Node Inlet 1.
2. **Dictionary:** Node Outlet 1 → `[route dict]` → `[dict ---power_trio_brain]`.

Save as part of Track 4 device or a separate bridge subpatcher.

---

## Track 5: Bass Follower — PATTERN B

**Script:** `track_5_bass/bass_follower.js`. **Does dict get** (`transport::current_chord`). Response Loop is **mandatory**.

1. **Kick trigger:** `[r ---kick_pulse_global]` (or receive from Track 4) → `[prepend kick_trigger]` (optional: velocity as second element) → Node Inlet 1.
2. **Dictionary request:** Node Outlet 1 → `[route dict]` → `[dict ---power_trio_brain]`.
3. **Response Loop (mandatory):** **Left outlet** of `[dict ---power_trio_brain]` → `[prepend dict_response]` → **Left inlet** of `[node.script]`.
4. **MIDI out:** Node Outlet 1 → `[route note_out]` or `midi_out` → `[noteout]` (bass synth).

Save as `Track_5_Bass.amxd`.

---

## Checklist (Constraint 1)

Before testing any device that reads from the dictionary:

- [ ] **Track 2:** Left outlet of `[dict]` → `[prepend dict_response]` → node.script left inlet.
- [ ] **Track 5:** Left outlet of `[dict]` → `[prepend dict_response]` → node.script left inlet.
- [ ] **Track 3 (Conductor):** Loadbang → init → dict_init; outlet → route dict → dict (no response loop needed for init-only).
- [ ] **Track 1:** Dict wiring + optional response loop if you add any get later.

Reference: **07_Wiring_SOP.md**, **WIRING_GUIDE.md**.

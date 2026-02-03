# Visual Wiring Comparison Guide

Use this guide to compare your existing devices against the correct wiring patterns.

---

## Device 3: Global Brain — Before vs After

### ❌ INCORRECT (Common Issues):

```
[loadbang]
    |
[message init]  ← Remove this!
    |
[node.script ../shared/dict_init.js @autostart 0]  ← Wrong path! Wrong autostart!
    |
[route dict]
    |
[dict ---power_trio_brain]
```

### ✅ CORRECT (What It Should Be):

```
[node.script shared/dict_init.js @autostart 1]  ← Correct path! Autostart ON!
    |
[route dict]
    |
[dict ---power_trio_brain]

(No loadbang/init needed - script self-initializes)
```

**Changes Required**:
1. Script path: `shared/dict_init.js` (remove `../`)
2. @autostart: Change from `0` to `1`
3. Remove [loadbang] and [message init] objects (optional now)

---

## Device 2: Sequencer — Before vs After

### ❌ INCORRECT (Missing Response Loop):

```
[notein]
    |
[prepend note_input]
    |
[node.script track_2_sequencer/sequencer.js]
    |
[route dict note_out]
    |          |
    |          └→ [noteout]
    |
[dict ---power_trio_brain]
    |
    └→ (nothing connected to LEFT outlet) ← THIS IS THE PROBLEM!
```

### ✅ CORRECT (With Response Loop):

```
[r ---transport_tick]  [notein]
         |                |
[prepend transport_tick] [prepend note_input]
         |                |
         +----------------+
                |
[node.script track_2_sequencer/sequencer.js @autostart 1]
                |
     [route dict sysex led note_out]
         |      |      |        |
         |      └→ [midiout]    └→ [noteout]
         |
    [dict ---power_trio_brain]
      |              |
      |    (LEFT outlet)  ← Must connect this!
      |              |
      |       [prepend dict_response]
      |              |
      └──────────────┴→ [node.script] LEFT INLET
```

**Changes Required**:
1. Add transport input: `[r ---transport_tick]`
2. Add [prepend transport_tick]
3. Add response loop: dict LEFT → [prepend dict_response] → node.script LEFT
4. Set @autostart: 1
5. Expand routing to include sysex, led, note_out

---

## Device 5: Bass Follower — Before vs After

### ❌ INCORRECT (Missing Response Loop):

```
[notein]  ← Wrong input! Should be kick trigger
    |
[node.script track_5_bass/bass_follower.js]
    |
[route dict note_out]
    |          |
    |          └→ [noteout]
    |
[dict ---power_trio_brain]
    |
    └→ (nothing connected to LEFT outlet) ← THIS IS THE PROBLEM!
```

### ✅ CORRECT (With Response Loop & Kick Input):

```
[r ---kick_pulse_global]  ← Correct input source!
         |
[prepend kick_trigger]
         |
[node.script track_5_bass/bass_follower.js @autostart 1]
         |
   [route dict note_out]
      |          |
      |          └→ [noteout]
      |
   [dict ---power_trio_brain]
      |              |
      |    (LEFT outlet)  ← Must connect this!
      |              |
      |       [prepend dict_response]
      |              |
      └──────────────┴→ [node.script] LEFT INLET
```

**Changes Required**:
1. Change input from [notein] to [r ---kick_pulse_global]
2. Add [prepend kick_trigger]
3. Add response loop: dict LEFT → [prepend dict_response] → node.script LEFT
4. Set @autostart: 1

---

## Device 4: Bridge — Before vs After

### ❌ INCORRECT (Missing Global Send):

```
[notein]
    |
[node.script track_4_drums/groove_wanderer_bridge.js]
    |
[route dict]
    |
[dict ---power_trio_brain]

(No kick_pulse output - Bass won't get triggered!)
```

### ✅ CORRECT (With Global Send):

```
[notein]
    |
[prepend drum_trigger]
    |
[node.script track_4_drums/groove_wanderer_bridge.js @autostart 1]
    |
[route dict kick_pulse]
    |          |
    |          └→ [send ---kick_pulse_global]  ← Critical for Bass!
    |
[dict ---power_trio_brain]
```

**Changes Required**:
1. Add [prepend drum_trigger]
2. Change [route dict] to [route dict kick_pulse]
3. Add [send ---kick_pulse_global] from kick_pulse outlet
4. Set @autostart: 1

---

## Device 1: Chord Lab — Before vs After

### ❌ INCORRECT (Missing Routing):

```
[notein]
    |
[node.script track_1_chord_lab/logic.js]
    |
[dict ---power_trio_brain]
```

### ✅ CORRECT (Full Routing):

```
[notein]          [ctlin]
   |                 |
[prepend note_input] [prepend cc_input]
   |                 |
   +-----------------+
           |
[node.script track_1_chord_lab/logic.js @autostart 1]
           |
[route dict sysex led note_out]
   |      |      |        |
   |      |      |        └→ [noteout]
   |      |      └→ [pack] → [noteout] (LED control)
   |      └→ [midiout] (APC64 display)
   |
[dict ---power_trio_brain]
```

**Changes Required**:
1. Add [ctlin] input with [prepend cc_input]
2. Add [prepend note_input] to notein
3. Expand routing: [route dict sysex led note_out]
4. Add outputs for sysex (display) and LED feedback
5. Set @autostart: 1

---

## How to Use This Guide

For each device:

1. **Open** the device in Max (right-click → Edit)
2. **Unlock** the patcher (click lock icon)
3. **Compare** your current wiring to the "INCORRECT" diagram
4. **Match** the "CORRECT" diagram by:
   - Adding missing objects
   - Connecting missing cables
   - Changing settings in Inspector
   - Removing obsolete objects
5. **Lock** and **Save**
6. **Test** (see validation below)

---

## Quick Validation Checklist

After making changes, check these:

### All Devices:
- [ ] @autostart is `1` (click node.script, check Inspector)
- [ ] Script path is relative (no `../` or absolute paths)
- [ ] Max Console shows device loaded message

### Sequencer & Bass Follower Only:
- [ ] [prepend dict_response] object exists
- [ ] Cable from dict LEFT outlet to prepend
- [ ] Cable from prepend to node.script LEFT inlet
- [ ] NO "WIRING ERROR" in console

### Bridge Only:
- [ ] [send ---kick_pulse_global] exists
- [ ] Connected to [route kick_pulse] outlet

### Test End-to-End:
- [ ] Chord Lab: Pad press → chord in dict
- [ ] Sequencer: Transport → steps advance
- [ ] Bridge: Drums → pulses in dict
- [ ] Bass: Kick → bass note plays

---

## Color Coding for Cables (Optional)

To make your patchers easier to debug, use different colors for different types of connections:

- **Red**: Dict response loop (critical!)
- **Blue**: MIDI/note data
- **Green**: Control/CC data
- **Yellow**: Transport/timing
- **Gray**: Misc/utility

To change cable color: Select cable → Inspector → Color

---

## Common Mistakes to Avoid

❌ **Using absolute paths**: `/Users/Matthew/PowerTrioArranger/shared/dict_init.js`
✅ **Use relative paths**: `shared/dict_init.js`

❌ **Using `../` notation**: `../shared/dict_init.js`
✅ **Use from Max path root**: `shared/dict_init.js`

❌ **@autostart 0**: Script won't run on load
✅ **@autostart 1**: Script runs immediately

❌ **[dict ---power_trio_brain @embed 1]**: Creates separate dict per device
✅ **[dict ---power_trio_brain]**: References shared dict

❌ **No response loop**: Sequencer and Bass hang
✅ **With response loop**: Everything works

❌ **RIGHT outlet**: Wrong outlet on dict
✅ **LEFT outlet**: Correct outlet for responses

---

## Need More Help?

See:
- [DEVICE_ALIGNMENT_PROCEDURE.md](DEVICE_ALIGNMENT_PROCEDURE.md) — Step-by-step instructions
- [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) — 30-minute fix guide
- Templates in `max_templates/` — Complete working examples

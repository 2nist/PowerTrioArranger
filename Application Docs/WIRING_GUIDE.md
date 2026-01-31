# PowerTrioArranger — Max Patcher Wiring Guide

This guide describes how to connect the **Global Brain** (dictionary) and **Client** (track) devices so that `maxApi.outlet('dict', ...)` from JS reaches the `[dict ---power_trio_brain]` and responses loop back into the node.script.

---

## ⚠️ Gotcha: The dict_response loop

Client scripts (Bass, Sequencer, etc.) that **read** from the dict rely on async responses. If the **loopback** is not wired, those reads never complete and the script can hang or stop responding.

**Wiring check (every client device that does dict get):**

| Direction | Connection                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------- |
| **Out**   | `node.script` → `route dict` → `dict ---power_trio_brain`                                               |
| **In**    | `dict ---power_trio_brain` **(left outlet)** → `prepend dict_response` → `node.script` **(left inlet)** |

Without the **In** path, `dict_response` handlers never fire and any logic waiting on dict data will hang.

---

## 1. The "Global Brain" Device (Track 3 or Master)

Use **one** Global Brain device in the whole Live Set. It holds the actual `[dict ---power_trio_brain]` and runs the init script.

**Risk:** If every device runs `dict_init.js` on load, they can overwrite each other or reset song state when you add a new device.

**Fix:** Only the Global Brain device (e.g. on Track 3 / Conductor) should run the init logic. Other scripts assume the dict already exists.

### Patcher layout

```
[loadbang]
   |
[message "init"]
   |
[node.script shared/dict_init.js]
   |
[route dict]   <-- "dict" is the first element from maxApi.outlet('dict', ...) in JS
   |
   +-----------------------+
   |                       |
[message "import $1"]    [dict ---power_trio_brain]   <-- The actual storage
```

- On loadbang, send `init` into the node.script so it runs `initFromMax()` and outlets dict messages.
- Connect the node.script outlet to `[route dict]`. The script sends lists like `dict get ---power_trio_brain path` or `dict replace ---power_trio_brain key value`.
- Route the second element onward (e.g. `get`, `replace`, `clear`) into the `[dict ---power_trio_brain]` object so it performs the operation.

**Critical:** The `[dict]` object’s **left outlet** outputs the result of `get` requests. You must **loop this back into the node.script** (e.g. with `prepend dict_response`) so the JS receives the answer. See "Read/Write Loop" below.

---

## 2. The "Client" Devices (Tracks 1, 2, 4, 5)

Client devices do **not** contain the dict; they **reference** it. They assume `---power_trio_brain` already exists (created by the Global Brain).

### Standard wiring for `[node.script]` in track devices

```
[r transport_tick]   [r transport_playing]
       |                    |
[prepend transport_tick] [prepend transport_playing]
       |                    |
       +---------+----------+
                 |
        [node.script track_X/logic.js]
                 |
      +----------+----------+
      |                     |
[route dict]          [route midi_out]
      |                     |
[dict ---power_trio_brain]  [noteout]
```

- Transport: route `transport_tick` and `transport_playing` into the node.script so the JS receives them (e.g. as `transport_tick` / `transport_playing` with one argument).
- JS outlet: first element is often `dict` or `midi_out`. Use `[route dict]` so that lists starting with `dict` go to the dict; route other outlets (e.g. `midi_out`, `note_out`) to `[noteout]` or wherever you need.

**Critical missing link:** The `[dict]` object outputs the result of a `get` from its **left outlet**. That result must be sent **back into** the node.script so the JS can handle it.

---

## 3. The Complete Read/Write Loop

For the JS to receive dictionary **get** responses:

```
       (Response loop)
           ^
           |
[dict ---power_trio_brain]  (left outlet = result of "get")
   |                 |
   |                 |
[route dict]      [prepend dict_response]
   ^                 |
   |                 |
   |            [node.script track_X/logic.js]  (inlet)
   |
[node.script track_X/logic.js]  (outlet)
```

- JS sends: `maxApi.outlet('dict', 'get', '---power_trio_brain', 'path');`
- Patcher: outlet → `[route dict]` → strip `dict` → send `get ---power_trio_brain path` to `[dict ---power_trio_brain]`.
- Dict: left outlet outputs the value for that path.
- Patcher: take that value → `[prepend dict_response]` → send `dict_response <path> <value>` into the node.script inlet.
- JS: `maxApi.addHandler('dict_response', (key, value) => { ... });` receives the response.

Without this loop, async reads from the dict never reach the script.

---

## 4. Validation Checklist Fixes

- **package.json location:** Keep `package.json` in the **project root** (`PowerTrioArranger/`). Do not put it inside individual track folders. You want a single `node_modules` at the root.

- **dict_init.js execution:** Only the **Global Brain** device (e.g. Track 3 / Conductor) should run the init logic on loadbang. Other devices must **not** loadbang `dict_init.js`; they should only run their own track script (e.g. `track_1_chord_lab/logic.js`) and assume the dict exists.

- **Bass (track_5_bass/bass_follower.js):** Hierarchy logic is implemented in `filterByHierarchy(chord, fader_value)` using the chord’s `notes` array from the dictionary. The bass does **not** need to import `getChordIntervals` from `music_theory.js`; it works from `transport::current_chord` and `rhythm_pulses`. No change required for the wiring guide beyond this note.

---

## 5. Summary

| Item           | Action                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Global Brain   | One device only; run `shared/dict_init.js` on loadbang with `init`; connect outlet to `[route dict]` → `[dict ---power_trio_brain]`. |
| Dict response  | Connect left outlet of `[dict ---power_trio_brain]` → `[prepend dict_response]` → node.script inlet.                                 |
| Client devices | Do **not** run dict_init; wire transport and dict as above; use same dict response loop if the script does dict `get`.               |
| package.json   | Root folder only; single `node_modules`.                                                                                             |

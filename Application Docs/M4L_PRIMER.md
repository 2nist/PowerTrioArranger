# M4L Primer — node.script, dict, prepend, and debugging

This primer explains the M4L concepts used in the Power Trio Arranger project.

node.script (Node.js in Max)
- `node.script` runs Node.js code inside a Max device (use for adapters).
- Inspector tips:
  - **textfile**: set to the relative script path (e.g., `track_6_song_arranger/m4l_adapter.js`).
  - **@autostart 1**: enable so script starts when device loads.
- Best practice: keep *core* logic out of Max (no `max-api`) and put device-specific wiring in a small adapter file.

Dict (shared state)
- Use `[dict ---power_trio_brain]` as the global shared dictionary.
- Set `@embed 0` on the `dict` object so it acts as a shared store across devices.
- Common operations (from adapters):
  - Write: `max.outlet('dict', dictName, 'replace', key, ...values)`
  - Read:  `max.outlet('dict', dictName, 'get', key)`
  - Listen for responses via a `dict_response` message handler in the adapter.

prepend dict_response (response loop)
- For devices that expect immediate replies (Sequencer, Bass), create a response loop:
  1. Connect `dict` left outlet → `prepend dict_response` → `node.script` left inlet.
  2. This lets the script send a request and receive the matching `dict_response` payload.
- If missing, devices may show "WIRING ERROR" or hang on init.

Debugging — Max Console & common tips
- Open Max Console: Window → Max Console (shows `max.post` messages and errors).
- Use `max.post('message')` in adapters to log helpful startup and error info.
- Common problems:
  - **Script not loading**: check `textfile` path and `@autostart` inspector setting.
  - **Dict not found**: ensure Global Brain (Track 3) is loaded first and dict name matches (`---power_trio_brain`).
  - **WIRING ERROR**: check `route dict` and `prepend dict_response` wiring.
- Quick check: load devices in recommended order, open Max Console, and verify startup messages like "SONG ARRANGER LOADED" or "GrooveWanderer loaded".

Quick checklist
- Global Brain (Track 3) loaded first
- `dict ---power_trio_brain` present, `@embed 0`
- `node.script` objects point to adapter scripts and have `@autostart 1`
- Devices requiring dict replies have the response loop wired
- Open Max Console and confirm startup messages

# M4L Module Development Guide 🔧

This document explains the current modular architecture in this repository and provides step-by-step instructions for creating an Ableton Live Set (.als) from the default template that will run the M4L modules in this project. It also includes recommended development workflows, test commands, and troubleshooting tips.

---

## Overview — What we extracted and why ✅
- We split M4L functionality into **pure cores** and **thin M4L adapters**:
  - *Cores* are pure Node.js modules (no `max-api`) that implement the logic and can be unit-tested outside of Max.
  - *Adapters* are small `m4l_adapter.js` files placed next to device patches that wire Max messages and `dict` responses into the cores using `max-api`.

Benefits:
- Easier testing (unit + integration tests)
- Reuse across projects (publishable packages)
- Safer refactors and versioning

Current core packages (path in repo):
- `packages/song-arranger-core` — song arrangement engine (progressions, sections, playback)
- `packages/apc64-comms` — APC64 SysEx / display + pad helpers
- `packages/groove-wanderer-core` — drum/percussion parsing → rhythm pulses
- `packages/bass-follower-core` — bass note decision engine on kick pulses

Adapters (in the M4L device folders):
- `track_6_song_arranger/m4l_adapter.js`
- `track_4_drums/m4l_adapter.js`
- `track_5_bass/m4l_adapter.js`

Tests and CI:
- Unit tests live inside each package (`packages/*/test/run.js`).
- Adapter integration tests: `test/integration/` (they mock `max-api`).
- CI workflow runs package tests and adapter integration tests on push/PR via `.github/workflows/nodejs.yml`.

---

## How to create a .als that runs these modules (two options) 🎛️

You can create an Ableton set from the default template using either the automated script or manual method.

### Option A — Automated (recommended)
1. Ensure Python 3 is available and you have write permission in the repo.
2. Run the generator script:

```bash
cd /Users/Matthew/PowerTrioArranger
python3 create_power_trio_set.py
```

3. This will create `PowerTrio_Template.als` at the repo root. Open this in Ableton Live and follow the device wiring/load order below.

Alternative simpler script (text-based replace):
```bash
python3 create_simple_set.py
```

> Notes: The generator reads `Application Docs/DefaultLiveSet.als` as the template and emits `PowerTrio_Template.als` with tracks pre-named and basic metadata set.

### Option B — Manual (if you prefer to edit in Live)
1. Open `Application Docs/DefaultLiveSet.als` in Ableton Live.
2. Duplicate a MIDI track to make the 5 device tracks.
3. Rename tracks (recommended):
   - `1-Chord Lab`
   - `2-Sequencer`
   - `3-Global Brain` (loads first)
   - `4-Drums Bridge`
   - `5-Bass Follower`
   - `6-Song Arranger` (GUI)
4. On each track, add the corresponding `.amxd` device (in `Application Docs/M4LDevices/` or your local copy) and open the Max patch.
5. For each `node.script` object:
   - Set the `textfile` (script file) to the relative path used in repository, e.g. `track_3_global_brain/shared/dict_init.js` or `track_6_song_arranger/song_arranger.js` depending on the device.
   - Verify `@autostart 1` is set (device scripts self-initialize).
6. Add `[dict ---power_trio_brain]` to the Global Brain track (Track 3). For shared dictionaries, ensure `@embed 0` is set so the dict is shared across devices.

---

## Load order and wiring essentials ⚠️
- **Load order (recommended):**
  1. Track 3 — Global Brain (creates `---power_trio_brain` dict)
  2. Track 4 — Drums Bridge (GrooveWanderer bridge)
  3. Track 1 — Chord Lab
  4. Track 2 — Sequencer
  5. Track 5 — Bass Follower
  6. Track 6 — Song Arranger GUI

- **Critical wiring patterns:**
  - Devices that read from `dict` and expect responses need a *dict response loop*: connect the left outlet of the `dict` object to a `prepend dict_response` object, then to the `node.script` left inlet. This is mandatory for Sequencer and Bass Follower to work properly.
  - Global Brain must create the `---power_trio_brain` dictionary and *should* be loaded first.

- **Common `node.script` settings:**
  - `@autostart 1` (start automatically)
  - `textfile` points to the package script path (e.g., `track_2_sequencer/sequencer.js`)

---

## Development workflow (how to add or extract a module) 🚀
1. **Create the package:** under `packages/your-module`, add `package.json`, `lib/core.js`, `test/run.js`, `README.md`, `API.md`, and an ESLint config.
2. **Keep core pure:** do not `require('max-api')` in the core. Use EventEmitter or plain functions and return data structures.
3. **Add an M4L adapter:** put `m4l_adapter.js` next to the device patch. Adapter responsibilities:
   - `require('max-api')`
   - Translate messages from Max (`addHandler`) into core calls
   - Persist core state back to `dict` and `outlet` messages
   - Emit/forward console messages (`max.post`) for debugging
4. **Unit tests:** add pure unit tests for core logic (`npm test` in package).
5. **Adapter integration tests:** add tests under `test/integration/` that use `proxyquire` to stub `max-api` and exercise wiring (this repo already has examples).
6. **Add CI:** make sure new package tests run in the GitHub Actions workflow.
7. **Document & publish:** write `README.md` and `API.md`. Optionally publish to npm (e.g., `@2nist/your-module`) or keep as monorepo workspace.

---

## Commands (quick reference) 🧾
- Run package unit tests:
  - `cd packages/song-arranger-core && npm test`
- Run adapter integration tests (root):
  - `npm run test:integration`
- Run ESLint for a package:
  - `cd packages/apc64-comms && npm run lint`
- Create template .als (automatic):
  - `python3 create_power_trio_set.py` or `python3 create_simple_set.py`
- Validate setup script (checks files & docs):
  - `./validate_setup.sh`

---

## Troubleshooting tips 🛠️
- If node scripts don't run in Max: open the Max Console and look for node script errors. Verify `@autostart 1` and `textfile` path.
- If dict lookups fail: ensure `---power_trio_brain` exists and `@embed` is set correctly on the dict object.
- If a device shows "WIRING ERROR": inspect the patch for missing `prepend dict_response` or missing `route dict` paths.
- `fix_devices.py` and `analyze_devices.py` can help check and correct script paths inside `.amxd` files.

---

## Where to look in this repo (useful files)
- Device templates: `max_templates/` (track templates)
- Device .amxd files and backups: `Application Docs/M4LDevices/` (examples)
- Package cores: `packages/*` (see above)
- M4L adapters: `track_*/m4l_adapter.js`
- Create set scripts: `create_power_trio_set.py`, `create_simple_set.py`
- Tests: `packages/*/test/`, `test/integration/`
- CI: `.github/workflows/nodejs.yml`
- SOP for agent-driven extraction: `agent-sop/` (decision gates and prompts)

---

If you’d like, I can also:
- Add a short *M4L primer* to `Application Docs/QUICKSTART.md` covering `node.script`, `dict`, `prepend` conventions, and how to debug in Max Console.
- Create a short screencast or step-by-step checklist for loading `PowerTrio_Template.als` and verifying each device.

Would you like the primer added into `Application Docs/QUICKSTART.md` next? 🙌

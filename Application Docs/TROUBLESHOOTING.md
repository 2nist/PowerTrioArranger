# Power Trio Arranger — Troubleshooting Guide

Use this guide to verify dependencies and fix common issues. Work through sections in order.

---

## Critical: Do NOT install max-api via npm

**The `max-api` package on npm is a placeholder that throws an error.** Max provides `max-api` built-in when running `[node.script]`. If you have `max-api` in `node_modules`, it overrides Max's API and breaks all scripts.

**Fix (run in project root):**
```bash
cd /Users/Matthew/PowerTrioArranger
npm uninstall max-api
```

**Verify:** `node_modules/max-api` should no longer exist. Your `package.json` should NOT list `max-api` in dependencies.

---

## Pre-flight checklist

Run these checks before loading any device.

### 1. Project structure

```
/Users/Matthew/PowerTrioArranger/
├── package.json          (exists, no max-api dependency)
├── node_modules/         (exists, NO max-api subfolder)
├── shared/
│   ├── dict_init.js
│   ├── dict_helpers.js
│   └── music_theory.js
├── track_1_chord_lab/logic.js
├── track_2_sequencer/sequencer.js
├── track_3_conductor/
│   ├── arranger_playlist.js
│   ├── lom_exporter.js
│   └── Global_Brain.amxd
├── track_4_drums/
│   ├── groove_wanderer_bridge.js
│   ├── pattern_loader.js
│   ├── pattern_selector.js
│   └── note_generator.js
└── track_5_bass/bass_follower.js
```

### 2. Max search path (choose one method)

**Method A — Max Package (recommended)**  
PowerTrioArranger is symlinked as a Max Package so Max finds it automatically:

```
~/Documents/Max 9/Packages/PowerTrioArranger -> /Users/Matthew/PowerTrioArranger
```

If this symlink exists, Max adds the project to its search path on launch. **Restart Max** (and Ableton) after creating it.

**Method B — Manual search path**  
1. Open Max → **Preferences → File Preferences**.
2. Under **Search Path**, add: `/Users/Matthew/PowerTrioArranger`
3. Apply and **restart Max**.

### 3. Node.script script path

In `[node.script]`, use paths relative to the search path:

- `shared/dict_init.js`
- `track_1_chord_lab/logic.js`
- `track_2_sequencer/sequencer.js`
- etc.

Do **not** use `../` from the device location; use paths from the project root.

---

## Global Brain device

### Wiring (verify in patcher)

| From | To |
|------|-----|
| `[node.script]` outlet | `[route dict]` |
| `[route dict]` | `[dict ---power_trio_brain]` |
| `[dict]` **left outlet** | `[prepend dict_response]` |
| `[prepend dict_response]` | `[node.script]` **left inlet** |

**Startup:** The script **self-initializes** when it loads—no loadbang or init message needed.

- Set `autostart` to **1** in the node.script Inspector so it starts when the patcher loads.
- If autostart is 0: connect `[loadbang]` → `[message script start]` → `[node.script]` to start the process.

### Success indicator

When the device loads, the Max Console should show:
```
---power_trio_brain initialized with schema.
```

**How to open Max Console:**
- In Max standalone: **Window → Max Console**
- In Ableton: Double-click the device to open it, then **View → Max Console** (or check the Max window menu)

### Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `init: No such object` | Max can't find the script | 1) Ensure PowerTrioArranger is in `~/Documents/Max 9/Packages/`; 2) Restart Max and Ableton; 3) Or use absolute path: `/Users/Matthew/PowerTrioArranger/shared/dict_init.js` |
| `Node script not ready can't handle message init` | init arrived before Node started | **Fixed:** Script now self-initializes on load. Remove loadbang→message init. Set node.script **autostart 1** in Inspector, or use loadbang → `[message script start]` → node.script |
| `Cannot find module 'max-api'` | You ran the script outside Max (e.g. `node dict_init.js`) | Only run via Max `[node.script]` |
| Script throws / no message | npm `max-api` package installed | Run `npm uninstall max-api` and restart Max |
| Dict stays empty | Loadbang didn't fire or message isn't `init` | Click `[loadbang]` manually; verify message says `init` |

### Verify dict contents

1. Open the Global Brain patcher.
2. Double-click `[dict ---power_trio_brain]`.
3. You should see keys: `transport`, `clipboard`, `sequencer_buffer`, `song_structure`, `rhythm_pulses`.
4. If empty, the init script didn't run; check console for errors.

---

## Dependency verification commands

Run these in Terminal from the project root:

```bash
cd /Users/Matthew/PowerTrioArranger

# 1. max-api must NOT be in node_modules
ls node_modules/max-api 2>/dev/null && echo "FAIL: Remove with npm uninstall max-api" || echo "OK: max-api not in node_modules"

# 2. Scripts must exist
for f in shared/dict_init.js shared/dict_helpers.js track_1_chord_lab/logic.js track_2_sequencer/sequencer.js; do
  test -f "$f" && echo "OK: $f" || echo "MISSING: $f"
done

# 3. package.json should not have max-api
grep -q '"max-api"' package.json 2>/dev/null && echo "FAIL: Remove max-api from package.json" || echo "OK: package.json has no max-api"
```

---

## Device load order

1. **Load Global Brain first** (Track 3 or a dedicated track). It creates the dictionary.
2. Load other devices (Chord Lab, Sequencer, Bass) after. They assume the dict exists.

---

## Quick fix summary

If Global Brain shows no message and dict is empty:

1. **`npm uninstall max-api`** (critical)
2. Add `/Users/Matthew/PowerTrioArranger` to Max search path
3. Restart Max / Ableton
4. Reload the device
5. Open Max Console and click `[loadbang]` manually to test

---

## References

- [Node for Max - max-api](https://docs.cycling74.com/max8/vignettes/07_n4m_maxapi) — max-api is built-in, do not install via npm
- [Node for Max - Using npm](https://docs.cycling74.com/max8/vignettes/02_n4m_usingnpm)
- AMXD_BUILD_INSTRUCTIONS.md — device wiring
- 07_Wiring_SOP.md — wiring patterns

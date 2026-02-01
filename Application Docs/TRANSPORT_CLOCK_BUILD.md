# Transport Clock — Build Instructions

**Purpose:** Outputs `transport_tick` (0–15) for the Sequencer. Must be loaded before Track 2.

**Output:** Sends `(transport_tick 0)` … `(transport_tick 15)` at 16th-note rate, synced to Live.

---

## Optional: Reset-on-Stop (node.script)

For reset logic when transport stops, add `[node.script transport_clock/transport_clock.js]`:

| Inlet | Handler | Source |
|-------|---------|--------|
| 1 | `transport_state` | `[live.observer playing]` → prepend transport_state |
| 2 | `manual_step` | `[int]` or `[live.numbox]` for step 0–15 (debug) |
| 3 | `reset` | `[loadbang]` or button |

**Outlets:** `transport_reset` (bang when stopped), `transport_tick` (manual step only when not playing).

The script is a **State Manager** only. Ticks come from Option A (plugsync~), B (metro), or C (transport polling).

---

## Option A: plugsync~ (recommended, sample-accurate)

### Objects

1. `[plugsync~ 16 0]` — 16 divisions per bar (16th notes), offset 0
2. `[tabplay~]` or `[tapin~]` — Not needed; plugsync~ outputs phase
3. **Alternative:** Use `[phasor~]` with `@lock 1` driven by transport

**Simpler approach:** Use `[sync~ 16 1]` if available, or the `[plugsync~]` pulse outlet.

### Recommended: live.grid + counter

Ableton’s `[live.grid]` can output step position. Simpler option below.

---

## Option B: Metro + Counter (works immediately, not tempo-synced)

Use for quick testing. Replace with Option A for production.

### Objects

| Object | Args | Purpose |
|--------|------|---------|
| `[loadbang]` | — | Start on load |
| `[metro 125]` | 125 | ~120 BPM 16th notes (2000ms ÷ 16 ≈ 125ms) |
| `[counter 0 15]` | 0 15 | Step 0→15, wraps |
| `[prepend transport_tick]` | transport_tick | Format message |
| `[s transport_tick]` | transport_tick | Send to Sequencer |

### Wiring

```
[loadbang] ──► [metro 125]
                  │
                  ▼
            [counter 0 15]
                  │
                  ▼
         [prepend transport_tick]
                  │
                  ▼
            [s transport_tick]
```

### Tempo adjustment

At tempo T BPM: bar = 60/T seconds. 16 16ths per bar → `metro` = `(60/T)*1000/16` ms.

- 120 BPM → 125 ms
- 100 BPM → 150 ms
- 140 BPM → 107 ms

---

## Option C: transport + polling (tempo-synced)

### Objects

| Object | Purpose |
|--------|---------|
| `[transport]` | Live transport position |
| `[metro 50]` | Poll every 50 ms |
| `[prepend bars beats]` | Request position |
| `[expr ($f1-1)*4 + floor($f2)]` | bar*4 + beat → step 0–15 |
| `[% 16]` | Wrap to 0–15 |
| `[change]` | Only output when step changes |
| `[prepend transport_tick]` | Format |
| `[s transport_tick]` | Send |

### Wiring

```
[loadbang] ──► [metro 50]
                  │
                  ▼
         [prepend bars beats] ──► [transport]
                                       │
                                    (bars, beats)
                                       │
                                       ▼
[expr ($f1-1)*4 + floor($f2)]  ; bar 1 beat 1 → 0, bar 1 beat 2 → 4, etc.
         (Note: transport outputs bar 1-based, beat 1-4)
                                       │
                                       ▼
                               [expr $f1 % 16]
                                       │
                                       ▼
                                [change]
                                       │
                                       ▼
                         [prepend transport_tick]
                                       │
                                       ▼
                             [s transport_tick]
```

**Note:** Check `[transport]` outlet format in your Max version; adjust `expr` if bars/beats are different.

---

## Save as M4L device

1. Create a new **Max MIDI Effect** or **Audio Effect** (MIDI is lighter).
2. Build one of the options above in the patcher.
3. **File → Save As** → `Transport_Clock.amxd`
4. Place on Master or a utility track; load **before** Track 2 Sequencer.

---

## Verification

1. Add `[print]` after `[s transport_tick]` (or use Max Console).
2. Start Live transport.
3. Confirm output: `transport_tick 0`, `transport_tick 1`, … `transport_tick 15`, `transport_tick 0`, …

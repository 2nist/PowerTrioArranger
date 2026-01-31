# Pattern Analysis Requirements

## Input

- E-GMD MIDI file collection
- Path: `data/egmd/`

## Output Format

JSON file with structure:

```json
{
  "kick": [
    {
      "id": "kick_001",
      "source_file": "groove_042.mid",
      "complexity_score": 0.25,
      "density_score": 0.40,
      "pattern": {
        "beats": 4,
        "notes": [
          {"beat": 0.0, "velocity": 100, "note": 36},
          {"beat": 1.0, "velocity": 85, "note": 36}
        ]
      },
      "metadata": {
        "original_tempo": 120,
        "time_signature": "4/4",
        "bar_count": 4
      }
    }
  ],
  "snare": [...],
  "hats_ride": [...],
  "percussion": [...]
}
```

- `complexity_score`: 0.0–1.0
- `density_score`: notes per beat normalized (0.0–1.0)

## Categorization Rules

- **Kick**: MIDI notes 35, 36
- **Snare**: MIDI notes 37, 38, 40
- **Hats/Ride**: MIDI notes 42, 44, 46, 51, 59
- **Percussion**: MIDI notes 41, 43, 45, 47, 48, 49, 52, 55, 57

## Metrics to Calculate

- **Complexity**: Based on syncopation, pattern irregularity
- **Density**: Notes per beat (normalized 0–1)
- Pattern signature (for similarity matching)
- Velocity statistics (mean, std, range)

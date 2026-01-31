# Technical Constraints & Considerations

## Max/MSP Limitations

- live.dict max size: ~100MB (should be fine)
- JavaScript execution: Avoid blocking operations
- MIDI timing: Use metro/transport for accuracy

## Performance Targets

- Pattern selection: < 10ms
- Ring buffer write: < 1ms per note
- Clip creation: < 100ms

## MIDI Compatibility

- All patterns normalized to MIDI notes 35-59 (GM drum map)
- Velocity range: 1-127
- Time resolution: 480 tpb (standard)

## Storage Estimates

- E-GMD collection: ~1000 files? (~10MB uncompressed)
- Pattern library JSON: ~2-5MB estimated
- Ring buffer (600 bars): ~240KB in memory

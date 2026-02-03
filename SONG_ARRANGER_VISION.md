# Power Trio Arranger - Complete Workflow Vision

## THE HOME RUN: Song Structure → Ableton Arrangement

### Complete User Journey

```
1. CAPTURE CHORDS (Track 1: Chord Lab)
   APC64 Pads → Chord → Dictionary
   
2. BUILD PROGRESSIONS (Track 2: Sequencer)  
   Paste chords → 16-step sequences → Save as named progression
   Examples: "verse_prog", "chorus_prog", "bridge_prog"
   
3. DEFINE SECTIONS (Track 6: Song Arranger)
   Create sections: Intro, Verse, Chorus, Bridge, Solo, Outro
   Assign progression to each section
   Set duration (bars) for each section
   
4. ARRANGE SONG FLOW (Track 6: Song Arranger)
   Drag sections into timeline
   Example: Intro(4) → Verse(8) → Chorus(8) → Verse(8) → Chorus(8) → Bridge(4) → Chorus(8) → Outro(4)
   
5. VISUALIZE (M4L GUI)
   See entire song structure at a glance
   Current playback position highlighted
   Section colors match APC64
   
6. EXPORT TO ABLETON
   One click → Creates MIDI clips in Ableton arrangement
   Each section becomes a clip with correct progression
   Drums, bass, and harmony all generated
   
7. PERFORM LIVE (APC64)
   Pads trigger sections
   Visual feedback shows current section
   Manual override for improvisation
```

## The GUI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    POWER TRIO SONG ARRANGER                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CHORD LIBRARY          │  SAVED PROGRESSIONS                  │
│  ━━━━━━━━━━━━━━━━━━━━━━┼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [C]  [Dm] [Em] [F]    │  ► verse_prog    [Edit] [Play]       │
│  [G]  [Am] [Bdim]      │  ► chorus_prog   [Edit] [Play]       │
│  [G7] [Cmaj7]          │  ► bridge_prog   [Edit] [Play]       │
│                         │  ► solo_prog     [Edit] [Play]       │
│  [Capture] [Clear]     │  [New Progression]                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SECTION DEFINITIONS    │  SONG ARRANGEMENT                    │
│  ━━━━━━━━━━━━━━━━━━━━━━┼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ● Intro   (4 bars)    │  ┌────┬────────┬────────┬────┬─────┐ │
│    → verse_prog         │  │Intr│ Verse1 │Chorus1 │Vrs2│Chrs2│ │
│                         │  │ 4  │   8    │   8    │ 8  │  8  │ │
│  ● Verse   (8 bars)    │  └────┴────────┴────────┴────┴─────┘ │
│    → verse_prog         │  ┌──────┬────────┬───────┐          │
│                         │  │Bridge│Chorus3 │ Outro │          │
│  ● Chorus  (8 bars)    │  │  4   │   8    │   4   │          │
│    → chorus_prog        │  └──────┴────────┴───────┘          │
│                         │                                      │
│  ● Bridge  (4 bars)    │  Total: 52 bars (3:28 @ 120 BPM)    │
│    → bridge_prog        │                                      │
│                         │  Playback: ▶ [Bar 16: Chorus1]      │
│  [Add Section]          │                                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ACTIONS                                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [Export to Ableton]  [Save Song]  [Load Song]  [Clear All]   │
│                                                                 │
│  Status: Ready | Song: "MyAwesomeSong.json" | Modified: Yes   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## APC64 Integration

### Grid Layout for Arranger Mode

```
APC64 Grid (8×8):

Row 1 (Top): Section Triggers
┌────┬────┬────┬────┬────┬────┬────┬────┐
│INTR│VRS1│CHR1│VRS2│CHR2│BRDG│CHR3│OUTR│  ← Press to jump
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 2: Progression Select
┌────┬────┬────┬────┬────┬────┬────┬────┐
│PRG1│PRG2│PRG3│PRG4│PRG5│PRG6│PRG7│PRG8│  ← Select progression
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 3-6: Chord Capture (existing Chord Lab)
┌────┬────┬────┬────┬────┬────┬────┬────┐
│    │    │    │    │    │    │    │    │
│    │    │  CHORD CAPTURE AREA  │    │
│    │    │    │    │    │    │    │    │
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 7: Transport
┌────┬────┬────┬────┬────┬────┬────┬────┐
│PLAY│STOP│REC │LOOP│SAVE│LOAD│EXPRT│CLRR│
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 8 (Bottom): Mode Select
┌────┬────┬────┬────┬────┬────┬────┬────┐
│CHRD│PROG│SECT│SONG│DRUM│BASS│FX  │PERF│
└────┴────┴────┴────┴────┴────┴────┴────┘

LED Colors:
- White = Available
- Green = Active/Playing
- Yellow = Selected
- Orange = Recording
- Red = Stopped
- Blue = Section Playing
```

## Data Structure

### Dictionary Schema (Enhanced)

```javascript
{
  // Existing
  "current_chord": { root, quality, notes },
  "sequencer_buffer": [ 16 chord slots ],
  
  // NEW: Song Arranger Data
  "saved_progressions": {
    "verse_prog": { name, chords: [], bars: 8 },
    "chorus_prog": { name, chords: [], bars: 8 },
    "bridge_prog": { name, chords: [], bars: 4 }
  },
  
  "song_sections": {
    "intro": { 
      name: "Intro",
      progression: "verse_prog",
      bars: 4,
      color: "blue"
    },
    "verse1": {
      name: "Verse 1", 
      progression: "verse_prog",
      bars: 8,
      color: "green"
    },
    "chorus1": {
      name: "Chorus 1",
      progression: "chorus_prog", 
      bars: 8,
      color: "yellow"
    }
  },
  
  "song_arrangement": [
    { section_id: "intro", start_bar: 0 },
    { section_id: "verse1", start_bar: 4 },
    { section_id: "chorus1", start_bar: 12 },
    { section_id: "verse2", start_bar: 20 }
  ],
  
  "playback_state": {
    playing: false,
    current_bar: 0,
    current_section: "verse1",
    loop_enabled: false
  }
}
```

## Workflow Steps (Detailed)

### Phase 1: Capture Musical Elements (DONE ✅)
- Chord Lab captures chords from APC64
- Chords stored in dictionary
- Visual feedback on APC64

### Phase 2: Build Progressions (PARTIALLY DONE 🟡)
- Sequencer stores 16-step chord sequences
- **NEED**: Save/load named progressions
- **NEED**: Progression library browser

### Phase 3: Define Song Structure (NEW ⚠️)
- Create section templates (Verse, Chorus, etc.)
- Assign progression to each section
- Set section duration in bars
- Visual section editor

### Phase 4: Arrange Timeline (NEW ⚠️)
- Drag sections into order
- Duplicate sections (Verse 1, Verse 2)
- See total song length
- Reorder with drag-and-drop

### Phase 5: Live Playback (NEW ⚠️)
- Play through arrangement
- Follow playback position
- Trigger sections manually from APC64
- Loop sections for practice

### Phase 6: Export to Ableton (NEW ⚠️)
- Generate MIDI clips for each section
- Place in arrangement view
- Set clip lengths correctly
- Include chord, drum, bass parts

## Technical Implementation

### New Device: Track_6_Song_Arranger.amxd

**JavaScript Modules:**
1. `progression_library.js` - Save/load progressions
2. `section_editor.js` - Define sections
3. `timeline_manager.js` - Arrange sections
4. `playback_engine.js` - Follow arrangement
5. `ableton_exporter.js` - Create clips via LOM

**Max UI Components:**
1. `[live.tab]` - Mode selector
2. `[live.grid]` - Section timeline
3. `[live.menu]` - Progression selector
4. `[live.text]` - Section buttons
5. `[live.numbox]` - Bar duration
6. Custom JavaScript rendering for timeline

**Integration Points:**
- Reads from dictionary (progressions, sections)
- Writes to dictionary (arrangement, playback state)
- Sends to APC64 (LED feedback)
- Controls Ableton via LOM (create clips)

## Success Metrics (The Home Run!)

When complete, users can:
✅ Capture chords with APC64 in seconds
✅ Build chord progressions visually  
✅ Define song sections with one click
✅ See entire song structure at a glance
✅ Play back arrangement live
✅ Export to Ableton arrangement automatically
✅ Perform live with APC64 section triggers

**Time Savings:**
- Traditional: 30-60 minutes to arrange a song in Ableton
- With Power Trio: 5-10 minutes from idea to arrangement

## Next Steps

1. Build progression library system
2. Create section editor GUI
3. Implement timeline view
4. Add playback engine
5. Build Ableton exporter
6. Integrate with APC64
7. Add save/load for songs

This is the complete vision. Ready to build it?

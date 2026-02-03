# Song Arranger - Max GUI Build Guide

## Quick Start

1. **Open the patch:**
   - Navigate to `track_6_song_arranger/`
   - Double-click `SongArranger.maxpat`
   - Max will open the patch

2. **What you'll see:**
   - **Top**: Title and script loader
   - **Section 1 (Purple)**: Progression Library controls
   - **Section 2 (Green)**: Section Definitions
   - **Section 3 (Red)**: Song Arrangement timeline
   - **Section 4 (Dark)**: Playback and Export

## How to Use (Step by Step)

### STEP 1: Save a Progression

1. Use **Track 2 (Sequencer)** to create a chord progression
2. In Song Arranger, type a name: `verse_prog`
3. Click **"Save Current Progression"**
4. Console will show: `✅ Saved progression: "verse_prog" (4 chords)`

### STEP 2: Create Sections

1. Fill in the fields:
   - **ID**: `verse1` 
   - **Name**: `Verse 1`
   - **Progression**: Select `verse_prog` from dropdown
   - **Bars**: `8`

2. Click **"Create Section"**
3. Repeat for: `intro`, `chorus1`, `bridge`, `outro`

### STEP 3: Build Arrangement

1. Select section from **"Add Section Menu"**
2. Click **"Add to Arrangement"**
3. Section appears in timeline display
4. Click **"Get Arrangement"** to refresh display

### STEP 4: Playback

1. Click **▶ PLAY** to start
2. Click **⏹ STOP** to stop
3. Use **Jump to Section** to skip around

### STEP 5: Export

1. Click **🚀 Export to Ableton**
2. Creates MIDI clips in arrangement view
3. Each section becomes a clip with chords

## Button Wiring Reference

The GUI buttons need to be connected to send messages. Here's what each does:

### Progression Library
- **Save Current** → Gets sequencer buffer, saves with name
- **List Progressions** → Shows all saved progressions in dropdown
- **Load Selected** → Loads progression back to sequencer
- **Delete Selected** → Removes progression

### Section Definitions  
- **Create Section** → Creates new section with specified settings
- **List Sections** → Shows all sections in text area

### Song Arrangement
- **Add to Arrangement** → Adds selected section to timeline
- **Get Arrangement** → Refreshes display
- **Clear Arrangement** → Removes all sections

### Playback
- **Play** → Starts playback from beginning
- **Stop** → Stops playback
- **Jump** → Skips to specific section index
- **Status** → Shows state in Max Console

## Adding Additional Wiring

To fully wire the buttons, you need to add message boxes that format the commands. Here's the pattern:

```
[live.text "Button"] 
    |
[trigger bang]
    |
[message "command_name"]
    |
[node.script] inlet
```

### Example: Wire "Save Progression" Button

In presentation mode:
1. Unlock the patch (click lock icon)
2. Add between button and script:

```
[live.text save_prog_btn]
    |
[trigger bang bang]
   /              \
[textedit]   [prepend save_progression]
    |              |
[sprintf %s]      /
    |            /
    ----------- 
         |
[node.script] inlet
```

## Console Output

When working correctly, you'll see:
```
========================================
SONG ARRANGER LOADED
========================================

✅ Saved progression: "verse_prog" (4 chords)
✅ Created section: "Verse 1" using verse_prog (8 bars)
✅ Added "Verse 1" to arrangement at bar 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SONG ARRANGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Intro (bars 0-4)
  2. Verse 1 (bars 4-12)
  3. Chorus 1 (bars 12-20)

Total: 20 bars
```

## Troubleshooting

**Script not loading?**
- Check textfile points to: `track_6_song_arranger/song_arranger.js`
- Verify @autostart 1 is set on node.script
- Check Max Console for errors

**Buttons not responding?**
- Make sure you've unlocked the patch
- Verify connections from buttons to script
- Check for "no such method" errors in console

**Dictionary not found?**
- Make sure Track 3 (Global Brain) is loaded first
- Check dict name is `---power_trio_brain`
- Verify @embed 0 is set

## Next Steps

1. Test each button individually
2. Create a test progression
3. Build a simple arrangement (Intro → Verse → Chorus)
4. Try playback
5. Export to Ableton!

The GUI provides the complete visual interface for the Power Trio workflow!

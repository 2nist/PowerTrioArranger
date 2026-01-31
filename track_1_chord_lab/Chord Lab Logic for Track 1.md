\\**logic.js** file for **Track 1: The Chord Lab**.

This script turns your APC64 grid into the "Music Theory Calculator" we discussed. It handles the math to generate Power Chords, Triads, 7ths, 9ths, and Altered chords based on which pad you press, then broadcasts that data to the Global Brain.

### **Instructions**

1. Create a file named logic.js in the same folder as your Arranger\_ChordGen.amxd.  
2. Paste the code below into it.  
3. Connect the Max objects as described in the "Wiring Guide" at the bottom.

### **The Code (logic.js)**

JavaScript

const maxApi \= require('max-api');

// \--- CONFIGURATION \---  
const DICT\_NAME \= "---power\_trio\_brain";  
const START\_NOTE \= 36; // C1 (Bottom-left pad of APC64 in standard mode)  
const GRID\_WIDTH \= 8;

// \--- STATE \---  
let globalState \= {  
    root\_key: 60,       // Middle C  
    scale\_type: 'major', // 'major' or 'minor'  
    voicing: {  
        spread: 0,      // 0 \= closed, 1 \= open/drop-2  
        inversion: 0    // 0 \= root pos, 1 \= 1st inv, 2 \= 2nd inv  
    }  
};

// \--- MUSIC THEORY CONSTANTS \---  
const SCALES \= {  
    major: \[0, 2, 4, 5, 7, 9, 11\],  
    minor: \[0, 2, 3, 5, 7, 8, 10\]  
};

// Maps Matrix Rows to Chord Flavors  
// Row 0 \= Bottom Row of APC64  
const CHORD\_TYPES \= \[  
    { name: "Power", intervals: \[0, 4\] },           // Row 1: Root, 5th  
    { name: "Triad", intervals: \[0, 2, 4\] },        // Row 2: 1, 3, 5  
    { name: "7th",   intervals: \[0, 2, 4, 6\] },     // Row 3: 1, 3, 5, 7  
    { name: "9th",   intervals: \[0, 2, 4, 6, 8\] },  // Row 4: 1, 3, 5, 7, 9  
    { name: "Alt",   intervals: \[0, 2, 4, 6\] }      // Row 5: Altered (Logic handled below)  
\];

// \--- CORE FUNCTIONS \---

/\*\*  
 \* Main Handler: Receives MIDI Note from APC64 Pad  
 \*/  
maxApi.addHandler('grid\_input', (midiNote) \=\> {  
    // 1\. Calculate Grid Coordinates  
    const offset \= midiNote \- START\_NOTE;  
    const col \= offset % GRID\_WIDTH; // 0-7  
    const row \= Math.floor(offset / GRID\_WIDTH); // 0-7

    // 2\. Route based on Zone  
    if (col \< 7 && row \< 5) {  
        // ZONES 1-7, ROWS 1-5: CHORD GENERATION  
        generateAndSendChord(col, row);  
    }   
    else if (col \=== 7) {  
        // COLUMN 8: MODIFIERS (Inversions, etc.)  
        handleModifier(row);  
    }  
      
    // Feedback: Light up the pad (Optional, handled via Max usually)  
    maxApi.outlet('feedback', midiNote, 1); // Velocity 1 \= Green (example)  
});

/\*\*  
 \* Handlers for Faders (Native M4L Dials mapped to these)  
 \*/  
maxApi.addHandler('set\_spread', (val) \=\> {  
    globalState.voicing.spread \= val; // 0.0 to 1.0  
    // Re-trigger current chord if needed? For now, just update state.  
});

maxApi.addHandler('set\_key', (midiVal) \=\> {  
    globalState.root\_key \= midiVal;  
});

maxApi.addHandler('set\_scale', (isMinor) \=\> {  
    globalState.scale\_type \= (isMinor \> 0) ? 'minor' : 'major';  
});

// \--- LOGIC ENGINE \---

function generateAndSendChord(degreeIndex, complexityRow) {  
    const scale \= SCALES\[globalState.scale\_type\];  
    const rootNote \= globalState.root\_key;  
      
    // 1\. Determine Notes in Scale  
    // We generate 2 octaves of the scale to easily grab 9ths/11ths  
    let fullScale \= \[\];  
    for(let oct=0; oct\<2; oct++) {  
        scale.forEach(interval \=\> {  
            fullScale.push(interval \+ (oct \* 12));  
        });  
    }

    // 2\. Select Intervals based on Row (Complexity)  
    let pattern \= CHORD\_TYPES\[complexityRow\].intervals;  
      
    // Handling "Row 5: Altered" Logic  
    // If it's Row 5, we swap the 3rd to make it Major-\>Minor or Minor-\>Major (Borrowed Chord)  
    let isAltered \= (complexityRow \=== 4);  
      
    let noteIndices \= pattern.map(intervalStep \=\> {  
        // DegreeIndex is 0 for Tonic, 1 for Supertonic...  
        // We add the intervalStep (0 for root, 2 for third, 4 for fifth)  
        return degreeIndex \+ intervalStep;  
    });

    // 3\. Convert Indices to MIDI Notes  
    let midiNotes \= noteIndices.map((idx, i) \=\> {  
        // Safety wrap  
        let scaleNote \= fullScale\[idx % fullScale.length\];  
          
        // Handle Octave Wrapping manually if idx exceeds scale length  
        let octaveOffset \= Math.floor(idx / scale.length) \* 12;  
          
        let finalNote \= rootNote \+ scaleNote \+ octaveOffset;

        // Apply Alteration (Row 5 Special Logic)  
        if (isAltered && i \=== 1) { // The 3rd of the chord  
             // If Major scale, flatten the 3rd. If Minor, sharpen it.  
             finalNote \+= (globalState.scale\_type \=== 'major') ? \-1 : 1;  
        }  
          
        return finalNote;  
    });

    // 4\. Apply Voicing (Spread / Inversion)  
    midiNotes \= applyVoicing(midiNotes);

    // 5\. Build Data Object  
    const chordObj \= {  
        root\_name: getNoteName(rootNote \+ scale\[degreeIndex\]),  
        quality: CHORD\_TYPES\[complexityRow\].name,  
        degree: (degreeIndex \+ 1).toString(),  
        midi\_notes: midiNotes,  
        timestamp: Date.now()  
    };

    // 6\. Output to Audio (Audition)  
    // Send list of notes to Max to play immediately  
    maxApi.outlet('audition', midiNotes);

    // 7\. Write to Clipboard (The Global Brain)  
    updateClipboard(chordObj);  
}

function applyVoicing(notes) {  
    let voicedNotes \= \[...notes\];

    // Inversions  
    for(let i=0; i\<globalState.voicing.inversion; i++) {  
        let bottomNote \= voicedNotes.shift();  
        voicedNotes.push(bottomNote \+ 12);  
    }

    // Spread (Drop 2 voicing if Spread \> 50%)  
    if (globalState.voicing.spread \> 64 && voicedNotes.length \>= 4) {  
        // Move the 2nd highest note down an octave  
        let dropNote \= voicedNotes.splice(voicedNotes.length \- 2, 1)\[0\];  
        voicedNotes.unshift(dropNote \- 12);  
    }  
      
    return voicedNotes;  
}

function handleModifier(row) {  
    // Column 8 Modifiers  
    switch(row) {  
        case 0: // Pad 8,1: Reset Inversion  
            globalState.voicing.inversion \= 0;  
            break;  
        case 1: // Pad 8,2: Inversion Up  
            globalState.voicing.inversion \= (globalState.voicing.inversion \+ 1) % 3;  
            break;  
        case 2: // Pad 8,3: Parallel Minor Toggle  
            globalState.scale\_type \= (globalState.scale\_type \=== 'major') ? 'minor' : 'major';  
            break;  
    }  
    maxApi.post(\`Modifier Triggered: Row ${row} | Inv: ${globalState.voicing.inversion}\`);  
}

async function updateClipboard(chordData) {  
    // Write to the global dict path: clipboard::active\_chord  
    await maxApi.setDict(DICT\_NAME, "clipboard::active\_chord", chordData);  
    maxApi.post("Clipboard Updated: " \+ chordData.root\_name \+ " " \+ chordData.quality);  
}

// Helper  
function getNoteName(midi) {  
    const notes \= \['C','C\#','D','D\#','E','F','F\#','G','G\#','A','A\#','B'\];  
    return notes\[midi % 12\];  
}

### **Wiring Guide (Inside Arranger\_ChordGen.amxd)**

You need to connect standard Max objects to this node.script object to make it work.

1. **APC64 Input:**  
   * \[ctlin 36 99\] (or \[notein\] depending on your APC mode) \-\> \[stripnote\] \-\> Connect to node.script.  
   * *Correction:* Use \[prepend grid\_input\] before sending the note number to the Node object.  
2. **Audio Output (Audition):**  
   * The Node object has an outlet.  
   * Connect Outlet 1 \-\> \[route audition feedback\].  
   * \[route audition\] \-\> \[makenote 100 500\] \-\> \[noteout\].  
   * *(This lets you hear the chord instantly when you press the pad).*  
3. **Visual Feedback:**  
   * \[route feedback\] \-\> Connect to your MIDI Output object sending back to APC64 (to light the LED).  
4. **Dictionary:**  
   * Create a \[dict \---power\_trio\_brain\] object anywhere in the patch. The Node script finds it by name; you don't need to patch a cord to it.  
5. **Faders:**  
   * Create a \[live.dial\] for "Spread".  
   * Connect it to \[prepend set\_spread\] \-\> node.script.  
   * Create a \[live.menu\] for Scale (Major/Minor).  
   * Connect it to \[prepend set\_scale\] \-\> node.script.

### **Why this logic is "The Lab"**

Notice the generateAndSendChord function. It doesn't just play a sound; it calculates the **Theory Data** (Degree, Quality, MIDI Notes) and stamps it into the Global Dict. This means when you switch to **Track 2**, the Sequencer already knows *exactly* what "Current Chord" is waiting in the clipboard.
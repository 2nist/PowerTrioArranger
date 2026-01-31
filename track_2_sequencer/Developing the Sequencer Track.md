We need to develop **Track 2: The Sequencer (Arranger\_Sequencer.amxd)**.

This device has two distinct jobs:

1. **The Editor:** It maps the APC64 grid to a timeline (Pad 1 \= Beat 1). When you press a pad, it "pastes" the chord from Track 1's clipboard.  
2. **The Engine:** It watches Ableton's transport and broadcasts the "Current Chord" to the rest of the band (Bass/Arps) at the exact right millisecond.

Here is the complete development package for Track 2\.

### **1\. The Concept: "The Time Painter"**

* **Input:** You are on **Track 1**. You find a "C Maj 7" you like. It is now in the Clipboard.  
* **Action:** You switch to **Track 2**. The 8x8 Grid represents 4 bars of 16th notes (or 8 bars of 8th notes—configurable).  
* **Workflow:** You tap **Pad 1** and **Pad 9**.  
  * *Result:* The sequencer paints "C Maj 7" starting at Step 1 and Step 9\.  
* **Visuals:** The pads light up to show where chords are placed.

### **2\. The Code: sequencer.js**

Create a new file named sequencer.js in your Track 2 M4L Project folder.

JavaScript

const maxApi \= require('max-api');

// \--- CONFIGURATION \---  
const DICT\_NAME \= "---power\_trio\_brain";  
const TOTAL\_STEPS \= 64; // 8x8 Grid  
let STEPS\_PER\_BAR \= 16; // 16th note resolution

// \--- STATE \---  
let sequenceData \= new Array(TOTAL\_STEPS).fill(null);  
let lastKnownChord \= null;

// \--- INITIALIZATION \---  
// Initialize dict listener to watch for Clipboard updates from Track 1  
maxApi.addHandler('init', () \=\> {  
    // We don't strictly need to listen to clipboard changes,   
    // we just pull from it when a pad is pressed.  
    refreshGrid();  
});

// \--- EDITOR FUNCTIONS (APC64 Interaction) \---

/\*\*  
 \* Handle Pad Press on Track 2  
 \* @param {number} stepIndex \- 0 to 63 (mapped from MIDI notes 36-99)  
 \*/  
maxApi.addHandler('step\_press', async (stepIndex) \=\> {  
    if (stepIndex \< 0 || stepIndex \>= TOTAL\_STEPS) return;

    // 1\. Get the chord currently sitting in Track 1's Clipboard  
    const dict \= await maxApi.getDict(DICT\_NAME);  
      
    if (\!dict || \!dict.clipboard || \!dict.clipboard.active\_chord) {  
        maxApi.post("Error: No chord in clipboard\! Go to Track 1 and pick one.");  
        return;  
    }

    const chordToPaste \= dict.clipboard.active\_chord;

    // 2\. Logic: Toggle vs Overwrite  
    // If this step already has THIS chord, clear it. Otherwise, paste new one.  
    if (sequenceData\[stepIndex\] && sequenceData\[stepIndex\].root\_name \=== chordToPaste.root\_name) {  
         sequenceData\[stepIndex\] \= null; // Delete  
         maxApi.post(\`Step ${stepIndex}: Cleared\`);  
    } else {  
         sequenceData\[stepIndex\] \= chordToPaste; // Paste  
         maxApi.post(\`Step ${stepIndex}: Pasted ${chordToPaste.root\_name}${chordToPaste.quality}\`);  
    }

    // 3\. Update Visuals  
    refreshGrid();  
      
    // 4\. Save to Global Dict (so Track 3 can save it as a "Section" later)  
    await maxApi.updateDict(DICT\_NAME, "sequencer\_buffer::events", sequenceData);  
});

// \--- PLAYBACK ENGINE (Transport Listener) \---

/\*\*  
 \* Called by Ableton Transport every beat/step  
 \* @param {number} currentStep \- The quantization step from Live  
 \*/  
maxApi.addHandler('transport\_step', (currentStep) \=\> {  
    // Handle looping (0-63)  
    const activeStep \= currentStep % TOTAL\_STEPS;  
      
    // Check if we have a chord trigger on this exact step  
    const chordEvent \= sequenceData\[activeStep\];  
      
    if (chordEvent) {  
        // BROADCAST\!  
        // We found a chord. Send it to the "Live State" so Bass/Groove can read it.  
        maxApi.updateDict(DICT\_NAME, "transport::current\_chord", chordEvent);  
        maxApi.outlet('play\_chord', chordEvent.midi\_notes); // Local audio feedback  
    }  
});

// \--- HELPER: LED FEEDBACK \---  
function refreshGrid() {  
    // Send a list of 64 integers to Max to light up the APC64  
    // 0 \= Off, 1 \= Green (Has Chord), 5 \= Red (Cursor)  
    let ledState \= sequenceData.map(slot \=\> (slot \!== null) ? 1 : 0);  
    maxApi.outlet('batch\_led\_update', ledState);  
}

// Clear all steps  
maxApi.addHandler('clear\_pattern', () \=\> {  
    sequenceData.fill(null);  
    refreshGrid();  
    maxApi.updateDict(DICT\_NAME, "sequencer\_buffer::events", sequenceData);  
});

### **3\. The Wiring Guide (Inside Arranger\_Sequencer.amxd)**

This setup is slightly different because it needs to know **Time**.

1. **Transport Input (The Clock):**  
   * Create \[plugsync\~\].  
   * Connect the current step outlet (check help file, usually 2nd or 3rd outlet depending on configuration) to a \[change\] object (to prevent duplicate data).  
   * Connect to \[prepend transport\_step\] \-\> node.script.  
   * *Tip:* You might need to do some math on the \[plugsync\~\] ticks to convert them to "Steps" (0-63). A common way is \[transport\], get bars/beats/units, and convert to a step integer.  
2. **APC64 Pad Input:**  
   * \[notein\] (From APC64).  
   * \[stripnote\] (Remove Note Offs).  
   * \[- 36\] (Offset MIDI note 36 down to 0 for Array indexing).  
   * \[prepend step\_press\] \-\> node.script.  
3. **Visual Feedback (Batch Update):**  
   * The Node script outputs batch\_led\_update \[1, 0, 0, 1...\].  
   * You need to parse this list and send MIDI Note On messages back to the APC64.  
   * *Max Object chain:* \[list.iter\] \-\> \[t i i\] (trigger index and value).  
   * Using the Index as the Note Number (add 36 back\!) and the Value as Velocity (Color).  
   * \[noteout\] (To APC64).

### **4\. Integration Test**

Once you have this built:

1. Go to **Track 1**, hit a "C Maj" pad.  
2. Go to **Track 2**, hit Pad 1 (Step 1).  
   * *Does Pad 1 light up?*  
   * *If you hit Play in Ableton, does the C Major sound trigger when the timeline crosses Step 1?*


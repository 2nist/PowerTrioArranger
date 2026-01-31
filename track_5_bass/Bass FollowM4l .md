JavaScript  
const maxApi \= require('max-api');

// \--- CONFIGURATION \---  
const DICT\_NAME \= "---power\_trio\_brain";

// \--- STATE \---  
let bassParams \= {  
    octave: \-2,         // Drop 2 octaves below the chord root (e.g., C3 \-\> C1)  
    velocity: 100,      // Fixed velocity or dynamic  
    duration: 250,      // ms  
    probability: 1.0    // 100% chance to follow kick  
};

// \--- INPUT HANDLERS \---

/\*\*  
 \* 1\. The Pulse (From GrooveWanderer via \[receive\])  
 \*/  
maxApi.addHandler('kick\_trigger', async () \=\> {  
    // A. Check Probability (Humanize)  
    if (Math.random() \> bassParams.probability) return;

    // B. Get Current Pitch from the Brain  
    const dict \= await maxApi.getDict(DICT\_NAME);  
      
    if (\!dict || \!dict.clipboard || \!dict.clipboard.active\_chord) {  
        // Fallback if no chord is defined yet (Safety)  
        playNote(36 \+ (bassParams.octave \* 12\) \+ 24, bassParams.velocity);   
        return;  
    }

    const chord \= dict.clipboard.active\_chord; // e.g., { root\_midi: 60, quality: 'min7' }  
      
    // C. Calculate Bass Note  
    // Take the chord root (e.g., 60/C3) and drop it to Bass range (e.g., 36/C1)  
    let bassNote \= chord.root\_midi \+ (bassParams.octave \* 12);  
      
    // D. Play It  
    playNote(bassNote, bassParams.velocity);  
});

// \--- OUTPUT \---  
function playNote(pitch, velocity) {  
    // Output: \[note, velocity, duration, channel\]  
    // We send this to \[makenote\] in Max  
    maxApi.outlet('bass\_out', pitch, velocity, bassParams.duration);  
}

// \--- UI CONTROLS (From APC64 Faders) \---  
maxApi.addHandler('set\_octave', (val) \=\> {  
    bassParams.octave \= val; // Range \-3 to 0  
});

maxApi.addHandler('set\_sustain', (val) \=\> {  
    bassParams.duration \= val; // Range 50ms to 1000ms  
});


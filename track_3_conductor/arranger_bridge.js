// arranger_bridge.js - Bridge between Ableton Arranger (OSC) and Bass Follower
autowatch = 1;

// Current arrangement state
var current_sections = [];
var current_chords = [];
var global_key = 0;  // C = 0
var global_scale = "ionian";
var current_section_index = -1;
var playhead_bar = 0;

// OSC state
var osc_connected = false;

function init() {
    post("Arranger Bridge initialized\n");
    post("Listening for OSC messages from Ableton Arranger...\n");
}

// Receive arrangement data from Ableton Arranger via OSC
// Expected format: /arranger/update [JSON]
function updateArrangement(json_string) {
    try {
        var data = JSON.parse(json_string);
        
        if (data.sections) {
            current_sections = data.sections;
            post("Received " + current_sections.length + " sections\n");
        }
        
        if (data.chords) {
            current_chords = data.chords;
            post("Received " + current_chords.length + " chords\n");
        }
        
        if (data.key !== undefined) {
            global_key = data.key;
            post("Key: " + getNoteNameFromMIDI(global_key) + "\n");
            
            // Forward to bass_follower
            outlet(0, "setKey", global_key);
        }
        
        if (data.scale) {
            global_scale = data.scale;
            post("Scale: " + global_scale + "\n");
            
            // Forward to bass_follower
            outlet(0, "setScale", global_scale);
        }
        
        // Extract progression from current section
        updateProgression();
        
    } catch(e) {
        error("Error parsing arrangement data: " + e + "\n");
    }
}

// Update chord progression based on current section
function updateProgression() {
    if (current_sections.length === 0 || current_chords.length === 0) {
        return;
    }
    
    // Find current section
    var section = getCurrentSection(playhead_bar);
    if (!section) {
        return;
    }
    
    // Get chords for this section
    var section_chords = getChordsInSection(section);
    if (section_chords.length === 0) {
        return;
    }
    
    // Extract root notes as scale degrees
    var degrees = [];
    var bars_per_chord = [];
    
    for (var i = 0; i < section_chords.length; i++) {
        var chord = section_chords[i];
        
        // Calculate scale degree from root note
        var degree = getScaleDegree(chord.root, global_key, global_scale);
        degrees.push(degree);
        
        // Track bars per chord
        bars_per_chord.push(chord.duration_bars || 1);
    }
    
    post("Progression for " + section.name + ": " + degrees + "\n");
    
    // Forward to bass_follower
    outlet(0, "setProgression", JSON.stringify(degrees));
    
    // Set bars per chord (use first chord's duration)
    if (bars_per_chord.length > 0) {
        outlet(0, "setBarsPerChord", bars_per_chord[0]);
    }
}

// Get current section based on playhead position
function getCurrentSection(bar_num) {
    var cumulative_bars = 0;
    
    for (var i = 0; i < current_sections.length; i++) {
        var section = current_sections[i];
        cumulative_bars += section.bars;
        
        if (bar_num < cumulative_bars) {
            return section;
        }
    }
    
    return null;
}

// Get chords within a section
function getChordsInSection(section) {
    var section_chords = [];
    
    // Find section start bar
    var section_start = 0;
    for (var i = 0; i < current_sections.length; i++) {
        if (current_sections[i].name === section.name) {
            break;
        }
        section_start += current_sections[i].bars;
    }
    
    var section_end = section_start + section.bars;
    
    // Filter chords in range
    for (var i = 0; i < current_chords.length; i++) {
        var chord = current_chords[i];
        if (chord.bar >= section_start && chord.bar < section_end) {
            section_chords.push(chord);
        }
    }
    
    return section_chords;
}

// Calculate scale degree (0-6) from MIDI note
function getScaleDegree(root_note, key, scale_name) {
    var SCALE_INTERVALS = {
        "ionian": [0, 2, 4, 5, 7, 9, 11],
        "dorian": [0, 2, 3, 5, 7, 9, 10],
        "phrygian": [0, 1, 3, 5, 7, 8, 10],
        "lydian": [0, 2, 4, 6, 7, 9, 11],
        "mixolydian": [0, 2, 4, 5, 7, 9, 10],
        "aeolian": [0, 2, 3, 5, 7, 8, 10],
        "locrian": [0, 1, 3, 5, 6, 8, 10]
    };
    
    var intervals = SCALE_INTERVALS[scale_name];
    if (!intervals) {
        intervals = SCALE_INTERVALS["ionian"];
    }
    
    // Calculate interval from key
    var interval = (root_note - key + 12) % 12;
    
    // Find closest scale degree
    for (var i = 0; i < intervals.length; i++) {
        if (intervals[i] === interval) {
            return i;
        }
    }
    
    // Fallback: return closest
    var closest = 0;
    var min_dist = 12;
    for (var i = 0; i < intervals.length; i++) {
        var dist = Math.abs(intervals[i] - interval);
        if (dist < min_dist) {
            min_dist = dist;
            closest = i;
        }
    }
    
    return closest;
}

// Called on bar boundary from transport
function onBar(bar_number) {
    playhead_bar = bar_number;
    
    // Check if section changed
    var section = getCurrentSection(bar_number);
    if (section) {
        var section_index = current_sections.indexOf(section);
        if (section_index !== current_section_index) {
            current_section_index = section_index;
            post("Entered section: " + section.name + " (bar " + bar_number + ")\n");
            
            // Update progression for new section
            updateProgression();
        }
    }
}

// Receive key from GUI or external source
function setKey(key_num) {
    global_key = Math.max(0, Math.min(11, key_num));
    post("Key set to: " + getNoteNameFromMIDI(global_key) + "\n");
    outlet(0, "setKey", global_key);
}

// Receive scale from GUI
function setScale(scale_name) {
    global_scale = scale_name;
    post("Scale set to: " + scale_name + "\n");
    outlet(0, "setScale", scale_name);
}

// Manual progression override
function setProgression(degrees_json) {
    post("Manual progression override: " + degrees_json + "\n");
    outlet(0, "setProgression", degrees_json);
}

// Get note name from MIDI number
function getNoteNameFromMIDI(midi_note) {
    var NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return NOTE_NAMES[midi_note % 12];
}

// OSC connection status
function oscConnected() {
    osc_connected = true;
    post("OSC connection established\n");
    outlet(1, "osc_status", "connected");
}

function oscDisconnected() {
    osc_connected = false;
    post("OSC connection lost\n");
    outlet(1, "osc_status", "disconnected");
}

// For testing without OSC
function testData() {
    var test_arrangement = {
        "key": 0,  // C
        "scale": "ionian",
        "sections": [
            {"name": "Verse", "bars": 8},
            {"name": "Chorus", "bars": 8}
        ],
        "chords": [
            {"bar": 0, "root": 0, "duration_bars": 2},   // C (I)
            {"bar": 2, "root": 5, "duration_bars": 2},   // F (IV)
            {"bar": 4, "root": 7, "duration_bars": 2},   // G (V)
            {"bar": 6, "root": 0, "duration_bars": 2}    // C (I)
        ]
    };
    
    updateArrangement(JSON.stringify(test_arrangement));
}

init();

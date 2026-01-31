// note_generator.js - Enhanced with proper transport sync
autowatch = 1;

var current_patterns = {
    kick: null,
    snare: null,
    hats_ride: null,
    percussion: null
};

var tempo = 120;
var playing = false;
var current_beat = 0;
var pattern_length = 16; // 4 bars in beats
var ticks_per_beat = 480; // Standard MIDI ticks

// Set pattern for a layer
function setPattern(layer, json_string) {
    try {
        current_patterns[layer] = JSON.parse(json_string);
        var note_count = current_patterns[layer].pattern.notes.length;
        post("Pattern set for " + layer + ": " + note_count + " notes\n");
    } catch(e) {
        error("Error parsing pattern for " + layer + ": " + e + "\n");
    }
}

// Called from transport with beat position (in beats, as float)
function beat(beat_position) {
    if (!playing) {
        playing = true; // Auto-start on first beat
    }
    
    // Normalize beat position to pattern length
    current_beat = beat_position % pattern_length;
    
    // Generate notes for all layers
    for (var layer in current_patterns) {
        if (current_patterns[layer]) {
            generateNotesForLayer(layer, current_beat);
        }
    }
}

function generateNotesForLayer(layer, beat_position) {
    var pattern = current_patterns[layer];
    if (!pattern || !pattern.pattern || !pattern.pattern.notes) {
        return;
    }
    
    var notes = pattern.pattern.notes;
    
    // CRITICAL: Check ALL notes and output those within current 16th note window
    var tolerance = 0.0625; // One 16th note = 0.0625 beats (1/16)
    var beat_window_start = Math.floor(beat_position / tolerance) * tolerance;
    var beat_window_end = beat_window_start + tolerance;
    
    for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        var note_beat = note.beat % pattern_length;
        
        // Check if note falls within current window
        if (note_beat >= beat_window_start && note_beat < beat_window_end) {
            // Calculate delay within the window (for timing precision)
            var delay_ticks = (note_beat - beat_window_start) * ticks_per_beat;
            
            // Output: note_num, velocity, duration (in ticks), delay (in ticks)
            outlet(0, note.note, note.velocity, 100, Math.round(delay_ticks));
        }
    }
}

function setTempo(bpm) {
    tempo = Math.max(20, Math.min(300, bpm));
    post("Tempo set to: " + tempo + " BPM\n");
}

function start() {
    playing = true;
    current_beat = 0;
    post("Note generator started\n");
    outlet(1, "playing", 1); // Status output
}

function stop() {
    playing = false;
    post("Note generator stopped\n");
    outlet(1, "playing", 0); // Status output
}

function reset() {
    current_beat = 0;
    post("Beat position reset\n");
}

// For testing - manual beat advance
function bang() {
    beat(current_beat);
    current_beat = (current_beat + 0.0625) % pattern_length; // Advance by 16th note
}

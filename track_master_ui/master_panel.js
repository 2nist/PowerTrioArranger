/**
 * ============================================================================
 * POWER TRIO ARRANGER - MASTER UI PANEL
 * ============================================================================
 * 
 * Displays current state from global dictionary and provides manual controls
 * 
 * OUTPUTS:
 *   outlet 0: UI updates (connect to Max UI objects)
 *   outlet 1: Commands to send to other devices
 * 
 * ============================================================================
 */

const max = require('max-api');

// Globals
let dictName = '---power_trio_brain';
let currentChord = { root: '', quality: '', notes: [] };
let sequencerLength = 16;
let currentStep = 0;
let bassState = 'idle';
let lastUpdate = Date.now();

// Initialize
max.post('========================================');
max.post('MASTER UI PANEL LOADED');
max.post('========================================');
max.post('Monitoring dictionary: ' + dictName);
max.post('');

// Set up dictionary monitoring
max.addHandler('dict_response', (key, ...values) => {
    handleDictResponse(key, values);
});

// Set up periodic polling
setInterval(() => {
    pollDictionaryState();
}, 100); // Update UI at 10Hz

// Manual control handlers
max.addHandler('clear_chord', () => {
    max.outlet('dict', 'current_chord', 'clear');
    max.post('📝 Cleared current chord');
});

max.addHandler('clear_sequencer', () => {
    max.outlet('dict', 'sequencer_buffer', 'clear');
    max.post('📝 Cleared sequencer');
});

max.addHandler('trigger_bass', () => {
    max.outlet('---kick_pulse_global', 1);
    max.post('🎸 Manual bass trigger');
});

max.addHandler('refresh_display', () => {
    pollDictionaryState();
    max.post('🔄 Display refreshed');
});

// Dictionary response handler
function handleDictResponse(key, values) {
    if (key === 'current_chord') {
        parseCurrentChord(values);
        updateChordDisplay();
    } else if (key === 'sequencer_buffer') {
        parseSequencer(values);
        updateSequencerDisplay();
    } else if (key === 'bass_state') {
        bassState = values[0] || 'idle';
        updateBassDisplay();
    }
}

// Poll dictionary for current state
function pollDictionaryState() {
    // Request current chord
    max.outlet('dict', dictName, 'get', 'current_chord');
    
    // Request sequencer state every 10 updates (1Hz)
    if (Date.now() - lastUpdate > 1000) {
        max.outlet('dict', dictName, 'get', 'sequencer_buffer');
        lastUpdate = Date.now();
    }
}

// Parse current chord from dict response
function parseCurrentChord(values) {
    try {
        if (values.length >= 2) {
            currentChord.root = values[0] || '';
            currentChord.quality = values[1] || '';
            currentChord.notes = values.slice(2) || [];
        }
    } catch (e) {
        max.post('Error parsing chord: ' + e);
    }
}

// Parse sequencer from dict response
function parseSequencer(values) {
    try {
        if (values && values.length > 0) {
            // Count non-empty slots
            let filledSlots = 0;
            for (let i = 0; i < Math.min(values.length, sequencerLength); i++) {
                if (values[i] && values[i] !== 'empty') {
                    filledSlots++;
                }
            }
            currentStep = filledSlots;
        }
    } catch (e) {
        max.post('Error parsing sequencer: ' + e);
    }
}

// Update UI displays
function updateChordDisplay() {
    const chordText = currentChord.root 
        ? `${currentChord.root} ${currentChord.quality}` 
        : 'No Chord';
    
    max.outlet('display', 'chord', chordText);
    
    // Send note list
    if (currentChord.notes.length > 0) {
        max.outlet('display', 'notes', currentChord.notes.join(' '));
    } else {
        max.outlet('display', 'notes', '---');
    }
}

function updateSequencerDisplay() {
    max.outlet('display', 'sequencer', `${currentStep}/${sequencerLength}`);
}

function updateBassDisplay() {
    max.outlet('display', 'bass', bassState);
}

// Status reporter
setInterval(() => {
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    max.post('POWER TRIO STATUS');
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    max.post(`Chord: ${currentChord.root} ${currentChord.quality}`);
    max.post(`Notes: ${currentChord.notes.join(', ') || 'none'}`);
    max.post(`Sequencer: ${currentStep}/${sequencerLength} slots`);
    max.post(`Bass: ${bassState}`);
    max.post('');
}, 30000); // Status every 30 seconds

max.post('✅ Master UI ready - monitoring active');

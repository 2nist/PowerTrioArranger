/**
 * GUI Helper - Handles button clicks and formats messages for song_arranger.js
 */

const max = require('max-api');

// Button handlers that format messages for the main script

max.addHandler('save_prog_clicked', (name) => {
    if (!name || name === 'progression_name') {
        max.post('⚠️  Enter a progression name first');
        return;
    }
    
    // Get current sequencer buffer from dictionary
    max.outlet('dict_request', dictName, 'get', 'sequencer_buffer');
    max.post(`Requesting sequencer data to save as "${name}"`);
});

max.addHandler('create_section_clicked', (id, name, progression, bars) => {
    if (!id || !name || !progression) {
        max.post('⚠️  Fill in all section fields');
        return;
    }
    
    const msg = ['create_section', id, name, progression, bars || 8, 'white'];
    max.outlet('to_arranger', ...msg);
});

max.addHandler('add_to_arrangement_clicked', (sectionId, position) => {
    if (!sectionId) {
        max.post('⚠️  Select a section first');
        return;
    }
    
    const msg = position !== undefined 
        ? ['add_to_arrangement', sectionId, position]
        : ['add_to_arrangement', sectionId];
    
    max.outlet('to_arranger', ...msg);
});

max.addHandler('jump_clicked', (sectionIndex) => {
    max.outlet('to_arranger', 'jump_to_section', sectionIndex || 0);
});

// Pass-through commands
const simpleCommands = [
    'list_progressions',
    'list_sections', 
    'clear_arrangement',
    'get_arrangement',
    'play',
    'stop',
    'status'
];

simpleCommands.forEach(cmd => {
    max.addHandler(cmd + '_clicked', () => {
        max.outlet('to_arranger', cmd);
    });
});

max.post('GUI Helper loaded - ready to process button clicks');

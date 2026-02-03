/**
 * ============================================================================
 * POWER TRIO ARRANGER - SONG ARRANGER (Master Component)
 * ============================================================================
 * 
 * This is the centerpiece - manages the entire song arrangement workflow
 * 
 * FEATURES:
 * - Save/load named chord progressions
 * - Define song sections (Verse, Chorus, Bridge, etc.)
 * - Arrange sections into complete song structure
 * - Live playback with position tracking
 * - Export to Ableton arrangement
 * 
 * ============================================================================
 */

const max = require('max-api');

// Globals
const dictName = '---power_trio_brain';
let savedProgressions = {};
let songSections = {};
let songArrangement = [];
let playbackState = {
    playing: false,
    currentBar: 0,
    currentSectionIndex: 0,
    loopEnabled: false
};

// Initialize
max.post('========================================');
max.post('SONG ARRANGER LOADED');
max.post('========================================');
max.post('');

// Load existing data from dictionary
setTimeout(() => {
    loadFromDictionary();
    max.post('✅ Song Arranger ready');
}, 500);

//==============================================================================
// PROGRESSION LIBRARY
//==============================================================================

max.addHandler('save_progression', (name, ...chords) => {
    if (!name || chords.length === 0) {
        max.post('❌ Save progression requires: name + chords');
        return;
    }
    
    savedProgressions[name] = {
        name: name,
        chords: chords,
        createdAt: Date.now()
    };
    
    // Save to dictionary
    max.outlet('dict', dictName, 'replace', 'saved_progressions', name, 
        'name', name,
        'chords', ...chords,
        'createdAt', Date.now());
    
    max.post(`✅ Saved progression: "${name}" (${chords.length} chords)`);
    max.outlet('progression_saved', name);
});

max.addHandler('load_progression', (name) => {
    if (!savedProgressions[name]) {
        max.post(`❌ Progression "${name}" not found`);
        return;
    }
    
    const prog = savedProgressions[name];
    max.post(`📖 Loading progression: "${name}"`);
    max.outlet('progression_loaded', name, ...prog.chords);
});

max.addHandler('list_progressions', () => {
    const names = Object.keys(savedProgressions);
    if (names.length === 0) {
        max.post('No saved progressions');
        return;
    }
    
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    max.post('SAVED PROGRESSIONS');
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    names.forEach(name => {
        const prog = savedProgressions[name];
        max.post(`  • ${name} (${prog.chords.length} chords)`);
    });
    max.post('');
    
    max.outlet('progression_list', ...names);
});

max.addHandler('delete_progression', (name) => {
    if (!savedProgressions[name]) {
        max.post(`❌ Progression "${name}" not found`);
        return;
    }
    
    delete savedProgressions[name];
    max.outlet('dict', dictName, 'remove', 'saved_progressions', name);
    max.post(`🗑️  Deleted progression: "${name}"`);
});

//==============================================================================
// SECTION EDITOR
//==============================================================================

max.addHandler('create_section', (sectionId, name, progressionName, bars, color) => {
    if (!sectionId || !name || !progressionName) {
        max.post('❌ Create section requires: id, name, progression');
        return;
    }
    
    if (!savedProgressions[progressionName]) {
        max.post(`❌ Progression "${progressionName}" not found`);
        return;
    }
    
    songSections[sectionId] = {
        id: sectionId,
        name: name,
        progression: progressionName,
        bars: bars || 8,
        color: color || 'white'
    };
    
    // Save to dictionary
    max.outlet('dict', dictName, 'replace', 'song_sections', sectionId,
        'name', name,
        'progression', progressionName,
        'bars', bars || 8,
        'color', color || 'white');
    
    max.post(`✅ Created section: "${name}" using ${progressionName} (${bars} bars)`);
    max.outlet('section_created', sectionId, name);
});

max.addHandler('edit_section', (sectionId, property, value) => {
    if (!songSections[sectionId]) {
        max.post(`❌ Section "${sectionId}" not found`);
        return;
    }
    
    songSections[sectionId][property] = value;
    max.outlet('dict', dictName, 'replace', 'song_sections', sectionId, property, value);
    max.post(`✅ Updated section "${sectionId}": ${property} = ${value}`);
});

max.addHandler('list_sections', () => {
    const ids = Object.keys(songSections);
    if (ids.length === 0) {
        max.post('No sections defined');
        return;
    }
    
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    max.post('SONG SECTIONS');
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    ids.forEach(id => {
        const section = songSections[id];
        max.post(`  ${section.name} (${section.bars} bars) → ${section.progression}`);
    });
    max.post('');
});

max.addHandler('delete_section', (sectionId) => {
    if (!songSections[sectionId]) {
        max.post(`❌ Section "${sectionId}" not found`);
        return;
    }
    
    delete songSections[sectionId];
    max.outlet('dict', dictName, 'remove', 'song_sections', sectionId);
    max.post(`🗑️  Deleted section: "${sectionId}"`);
});

//==============================================================================
// SONG ARRANGEMENT
//==============================================================================

max.addHandler('add_to_arrangement', (sectionId, position) => {
    if (!songSections[sectionId]) {
        max.post(`❌ Section "${sectionId}" not found`);
        return;
    }
    
    const section = songSections[sectionId];
    const startBar = calculateStartBar(position);
    
    const arrangementItem = {
        sectionId: sectionId,
        startBar: startBar,
        endBar: startBar + section.bars,
        position: position !== undefined ? position : songArrangement.length
    };
    
    if (position !== undefined && position < songArrangement.length) {
        songArrangement.splice(position, 0, arrangementItem);
        recalculateBars();
    } else {
        songArrangement.push(arrangementItem);
    }
    
    saveSongArrangement();
    max.post(`✅ Added "${section.name}" to arrangement at bar ${startBar}`);
    updateArrangementDisplay();
});

max.addHandler('remove_from_arrangement', (index) => {
    if (index < 0 || index >= songArrangement.length) {
        max.post(`❌ Invalid arrangement index: ${index}`);
        return;
    }
    
    const item = songArrangement[index];
    const section = songSections[item.sectionId];
    
    songArrangement.splice(index, 1);
    recalculateBars();
    saveSongArrangement();
    
    max.post(`🗑️  Removed "${section.name}" from arrangement`);
    updateArrangementDisplay();
});

max.addHandler('move_in_arrangement', (fromIndex, toIndex) => {
    if (fromIndex < 0 || fromIndex >= songArrangement.length ||
        toIndex < 0 || toIndex >= songArrangement.length) {
        max.post('❌ Invalid arrangement indices');
        return;
    }
    
    const item = songArrangement.splice(fromIndex, 1)[0];
    songArrangement.splice(toIndex, 0, item);
    recalculateBars();
    saveSongArrangement();
    
    max.post(`✅ Moved section in arrangement`);
    updateArrangementDisplay();
});

max.addHandler('clear_arrangement', () => {
    songArrangement = [];
    saveSongArrangement();
    max.post('🗑️  Cleared arrangement');
    updateArrangementDisplay();
});

max.addHandler('get_arrangement', () => {
    updateArrangementDisplay();
});

//==============================================================================
// PLAYBACK ENGINE
//==============================================================================

max.addHandler('play', () => {
    if (songArrangement.length === 0) {
        max.post('❌ No arrangement to play');
        return;
    }
    
    playbackState.playing = true;
    playbackState.currentBar = songArrangement[0].startBar;
    playbackState.currentSectionIndex = 0;
    
    savePlaybackState();
    max.post('▶ Playing arrangement');
    max.outlet('playback_started');
});

max.addHandler('stop', () => {
    playbackState.playing = false;
    playbackState.currentBar = 0;
    playbackState.currentSectionIndex = 0;
    
    savePlaybackState();
    max.post('⏹ Stopped');
    max.outlet('playback_stopped');
});

max.addHandler('jump_to_section', (index) => {
    if (index < 0 || index >= songArrangement.length) {
        max.post(`❌ Invalid section index: ${index}`);
        return;
    }
    
    playbackState.currentSectionIndex = index;
    playbackState.currentBar = songArrangement[index].startBar;
    
    savePlaybackState();
    
    const section = songSections[songArrangement[index].sectionId];
    max.post(`⏭ Jumped to: ${section.name} (bar ${playbackState.currentBar})`);
    max.outlet('section_changed', index);
});

// Transport callback (called by Ableton transport)
max.addHandler('transport_bar', (bar) => {
    if (!playbackState.playing) return;
    
    playbackState.currentBar = bar;
    
    // Check if we need to change sections
    for (let i = 0; i < songArrangement.length; i++) {
        const item = songArrangement[i];
        if (bar >= item.startBar && bar < item.endBar) {
            if (i !== playbackState.currentSectionIndex) {
                playbackState.currentSectionIndex = i;
                const section = songSections[item.sectionId];
                max.post(`📍 Now playing: ${section.name}`);
                max.outlet('section_changed', i);
            }
            break;
        }
    }
    
    savePlaybackState();
});

//==============================================================================
// HELPER FUNCTIONS
//==============================================================================

function calculateStartBar(position) {
    if (position === undefined || position >= songArrangement.length) {
        // Add at end
        if (songArrangement.length === 0) return 0;
        const last = songArrangement[songArrangement.length - 1];
        return last.endBar;
    } else {
        // Insert at position
        return songArrangement[position].startBar;
    }
}

function recalculateBars() {
    let currentBar = 0;
    songArrangement.forEach(item => {
        item.startBar = currentBar;
        const section = songSections[item.sectionId];
        item.endBar = currentBar + section.bars;
        currentBar = item.endBar;
    });
}

function updateArrangementDisplay() {
    if (songArrangement.length === 0) {
        max.post('Arrangement is empty');
        max.outlet('arrangement_display', 'empty');
        return;
    }
    
    let totalBars = 0;
    const display = [];
    
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    max.post('SONG ARRANGEMENT');
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    songArrangement.forEach((item, idx) => {
        const section = songSections[item.sectionId];
        max.post(`  ${idx + 1}. ${section.name} (bars ${item.startBar}-${item.endBar})`);
        display.push(section.name, item.startBar, item.endBar);
        totalBars = item.endBar;
    });
    
    max.post('');
    max.post(`Total: ${totalBars} bars`);
    max.post('');
    
    max.outlet('arrangement_display', ...display);
    max.outlet('total_bars', totalBars);
}

function saveSongArrangement() {
    // Save arrangement to dictionary as array
    const flatData = [];
    songArrangement.forEach(item => {
        flatData.push(item.sectionId, item.startBar, item.endBar);
    });
    
    max.outlet('dict', dictName, 'replace', 'song_arrangement', ...flatData);
}

function savePlaybackState() {
    max.outlet('dict', dictName, 'replace', 'playback_state',
        'playing', playbackState.playing ? 1 : 0,
        'currentBar', playbackState.currentBar,
        'currentSectionIndex', playbackState.currentSectionIndex,
        'loopEnabled', playbackState.loopEnabled ? 1 : 0);
}

function loadFromDictionary() {
    max.post('📖 Loading saved data from dictionary...');
    
    // Request data from dictionary
    max.outlet('dict', dictName, 'get', 'saved_progressions');
    max.outlet('dict', dictName, 'get', 'song_sections');
    max.outlet('dict', dictName, 'get', 'song_arrangement');
    max.outlet('dict', dictName, 'get', 'playback_state');
}

// Status report
max.addHandler('status', () => {
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    max.post('SONG ARRANGER STATUS');
    max.post('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    max.post(`Progressions: ${Object.keys(savedProgressions).length}`);
    max.post(`Sections: ${Object.keys(songSections).length}`);
    max.post(`Arrangement length: ${songArrangement.length} items`);
    max.post(`Playback: ${playbackState.playing ? 'Playing' : 'Stopped'}`);
    max.post('');
});

max.post('Ready for commands:');
max.post('  save_progression, load_progression, list_progressions');
max.post('  create_section, list_sections');
max.post('  add_to_arrangement, get_arrangement');
max.post('  play, stop, jump_to_section');
max.post('');

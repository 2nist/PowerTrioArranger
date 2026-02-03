const max = require('max-api');
const SongArranger = require('../../packages/song-arranger-core');

const arranger = new SongArranger();

// Bridge core events to Max
arranger.on('progressionSaved', (name, data) => {
    max.post(`✅ Saved progression: "${name}" (${data.chords.length} chords)`);
    max.outlet('progression_saved', name);
    // Persist to dict using generic dict replace format
    max.outlet('dict', '---power_trio_brain', 'replace', 'saved_progressions', name, 'name', name, 'chords', ...data.chords, 'createdAt', data.createdAt);
});

arranger.on('sectionCreated', (id, data) => {
    max.post(`✅ Created section: "${data.name}" using ${data.progression} (${data.bars} bars)`);
    max.outlet('section_created', id, data.name);
    max.outlet('dict', '---power_trio_brain', 'replace', 'song_sections', id, 'name', data.name, 'progression', data.progression, 'bars', data.bars, 'color', data.color);
});

arranger.on('arrangementChanged', (arrangement) => {
    max.post('✅ Arrangement updated');
    const flat = [];
    arrangement.forEach(item => flat.push(item.sectionId, item.startBar, item.endBar));
    max.outlet('dict', '---power_trio_brain', 'replace', 'song_arrangement', ...flat);
    max.outlet('arrangement_display', ...flat);
});

arranger.on('playbackStarted', (state) => {
    max.post('▶ Playing arrangement');
    max.outlet('playback_started');
});

arranger.on('playbackStopped', (state) => {
    max.post('⏹ Stopped');
    max.outlet('playback_stopped');
});

arranger.on('sectionChanged', (index, state) => {
    max.post(`⏭ Section changed: ${index}`);
    max.outlet('section_changed', index);
});

// Max message handlers -> Core
max.addHandler('save_progression', (name, ...chords) => {
    try {
        arranger.saveProgression(name, chords);
    } catch (e) { max.post(`Error: ${e.message}`); }
});

max.addHandler('list_progressions', () => {
    const names = arranger.listProgressions();
    max.outlet('progression_list', ...names);
});

max.addHandler('load_progression', (name) => {
    const prog = arranger.loadProgression(name);
    if (prog) max.outlet('progression_loaded', name, ...prog.chords);
});

max.addHandler('create_section', (id, name, progression, bars, color) => {
    try { arranger.createSection(id, name, progression, Number(bars) || 8, color || 'white'); } catch (e) { max.post(e.message); }
});

max.addHandler('list_sections', () => {
    const secs = arranger.listSections();
    // send as flat list: id, name, bars, progression
    const flat = [];
    secs.forEach(s => flat.push(s.id, s.name, s.bars, s.progression));
    if (flat.length) max.outlet('section_list', ...flat);
});

max.addHandler('add_to_arrangement', (sectionId, position) => {
    try { arranger.addToArrangement(sectionId, position !== undefined ? Number(position) : undefined); } catch (e) { max.post(e.message); }
});

max.addHandler('get_arrangement', () => { const arr = arranger.getArrangement(); const flat=[]; arr.forEach(i=>flat.push(i.sectionId,i.startBar,i.endBar)); if (flat.length) max.outlet('arrangement_display', ...flat); });

max.addHandler('clear_arrangement', () => { arranger.clearArrangement(); });

max.addHandler('play', () => { try { arranger.play(); } catch (e) { max.post(e.message); }});
max.addHandler('stop', () => { arranger.stop(); });
max.addHandler('jump_to_section', (index) => { try { arranger.jumpToSection(Number(index)); } catch (e) { max.post(e.message); } });

// Dict responses (when core state is requested from dict)
max.addHandler('dict_response', (key, ...values) => {
    // Simple loader: if dict returns serialized state, pass to core
    if (key === 'song_arrangement' || key === 'saved_progressions' || key === 'song_sections' || key === 'playback_state') {
        // adapters may request specific keys - we leave persistence to specific handlers
        // For more advanced loading, a dict->state serializer should be implemented here
    }
});

max.post('Song Arranger M4L adapter loaded');

module.exports = arranger;

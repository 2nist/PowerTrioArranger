const assert = require('assert');
const SongArranger = require('../lib/SongArranger');

function run() {
    const s = new SongArranger();

    // Basic progression
    s.saveProgression('verse', ['C','F','G']);
    assert(s.listProgressions().includes('verse'));

    // Sections
    s.createSection('verse1','Verse 1','verse',8);
    const section = s.listSections().find(x => x.id === 'verse1');
    assert(section && section.name === 'Verse 1');

    // Arrangement
    s.addToArrangement('verse1');
    const arr = s.getArrangement();
    assert(arr.length === 1 && arr[0].sectionId === 'verse1');

    // Playback
    s.play();
    s.transportBar(arr[0].startBar);
    s.stop();

    console.log('All tests passed');
}

run();

const assert = require('assert');
const SongArranger = require('../lib/SongArranger');

function run() {
    const s = new SongArranger();

    // Basic progression
    s.saveProgression('verse', ['C','F','G']);
    assert(s.listProgressions().includes('verse'));

    // Sections
    s.createSection('verse1','Verse 1','verse',8);
    s.createSection('chorus1','Chorus 1','verse',8);
    const section = s.listSections().find(x => x.id === 'verse1');
    assert(section && section.name === 'Verse 1');

    // Arrangement: add and insert
    s.addToArrangement('verse1');
    s.addToArrangement('chorus1');
    s.addToArrangement('verse1', 1); // insert at position 1
    let arr = s.getArrangement();
    assert(arr.length === 3, 'Arrangement length should be 3');
    assert(arr[1].sectionId === 'verse1', 'Inserted item at pos 1');

    // move
    s.moveInArrangement(2, 1);
    arr = s.getArrangement();
    assert(arr[1].sectionId === 'chorus1', 'Move succeeded');

    // exportForAbleton
    const clips = s.exportForAbleton();
    assert(Array.isArray(clips) && clips.length === 3, 'Export returns 3 clips');
    assert(clips[0].progression.name === 'verse');

    // playback & transportBar event -> section change
    let sectionChanged = false;
    s.on('sectionChanged', () => { sectionChanged = true; });
    s.play();
    const secondStart = s.getArrangement()[1].startBar;
    s.transportBar(secondStart);
    assert(sectionChanged, 'sectionChanged event fired on transportBar');

    // serialize / deserialize
    const serial = s.serialize();
    const s2 = new SongArranger();
    s2.deserialize(serial);
    assert(Object.keys(s2.savedProgressions).length === 1, 'deserialize restored progressions');
    assert(Object.keys(s2.songSections).length === 2, 'deserialize restored sections');
    
    // clear arrangement
    s.clearArrangement();
    assert(s.getArrangement().length === 0, 'Arrangement cleared');

    console.log('All tests passed');
}

run();

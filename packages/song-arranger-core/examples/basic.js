const SongArranger = require('..');

const s = new SongArranger();

s.saveProgression('verse', ['C','F','G']);
s.createSection('verse1','Verse 1','verse',8);
s.addToArrangement('verse1');

console.log('Arrangement:', s.getArrangement());
console.log('Ableton clips:', s.exportForAbleton());

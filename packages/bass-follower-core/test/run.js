const assert = require('assert');
const BF = require('../lib/BassFollower');

function run() {
    const b = new BF();
    let played = false;
    b.on('bassNote', (m) => { played = true; assert(typeof m === 'number'); });
    b.setCurrentChord({ root: 'C', quality: 'maj' });
    const note = b.onKick();
    assert(played && note === 36);
    console.log('BassFollower tests passed');
}

run();

const assert = require('assert');
const GW = require('../lib/GrooveWanderer');

function run() {
    const g = new GW();
    let kick = false;
    g.on('kick', (note) => { kick = true; assert(note === 35 || note === 36); });
    g.processMidiNote(36);
    assert(kick, 'kick event fired');
    console.log('GrooveWanderer tests passed');
}

run();

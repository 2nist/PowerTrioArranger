const assert = require('assert');
const APC64Comms = require('../lib/apc64Comms');

function run() {
    const a = new APC64Comms({ sysexHeader: 'F0 47 00 53' });
    let disp = false;
    a.on('display', (msg, text) => { disp = true; assert(msg.includes('F0')); });
    const sys = a.displayText('Cmaj');
    assert(typeof sys === 'string');
    assert(disp, 'display event fired');
    console.log('APC64Comms tests passed');
}

run();

const max = require('max-api');
const GrooveWanderer = require('../packages/groove-wanderer-core');
const APC64 = require('../packages/apc64-comms');

const gw = new GrooveWanderer();
const apc = new APC64();

// Map note input
max.addHandler('note_in', (note) => {
    gw.processMidiNote(Number(note));
});

gw.on('kick', (note) => {
    max.post('Kick detected: ' + note);
    max.outlet('send', '---kick_pulse_global', 1);
    apc.setPadColor(0, { r: 0, g: 255, b: 0 });
});

gw.on('pulse', (p) => {
    max.outlet('dict', '---power_trio_brain', 'replace', 'rhythm_pulses', 'kick_pulse', p.kick_pulse, 'snare_pulse', p.snare_pulse);
});

max.post('GrooveWanderer adapter loaded');

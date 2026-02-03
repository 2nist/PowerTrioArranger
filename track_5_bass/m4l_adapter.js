const max = require('max-api');
const BassFollower = require('../packages/bass-follower-core');

const bf = new BassFollower();

// When dict reports current_chord, update core
max.addHandler('dict_response', (key, ...values) => {
    if (key === 'current_chord') {
        // Expect values: root, quality, ...notes
        const chord = { root: values[0], quality: values[1], notes: values.slice(2) };
        bf.setCurrentChord(chord);
    }
});

// Kick trigger
max.addHandler('kick_trigger', () => {
    const midi = bf.onKick();
    if (midi) {
        max.outlet('noteout', midi, 100, 1);
    }
});

max.post('Bass Follower adapter loaded');

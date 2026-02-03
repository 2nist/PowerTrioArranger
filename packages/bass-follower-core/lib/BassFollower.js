const { EventEmitter } = require('events');

// Simple bass follower: listens for kick pulses and uses current chord to output bass note
class BassFollower extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.currentChord = null; // { root, quality, notes: [] }
    }

    setCurrentChord(chord) {
        this.currentChord = chord;
        this.emit('chordChanged', chord);
    }

    // On kick, decide the bass note (root in bass octave)
    onKick() {
        if (!this.currentChord || !this.currentChord.root) return null;
        // Convert root to MIDI note - simplified mapping
        const root = this.currentChord.root.toUpperCase();
        const noteMap = { 'C': 36, 'D': 38, 'E': 40, 'F': 41, 'G': 43, 'A': 45, 'B': 47 };
        const midi = noteMap[root] || 36;
        this.emit('bassNote', midi);
        return midi;
    }
}

module.exports = BassFollower;

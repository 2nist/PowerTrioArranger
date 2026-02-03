const { EventEmitter } = require('events');

class GrooveWanderer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.rhythmPulses = { kick_pulse: 0, snare_pulse: 0, hats_pulse: 0 };
    }

    processMidiNote(note) {
        // note: integer midi note
        // simple mapping for kicks/snare/hats ranges
        if (note === 35 || note === 36) {
            this.rhythmPulses.kick_pulse = 1;
            this.emit('kick', note);
        } else if (note === 38 || note === 37) {
            this.rhythmPulses.snare_pulse = 1;
            this.emit('snare', note);
        } else {
            // other percussion
            this.emit('perc', note);
        }
        // emit general pulse update
        this.emit('pulse', Object.assign({}, this.rhythmPulses));
        // auto-clear pulses (caller should manage timing)
        setTimeout(() => { this.rhythmPulses.kick_pulse = 0; this.rhythmPulses.snare_pulse = 0; }, 50);
    }

    setRhythmPulse(name, val) {
        this.rhythmPulses[name] = val ? 1 : 0;
        this.emit('pulse', Object.assign({}, this.rhythmPulses));
    }
}

module.exports = GrooveWanderer;

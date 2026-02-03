const { EventEmitter } = require('events');

// Simple APC64 communications helper (pure JS)
class APC64Comms extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.SYSEX_HEADER = options.sysexHeader || 'F0 47 00 53';
    }

    // Format a display text SysEx message (stub - implementation depends on device)
    buildDisplaySysEx(text) {
        // Simplified example - real implementation should pack properly
        return `${this.SYSEX_HEADER} ${Buffer.from(text).toString('hex')} F7`;
    }

    // Set pad color helper (r,g,b or palette index)
    setPadColor(padIndex, color) {
        // color can be {r,g,b} or integer
        this.emit('padColor', padIndex, color);
        return true;
    }

    displayText(text) {
        const msg = this.buildDisplaySysEx(text);
        this.emit('display', msg, text);
        return msg;
    }
}

module.exports = APC64Comms;

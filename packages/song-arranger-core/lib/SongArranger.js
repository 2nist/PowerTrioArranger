const { EventEmitter } = require('events');

class SongArranger extends EventEmitter {
    constructor(options = {}) {
        super();
        this.savedProgressions = {};
        this.songSections = {};
        this.songArrangement = [];
        this.playbackState = {
            playing: false,
            currentBar: 0,
            currentSectionIndex: 0,
            loopEnabled: false
        };
    }

    // Progression API
    saveProgression(name, chords = []) {
        if (!name || !Array.isArray(chords) || chords.length === 0) {
            throw new Error('saveProgression requires a name and at least one chord');
        }
        this.savedProgressions[name] = { name, chords: chords.slice(), createdAt: Date.now() };
        this.emit('progressionSaved', name, this.savedProgressions[name]);
        return this.savedProgressions[name];
    }

    loadProgression(name) {
        return this.savedProgressions[name] || null;
    }

    listProgressions() {
        return Object.keys(this.savedProgressions);
    }

    deleteProgression(name) {
        if (this.savedProgressions[name]) {
            delete this.savedProgressions[name];
            this.emit('progressionDeleted', name);
            return true;
        }
        return false;
    }

    // Sections
    createSection(sectionId, name, progressionName, bars = 8, color = 'white') {
        if (!sectionId || !name || !progressionName) {
            throw new Error('createSection requires id, name and progression');
        }
        if (!this.savedProgressions[progressionName]) {
            throw new Error(`Progression ${progressionName} not found`);
        }
        this.songSections[sectionId] = { id: sectionId, name, progression: progressionName, bars, color };
        this.emit('sectionCreated', sectionId, this.songSections[sectionId]);
        return this.songSections[sectionId];
    }

    editSection(sectionId, property, value) {
        const s = this.songSections[sectionId];
        if (!s) throw new Error('Section not found');
        s[property] = value;
        this.emit('sectionEdited', sectionId, property, value);
        return s;
    }

    listSections() {
        return Object.values(this.songSections);
    }

    deleteSection(sectionId) {
        if (this.songSections[sectionId]) {
            delete this.songSections[sectionId];
            this.emit('sectionDeleted', sectionId);
            return true;
        }
        return false;
    }

    // Arrangement
    addToArrangement(sectionId, position) {
        if (!this.songSections[sectionId]) throw new Error('Section not found');
        const section = this.songSections[sectionId];
        const startBar = this.calculateStartBar(position);
        const arrangementItem = {
            sectionId,
            startBar,
            endBar: startBar + section.bars,
            position: position !== undefined ? position : this.songArrangement.length
        };
        if (position !== undefined && position < this.songArrangement.length) {
            this.songArrangement.splice(position, 0, arrangementItem);
            this.recalculateBars();
        } else {
            this.songArrangement.push(arrangementItem);
        }
        this.emit('arrangementChanged', this.songArrangement.slice());
        return arrangementItem;
    }

    removeFromArrangement(index) {
        if (index < 0 || index >= this.songArrangement.length) throw new Error('Invalid index');
        const removed = this.songArrangement.splice(index, 1)[0];
        this.recalculateBars();
        this.emit('arrangementChanged', this.songArrangement.slice());
        return removed;
    }

    moveInArrangement(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.songArrangement.length) throw new Error('Invalid from index');
        if (toIndex < 0 || toIndex > this.songArrangement.length) throw new Error('Invalid to index');
        const item = this.songArrangement.splice(fromIndex, 1)[0];
        this.songArrangement.splice(toIndex, 0, item);
        this.recalculateBars();
        this.emit('arrangementChanged', this.songArrangement.slice());
    }

    clearArrangement() {
        this.songArrangement = [];
        this.emit('arrangementCleared');
    }

    getArrangement() {
        return this.songArrangement.slice();
    }

    // Playback
    play() {
        if (this.songArrangement.length === 0) throw new Error('No arrangement to play');
        this.playbackState.playing = true;
        this.playbackState.currentBar = this.songArrangement[0].startBar;
        this.playbackState.currentSectionIndex = 0;
        this.emit('playbackStarted', this.playbackState);
    }

    stop() {
        this.playbackState.playing = false;
        this.playbackState.currentBar = 0;
        this.playbackState.currentSectionIndex = 0;
        this.emit('playbackStopped', this.playbackState);
    }

    jumpToSection(index) {
        if (index < 0 || index >= this.songArrangement.length) throw new Error('Invalid section index');
        this.playbackState.currentSectionIndex = index;
        this.playbackState.currentBar = this.songArrangement[index].startBar;
        this.emit('sectionChanged', index, this.playbackState);
    }

    transportBar(bar) {
        if (!this.playbackState.playing) return;
        this.playbackState.currentBar = bar;
        for (let i = 0; i < this.songArrangement.length; i++) {
            const item = this.songArrangement[i];
            if (bar >= item.startBar && bar < item.endBar) {
                if (i !== this.playbackState.currentSectionIndex) {
                    this.playbackState.currentSectionIndex = i;
                    this.emit('sectionChanged', i, this.playbackState);
                }
                break;
            }
        }
        this.emit('playbackTick', this.playbackState);
    }

    // Helpers
    calculateStartBar(position) {
        if (position === undefined || position >= this.songArrangement.length) {
            if (this.songArrangement.length === 0) return 0;
            const last = this.songArrangement[this.songArrangement.length - 1];
            return last.endBar;
        } else {
            return this.songArrangement[position].startBar;
        }
    }

    recalculateBars() {
        let currentBar = 0;
        this.songArrangement.forEach(item => {
            item.startBar = currentBar;
            const section = this.songSections[item.sectionId];
            item.endBar = currentBar + section.bars;
            currentBar = item.endBar;
        });
    }

    // Persistence helpers - core does not perform I/O, it emits state for adapters to persist
    serialize() {
        return {
            savedProgressions: this.savedProgressions,
            songSections: this.songSections,
            songArrangement: this.songArrangement,
            playbackState: this.playbackState
        };
    }

    deserialize(data) {
        if (!data) return;
        this.savedProgressions = data.savedProgressions || {};
        this.songSections = data.songSections || {};
        this.songArrangement = data.songArrangement || [];
        this.playbackState = Object.assign(this.playbackState, data.playbackState || {});
        this.emit('stateLoaded', this.serialize());
    }

    // Export for Ableton (returns data structure, not LOM calls)
    exportForAbleton() {
        const clips = this.songArrangement.map(item => {
            const section = this.songSections[item.sectionId];
            return {
                name: section.name,
                startBar: item.startBar,
                endBar: item.endBar,
                progression: this.savedProgressions[section.progression]
            };
        });
        return clips;
    }
}

module.exports = SongArranger;

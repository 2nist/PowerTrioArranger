# Song Arranger Core - API

## Constructor
- `new SongArranger(options = {})` — returns EventEmitter-based instance

## Methods
- `saveProgression(name, chords)` — throws on invalid input
- `loadProgression(name)` — returns progression or null
- `listProgressions()` — returns array of names
- `deleteProgression(name)` — returns boolean

- `createSection(sectionId, name, progressionName, bars = 8, color = 'white')` — throws if progression missing
- `editSection(sectionId, property, value)`
- `listSections()` — returns array of section objects
- `deleteSection(sectionId)`

- `addToArrangement(sectionId, position?)` — returns arrangement item
- `removeFromArrangement(index)` — returns removed item
- `moveInArrangement(fromIndex, toIndex)`
- `clearArrangement()`
- `getArrangement()` — returns array

- `play()` / `stop()` / `jumpToSection(index)`
- `transportBar(bar)` — called by host transport to advance

- `serialize()` / `deserialize(data)` — persistence helpers
- `exportForAbleton()` — returns array of clip descriptors

## Events
- `progressionSaved(name, data)`
- `progressionDeleted(name)`
- `sectionCreated(id, data)`
- `sectionEdited(id, property, value)`
- `sectionDeleted(id)`
- `arrangementChanged(arrangement)`
- `arrangementCleared()`
- `playbackStarted(state)` / `playbackStopped(state)` / `playbackTick(state)`
- `sectionChanged(index, state)`
- `stateLoaded(serial)`

# @2nist/song-arranger-core

A reusable Node/JS core for song arrangement logic (progressions, sections, arrangement, playback state). Designed to be adapter-friendly (Max for Live adapter included in PowerTrioArranger).

## Quick start

From the package directory:

```
node test/run.js
```

### Usage (Node)

```js
const SongArranger = require('..');
const s = new SongArranger();
s.saveProgression('verse', ['C','F','G']);
s.createSection('verse1','Verse 1','verse',8);
s.addToArrangement('verse1');
console.log(s.exportForAbleton());
```

## Development

- `npm run lint` — run ESLint
- `npm test` — run tests (runs linter first)

## API
See `API.md` for full method list and events.

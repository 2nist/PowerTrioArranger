const { spawnSync } = require('child_process');

console.log('Running bass adapter test...');
let r = spawnSync('node', ['test/integration/bass_adapter.test.js'], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status);

console.log('\nRunning groove adapter test...');
r = spawnSync('node', ['test/integration/groove_adapter.test.js'], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status);

console.log('\nAll adapter integration tests passed');

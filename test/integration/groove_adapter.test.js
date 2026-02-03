const assert = require('assert');
const path = require('path');
const { createMock } = require('../helpers/mock_max_api');

function run() {
    const mock = createMock();
    const maxApiPath = require.resolve('max-api');
    require.cache[maxApiPath] = { id: maxApiPath, filename: maxApiPath, loaded: true, exports: mock };

    const adapterPath = path.resolve(__dirname, '../../track_4_drums/m4l_adapter.js');
    delete require.cache[require.resolve(adapterPath)];
    const adapter = require(adapterPath);

    // Simulate incoming note that maps to kick (36)
    mock.trigger('note_in', 36);

    // Allow some time for async handlers (setTimeout in core)
    setTimeout(() => {
        const outs = mock.getOutlets();
        // Expect a send outlet for kick_pulse
        const sendCalls = outs.filter(o => o[0] === 'send' && o[1] === '---kick_pulse_global');
        assert(sendCalls.length >= 1, 'send should have been called with kick pulse');
        console.log('Groove adapter integration test passed');
    }, 100);
}

run();

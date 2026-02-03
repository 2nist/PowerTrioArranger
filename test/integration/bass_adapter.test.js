const assert = require('assert');
const path = require('path');
const Module = require('module');
const { createMock } = require('../helpers/mock_max_api');

function run() {
    // Prepare mock max-api
    const mock = createMock();
    const maxApiPath = require.resolve('max-api');
    require.cache[maxApiPath] = { id: maxApiPath, filename: maxApiPath, loaded: true, exports: mock };

    // Load the adapter (it will require max-api -> gets mock)
    const adapterPath = path.resolve(__dirname, '../../track_5_bass/m4l_adapter.js');
    delete require.cache[require.resolve(adapterPath)];
    const adapter = require(adapterPath);

    // Simulate dict response with current_chord
    mock.trigger('dict_response', 'current_chord', 'C', 'maj', 60, 64, 67);

    // Simulate kick trigger
    mock.trigger('kick_trigger');

    // Check outlets - noteout should have been called with midi note
    const outs = mock.getOutlets();
    const noteoutCalls = outs.filter(o => o[0] === 'noteout');
    assert(noteoutCalls.length >= 1, 'noteout should be called');
    const note = noteoutCalls[0][1];
    assert(typeof note === 'number', 'noteout value is number');

    console.log('Bass adapter integration test passed');
}

run();

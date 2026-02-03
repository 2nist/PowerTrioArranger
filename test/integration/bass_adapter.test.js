const assert = require('assert');
const path = require('path');
const proxyquire = require('proxyquire');
const { createMock } = require('../helpers/mock_max_api');

function run() {
    // Prepare mock max-api
    const mock = createMock();

    // Load the adapter with proxyquire, stubbing 'max-api'
    const adapterPath = path.resolve(__dirname, '../../track_5_bass/m4l_adapter.js');
    delete require.cache[require.resolve(adapterPath)];
    proxyquire(adapterPath, { 'max-api': mock });

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

# PowerTrioArranger - Test Scripts & Validation Suite

## 📋 Overview

This document contains automated and manual test scripts for validating each phase of the PowerTrioArranger build.

---

## 🧪 Test Suite Organization

```
tests/
├── phase_1_infrastructure_test.js
├── phase_2_chord_lab_test.js
├── phase_3_sequencer_test.js
├── phase_4_conductor_test.js
├── phase_5_rhythm_test.js
├── phase_6_hardware_test.js
└── integration_test.js
```

---

## Phase 1: Infrastructure Tests

### Test 1.1: Dictionary Initialization

**File**: `tests/phase_1_infrastructure_test.js`

```javascript
const maxApi = require('max-api');

// Test dictionary structure
function testDictionarySchema() {
  maxApi.post('=== PHASE 1 TEST: Dictionary Schema ===');
  
  // Test transport keys
  maxApi.outlet('dict', 'get', '---power_trio_brain', 'transport::bpm');
  maxApi.outlet('dict', 'get', '---power_trio_brain', 'transport::current_step');
  maxApi.outlet('dict', 'get', '---power_trio_brain', 'transport::playing');
  
  // Test clipboard keys
  maxApi.outlet('dict', 'get', '---power_trio_brain', 'clipboard::active_chord');
  
  // Test sequencer_buffer
  maxApi.outlet('dict', 'get', '---power_trio_brain', 'sequencer_buffer[0]');
  maxApi.outlet('dict', 'get', '---power_trio_brain', 'sequencer_buffer[15]');
  
  // Test song_structure
  maxApi.outlet('dict', 'get', '---power_trio_brain', 'song_structure');
  
  maxApi.post('Schema test complete - check responses above');
}

// Test write/read cycle
let testValue = 0;
function testWriteReadCycle() {
  maxApi.post('=== PHASE 1 TEST: Write/Read Cycle ===');
  
  testValue = Math.floor(Math.random() * 1000);
  maxApi.post(`Writing test value: ${testValue}`);
  
  // Write
  maxApi.outlet('dict', 'replace', '---power_trio_brain', 'transport::bpm', testValue);
  
  // Read back (wait for response)
  setTimeout(() => {
    maxApi.outlet('dict', 'get', '---power_trio_brain', 'transport::bpm');
  }, 100);
}

// Listen for responses
maxApi.addHandler('dict_response', (key, value) => {
  maxApi.post(`✓ Received: ${key} = ${value}`);
  
  // Validate test value
  if (key === 'transport::bpm' && parseInt(value) === testValue) {
    maxApi.post('✓✓✓ WRITE/READ CYCLE TEST PASSED ✓✓✓');
  }
});

// Auto-run tests on load
maxApi.addHandler('bang', () => {
  testDictionarySchema();
  setTimeout(testWriteReadCycle, 500);
});

maxApi.post('Phase 1 tests loaded - send "bang" to run');
```

**Max Patcher Setup**:
```
[loadbang]
    ↓
[delay 500]
    ↓
[bang]
    ↓
[node.script tests/phase_1_infrastructure_test.js]
    ↓
[route dict]
    ↓
[dict ---power_trio_brain]
    ↓
[prepend dict_response]
    ↓
(back to node.script inlet)
```

**Expected Output**:
```
=== PHASE 1 TEST: Dictionary Schema ===
✓ Received: transport::bpm = 120
✓ Received: transport::current_step = 0
✓ Received: transport::playing = false
✓ Received: clipboard::active_chord = {"root":null,"quality":null,"notes":[]}
✓ Received: sequencer_buffer[0] = null
✓ Received: sequencer_buffer[15] = null
Schema test complete - check responses above
=== PHASE 1 TEST: Write/Read Cycle ===
Writing test value: 742
✓ Received: transport::bpm = 742
✓✓✓ WRITE/READ CYCLE TEST PASSED ✓✓✓
```

**Pass Criteria**:
- [ ] All keys return values (not errors)
- [ ] Write/read cycle returns same value
- [ ] No JavaScript errors in Max console

---

## Phase 2: Chord Lab Tests

### Test 2.1: Grid Note Mapping

**File**: `tests/phase_2_chord_lab_test.js`

```javascript
const maxApi = require('max-api');
const HW = require('../hardware/apc64_constants.js');

maxApi.post('=== PHASE 2 TEST: Chord Lab ===');

// Test grid position calculation
function testGridMath() {
  const testCases = [
    { note: 36, expected: { column: 0, row: 0 } },  // Bottom-left
    { note: 43, expected: { column: 7, row: 0 } },  // Bottom-right
    { note: 92, expected: { column: 0, row: 7 } },  // Top-left
    { note: 99, expected: { column: 7, row: 7 } },  // Top-right
    { note: 60, expected: { column: 0, row: 3 } }   // Middle
  ];
  
  maxApi.post('Testing grid math...');
  let passed = 0;
  
  testCases.forEach(test => {
    const result = HW.gridNoteToPosition(test.note);
    if (result.column === test.expected.column && result.row === test.expected.row) {
      maxApi.post(`✓ Note ${test.note} → (${result.column}, ${result.row})`);
      passed++;
    } else {
      maxApi.post(`✗ Note ${test.note} FAILED: got (${result.column}, ${result.row}), expected (${test.expected.column}, ${test.expected.row})`);
    }
  });
  
  maxApi.post(`Grid math: ${passed}/${testCases.length} passed`);
}

// Test chord construction
function testChordConstruction() {
  maxApi.post('Testing chord construction...');
  
  // Simulate pad presses
  const testPads = [
    { note: 44, name: 'C Major Triad', expected: { root: 'C', notes: 3 } },
    { note: 60, name: 'G 7th Chord', expected: { root: 'G', notes: 4 } },
    { note: 68, name: 'C 9th Chord', expected: { root: 'C', notes: 5 } }
  ];
  
  testPads.forEach((test, index) => {
    setTimeout(() => {
      maxApi.post(`Simulating press: ${test.name} (note ${test.note})`);
      maxApi.outlet('note_input', test.note, 100);
      
      // Wait for response
      setTimeout(() => {
        maxApi.outlet('dict', 'get', '---power_trio_brain', 'clipboard::active_chord');
      }, 100);
    }, index * 500);
  });
}

// Listen for chord data
maxApi.addHandler('dict_response', (key, value) => {
  if (key.includes('active_chord')) {
    try {
      const chord = JSON.parse(value);
      maxApi.post(`✓ Chord created: ${chord.root} ${chord.quality}`);
      maxApi.post(`  Notes: ${chord.notes.join(', ')}`);
      maxApi.post(`  Voicing: ${chord.voicing_spread}, Inversion: ${chord.inversion}`);
    } catch (e) {
      maxApi.post(`✗ Invalid chord data: ${value}`);
    }
  }
});

// Test fader control
function testFaderControl() {
  maxApi.post('Testing fader control...');
  
  // First, create a chord
  maxApi.outlet('note_input', 44, 100); // C Major Triad
  
  setTimeout(() => {
    // Test Fader 1 (Voicing Spread)
    maxApi.post('Moving Fader 1 (Voicing Spread) to 127');
    maxApi.outlet('cc_input', HW.T1_CC_VOICING_SPREAD, 127);
    
    setTimeout(() => {
      maxApi.outlet('dict', 'get', '---power_trio_brain', 'clipboard::active_chord');
    }, 100);
    
    // Test Fader 2 (Inversion)
    setTimeout(() => {
      maxApi.post('Moving Fader 2 (Inversion) to 64');
      maxApi.outlet('cc_input', HW.T1_CC_INVERSION, 64);
      
      setTimeout(() => {
        maxApi.outlet('dict', 'get', '---power_trio_brain', 'clipboard::active_chord');
      }, 100);
    }, 300);
  }, 200);
}

// Run all tests
maxApi.addHandler('bang', () => {
  testGridMath();
  setTimeout(testChordConstruction, 1000);
  setTimeout(testFaderControl, 3000);
});

maxApi.post('Phase 2 tests loaded - send "bang" to run');
```

**Expected Output**:
```
=== PHASE 2 TEST: Chord Lab ===
Testing grid math...
✓ Note 36 → (0, 0)
✓ Note 43 → (7, 0)
✓ Note 92 → (0, 7)
✓ Note 99 → (7, 7)
✓ Note 60 → (0, 3)
Grid math: 5/5 passed
Testing chord construction...
Simulating press: C Major Triad (note 44)
✓ Chord created: C maj
  Notes: 60, 64, 67
  Voicing: 0, Inversion: 0
...
```

**Pass Criteria**:
- [ ] Grid math calculates correctly
- [ ] All test chords create valid JSON
- [ ] Faders update chord properties
- [ ] No duplicate notes in chord array

---

## Phase 3: Sequencer Tests

### Test 3.1: Copy/Paste Workflow

**File**: `tests/phase_3_sequencer_test.js`

```javascript
const maxApi = require('max-api');

maxApi.post('=== PHASE 3 TEST: Sequencer ===');

// Test paste workflow
function testCopyPaste() {
  maxApi.post('Testing copy/paste workflow...');
  
  // Step 1: Create a chord in clipboard
  const testChord = {
    root: 'C',
    quality: 'maj',
    notes: [60, 64, 67],
    voicing_spread: 0,
    inversion: 0
  };
  
  maxApi.outlet('dict', 'replace', '---power_trio_brain', 
    'clipboard::active_chord', JSON.stringify(testChord));
  
  // Step 2: Paste to step 0
  setTimeout(() => {
    maxApi.post('Pasting chord to step 0...');
    maxApi.outlet('note_input', 36, 100); // Step 0
    
    // Step 3: Verify
    setTimeout(() => {
      maxApi.outlet('dict', 'get', '---power_trio_brain', 'sequencer_buffer[0]');
    }, 100);
  }, 200);
}

// Test playback
let playbackStep = 0;
function testPlayback() {
  maxApi.post('Testing playback...');
  
  // Fill steps 0-3 with test data
  const testChord = {
    root: 'C',
    quality: 'maj',
    notes: [60, 64, 67]
  };
  
  for (let i = 0; i < 4; i++) {
    maxApi.outlet('dict', 'replace', '---power_trio_brain', 
      `sequencer_buffer[${i}]`, JSON.stringify(testChord));
  }
  
  // Simulate transport ticks
  setTimeout(() => {
    maxApi.post('Starting simulated playback...');
    const playInterval = setInterval(() => {
      maxApi.outlet('transport_tick', playbackStep);
      playbackStep = (playbackStep + 1) % 16;
      
      if (playbackStep === 0) {
        clearInterval(playInterval);
        maxApi.post('Playback test complete');
      }
    }, 250); // 4 steps per second
  }, 500);
}

// Test clear function
function testClear() {
  maxApi.post('Testing clear function...');
  
  // First, set a step
  const testChord = { root: 'C', notes: [60, 64, 67] };
  maxApi.outlet('dict', 'replace', '---power_trio_brain', 
    'sequencer_buffer[5]', JSON.stringify(testChord));
  
  setTimeout(() => {
    maxApi.post('Clearing step 5...');
    maxApi.outlet('note_input', 41, 0); // Step 5, velocity 0 (release with shift)
    
    setTimeout(() => {
      maxApi.outlet('dict', 'get', '---power_trio_brain', 'sequencer_buffer[5]');
    }, 100);
  }, 200);
}

// Listen for responses
maxApi.addHandler('dict_response', (key, value) => {
  if (key.includes('sequencer_buffer')) {
    if (value === 'null' || value === null) {
      maxApi.post(`✓ ${key} is empty (cleared)`);
    } else {
      const chord = JSON.parse(value);
      maxApi.post(`✓ ${key} contains: ${chord.root} chord`);
    }
  }
  
  if (key.includes('transport::current_chord')) {
    const chord = JSON.parse(value);
    maxApi.post(`  → Playing: ${chord.root} (${chord.notes.join(', ')})`);
  }
});

// Run tests
maxApi.addHandler('bang', () => {
  testCopyPaste();
  setTimeout(testPlayback, 2000);
  setTimeout(testClear, 7000);
});

maxApi.post('Phase 3 tests loaded - send "bang" to run');
```

**Expected Output**:
```
=== PHASE 3 TEST: Sequencer ===
Testing copy/paste workflow...
Pasting chord to step 0...
✓ sequencer_buffer[0] contains: C chord
Testing playback...
Starting simulated playback...
  → Playing: C (60, 64, 67)
  → Playing: C (60, 64, 67)
  → Playing: C (60, 64, 67)
  → Playing: C (60, 64, 67)
...
Playback test complete
Testing clear function...
Clearing step 5...
✓ sequencer_buffer[5] is empty (cleared)
```

**Pass Criteria**:
- [ ] Chords paste to correct steps
- [ ] Playback reads from buffer sequentially
- [ ] Clear sets buffer to null
- [ ] Empty steps are skipped during playback

---

## Phase 4: Conductor Tests

### Test 4.1: Pattern Storage

**File**: `tests/phase_4_conductor_test.js`

```javascript
const maxApi = require('max-api');

maxApi.post('=== PHASE 4 TEST: Conductor ===');

// Test pattern save
function testPatternSave() {
  maxApi.post('Testing pattern save...');
  
  // Create a test sequence
  const testPattern = [];
  for (let i = 0; i < 16; i++) {
    if (i % 4 === 0) {
      testPattern.push({ root: 'C', notes: [60, 64, 67] });
    } else {
      testPattern.push(null);
    }
  }
  
  // Write to sequencer_buffer
  testPattern.forEach((chord, step) => {
    const value = chord ? JSON.stringify(chord) : 'null';
    maxApi.outlet('dict', 'replace', '---power_trio_brain', 
      `sequencer_buffer[${step}]`, value);
  });
  
  // Save as pattern 0
  setTimeout(() => {
    maxApi.post('Saving as pattern 0...');
    maxApi.outlet('note_input', 92, 100); // Top row, pad 0
    
    setTimeout(() => {
      maxApi.outlet('dict', 'get', '---power_trio_brain', 'patterns::pattern_0');
    }, 200);
  }, 500);
}

// Test timeline placement
function testTimelinePlacement() {
  maxApi.post('Testing timeline placement...');
  
  // Select pattern 0
  maxApi.outlet('note_input', 92, 100);
  
  setTimeout(() => {
    // Place in timeline slot (bar 0, layer 0)
    maxApi.post('Placing pattern at (0, 0)...');
    maxApi.outlet('note_input', 36, 100);
    
    setTimeout(() => {
      maxApi.outlet('dict', 'get', '---power_trio_brain', 'song_structure');
    }, 200);
  }, 200);
}

// Test LOM export (manual verification required)
function testLOMExport() {
  maxApi.post('Testing LOM export...');
  maxApi.post('⚠ MANUAL CHECK REQUIRED: Look at Ableton Session View');
  
  // Trigger export
  maxApi.outlet('export_to_live');
  
  maxApi.post('Export triggered - check Session View for new scenes');
}

// Listen for responses
maxApi.addHandler('dict_response', (key, value) => {
  if (key.includes('pattern_')) {
    maxApi.post(`✓ Pattern saved: ${key}`);
    try {
      const pattern = JSON.parse(value);
      maxApi.post(`  Length: ${pattern.length} steps`);
    } catch (e) {
      maxApi.post(`  Value: ${value}`);
    }
  }
  
  if (key === 'song_structure') {
    try {
      const structure = JSON.parse(value);
      maxApi.post(`✓ Song structure has ${structure.length} entries`);
      structure.forEach((entry, i) => {
        maxApi.post(`  [${i}] Slot ${entry.slot_id}, Pattern ${entry.pattern_id}`);
      });
    } catch (e) {
      maxApi.post(`  Value: ${value}`);
    }
  }
});

// Run tests
maxApi.addHandler('bang', () => {
  testPatternSave();
  setTimeout(testTimelinePlacement, 2000);
  setTimeout(testLOMExport, 4000);
});

maxApi.post('Phase 4 tests loaded - send "bang" to run');
```

**Expected Output**:
```
=== PHASE 4 TEST: Conductor ===
Testing pattern save...
Saving as pattern 0...
✓ Pattern saved: patterns::pattern_0
  Length: 16 steps
Testing timeline placement...
Placing pattern at (0, 0)...
✓ Song structure has 1 entries
  [0] Slot 0, Pattern 0
Testing LOM export...
⚠ MANUAL CHECK REQUIRED: Look at Ableton Session View
Export triggered - check Session View for new scenes
```

**Pass Criteria**:
- [ ] Patterns save complete sequencer_buffer
- [ ] Timeline stores pattern references
- [ ] song_structure array updates correctly
- [ ] **MANUAL**: New scenes appear in Session View
- [ ] **MANUAL**: Scenes contain MIDI clips with notes

---

## Phase 5: Rhythm Section Tests

### Test 5.1: Drum Pulse Broadcasting

**File**: `tests/phase_5_drums_test.js`

```javascript
const maxApi = require('max-api');

maxApi.post('=== PHASE 5 TEST: Drums (Pulse Broadcasting) ===');

let kickCount = 0;
let snareCount = 0;

// Test pulse detection
function testPulseDetection() {
  maxApi.post('Testing drum pulse detection...');
  maxApi.post('⚠ Play GrooveWanderer for 4 bars');
  
  // Listen for pulses
  maxApi.addHandler('kick_pulse', (value) => {
    kickCount++;
    maxApi.post(`✓ Kick pulse received (count: ${kickCount})`);
    
    // Check dictionary
    maxApi.outlet('dict', 'get', '---power_trio_brain', 'rhythm_pulses::kick_pulse');
  });
  
  maxApi.addHandler('snare_pulse', (value) => {
    snareCount++;
    maxApi.post(`✓ Snare pulse received (count: ${snareCount})`);
    
    // Check dictionary
    maxApi.outlet('dict', 'get', '---power_trio_brain', 'rhythm_pulses::snare_pulse');
  });
  
  // Summary after 8 seconds
  setTimeout(() => {
    maxApi.post(`=== Pulse Summary ===`);
    maxApi.post(`Kicks: ${kickCount}, Snares: ${snareCount}`);
    
    if (kickCount > 0 && snareCount > 0) {
      maxApi.post('✓✓✓ PULSE DETECTION TEST PASSED ✓✓✓');
    } else {
      maxApi.post('✗✗✗ TEST FAILED: No pulses detected ✗✗✗');
    }
  }, 8000);
}

maxApi.addHandler('bang', testPulseDetection);
maxApi.post('Phase 5 (Drums) tests loaded - send "bang" + play GrooveWanderer');
```

### Test 5.2: Bass Harmonic Following

**File**: `tests/phase_5_bass_test.js`

```javascript
const maxApi = require('max-api');

maxApi.post('=== PHASE 5 TEST: Bass (Harmonic Following) ===');

let bassNotes = [];

// Test harmonic filtering
function testHarmonicFiltering() {
  maxApi.post('Testing harmonic filtering...');
  
  // Set up test chord
  const testChord = {
    root: 'C',
    quality: 'maj7',
    notes: [60, 64, 67, 71] // C, E, G, B
  };
  
  maxApi.outlet('dict', 'replace', '---power_trio_brain', 
    'transport::current_chord', JSON.stringify(testChord));
  
  // Test Fader 1 at 0 (root/5th only)
  maxApi.post('Setting Fader 1 to 0 (root/5th only)...');
  maxApi.outlet('cc_input', 28, 0);
  
  // Simulate kick hits
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      maxApi.outlet('kick_pulse', 1);
    }, i * 500);
  }
  
  // Test Fader 1 at 127 (all tones)
  setTimeout(() => {
    maxApi.post('Setting Fader 1 to 127 (all tones)...');
    maxApi.outlet('cc_input', 28, 127);
    bassNotes = [];
    
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        maxApi.outlet('kick_pulse', 1);
      }, i * 500);
    }
    
    setTimeout(() => {
      maxApi.post(`Bass notes played (full): ${bassNotes.join(', ')}`);
    }, 2500);
  }, 2500);
}

// Test approach notes
function testApproachNotes() {
  maxApi.post('Testing approach notes...');
  
  // Set current chord (C Major)
  const chord1 = { root: 'C', notes: [48, 52, 55] }; // Bass register
  maxApi.outlet('dict', 'replace', '---power_trio_brain', 
    'transport::current_chord', JSON.stringify(chord1));
  
  // Simulate bar ending (step 15)
  setTimeout(() => {
    maxApi.outlet('transport_tick', 15);
    
    // Next chord will be G
    setTimeout(() => {
      const chord2 = { root: 'G', notes: [43, 47, 50] };
      maxApi.outlet('dict', 'replace', '---power_trio_brain', 
        'transport::current_chord', JSON.stringify(chord2));
    }, 250);
  }, 500);
}

// Listen for MIDI output
maxApi.addHandler('midiout', (note, velocity) => {
  if (velocity > 0) {
    bassNotes.push(note);
    maxApi.post(`  → Bass note: ${note} (vel: ${velocity})`);
    
    // Check if in bass range
    if (note < 28 || note > 52) {
      maxApi.post(`    ⚠ WARNING: Note outside bass range!`);
    }
  }
});

// Run tests
maxApi.addHandler('bang', () => {
  testHarmonicFiltering();
  setTimeout(testApproachNotes, 6000);
});

maxApi.post('Phase 5 (Bass) tests loaded - send "bang" to run');
```

**Expected Output**:
```
=== PHASE 5 TEST: Bass (Harmonic Following) ===
Testing harmonic filtering...
Setting Fader 1 to 0 (root/5th only)...
  → Bass note: 48 (vel: 100)
  → Bass note: 48 (vel: 100)
  → Bass note: 55 (vel: 80)
  → Bass note: 48 (vel: 100)
Setting Fader 1 to 127 (all tones)...
  → Bass note: 48 (vel: 100)
  → Bass note: 52 (vel: 80)
  → Bass note: 55 (vel: 80)
  → Bass note: 59 (vel: 70)
Bass notes played (full): 48, 52, 55, 59
...
```

**Pass Criteria**:
- [ ] Drum pulses detected and logged
- [ ] Bass responds to kick pulses
- [ ] Fader 1 filters harmonic content correctly
- [ ] Bass notes stay in register (28-52)
- [ ] Approach notes play on bar endings

---

## Phase 6: Hardware Integration Tests

### Test 6.1: Constant Validation

**File**: `tests/phase_6_hardware_test.js`

```javascript
const maxApi = require('max-api');
const HW = require('../hardware/apc64_constants.js');

maxApi.post('=== PHASE 6 TEST: Hardware Constants ===');

// Test all constants are defined
function testConstantsExist() {
  maxApi.post('Testing constant definitions...');
  
  const requiredConstants = [
    'GRID_MIN_NOTE',
    'GRID_MAX_NOTE',
    'T1_CC_VOICING_SPREAD',
    'T1_CC_INVERSION',
    'T2_CC_STEP_VELOCITY',
    'T5_CC_HARMONIC_FILTER',
    'CHORD_GRID_START',
    'SEQUENCER_GRID_START'
  ];
  
  let passed = 0;
  requiredConstants.forEach(name => {
    if (HW[name] !== undefined) {
      maxApi.post(`✓ ${name} = ${HW[name]}`);
      passed++;
    } else {
      maxApi.post(`✗ ${name} is UNDEFINED`);
    }
  });
  
  maxApi.post(`Constants: ${passed}/${requiredConstants.length} defined`);
}

// Test helper functions
function testHelperFunctions() {
  maxApi.post('Testing helper functions...');
  
  // Test gridNoteToPosition
  const pos = HW.gridNoteToPosition(60);
  maxApi.post(`gridNoteToPosition(60) = (${pos.column}, ${pos.row})`);
  
  // Test positionToGridNote
  const note = HW.positionToGridNote(4, 3);
  maxApi.post(`positionToGridNote(4, 3) = ${note}`);
  
  // Verify round-trip
  const roundTrip = HW.positionToGridNote(pos.column, pos.row);
  if (roundTrip === 60) {
    maxApi.post(`✓ Round-trip test passed (60 → pos → 60)`);
  } else {
    maxApi.post(`✗ Round-trip failed: got ${roundTrip}`);
  }
}

// Test CC mapping conflicts
function testCCConflicts() {
  maxApi.post('Testing for CC conflicts...');
  
  const ccMap = {
    T1: [20, 21, 22, 23, 24, 25, 26, 27],
    T2: [28, 29, 30, 31, 32, 33, 34, 35],
    T3: [36, 37, 38, 39, 40, 41, 42, 43]
  };
  
  const allCCs = [...ccMap.T1, ...ccMap.T2, ...ccMap.T3];
  const uniqueCCs = new Set(allCCs);
  
  if (allCCs.length === uniqueCCs.size) {
    maxApi.post(`✓ No CC conflicts (${allCCs.length} unique CCs)`);
  } else {
    maxApi.post(`✗ CC conflicts detected!`);
  }
}

// Scan for magic numbers in scripts (manual prompt)
function promptMagicNumberCheck() {
  maxApi.post('=== MANUAL CHECK REQUIRED ===');
  maxApi.post('Search all .js files for:');
  maxApi.post('  - Numbers 20-43 (CC range)');
  maxApi.post('  - Numbers 36-99 (Note range)');
  maxApi.post('All should be replaced with HW.CONSTANT_NAME');
  maxApi.post('Run: grep -r "\\b(2[0-9]|3[0-9]|4[0-3])\\b" *.js');
}

// Run tests
maxApi.addHandler('bang', () => {
  testConstantsExist();
  testHelperFunctions();
  testCCConflicts();
  promptMagicNumberCheck();
});

maxApi.post('Phase 6 tests loaded - send "bang" to run');
```

**Expected Output**:
```
=== PHASE 6 TEST: Hardware Constants ===
Testing constant definitions...
✓ GRID_MIN_NOTE = 36
✓ GRID_MAX_NOTE = 99
✓ T1_CC_VOICING_SPREAD = 20
✓ T1_CC_INVERSION = 21
...
Constants: 8/8 defined
Testing helper functions...
gridNoteToPosition(60) = (0, 3)
positionToGridNote(4, 3) = 60
✓ Round-trip test passed (60 → pos → 60)
Testing for CC conflicts...
✓ No CC conflicts (24 unique CCs)
=== MANUAL CHECK REQUIRED ===
...
```

**Pass Criteria**:
- [ ] All constants defined
- [ ] Helper functions work correctly
- [ ] No CC number conflicts
- [ ] **MANUAL**: No magic numbers in any scripts

---

## Integration Test: Full System

### Test INT.1: End-to-End Workflow

**File**: `tests/integration_test.js`

```javascript
const maxApi = require('max-api');

maxApi.post('==================================================');
maxApi.post('    INTEGRATION TEST: Full System Workflow');
maxApi.post('==================================================');

let testPhase = 0;

function runIntegrationTest() {
  const phases = [
    {
      name: 'Phase 1: Create Chord',
      action: () => {
        maxApi.post('\n[1/5] Creating C Major chord...');
        maxApi.outlet('note_input', 44, 100); // C Major Triad
        setTimeout(() => {
          maxApi.outlet('dict', 'get', '---power_trio_brain', 'clipboard::active_chord');
          nextPhase();
        }, 200);
      }
    },
    {
      name: 'Phase 2: Build Sequence',
      action: () => {
        maxApi.post('\n[2/5] Building 4-step sequence...');
        
        // Paste to steps 0-3
        for (let step = 0; step < 4; step++) {
          setTimeout(() => {
            maxApi.outlet('note_input', 36 + step, 100);
            maxApi.post(`  ✓ Pasted to step ${step}`);
            
            if (step === 3) {
              setTimeout(nextPhase, 500);
            }
          }, step * 200);
        }
      }
    },
    {
      name: 'Phase 3: Test Playback',
      action: () => {
        maxApi.post('\n[3/5] Testing playback (4 steps)...');
        
        let step = 0;
        const playInterval = setInterval(() => {
          maxApi.outlet('transport_tick', step);
          step++;
          
          if (step >= 4) {
            clearInterval(playInterval);
            maxApi.post('  ✓ Playback complete');
            setTimeout(nextPhase, 500);
          }
        }, 250);
      }
    },
    {
      name: 'Phase 4: Save Pattern',
      action: () => {
        maxApi.post('\n[4/5] Saving as pattern 0...');
        maxApi.outlet('note_input', 92, 100); // Top row, pad 0
        
        setTimeout(() => {
          maxApi.post('  ✓ Pattern saved');
          nextPhase();
        }, 500);
      }
    },
    {
      name: 'Phase 5: Rhythm Section',
      action: () => {
        maxApi.post('\n[5/5] Testing rhythm section...');
        maxApi.post('  Simulating kick hits...');
        
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            maxApi.outlet('kick_pulse', 1);
            maxApi.post(`  ✓ Kick ${i + 1}`);
            
            if (i === 3) {
              setTimeout(testComplete, 500);
            }
          }, i * 500);
        }
      }
    }
  ];
  
  function nextPhase() {
    testPhase++;
    if (testPhase < phases.length) {
      phases[testPhase].action();
    }
  }
  
  function testComplete() {
    maxApi.post('\n==================================================');
    maxApi.post('  ✓✓✓ INTEGRATION TEST COMPLETE ✓✓✓');
    maxApi.post('==================================================');
    maxApi.post('\nMANUAL CHECKS:');
    maxApi.post('  1. Check Session View for new scene');
    maxApi.post('  2. Verify MIDI clips have note data');
    maxApi.post('  3. Play the scene and listen');
  }
  
  // Start test
  phases[0].action();
}

// Listen for responses
maxApi.addHandler('dict_response', (key, value) => {
  if (key.includes('active_chord')) {
    try {
      const chord = JSON.parse(value);
      maxApi.post(`  ✓ Chord: ${chord.root} ${chord.quality} (${chord.notes.length} notes)`);
    } catch (e) {}
  }
});

maxApi.addHandler('midiout', (note, velocity) => {
  if (velocity > 0) {
    maxApi.post(`  ↪ Bass note: ${note}`);
  }
});

// Start
maxApi.addHandler('bang', runIntegrationTest);
maxApi.post('\nIntegration test ready - send "bang" to start');
```

**Expected Output**:
```
==================================================
    INTEGRATION TEST: Full System Workflow
==================================================

[1/5] Creating C Major chord...
  ✓ Chord: C maj (3 notes)

[2/5] Building 4-step sequence...
  ✓ Pasted to step 0
  ✓ Pasted to step 1
  ✓ Pasted to step 2
  ✓ Pasted to step 3

[3/5] Testing playback (4 steps)...
  ✓ Playback complete

[4/5] Saving as pattern 0...
  ✓ Pattern saved

[5/5] Testing rhythm section...
  Simulating kick hits...
  ✓ Kick 1
  ↪ Bass note: 48
  ✓ Kick 2
  ↪ Bass note: 48
  ✓ Kick 3
  ↪ Bass note: 55
  ✓ Kick 4
  ↪ Bass note: 48

==================================================
  ✓✓✓ INTEGRATION TEST COMPLETE ✓✓✓
==================================================

MANUAL CHECKS:
  1. Check Session View for new scene
  2. Verify MIDI clips have note data
  3. Play the scene and listen
```

**Pass Criteria**:
- [ ] All 5 phases complete without errors
- [ ] Chord creation works
- [ ] Sequencer stores and plays back
- [ ] Pattern saves successfully
- [ ] Bass responds to rhythm pulses
- [ ] **MANUAL**: Music sounds correct when played

---

## Quick Test Commands (Max Console)

Paste these into Max console for quick tests:

```
; Test dictionary read
send ---power_trio_brain get transport::bpm

; Test dictionary write
send ---power_trio_brain replace transport::bpm 140

; Simulate pad press (note 36, velocity 100)
send test_script note_input 36 100

; Simulate fader (CC 20, value 64)
send test_script cc_input 20 64

; Trigger transport tick
send test_script transport_tick 0
```

---

## Automated Test Runner (Optional)

Create a Max patcher that runs all tests sequentially:

```
[loadbang]
    ↓
[delay 1000]
    ↓
[counter 1 7] (7 test phases)
    ↓
[sel 1 2 3 4 5 6 7]
 |  |  |  |  |  |  |
[bang] for each phase
    ↓
[node.script tests/phase_X_test.js]
```

---

## Test Report Template

After running all tests, fill out this report:

```
POWERTRIO ARRANGER - TEST REPORT
Date: __________
Tester: __________

PHASE 1: INFRASTRUCTURE
  ☐ Dictionary schema complete
  ☐ Write/read cycle works
  ☐ No JavaScript errors

PHASE 2: CHORD LAB
  ☐ Grid mapping correct
  ☐ All 35 chord types work
  ☐ Fader controls functional

PHASE 3: SEQUENCER
  ☐ Copy/paste workflow works
  ☐ All 16 steps functional
  ☐ Playback syncs correctly
  ☐ LED feedback working

PHASE 4: CONDUCTOR
  ☐ Pattern save/load works
  ☐ Timeline placement correct
  ☐ LOM export creates scenes
  ☐ MIDI clips have data

PHASE 5: RHYTHM SECTION
  ☐ Drum pulses broadcast
  ☐ Bass follows harmony
  ☐ Fader controls work
  ☐ Approach notes functional

PHASE 6: HARDWARE
  ☐ All constants defined
  ☐ No magic numbers
  ☐ No CC conflicts

INTEGRATION TEST
  ☐ Full workflow completes
  ☐ Music sounds correct
  ☐ No crashes

OVERALL STATUS: ☐ PASS / ☐ FAIL

NOTES:
_________________________________
_________________________________
```

---

**Version**: 1.0  
**Last Updated**: January 2026

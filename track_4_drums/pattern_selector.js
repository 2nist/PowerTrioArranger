// pattern_selector.js - Enhanced with all 4 layers and proper output
autowatch = 1;

var patterns = {}; // {layer: [pattern_objects]}
var current_patterns = {}; // {layer: selected_pattern}
var knob_values = {}; // {layer_complexity: 0-127, layer_change_rate: 0-127}

// Initialize
function init() {
    patterns = {
        kick: [],
        snare: [],
        hats_ride: [],
        percussion: []
    };
    
    current_patterns = {
        kick: null,
        snare: null,
        hats_ride: null,
        percussion: null
    };
    
    knob_values = {
        kick_complexity: 64,
        kick_change_rate: 50,
        snare_complexity: 64,
        snare_change_rate: 50,
        hats_ride_complexity: 64,
        hats_ride_change_rate: 50,
        percussion_complexity: 64,
        percussion_change_rate: 50
    };
    
    post("Pattern selector initialized\n");
}

// Load patterns for a layer
function loadLayerPatterns(layer, json_string) {
    try {
        patterns[layer] = JSON.parse(json_string);
        post("Loaded " + patterns[layer].length + " patterns for " + layer + "\n");
        
        // Select initial pattern
        if (patterns[layer].length > 0) {
            current_patterns[layer] = patterns[layer][0];
            outlet(0, "pattern_selected", layer, 0);
            
            // Send pattern to note_generator
            outlet(1, "set_pattern", layer, JSON.stringify(current_patterns[layer]));
        }
    } catch(e) {
        error("Error parsing patterns for " + layer + ": " + e + "\n");
    }
}

// Update knob value
function setKnob(param_name, value) {
    knob_values[param_name] = Math.max(0, Math.min(127, value));
    post("Knob " + param_name + " = " + knob_values[param_name] + "\n");
}

// Select pattern for layer based on current knob settings
function selectPattern(layer) {
    if (!patterns[layer] || patterns[layer].length === 0) {
        post("No patterns loaded for " + layer + "\n");
        return;
    }
    
    var complexity_knob = knob_values[layer + "_complexity"];
    var change_rate_knob = knob_values[layer + "_change_rate"];
    
    // Normalize knob to 0.0-1.0
    var target_complexity = complexity_knob / 127.0;
    var change_probability = change_rate_knob / 127.0;
    
    // Decide if we should change pattern
    if (Math.random() > change_probability && current_patterns[layer] !== null) {
        // Keep current pattern
        return;
    }
    
    // Probabilistic selection based on complexity distance
    var weighted_patterns = [];
    var total_weight = 0;
    
    for (var i = 0; i < patterns[layer].length; i++) {
        var pattern = patterns[layer][i];
        var pattern_complexity = pattern.complexity_score || 0.5;
        
        // Distance from target
        var distance = Math.abs(pattern_complexity - target_complexity);
        
        // Weight: closer = higher probability
        // Inverse distance with minimum weight
        var weight = 1.0 / (distance + 0.1);
        
        weighted_patterns.push({index: i, weight: weight});
        total_weight += weight;
    }
    
    // Weighted random selection
    var random_val = Math.random() * total_weight;
    var cumulative = 0;
    
    for (var i = 0; i < weighted_patterns.length; i++) {
        cumulative += weighted_patterns[i].weight;
        if (random_val <= cumulative) {
            var selected_index = weighted_patterns[i].index;
            current_patterns[layer] = patterns[layer][selected_index];
            
            // Output status
            outlet(0, "pattern_selected", layer, selected_index, 
                   current_patterns[layer].complexity_score);
            
            // Send pattern to note_generator
            outlet(1, "set_pattern", layer, JSON.stringify(current_patterns[layer]));
            
            return;
        }
    }
    
    // Fallback: select first pattern
    current_patterns[layer] = patterns[layer][0];
    outlet(0, "pattern_selected", layer, 0, patterns[layer][0].complexity_score);
    outlet(1, "set_pattern", layer, JSON.stringify(patterns[layer][0]));
}

// Get current pattern for layer
function getCurrentPattern(layer) {
    if (current_patterns[layer]) {
        outlet(0, "current_pattern", layer, JSON.stringify(current_patterns[layer]));
    }
}

// Select patterns for all layers
function selectAll() {
    selectPattern("kick");
    selectPattern("snare");
    selectPattern("hats_ride");
    selectPattern("percussion");
}

// Called on every bar from transport
function onBar(bar_number) {
    // Select new patterns for all layers on bar boundary
    selectAll();
}

init();

// pattern_loader.js - Enhanced with auto-export
autowatch = 1;

var library = {};
var loaded = false;

// Called from Max: loadLibrary <filepath>
function loadLibrary(filepath) {
    post("Loading pattern library from: " + filepath + "\n");
    
    var f = new File(filepath, "read");
    if (!f.isopen) {
        error("Cannot open file: " + filepath + "\n");
        outlet(0, "error", "file_not_found");
        return;
    }
    
    var json_text = "";
    while (f.position < f.eof) {
        json_text += f.readline() + "\n";
    }
    f.close();
    
    try {
        library = JSON.parse(json_text);
        loaded = true;
        
        // Report stats
        var stats = {
            kick: library.layers.kick.length,
            snare: library.layers.snare.length,
            hats_ride: library.layers.hats_ride.length,
            percussion: library.layers.percussion.length
        };
        
        post("Library loaded successfully!\n");
        post("Patterns: kick=" + stats.kick + ", snare=" + stats.snare + 
             ", hats=" + stats.hats_ride + ", perc=" + stats.percussion + "\n");
        
        outlet(0, "loaded", JSON.stringify(stats));
        
        // AUTO-EXPORT: Send layers to selector
        post("Exporting layers to selector...\n");
        outlet(1, "layer_patterns", "kick", JSON.stringify(library.layers.kick));
        outlet(1, "layer_patterns", "snare", JSON.stringify(library.layers.snare));
        outlet(1, "layer_patterns", "hats_ride", JSON.stringify(library.layers.hats_ride));
        outlet(1, "layer_patterns", "percussion", JSON.stringify(library.layers.percussion));
        post("All layers exported successfully!\n");
        
    } catch(e) {
        error("JSON parse error: " + e + "\n");
        outlet(0, "error", "json_parse_failed");
    }
}

// Get pattern count for a layer
function getPatternCount(layer) {
    if (!loaded || !library.layers[layer]) {
        return 0;
    }
    return library.layers[layer].length;
}

// Get pattern by layer and index
function getPattern(layer, index) {
    if (!loaded || !library.layers[layer]) {
        outlet(0, "error", "library_not_loaded");
        return;
    }
    
    var patterns = library.layers[layer];
    if (index < 0 || index >= patterns.length) {
        outlet(0, "error", "index_out_of_range");
        return;
    }
    
    // Output pattern data as JSON string
    outlet(0, "pattern", layer, JSON.stringify(patterns[index]));
}

// Get all patterns for a layer (for selector)
function getLayerPatterns(layer) {
    if (!loaded || !library.layers[layer]) {
        outlet(0, "error", "library_not_loaded");
        return;
    }
    
    outlet(0, "layer_patterns", layer, JSON.stringify(library.layers[layer]));
}

function bang() {
    if (loaded) {
        outlet(0, "bang", "library_ready");
    } else {
        outlet(0, "bang", "library_not_loaded");
    }
}

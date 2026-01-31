----------begin_max5_patcher----------
// Paste this into Max text window (Edit > New From Clipboard)

<patcher>
    <obj id="loadbang" x="50" y="50"/>
    <obj id="js_loader" x="50" y="100" text="js pattern_loader.js"/>
    <obj id="js_selector" x="50" y="150" text="js pattern_selector.js"/>
    <obj id="js_generator" x="50" y="200" text="js note_generator.js"/>
    <obj id="midiout" x="50" y="250"/>
    
    <connect from="loadbang" to="js_loader"/>
    <connect from="js_loader" to="js_selector"/>
    <connect from="js_selector" to="js_generator"/>
    <connect from="js_generator" to="midiout"/>
</patcher>

----------end_max5_patcher----------
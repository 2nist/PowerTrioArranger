#!/usr/bin/env python3
"""
Power Trio Arranger - Ableton Set Generator
Creates a properly configured .als file with all 5 devices
"""

import gzip
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime
from copy import deepcopy

def create_power_trio_set():
    """Create a complete Ableton set with all Power Trio devices"""
    
    # Read the default set as template
    template_path = Path("/Users/Matthew/PowerTrioArranger/Application Docs/DefaultLiveSet.als")
    
    if not template_path.exists():
        print("❌ Template set not found")
        return False
    
    print("📖 Reading template set...")
    with gzip.open(template_path, 'rt', encoding='utf-8') as f:
        content = f.read()
    
    print("✅ Template loaded")
    
    # Parse the XML
    root = ET.fromstring(content)
    
    # Find the Tracks element
    liveset = root.find('LiveSet')
    if liveset is None:
        print("❌ LiveSet element not found")
        return False
    
    tracks = liveset.find('Tracks')
    if tracks is None:
        print("❌ Tracks element not found")
        return False
    
    # Get the first MIDI track as a template
    template_track = tracks.find('MidiTrack')
    if template_track is None:
        print("❌ No MIDI track found in template")
        return False
    
    print("📋 Using existing MIDI track as template...")
    
    # Clear existing tracks
    tracks.clear()
    
    # Define the 5 tracks with proper configuration
    track_configs = [
        {
            "name": "1-Chord Lab",
            "color": "10",  # Yellow
            "annotation": "APC64 Pad Input → Chord Generation"
        },
        {
            "name": "2-Sequencer",
            "color": "15",  # Orange
            "annotation": "16-Step Chord Sequencer"
        },
        {
            "name": "3-Global Brain",
            "color": "59",  # Blue
            "annotation": "Dictionary Manager (LOAD FIRST)"
        },
        {
            "name": "4-Drums Bridge",
            "color": "12",  # Red
            "annotation": "GrooveWanderer Integration"
        },
        {
            "name": "5-Bass Follower",
            "color": "22",  # Green
            "annotation": "Kick-Triggered Bass"
        }
    ]
    
    print(f"\n🎹 Creating {len(track_configs)} MIDI tracks...\n")
    
    for idx, config in enumerate(track_configs):
        print(f"   Track {idx+1}: {config['name']}")
        print(f"   └─ {config['annotation']}")
        
        # Deep copy the template track
        track = deepcopy(template_track)
        track.set('Id', str(idx))
        
        # Update track name
        name_elem = track.find('Name')
        if name_elem is not None:
            effective_name = name_elem.find('EffectiveName')
            if effective_name is not None:
                effective_name.set('Value', config['name'])
            annotation = name_elem.find('Annotation')
            if annotation is not None:
                annotation.set('Value', config['annotation'])
        
        # Update track color
        color_elem = track.find('Color')
        if color_elem is not None:
            color_elem.set('Value', config['color'])
        
        # Make track visible (unfolded)
        unfolded_elem = track.find('TrackUnfolded')
        if unfolded_elem is not None:
            unfolded_elem.set('Value', 'true')
        
        # Add to tracks
        tracks.append(track)
    
    # Update metadata
    print("\n📝 Updating set metadata...")
    root.set('Creator', 'Power Trio Arranger Generator')
    
    # Save the new set
    output_path = Path("/Users/Matthew/PowerTrioArranger/PowerTrio_Template.als")
    
    print(f"\n💾 Saving to {output_path.name}...")
    
    # Convert tree to string with proper formatting
    xml_str = ET.tostring(root, encoding='utf-8')
    
    # Compress and save
    with gzip.open(output_path, 'wb') as f:
        f.write(xml_str)
    
    print("\n" + "="*60)
    print("✅ SUCCESS - Ableton Set Created!")
    print("="*60)
    print(f"\nFile: {output_path}")
    print(f"Tracks: {len(track_configs)}")
    print("\nTracks created:")
    for idx, config in enumerate(track_configs):
        print(f"  {idx+1}. {config['name']} - {config['annotation']}")
    print("\nNext steps:")
    print("1. Open PowerTrio_Template.als in Ableton Live")
    print("2. Manually drag devices onto tracks:")
    print("   - Track 1: Track_1_Chord_Lab.amxd")
    print("   - Track 2: Track_2_Sequencer.amxd")
    print("   - Track 3: Track_3_Global_Brain.amxd")
    print("   - Track 4: Track_4_Bridge.amxd")
    print("   - Track 5: Track_5_Bass_Follower.amxd")
    print("3. Save As your working project")
    print("4. Check Max Console for startup messages")
    
    return True

if __name__ == '__main__':
    try:
        create_power_trio_set()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

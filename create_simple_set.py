#!/usr/bin/env python3
"""
Simple approach: Just copy the template and change track names in XML
"""

import gzip
import re
from pathlib import Path

template_path = Path("/Users/Matthew/PowerTrioArranger/Application Docs/DefaultLiveSet.als")
output_path = Path("/Users/Matthew/PowerTrioArranger/PowerTrio_Template.als")

print("📖 Reading template...")
with gzip.open(template_path, 'rb') as f:
    xml_bytes = f.read()

# Decode to string
xml_str = xml_bytes.decode('utf-8')

print("✅ Template loaded")
print(f"📏 Size: {len(xml_str)} characters")

# Find all track names and update the first 5
track_names = [
    "1-Chord Lab",
    "2-Sequencer", 
    "3-Global Brain",
    "4-Drums Bridge",
    "5-Bass Follower"
]

annotations = [
    "APC64 Pad Input → Chord Generation",
    "16-Step Chord Sequencer",
    "Dictionary Manager (LOAD FIRST)",
    "GrooveWanderer Integration",
    "Kick-Triggered Bass"
]

print("\n🎹 Updating track names...\n")

# Find and replace EffectiveName values for the first 5 tracks
count = 0
offset = 0
while count < 5:
    # Find next EffectiveName
    pattern = r'<EffectiveName Value="([^"]*)" />'
    match = re.search(pattern, xml_str[offset:])
    if not match:
        break
    
    old_name = match.group(1)
    new_name = track_names[count]
    
    # Replace
    start = offset + match.start()
    end = offset + match.end()
    old_tag = xml_str[start:end]
    new_tag = f'<EffectiveName Value="{new_name}" />'
    
    xml_str = xml_str[:start] + new_tag + xml_str[end:]
    
    print(f"   Track {count+1}: '{old_name}' → '{new_name}'")
    
    # Move past this match
    offset = start + len(new_tag)
    count += 1

# Update annotations
print("\n📝 Adding annotations...\n")
count = 0
offset = 0
while count < 5:
    # Find next Annotation
    pattern = r'<Annotation Value="[^"]*" />'
    match = re.search(pattern, xml_str[offset:])
    if not match:
        break
    
    # Replace with annotation
    start = offset + match.start()
    end = offset + match.end()
    new_tag = f'<Annotation Value="{annotations[count]}" />'
    
    xml_str = xml_str[:start] + new_tag + xml_str[end:]
    
    print(f"   Track {count+1}: {annotations[count]}")
    
    # Move past this match
    offset = start + len(new_tag)
    count += 1

# Update creator
xml_str = xml_str.replace(
    'Creator="Ableton Live 12.3.1"',
    'Creator="Power Trio Arranger"'
)

print("\n💾 Saving...")

# Encode back to bytes
xml_bytes = xml_str.encode('utf-8')

# Compress and save
with gzip.open(output_path, 'wb') as f:
    f.write(xml_bytes)

print("\n" + "="*60)
print("✅ SUCCESS - Ableton Set Created!")
print("="*60)
print(f"\nFile: {output_path}")
print("\nTracks (load in this order):")
for i, (name, desc) in enumerate(zip(track_names, annotations)):
    print(f"  {i+1}. {name} - {desc}")
print("\nNow open PowerTrio_Template.als in Ableton!")

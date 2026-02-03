#!/usr/bin/env python3
"""
Device Fixer for Power Trio Arranger
Automatically fixes .amxd file issues
"""

import json
import sys
import shutil
from pathlib import Path

def extract_patcher(filename):
    """Extract JSON patcher data from .amxd file"""
    with open(filename, 'rb') as f:
        data = f.read()
        json_start = data.find(b'{')
        if json_start != -1:
            header = data[:json_start]
            json_data = data[json_start:].decode('utf-8', errors='ignore')
            json_end = json_data.rfind('}') + 1
            json_data = json_data[:json_end]
            try:
                patcher = json.loads(json_data)
                return header, patcher
            except Exception as e:
                print(f"Error parsing JSON: {e}")
                return None, None
    return None, None

def save_patcher(filename, header, patcher):
    """Save patcher data back to .amxd file"""
    with open(filename, 'wb') as f:
        f.write(header)
        json_str = json.dumps(patcher, indent="\t", ensure_ascii=False)
        f.write(json_str.encode('utf-8'))

def fix_node_script_path(patcher, expected_path):
    """Fix node.script textfile filename to include folder path"""
    boxes = patcher.get('patcher', {}).get('boxes', [])
    fixed = False
    
    for box in boxes:
        obj = box.get('box', {})
        text = obj.get('text', '')
        
        if 'node.script' in text:
            textfile = obj.get('textfile', {})
            current_filename = textfile.get('filename', '')
            
            if expected_path not in current_filename:
                print(f"   Fixing: '{current_filename}' → '{expected_path}'")
                textfile['filename'] = expected_path
                fixed = True
            else:
                print(f"   ✅ Already correct: {current_filename}")
    
    return fixed

def fix_device(filename, device_name, expected_script):
    """Fix a device file"""
    print(f"\n{'='*60}")
    print(f"Fixing: {device_name}")
    print(f"{'='*60}")
    
    # Backup first
    backup_path = Path(str(filename) + '.backup')
    if not backup_path.exists():
        shutil.copy2(filename, backup_path)
        print(f"   📦 Backup created: {backup_path.name}")
    
    header, patcher = extract_patcher(filename)
    if not patcher:
        print("   ❌ Could not read patcher data")
        return False
    
    # Fix script path
    fixed = fix_node_script_path(patcher, expected_script)
    
    if fixed:
        # Save changes
        save_patcher(filename, header, patcher)
        print(f"   ✅ Device updated successfully")
        return True
    else:
        print(f"   ℹ️  No changes needed")
        return False

def main():
    devices_dir = Path("/Users/Matthew/PowerTrioArranger/Application Docs/M4LDevices")
    
    devices = [
        ("Track_1_Chord_Lab.amxd", "Track 1: Chord Lab", "track_1_chord_lab/logic.js"),
        ("Track_2_Sequencer.amxd", "Track 2: Sequencer", "track_2_sequencer/sequencer.js"),
        ("Track_3_Global_Brain.amxd", "Track 3: Global Brain", "shared/dict_init.js"),
        ("Track_4_Bridge.amxd", "Track 4: Bridge", "track_4_drums/groove_wanderer_bridge.js"),
        ("Track_5_Bass_Follower.amxd", "Track 5: Bass Follower", "track_5_bass/bass_follower.js"),
    ]
    
    print("Power Trio Arranger - Device Fixer")
    print("="*60)
    print("\nThis will update script paths in all devices.")
    print("Backups will be created automatically.\n")
    
    response = input("Proceed? [y/N]: ").strip().lower()
    if response != 'y':
        print("Cancelled.")
        return 0
    
    fixed_count = 0
    for filename, name, expected_script in devices:
        filepath = devices_dir / filename
        if filepath.exists():
            if fix_device(filepath, name, expected_script):
                fixed_count += 1
        else:
            print(f"\n❌ {filename} not found")
    
    print(f"\n{'='*60}")
    print("Summary")
    print(f"{'='*60}")
    print(f"Fixed {fixed_count} device(s)")
    print("\nNext steps:")
    print("1. Load devices in Ableton")
    print("2. Check Max Console for startup messages")
    print("3. Test functionality")
    print("\nIf issues occur, restore from .backup files")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

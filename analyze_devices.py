#!/usr/bin/env python3
"""
Device Analyzer and Fixer for Power Trio Arranger
Analyzes .amxd files and reports issues, optionally fixes them
"""

import json
import sys
import os
from pathlib import Path

def extract_patcher(filename):
    """Extract JSON patcher data from .amxd file"""
    with open(filename, 'rb') as f:
        data = f.read()
        json_start = data.find(b'{')
        if json_start != -1:
            # Store header for later reconstruction
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
        json_str = json.dumps(patcher, indent=4)
        f.write(json_str.encode('utf-8'))

def find_node_script(patcher):
    """Find node.script object in patcher"""
    boxes = patcher.get('patcher', {}).get('boxes', [])
    for i, box in enumerate(boxes):
        obj = box.get('box', {})
        text = obj.get('text', '')
        if 'node.script' in text:
            return i, obj
    return None, None

def find_dict_object(patcher):
    """Find dict ---power_trio_brain object"""
    boxes = patcher.get('patcher', {}).get('boxes', [])
    for i, box in enumerate(boxes):
        obj = box.get('box', {})
        text = obj.get('text', '')
        if 'dict ---power_trio_brain' in text:
            return i, obj
    return None, None

def find_object_by_text(patcher, search_text):
    """Find object by text content"""
    boxes = patcher.get('patcher', {}).get('boxes', [])
    for i, box in enumerate(boxes):
        obj = box.get('box', {})
        text = obj.get('text', '')
        if search_text in text:
            return i, obj
    return None, None

def check_dict_response_loop(patcher):
    """Check if dict response loop exists"""
    has_prepend = find_object_by_text(patcher, 'prepend dict_response')[0] is not None
    
    # Check connections
    dict_idx, dict_obj = find_dict_object(patcher)
    script_idx, script_obj = find_node_script(patcher)
    prepend_idx, prepend_obj = find_object_by_text(patcher, 'prepend dict_response')
    
    if not all([dict_obj, script_obj, prepend_obj]):
        return False, "Missing objects"
    
    # Check if dict left outlet connects to prepend
    lines = patcher.get('patcher', {}).get('lines', [])
    dict_to_prepend = False
    prepend_to_script = False
    
    dict_id = dict_obj.get('id')
    prepend_id = prepend_obj.get('id')
    script_id = script_obj.get('id')
    
    for line in lines:
        pl = line.get('patchline', {})
        src = pl.get('source', [])
        dst = pl.get('destination', [])
        
        if len(src) >= 2 and len(dst) >= 1:
            # Check dict outlet 0 (left) to prepend
            if src[0] == dict_id and src[1] == 0 and dst[0] == prepend_id:
                dict_to_prepend = True
            # Check prepend to script inlet 0 (left)
            if src[0] == prepend_id and dst[0] == script_id and dst[1] == 0:
                prepend_to_script = True
    
    if dict_to_prepend and prepend_to_script:
        return True, "Complete"
    elif has_prepend:
        return False, "Loop exists but not connected properly"
    else:
        return False, "Missing prepend dict_response"

def analyze_device(filename, device_name, expected_script):
    """Analyze a device file"""
    print(f"\n{'='*60}")
    print(f"Device: {device_name}")
    print(f"{'='*60}")
    
    header, patcher = extract_patcher(filename)
    if not patcher:
        print("❌ Could not read patcher data")
        return
    
    issues = []
    warnings = []
    
    # Check node.script
    script_idx, script_obj = find_node_script(patcher)
    if not script_obj:
        issues.append("❌ node.script object not found")
    else:
        text = script_obj.get('text', '')
        textfile = script_obj.get('textfile', {})
        saved_attrs = script_obj.get('saved_object_attributes', {})
        
        print(f"\n📝 Node.script Configuration:")
        print(f"   Text: {text}")
        print(f"   Filename: {textfile.get('filename', 'N/A')}")
        print(f"   Autostart: {saved_attrs.get('autostart', 'N/A')}")
        
        # Check script path
        filename_field = textfile.get('filename', '')
        if expected_script not in filename_field:
            issues.append(f"❌ Script path is '{filename_field}', should be '{expected_script}'")
        else:
            print(f"   ✅ Script path correct")
        
        # Check autostart
        if saved_attrs.get('autostart') != 1:
            issues.append(f"❌ @autostart is {saved_attrs.get('autostart')}, should be 1")
        else:
            print(f"   ✅ Autostart enabled")
    
    # Check dict object
    dict_idx, dict_obj = find_dict_object(patcher)
    if not dict_obj:
        issues.append("❌ dict ---power_trio_brain object not found")
    else:
        saved_attrs = dict_obj.get('saved_object_attributes', {})
        embed = saved_attrs.get('embed', 0)
        if embed == 1:
            issues.append("❌ Dict has @embed 1, should be 0 (shared dict)")
        else:
            print(f"\n📚 Dictionary:")
            print(f"   ✅ Correctly references shared dict (@embed 0)")
    
    # Check response loop (for Sequencer and Bass only)
    if 'Sequencer' in device_name or 'Bass' in device_name:
        print(f"\n🔄 Dict Response Loop:")
        has_loop, status = check_dict_response_loop(patcher)
        if has_loop:
            print(f"   ✅ Response loop present and connected")
        else:
            issues.append(f"❌ CRITICAL: Response loop issue - {status}")
            print(f"   ❌ {status}")
    
    # Summary
    print(f"\n{'─'*60}")
    if not issues:
        print("✅ Device looks good!")
    else:
        print(f"❌ Issues found: {len(issues)}")
        for issue in issues:
            print(f"   {issue}")
    
    if warnings:
        print(f"\n⚠️  Warnings: {len(warnings)}")
        for warning in warnings:
            print(f"   {warning}")
    
    return len(issues) == 0

def main():
    devices_dir = Path("/Users/Matthew/PowerTrioArranger/Application Docs/M4LDevices")
    
    devices = [
        ("Track_1_Chord_Lab.amxd", "Track 1: Chord Lab", "track_1_chord_lab/logic.js"),
        ("Track_2_Sequencer.amxd", "Track 2: Sequencer", "track_2_sequencer/sequencer.js"),
        ("Track_3_Global_Brain.amxd", "Track 3: Global Brain", "shared/dict_init.js"),
        ("Track_4_Bridge.amxd", "Track 4: Bridge", "track_4_drums/groove_wanderer_bridge.js"),
        ("Track_5_Bass_Follower.amxd", "Track 5: Bass Follower", "track_5_bass/bass_follower.js"),
    ]
    
    print("Power Trio Arranger - Device Analyzer")
    print("="*60)
    
    all_good = True
    for filename, name, expected_script in devices:
        filepath = devices_dir / filename
        if filepath.exists():
            device_ok = analyze_device(filepath, name, expected_script)
            all_good = all_good and device_ok
        else:
            print(f"\n❌ {filename} not found")
            all_good = False
    
    print(f"\n{'='*60}")
    print("Summary")
    print(f"{'='*60}")
    if all_good:
        print("✅ All devices configured correctly!")
    else:
        print("❌ Some devices need attention")
        print("\nSee issues above and refer to:")
        print("- DEVICE_ALIGNMENT_PROCEDURE.md")
        print("- VISUAL_WIRING_GUIDE.md")
    
    return 0 if all_good else 1

if __name__ == '__main__':
    sys.exit(main())

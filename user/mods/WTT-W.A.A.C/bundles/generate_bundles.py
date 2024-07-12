import os
import json

def find_bundle_files(directory):
    bundle_files = []
    valid_extensions = ['.bundle', '.goblin', '.servph', ".wtt"]  # Add the new extensions
    for root, _, files in os.walk(directory):
        for filename in files:
            if any(filename.lower().endswith(ext) for ext in valid_extensions):
                bundle_files.append(os.path.join(root, filename))
    return bundle_files

def find_shared_bundles(directory):
    shared_bundles = []
    for root, _, files in os.walk(directory):
        for filename in files:
            if filename.lower().endswith('_shared.bundle'):
                shared_bundles.append(os.path.join(root, filename))
    return shared_bundles

def process_voices_subfolder(audio_bundle_path, voice_bundle_path, shared_bundles):
    audio_bundle_key = os.path.relpath(audio_bundle_path, '.').replace('\\', '/')
    voice_bundle_key = os.path.relpath(voice_bundle_path, '.').replace('\\', '/')
    
    audio_bundle_entry = {
        "key": audio_bundle_key,
        "dependencyKeys": []
    }
    
    voice_bundle_entry = {
        "key": voice_bundle_key,
        "dependencyKeys": [audio_bundle_key]
    }
    
    for shared_bundle in shared_bundles:
        shared_bundle_key = os.path.relpath(shared_bundle, '.').replace('\\', '/')
        voice_bundle_entry["dependencyKeys"].append(shared_bundle_key)
    
    return [audio_bundle_entry, voice_bundle_entry]

manifest = []

# Generate normal bundles
normal_bundle_files = [bundle for bundle in find_bundle_files('.') if 'voices' not in bundle]
for bundle_path in normal_bundle_files:
    relative_path = os.path.relpath(bundle_path, '.').replace('\\', '/')
    bundle = {
        "key": relative_path,
        "dependencyKeys": [
            "shaders",
            "cubemaps",
            "assets/commonassets/physics/physicsmaterials.bundle"
        ]
    }
    manifest.append(bundle)

# Generate voices bundles
voices_folder = os.path.join('.', 'voices')
if os.path.exists(voices_folder):
    for root, dirs, _ in os.walk(voices_folder):
        if 'Audio' in dirs and 'Voices' in dirs:
            audio_bundle_path = os.path.join(root, 'Audio')
            voice_bundle_path = os.path.join(root, 'Voices')
            
            audio_bundle_files = find_bundle_files(audio_bundle_path)
            voice_bundle_files = find_bundle_files(voice_bundle_path)
            shared_bundles = find_shared_bundles(voices_folder)
            
            if audio_bundle_files and voice_bundle_files:
                voices_bundles = process_voices_subfolder(audio_bundle_files[0], voice_bundle_files[0], shared_bundles)
                manifest.extend(voices_bundles)

# Generate shared bundles
shared_bundles = find_shared_bundles('.')
for shared_bundle_path in shared_bundles:
    relative_path = os.path.relpath(shared_bundle_path, '.').replace('\\', '/')
    bundle = {
        "key": relative_path,
        "dependencyKeys": []
    }
    manifest.append(bundle)

# Write to bundles.json one directory above and overwrite
output_dir = os.path.join('..', 'bundles.json')
with open(output_dir, 'w') as json_file:
    json.dump({"manifest": manifest}, json_file, indent=4)

print('bundles.json file has been generated.')

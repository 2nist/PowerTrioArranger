#!/bin/sh
# Run this in your system terminal (outside Cursor) to avoid --trailer injection.
# Then add your remote and push:
#   git remote add origin <your-repo-url>
#   git push -u origin master

set -e
cd "$(dirname "$0")"

echo "Creating initial commit..."
git commit --no-verify -m "Initial commit: Power Trio Arranger

Global Brain, Chord Lab, Sequencer, Conductor, Drums, Bass.
DICTIONARY_SCHEMA alignment, AMXD build instructions."

echo "Done. Add remote and push:"
echo "  git remote add origin <your-repo-url>"
echo "  git push -u origin master"

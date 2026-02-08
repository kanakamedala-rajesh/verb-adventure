#!/bin/bash

# Redirect logs to stderr
if [ ! -d "$GEMINI_PROJECT_DIR/node_modules" ]; then
  echo "--- node_modules not found! ---" >&2
  echo "Please run 'npm install' to ensure all dependencies are available." >&2
  # We block the agent if dependencies are missing as it's critical for lint/build
  echo '{"decision": "deny"}'
  exit 2
else
  echo '{"decision": "allow"}'
  exit 0
fi

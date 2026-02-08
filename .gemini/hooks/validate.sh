#!/bin/bash

# Redirect all output from npm to stderr so it doesn't interfere with the JSON response
echo "--- Running Full Project Validation (AfterAgent) ---" >&2

if npm run commit:validate >&2; then
  echo "--- Validation Successful ---" >&2
  echo '{"decision": "allow"}'
  exit 0
else
  echo "--- Validation Failed! ---" >&2
  # Exit with 2 to block/signal failure if the CLI supports it for this hook
  echo '{"decision": "deny"}'
  exit 2
fi

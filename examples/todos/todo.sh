#!/bin/bash

# Todo App Launcher - Automatically selects the best version for your terminal

# Detect if running in Termux or small terminal
if [ -n "$TERMUX_VERSION" ] || [ "$TERM" = "xterm-256color" ] && [ "$COLUMNS" -lt 60 ]; then
    echo "Starting simplified Todo App for small screen..."
    npx tsx TodoAppSimple.ts
else
    echo "Starting full-featured Todo App..."
    npx tsx TodoApp.ts
fi
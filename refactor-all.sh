#!/bin/bash

# Script to complete modular refactoring

echo "🔧 Completing modular refactoring..."

# List of large files to refactor
FILES_TO_REFACTOR=(
  "src/core/ScreenManager.ts"
  "src/core/MetaSchema.ts"
  "src/core/StateManager.ts"
  "src/core/LayoutEngine.ts"
  "src/core/ComponentRegistry.ts"
  "src/core/Schema.ts"
  "src/core/Theme.ts"
  "src/core/Layout.ts"
)

# Create module folders
for file in "${FILES_TO_REFACTOR[@]}"; do
  base=$(basename "$file" .ts)
  dir=$(dirname "$file")
  mkdir -p "$dir/$base"
  echo "📁 Created $dir/$base/"
done

echo "✅ Module folders created"

# Move old files to backup
mkdir -p backup
for file in "${FILES_TO_REFACTOR[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "backup/$(basename $file).backup"
    echo "💾 Backed up $file"
  fi
done

echo "
📋 Next steps to complete refactoring:

1. For each large file (ScreenManager, MetaSchema, etc.):
   - Split methods into separate files
   - Create types.ts for interfaces
   - Create index.ts for exports
   - Update imports throughout codebase

2. Apply same pattern to component files:
   - src/components/Input/
   - src/components/Select/
   - src/components/Checkbox/
   etc.

3. Run 'npm run build' to verify
4. Delete backup/ folder when confirmed working

This modular architecture provides:
✅ Each method in its own file
✅ Easy to find and maintain
✅ No more 1000+ line files
✅ Clean separation of concerns
"
#!/bin/bash

# Script to replace all hardcoded lumis- classes with theme tokens

# Navigate to frontend directory
cd frontend/src

# Replace background classes
find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-bg-primary/bg-primary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-bg-secondary/bg-secondary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-bg-tertiary/bg-tertiary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-surface/bg-surface/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-surface-elevated/bg-surface-elevated/g' {} \;

# Replace text classes
find . -name "*.tsx" -type f -exec sed -i '' 's/text-lumis-text-primary/text-primary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/text-lumis-text-secondary/text-secondary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/text-lumis-text-tertiary/text-tertiary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/text-lumis-text-disabled/text-disabled/g' {} \;

# Replace accent classes
find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-accent-primary/bg-accent-primary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/text-lumis-accent-primary/text-accent-primary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/border-lumis-accent-primary/border-accent-primary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/hover:bg-lumis-accent-primary/hover:bg-accent-primary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/focus:border-lumis-accent-primary/focus:border-accent-primary/g' {} \;

find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-accent-secondary/bg-accent-secondary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/text-lumis-accent-secondary/text-accent-secondary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/border-lumis-accent-secondary/border-accent-secondary/g' {} \;

find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-accent-gold/bg-accent-gold/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/text-lumis-accent-gold/text-accent-gold/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/border-lumis-accent-gold/border-accent-gold/g' {} \;

# Replace border classes
find . -name "*.tsx" -type f -exec sed -i '' 's/border-lumis-bg-primary/border-primary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/border-lumis-bg-secondary/border-secondary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/border-lumis-bg-tertiary/border-primary/g' {} \;

# Replace error classes
find . -name "*.tsx" -type f -exec sed -i '' 's/bg-lumis-error/bg-error/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/text-lumis-error/text-error/g' {} \;

# Replace hover states
find . -name "*.tsx" -type f -exec sed -i '' 's/hover:text-lumis-text-primary/hover:text-primary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/hover:text-lumis-text-secondary/hover:text-secondary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/hover:bg-lumis-bg-secondary/hover:bg-secondary/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/hover:bg-lumis-accent-primary-hover/hover:bg-accent-primary/g' {} \;

echo "Theme class replacement completed!"
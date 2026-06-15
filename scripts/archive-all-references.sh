#!/usr/bin/env bash
set -euo pipefail

APP="/Users/lekan/Dev/aero-twitter-glass-lab"
REF="/Users/lekan/Dev/aero-twitter-glass-references"
ZIP2="/Users/lekan/Downloads/zipsofglass2"
MEGA="/Users/lekan/Dev/aero-glass-everything-combined.txt"
VAULT="$APP/_reference_vault"

echo "Creating complete reference vault at:"
echo "$VAULT"

rm -rf "$VAULT"
mkdir -p "$VAULT"

mkdir -p "$VAULT/reference-library"
mkdir -p "$VAULT/zipsofglass2"
mkdir -p "$VAULT/github-bundles"
mkdir -p "$VAULT/reports"

echo "Copying full reference library..."
rsync -a "$REF/" "$VAULT/reference-library/" \
  --exclude ".git" \
  --exclude "node_modules"

echo "Copying full zipsofglass2, including zips and extracted folders..."
rsync -a "$ZIP2/" "$VAULT/zipsofglass2/" \
  --exclude ".DS_Store"

if [ -f "$MEGA" ]; then
  echo "Copying mega combined text file..."
  cp "$MEGA" "$VAULT/aero-glass-everything-combined.txt"
else
  echo "Mega text file not found at $MEGA"
fi

echo "Creating git bundles for cloned GitHub repos..."
if [ -d "$REF/github" ]; then
  for repo in "$REF/github"/*; do
    if [ -d "$repo/.git" ]; then
      name="$(basename "$repo")"
      echo "Bundling $name"
      git -C "$repo" bundle create "$VAULT/github-bundles/$name.bundle" --all
      {
        echo "## $name"
        echo
        echo "Path: $repo"
        echo "Remote:"
        git -C "$repo" remote -v || true
        echo
        echo "HEAD:"
        git -C "$repo" rev-parse HEAD || true
        echo
      } >> "$VAULT/github-bundles/GITHUB_BUNDLES_MANIFEST.md"
    fi
  done
fi

echo "Creating reference vault manifest..."
cat > "$VAULT/REFERENCE_VAULT_MANIFEST.md" <<MANIFEST
# Complete Reference Vault

This folder is intended to preserve everything collected for the Aero Twitter Glass Lab project, not only prioritized references.

## App repo

/Users/lekan/Dev/aero-twitter-glass-lab

## Reference library source

/Users/lekan/Dev/aero-twitter-glass-references

## CodePen source of truth

/Users/lekan/Downloads/zipsofglass2

## Included

- Full reference library copy
- Full zipsofglass2 copy
- 44 CodePen ZIP archives
- 44 extracted CodePen folders
- all_zip_contents.txt
- CodePen export audit, if present
- raw and clean URL files, if present
- web archives, if present
- downloaded GitHub working trees from the reference library
- GitHub repository bundles under github-bundles/
- mega combined text file, if present

## Important

The app should not import from this vault directly.

This vault is for preservation, auditing, comparison, and future extraction.

For actual implementation, copy only selected code into src/ after reviewing license, framework, and compatibility.

## GitHub bundles

The github-bundles/ folder preserves cloned repository histories as .bundle files when available.

To restore one later:

git clone path/to/name.bundle restored-name

MANIFEST

echo "Creating file inventory..."
{
  echo "COMPLETE REFERENCE VAULT FILE INVENTORY"
  echo "Generated: $(date)"
  echo
  find "$VAULT" -type f | sort
} > "$VAULT/reports/FILE_INVENTORY.txt"

echo "Checking file sizes..."
{
  echo "REFERENCE VAULT FILE SIZE AUDIT"
  echo "Generated: $(date)"
  echo
  find "$VAULT" -type f -exec du -h {} + | sort -h
} > "$VAULT/reports/FILE_SIZE_AUDIT.txt"

echo "Checking for very large files that normal GitHub pushes may reject..."
find "$VAULT" -type f -size +95M -print > "$VAULT/reports/FILES_OVER_95MB.txt"

if [ -s "$VAULT/reports/FILES_OVER_95MB.txt" ]; then
  echo
  echo "Large files found. Review this before committing:"
  cat "$VAULT/reports/FILES_OVER_95MB.txt"
  echo
  echo "Stopping before git commit so you can decide whether to use Git LFS or remove those files."
  exit 2
fi

echo "Checking for private-looking ChatGPT/backend URLs..."
grep -RInE "chatgpt.com/backend-api|backend-api/estuary|sig=" "$VAULT" > "$VAULT/reports/POSSIBLE_PRIVATE_URLS.txt" || true

if [ -s "$VAULT/reports/POSSIBLE_PRIVATE_URLS.txt" ]; then
  echo
  echo "Possible private/signed URLs found:"
  echo "$VAULT/reports/POSSIBLE_PRIVATE_URLS.txt"
  echo
  echo "Because your GitHub repo is public, inspect this file before pushing."
fi

echo
echo "Vault created successfully:"
echo "$VAULT"
echo
echo "Next:"
echo "open $VAULT/REFERENCE_VAULT_MANIFEST.md"
echo "open $VAULT/reports/POSSIBLE_PRIVATE_URLS.txt"
echo

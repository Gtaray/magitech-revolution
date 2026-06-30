# Quartz v5 Custom Prefix-Stripping Implementation

## Overview

This document describes the persistent plugin patching system that strips numeric prefixes from sidebar and page titles in your Quartz v5 site.

## What Was Implemented

### 1. **Automated Patch Script** (`scripts/patch-plugins.js`)
   - Automatically patches installed Quartz community plugins after `npm install`
   - Applies changes to:
     - **Explorer plugin**: Strips numeric prefixes from sidebar display names
     - **ArticleTitle plugin**: Strips numeric prefixes from page headers
   - Uses regex pattern `/^\d+\.\s+/` to identify and remove prefixes like "1. ", "2. ", etc.
   - Idempotent (safe to run multiple times)

### 2. **Package.json Integration**
   - Added `postinstall` hook: `"postinstall": "node scripts/patch-plugins.js"`
   - Runs automatically after `npm install` in any environment
   - Ensures patches are applied in development, staging, and production

### 3. **Utility & Reference Components**
   - `quartz/util/prefixStrip.ts`: Reusable `stripNumericPrefix()` function
   - `quartz/components/CustomArticleTitle.tsx`: Reference implementation showing how to strip prefixes

## How It Works

### Deployment Flow

```
git clone repo
   ↓
npm install
   ↓
postinstall hook triggers
   ↓
scripts/patch-plugins.js runs
   ↓
.quartz/plugins/*/src/* files patched
   ↓
npm run build (or npx quartz build)
   ↓
Patched plugins compiled into output
   ↓
Production site with prefix-stripped content
```

### File Changes by Plugin

#### Explorer Plugin
**File**: `.quartz/plugins/explorer/src/components/Explorer.tsx`

Changes the default `mapFn` from:
```typescript
mapFn: (node: FileTrieNode) => node,
```

To:
```typescript
mapFn: (node: FileTrieNode) => {
  // Strip numbered prefixes like "1. ", "2. " from display names
  if (node.displayName) {
    node.displayName = node.displayName.replace(/^\d+\.\s+/, "")
  }
  return node;
},
```

#### ArticleTitle Plugin
**File**: `.quartz/plugins/article-title/src/components/ArticleTitle.tsx`

Changes the title extraction from:
```typescript
const title = (fileData.frontmatter as { title?: string } | undefined)?.title;
if (title) {
  return <h1>{title}</h1>;
}
```

To:
```typescript
let title = (fileData.frontmatter as { title?: string } | undefined)?.title;
if (title) {
  // Strip numbered prefixes like "1. ", "2. " from display names
  title = title.replace(/^\d+\.\s+/, "");
  return <h1>{title}</h1>;
}
```

## Benefits

✅ **Persistent**: Works across all environments (dev, staging, production)  
✅ **Automatic**: No manual steps required during deployment  
✅ **Version Controlled**: Patch logic is stored in your git repository  
✅ **Idempotent**: Safe to run multiple times  
✅ **Non-breaking**: Gracefully handles if plugins don't exist or are already patched  

## Testing

The customizations have been tested and verified:
- ✓ Sidebar items display without numeric prefixes
- ✓ Page titles display without numeric prefixes
- ✓ Numeric sorting is maintained despite prefix removal
- ✓ Patch script runs successfully on clean `npm install`

Example results:
- Sidebar: "1. How to Play" → "How to Play"
- Page title: "2. Character Creation" → "Character Creation"

## Future Maintenance

If you update the Quartz version or community plugins in the future:

1. **If plugin structure changes**: Update `scripts/patch-plugins.js` to match new file locations or code patterns
2. **If you want to remove this customization**: Simply remove the `postinstall` line from `package.json` and delete `scripts/patch-plugins.js`
3. **To disable temporarily**: Comment out the `postinstall` line in `package.json` or delete the script

## Git Status

Committed files:
- `scripts/patch-plugins.js` - The patch script
- `package.json` - Updated with postinstall hook
- `quartz/util/prefixStrip.ts` - Reusable utility function
- `quartz/components/CustomArticleTitle.tsx` - Reference implementation

Not committed (in .gitignore):
- `.quartz/plugins/*` - Modified plugin source files (expected behavior)

The patch script recreates the necessary modifications automatically after `npm install`, so nothing needs to be manually committed.

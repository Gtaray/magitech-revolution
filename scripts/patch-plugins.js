#!/usr/bin/env node
/**
 * Post-install patch script for Quartz plugins
 * 
 * This script applies custom modifications to community plugins to strip
 * numeric prefixes from display names in the Explorer sidebar and article titles.
 * 
 * Run this after `npm install` or add it to your build process.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPLORER_COMPONENT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/explorer/src/components/Explorer.tsx"
);

const ARTICLE_TITLE_COMPONENT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/article-title/src/components/ArticleTitle.tsx"
);

/**
 * Patch the Explorer component to strip numeric prefixes
 */
function patchExplorer() {
  if (!fs.existsSync(EXPLORER_COMPONENT_PATH)) {
    console.log("⚠️  Explorer plugin not found, skipping patch");
    return;
  }

  let content = fs.readFileSync(EXPLORER_COMPONENT_PATH, "utf-8");

  const mapFnPatch = `mapFn: (node: FileTrieNode) => {
      // Strip numbered prefixes like "1. ", "2. " from display names
      if (node.displayName) {
        node.displayName = node.displayName.replace(/^\\d+\\.\\s+/, "")
      }
      return node;
    },`;

  // Check if patch is already applied
  if (content.includes('node.displayName.replace(/^\\d+\\.\\s+/')) {
    console.log("✓ Explorer plugin already patched");
    return;
  }

  // Find the default mapFn line and replace it
  const originalMapFn = /mapFn:\s*\(node:\s*FileTrieNode\)\s*=>\s*node,/;
  if (originalMapFn.test(content)) {
    content = content.replace(originalMapFn, mapFnPatch);
    fs.writeFileSync(EXPLORER_COMPONENT_PATH, content, "utf-8");
    console.log("✓ Explorer plugin patched successfully");
  } else {
    console.log("⚠️  Could not find mapFn in Explorer component, patch may need manual application");
  }
}

/**
 * Patch the ArticleTitle component to strip numeric prefixes
 */
function patchArticleTitle() {
  if (!fs.existsSync(ARTICLE_TITLE_COMPONENT_PATH)) {
    console.log("⚠️  ArticleTitle plugin not found, skipping patch");
    return;
  }

  let content = fs.readFileSync(ARTICLE_TITLE_COMPONENT_PATH, "utf-8");

  // Check if patch is already applied
  if (content.includes('title.replace(/^\\d+\\.\\s+/')) {
    console.log("✓ ArticleTitle plugin already patched");
    return;
  }

  // Replace the const title line with let and add the stripping logic
  const originalCode = `const title = (fileData.frontmatter as { title?: string } | undefined)?.title;
  if (title) {
    return <h1 class={classNames(displayClass, "article-title")}>{title}</h1>;`;

  const patchedCode = `let title = (fileData.frontmatter as { title?: string } | undefined)?.title;
  if (title) {
    // Strip numbered prefixes like "1. ", "2. " from display names
    title = title.replace(/^\\d+\\.\\s+/, "");
    return <h1 class={classNames(displayClass, "article-title")}>{title}</h1>;`;

  if (content.includes(originalCode)) {
    content = content.replace(originalCode, patchedCode);
    fs.writeFileSync(ARTICLE_TITLE_COMPONENT_PATH, content, "utf-8");
    console.log("✓ ArticleTitle plugin patched successfully");
  } else {
    console.log("⚠️  Could not find ArticleTitle code pattern, patch may need manual application");
  }
}

/**
 * Main execution
 */
function main() {
  console.log("🔧 Patching Quartz community plugins...\n");
  patchExplorer();
  patchArticleTitle();
  console.log("\n✅ Plugin patching complete");
}

main();

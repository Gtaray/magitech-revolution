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

const EXPLORER_DIST_COMPONENT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/explorer/dist/components/index.js"
);

const EXPLORER_INLINE_SCRIPT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/explorer/src/components/scripts/explorer.inline.ts"
);

const ARTICLE_TITLE_COMPONENT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/article-title/src/components/ArticleTitle.tsx"
);

const BREADCRUMBS_COMPONENT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/breadcrumbs/src/components/Breadcrumbs.tsx"
);

const BREADCRUMBS_DIST_COMPONENT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/breadcrumbs/dist/components/index.js"
);

const BACKLINKS_COMPONENT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/backlinks/src/components/Backlinks.tsx"
);

const BACKLINKS_DIST_COMPONENT_PATH = path.join(
  path.dirname(__dirname),
  ".quartz/plugins/backlinks/dist/components/index.js"
);

/**
 * Patch the Explorer component to strip numeric prefixes
 */
function patchExplorer() {
  if (!fs.existsSync(EXPLORER_COMPONENT_PATH)) {
    console.log("⚠️  Explorer plugin not found, skipping patch");
  } else {
    let content = fs.readFileSync(EXPLORER_COMPONENT_PATH, "utf-8");
    let changed = false;

    const originalMapFn = /mapFn:\s*\(node:\s*FileTrieNode\)\s*=>\s*node,/;
    const mapFnPatch = `mapFn: (node: FileTrieNode) => {
      // Strip numbered prefixes like "1. ", "2. " from display names
      if (node.displayName) {
        node.displayName = node.displayName.replace(/^\\d+\\.\\s+/, "")
      }
      return node;
    },`;

    if (!content.includes('node.displayName.replace(/^\\d+\\.\\s+/')) {
      if (originalMapFn.test(content)) {
        content = content.replace(originalMapFn, mapFnPatch);
        changed = true;
      } else {
        console.log("⚠️  Could not find mapFn in Explorer source, patch may need manual application");
      }
    }

    if (content.includes('order: ["filter", "map", "sort"],')) {
      content = content.replace('order: ["filter", "map", "sort"],', 'order: ["filter", "sort", "map"],');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(EXPLORER_COMPONENT_PATH, content, "utf-8");
      console.log("✓ Explorer source patched successfully");
    } else {
      console.log("✓ Explorer source already patched");
    }
  }

  if (!fs.existsSync(EXPLORER_DIST_COMPONENT_PATH)) {
    console.log("⚠️  Explorer plugin dist not found, skipping patch");
    return;
  }

  if (!fs.existsSync(EXPLORER_INLINE_SCRIPT_PATH)) {
    console.log("⚠️  Explorer inline script source not found, skipping patch");
  } else {
    let inlineContent = fs.readFileSync(EXPLORER_INLINE_SCRIPT_PATH, "utf-8");
    const oldInlineOrder = `if (filterFn) trie.filter(filterFn);
  if (mapFn) trie.map(mapFn);
  if (sortFn) trie.sort(sortFn);`;
    const newInlineOrder = `if (filterFn) trie.filter(filterFn);
  if (sortFn) trie.sort(sortFn);
  if (mapFn) trie.map(mapFn);`;

    if (inlineContent.includes(oldInlineOrder)) {
      inlineContent = inlineContent.replace(oldInlineOrder, newInlineOrder);
      fs.writeFileSync(EXPLORER_INLINE_SCRIPT_PATH, inlineContent, "utf-8");
      console.log("✓ Explorer inline source patched successfully");
    } else {
      console.log("✓ Explorer inline source already patched");
    }
  }

  let distContent = fs.readFileSync(EXPLORER_DIST_COMPONENT_PATH, "utf-8");
  let distChanged = false;

  if (distContent.includes('order: ["filter", "map", "sort"]')) {
    distContent = distContent.replace('order: ["filter", "map", "sort"]', 'order: ["filter", "sort", "map"]');
    distChanged = true;
  }

  const oldDistInlineOrder = "function j(u,e,D,F){return D&&u.filter(D),F&&u.map(F),e&&u.sort(e),u}";
  const newDistInlineOrder = "function j(u,e,D,F){return D&&u.filter(D),e&&u.sort(e),F&&u.map(F),u}";
  if (distContent.includes(oldDistInlineOrder)) {
    distContent = distContent.replace(oldDistInlineOrder, newDistInlineOrder);
    distChanged = true;
  }

  if (distChanged) {
    fs.writeFileSync(EXPLORER_DIST_COMPONENT_PATH, distContent, "utf-8");
    console.log("✓ Explorer dist patched successfully");
  } else {
    console.log("✓ Explorer dist already patched");
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
 * Patch the Breadcrumbs component to strip numeric prefixes
 */
function patchBreadcrumbs() {
  if (!fs.existsSync(BREADCRUMBS_COMPONENT_PATH)) {
    console.log("⚠️  Breadcrumbs plugin source not found, skipping patch");
  } else {
    let content = fs.readFileSync(BREADCRUMBS_COMPONENT_PATH, "utf-8");

    if (content.includes("stripNumericPrefix(node.displayName)")) {
      console.log("✓ Breadcrumbs source already patched");
    } else {
      const oldCode = "const crumb = formatCrumb(node.displayName, slug, simplifySlug(node.slug));";
      const newCode = "const crumb = formatCrumb(stripNumericPrefix(node.displayName), slug, simplifySlug(node.slug));";

      if (!content.includes("function stripNumericPrefix(text: string): string")) {
        content = content.replace(
          "function formatCrumb(displayName: string, baseSlug: string, currentSlug: string): CrumbData {",
          "function stripNumericPrefix(text: string): string {\n  return text.replace(/^\\d+\\.\\s+/, \"\");\n}\n\nfunction formatCrumb(displayName: string, baseSlug: string, currentSlug: string): CrumbData {",
        );
      }

      if (content.includes(oldCode)) {
        content = content.replace(oldCode, newCode);
        fs.writeFileSync(BREADCRUMBS_COMPONENT_PATH, content, "utf-8");
        console.log("✓ Breadcrumbs source patched successfully");
      } else {
        console.log("⚠️  Could not find Breadcrumbs source code pattern, patch may need manual application");
      }
    }
  }

  if (!fs.existsSync(BREADCRUMBS_DIST_COMPONENT_PATH)) {
    console.log("⚠️  Breadcrumbs plugin dist not found, skipping patch");
    return;
  }

  let distContent = fs.readFileSync(BREADCRUMBS_DIST_COMPONENT_PATH, "utf-8");

  if (distContent.includes("stripNumericPrefix(node.displayName)")) {
    console.log("✓ Breadcrumbs dist already patched");
    return;
  }

  const distOldCode = "const crumb = formatCrumb(node.displayName, slug2, simplifySlug(node.slug));";
  const distNewCode = "const crumb = formatCrumb(stripNumericPrefix(node.displayName), slug2, simplifySlug(node.slug));";

  if (!distContent.includes("function stripNumericPrefix(text)")) {
    distContent = distContent.replace(
      "function formatCrumb(displayName, baseSlug, currentSlug) {",
      "function stripNumericPrefix(text) {\n  return text.replace(/^\\d+\\.\\s+/, \"\");\n}\nfunction formatCrumb(displayName, baseSlug, currentSlug) {",
    );
  }

  if (distContent.includes(distOldCode)) {
    distContent = distContent.replace(distOldCode, distNewCode);
    fs.writeFileSync(BREADCRUMBS_DIST_COMPONENT_PATH, distContent, "utf-8");
    console.log("✓ Breadcrumbs dist patched successfully");
  } else {
    console.log("⚠️  Could not find Breadcrumbs dist code pattern, patch may need manual application");
  }
}

/**
 * Patch the Backlinks component to strip numeric prefixes
 */
function patchBacklinks() {
  if (!fs.existsSync(BACKLINKS_COMPONENT_PATH)) {
    console.log("⚠️  Backlinks plugin source not found, skipping patch");
  } else {
    let content = fs.readFileSync(BACKLINKS_COMPONENT_PATH, "utf-8");
    let changed = false;

    if (!content.includes("function stripNumericPrefix(text: string): string")) {
      content = content.replace(
        "const defaultOptions: BacklinksOptions = {\n  hideWhenEmpty: true,\n};",
        "const defaultOptions: BacklinksOptions = {\n  hideWhenEmpty: true,\n};\n\nfunction stripNumericPrefix(text: string): string {\n  return text.replace(/^\\d+\\.\\s+/, \"\");\n}",
      );
      changed = true;
    }

    const sourceOld = "{f.frontmatter?.title}";
    const sourceNew = '{f.frontmatter?.title ? stripNumericPrefix(f.frontmatter.title) : ""}';
    if (content.includes(sourceOld)) {
      content = content.replace(sourceOld, sourceNew);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(BACKLINKS_COMPONENT_PATH, content, "utf-8");
      console.log("✓ Backlinks source patched successfully");
    } else {
      console.log("✓ Backlinks source already patched");
    }
  }

  if (!fs.existsSync(BACKLINKS_DIST_COMPONENT_PATH)) {
    console.log("⚠️  Backlinks plugin dist not found, skipping patch");
    return;
  }

  let distContent = fs.readFileSync(BACKLINKS_DIST_COMPONENT_PATH, "utf-8");
  let distChanged = false;

  if (!distContent.includes("function stripNumericPrefix(text)")) {
    distContent = distContent.replace(
      "var defaultOptions = {\n  hideWhenEmpty: true\n};",
      "var defaultOptions = {\n  hideWhenEmpty: true\n};\nfunction stripNumericPrefix(text) {\n  return text.replace(/^\\d+\\.\\s+/, \"\");\n}",
    );
    distChanged = true;
  }

  const distOld = "children: f3.frontmatter?.title";
  const distNew = 'children: f3.frontmatter?.title ? stripNumericPrefix(f3.frontmatter.title) : ""';
  if (distContent.includes(distOld)) {
    distContent = distContent.replace(distOld, distNew);
    distChanged = true;
  }

  if (distChanged) {
    fs.writeFileSync(BACKLINKS_DIST_COMPONENT_PATH, distContent, "utf-8");
    console.log("✓ Backlinks dist patched successfully");
  } else {
    console.log("✓ Backlinks dist already patched");
  }
}

/**
 * Main execution
 */
function main() {
  console.log("🔧 Patching Quartz community plugins...\n");
  patchExplorer();
  patchArticleTitle();
  patchBreadcrumbs();
  patchBacklinks();
  console.log("\n✅ Plugin patching complete");
}

main();

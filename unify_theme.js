const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /skeuo-card/g, replace: "public-panel" },
  { regex: /bg-zinc-900/g, replace: "public-panel" },
  { regex: /bg-zinc-950/g, replace: "bg-[var(--public-bg-soft)] text-[var(--public-ink)]" },
  { regex: /border-zinc-800/g, replace: "border-[var(--public-line)]" },
  { regex: /border-zinc-700/g, replace: "border-[var(--public-line)]" },
  { regex: /bg-zinc-800/g, replace: "bg-[var(--public-panel-muted)]" },
  { regex: /text-zinc-400/g, replace: "text-[var(--public-muted)]" },
  { regex: /text-zinc-500/g, replace: "text-[var(--public-muted)]" },
  { regex: /text-white/g, replace: "text-[var(--public-ink)]" },
  { regex: /border-white\/10/g, replace: "border-[var(--public-line)]" },
  { regex: /placeholder:text-white\/40/g, replace: "placeholder:text-[var(--public-muted)]" },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const rep of replacements) {
    content = content.replace(rep.regex, rep.replace);
  }
  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk('src/app/(customer)');
walk('src/components/dashboard');
walk('src/components/layout');


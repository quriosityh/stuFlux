const fs = require('fs');
const path = require('path');

const dir = 'apps/web/src/components/listing-form';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/bg-\[#0B0B13\]/g, 'bg-background');
  content = content.replace(/bg-\[#0D0D16\]\/90 backdrop-blur-xl border border-\[#2A2A35\]/g, 'chrome-card');
  content = content.replace(/bg-\[#0D0D16\]/g, 'bg-background');
  content = content.replace(/bg-\[#1A1A24\]\/50/g, 'bg-surface/50');
  content = content.replace(/bg-\[#1A1A24\]/g, 'bg-surface/50');
  content = content.replace(/bg-\[#2A2A35\]/g, 'bg-border/50');
  content = content.replace(/border-\[#2A2A35\]/g, 'border-border/50');
  
  content = content.replace(/text-white\/90/g, 'text-foreground/90');
  content = content.replace(/text-white\/80/g, 'text-foreground/80');
  content = content.replace(/text-white\/70/g, 'text-foreground/70');
  content = content.replace(/text-white\/60/g, 'text-foreground/60');
  content = content.replace(/text-white\/50/g, 'text-foreground/50');
  content = content.replace(/text-white\/40/g, 'text-foreground/40');
  content = content.replace(/text-white\/30/g, 'text-foreground/30');
  content = content.replace(/text-white\/20/g, 'text-foreground/20');
  content = content.replace(/text-white/g, 'text-foreground');
  
  // text-black on hyper-liquid buttons is usually fine, but let's check
  // The CSS for .hyper-liquid sets color: #000000; so text-black is redundant but fine.
  
  content = content.replace(/liquid-button/g, 'hyper-liquid');
  content = content.replace(/<h1 className="text-xl font-bold/g, '<h1 className="text-xl font-display font-bold');
  content = content.replace(/<h2 className="text-2xl font-bold/g, '<h2 className="text-2xl font-display font-bold');
  content = content.replace(/<h3 className="text-sm font-semibold/g, '<h3 className="text-sm font-display font-semibold');
  
  fs.writeFileSync(filePath, content);
}

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk(dir);
console.log('Done fixing theme!');

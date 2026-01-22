#!/usr/bin/env tsx
/**
 * Verification script to ensure Hugo documentation pages have globally unique weights
 * 
 * This script checks that:
 * 1. All documentation pages have a weight property
 * 2. No two pages share the same weight value
 * 3. Weights are sequential (no large gaps)
 * 
 * Run with: npx tsx scripts/verify-doc-weights.ts
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface DocPage {
  file: string;
  weight: number;
  title: string;
  section: string;
}

const DOCS_DIR = join(process.cwd(), 'docs/content/en/docs');

async function findMarkdownFiles(dir: string, section: string = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      files.push(...await findMarkdownFiles(fullPath, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function extractWeight(filePath: string, content: string): { weight: number | null; title: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { weight: null, title: 'Unknown' };
  }
  
  const frontmatter = frontmatterMatch[1];
  const weightMatch = frontmatter.match(/^weight:\s*(\d+(?:\.\d+)?)/m);
  const titleMatch = frontmatter.match(/^title:\s*["']?([^"'\n]+)["']?/m);
  
  const weight = weightMatch ? parseFloat(weightMatch[1]) : null;
  const title = titleMatch ? titleMatch[1] : 'Unknown';
  
  return { weight, title };
}

async function verifyWeights() {
  console.log('🔍 Scanning documentation files for weight conflicts...\n');
  
  const files = await findMarkdownFiles(DOCS_DIR);
  const pages: DocPage[] = [];
  const weightMap = new Map<number, DocPage[]>();
  
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const { weight, title } = extractWeight(file, content);
    const section = file.split('/docs/')[1]?.split('/')[0] || 'root';
    const fileName = file.split('/').pop() || 'unknown';
    
    if (weight === null) {
      console.warn(`⚠️  ${file}: Missing weight property`);
      continue;
    }
    
    const page: DocPage = {
      file: fileName,
      weight,
      title,
      section,
    };
    
    pages.push(page);
    
    if (!weightMap.has(weight)) {
      weightMap.set(weight, []);
    }
    weightMap.get(weight)!.push(page);
  }
  
  // Sort pages by weight
  pages.sort((a, b) => a.weight - b.weight);
  
  // Check for duplicates
  const duplicates: number[] = [];
  for (const [weight, pagesWithWeight] of weightMap.entries()) {
    if (pagesWithWeight.length > 1) {
      duplicates.push(weight);
    }
  }
  
  // Check for gaps
  const weights = pages.map(p => p.weight).filter(w => w >= 1 && Number.isInteger(w));
  weights.sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < weights.length; i++) {
    if (weights[i] - weights[i - 1] > 1) {
      gaps.push(weights[i - 1]);
    }
  }
  
  // Report results
  console.log('📊 Weight Summary:\n');
  pages.forEach(page => {
    console.log(`  ${page.weight.toString().padStart(3)}: ${page.title} (${page.section}/${page.file})`);
  });
  
  console.log('\n');
  
  if (duplicates.length > 0) {
    console.error('❌ DUPLICATE WEIGHTS FOUND:\n');
    for (const weight of duplicates) {
      const pagesWithWeight = weightMap.get(weight)!;
      console.error(`  Weight ${weight} is used by:`);
      pagesWithWeight.forEach(page => {
        console.error(`    - ${page.section}/${page.file} (${page.title})`);
      });
    }
    console.error('\n');
    process.exit(1);
  }
  
  if (gaps.length > 0) {
    console.warn('⚠️  GAPS IN WEIGHT SEQUENCE:\n');
    for (const gapWeight of gaps) {
      const nextWeight = weights[weights.indexOf(gapWeight) + 1];
      console.warn(`  Missing weight between ${gapWeight} and ${nextWeight}`);
    }
    console.warn('\n');
  }
  
  if (duplicates.length === 0 && gaps.length === 0) {
    console.log('✅ All weights are unique and sequential!\n');
  }
  
  console.log(`📝 Total pages: ${pages.length}`);
  console.log(`🔢 Weight range: ${Math.min(...pages.map(p => p.weight))} - ${Math.max(...pages.map(p => p.weight))}\n`);
}

verifyWeights().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

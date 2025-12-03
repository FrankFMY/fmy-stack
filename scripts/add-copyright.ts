/**
 * @fileoverview FrankFMY Platform — Copyright Header Script
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * Adds copyright headers to source files in the monorepo
 * Usage: bun run scripts/add-copyright.ts
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const COPYRIGHT_TS = `/**
 * @fileoverview FrankFMY Platform — Initiative Development / Инициативная разработка
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @copyright 2025 Artyom Pryanishnikov
 * @license PolyForm-Shield-1.0.0
 *
 * INITIATIVE DEVELOPMENT: Created independently, without TZ or direct order.
 * IP rights remain with the Author. Commercial use requires agreement.
 * Contact: Pryanishnikovartem@gmail.com
 */

`;

const COPYRIGHT_SVELTE = `<!--
  FrankFMY Platform — Initiative Development / Инициативная разработка
  @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
  @copyright 2025 Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
-->
`;

const COPYRIGHT_CSS = `/**
 * FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

`;

const IGNORE_DIRS = new Set([
	'node_modules',
	'dist',
	'.svelte-kit',
	'.turbo',
	'.git',
	'coverage',
	'build'
]);

const IGNORE_FILES = new Set([
	'package.json',
	'tsconfig.json',
	'turbo.json',
	'.prettierrc',
	'.gitignore',
	'bun.lockb'
]);

const COPYRIGHT_MARKER = 'FrankFMY Platform';

interface Stats {
	processed: number;
	skipped: number;
	added: number;
}

async function addCopyrightToFile(filePath: string, stats: Stats): Promise<void> {
	const ext = extname(filePath);
	let copyright: string;

	switch (ext) {
		case '.ts':
		case '.tsx':
		case '.js':
		case '.jsx':
			copyright = COPYRIGHT_TS;
			break;
		case '.svelte':
			copyright = COPYRIGHT_SVELTE;
			break;
		case '.css':
		case '.scss':
			copyright = COPYRIGHT_CSS;
			break;
		default:
			stats.skipped++;
			return;
	}

	try {
		let content = await readFile(filePath, 'utf8');
		stats.processed++;

		// Check if already has copyright
		if (content.includes(COPYRIGHT_MARKER)) {
			stats.skipped++;
			return;
		}

		// Handle files that start with shebang
		if (content.startsWith('#!')) {
			const firstNewline = content.indexOf('\n');
			const shebang = content.slice(0, firstNewline + 1);
			content = shebang + copyright + content.slice(firstNewline + 1);
		} else {
			content = copyright + content;
		}

		await writeFile(filePath, content, 'utf8');
		stats.added++;
		console.log(`✅ Added copyright: ${filePath}`);
	} catch (error) {
		console.error(`❌ Error processing ${filePath}:`, error);
	}
}

async function traverseDirectory(directory: string, stats: Stats): Promise<void> {
	const entries = await readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(directory, entry.name);

		if (IGNORE_DIRS.has(entry.name)) {
			continue;
		}

		if (entry.isDirectory()) {
			await traverseDirectory(fullPath, stats);
		} else if (entry.isFile() && !IGNORE_FILES.has(entry.name)) {
			await addCopyrightToFile(fullPath, stats);
		}
	}
}

async function main() {
	console.log('🔧 FrankFMY Copyright Script');
	console.log('============================\n');

	const stats: Stats = { processed: 0, skipped: 0, added: 0 };
	const packagesDir = join(process.cwd(), 'packages');

	try {
		const packages = await readdir(packagesDir);

		for (const pkg of packages) {
			const pkgPath = join(packagesDir, pkg);
			const pkgStat = await stat(pkgPath);

			if (pkgStat.isDirectory()) {
				const srcPath = join(pkgPath, 'src');
				try {
					await stat(srcPath);
					console.log(`📦 Processing: ${pkg}`);
					await traverseDirectory(srcPath, stats);
				} catch {
					// No src directory, skip
				}
			}
		}

		console.log('\n============================');
		console.log(`📊 Results:`);
		console.log(`   Processed: ${stats.processed}`);
		console.log(`   Added: ${stats.added}`);
		console.log(`   Skipped: ${stats.skipped}`);
		console.log('============================\n');
	} catch (error) {
		console.error('Failed to process packages:', error);
		process.exit(1);
	}
}

main();

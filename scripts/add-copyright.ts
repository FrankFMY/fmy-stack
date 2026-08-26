/**
 * Add canonical Apache-2.0 copyright headers to package source files.
 *
 * Copyright 2026 Artem Prianishnikov
 * SPDX-License-Identifier: Apache-2.0
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const TYPESCRIPT_HEADER = `/**
 * Copyright 2026 Artem Prianishnikov
 * SPDX-License-Identifier: Apache-2.0
 */

`;
const SVELTE_HEADER = `<!-- Copyright 2026 Artem Prianishnikov | SPDX-License-Identifier: Apache-2.0 -->
`;
const STYLE_HEADER = `/** Copyright 2026 Artem Prianishnikov | SPDX-License-Identifier: Apache-2.0 */

`;
const ignoredDirectories = new Set([
	'node_modules',
	'dist',
	'.svelte-kit',
	'.turbo',
	'.git',
	'coverage',
	'build'
]);
const ignoredFiles = new Set([
	'package.json',
	'tsconfig.json',
	'turbo.json',
	'.gitignore',
	'bun.lock'
]);
const marker = 'SPDX-License-Identifier: Apache-2.0';

interface Stats {
	processed: number;
	skipped: number;
	added: number;
}

const headerFor = (path: string): string | null => {
	const extension = extname(path);
	if (['.ts', '.tsx', '.js', '.jsx'].includes(extension)) return TYPESCRIPT_HEADER;
	if (extension === '.svelte') return SVELTE_HEADER;
	if (['.css', '.scss'].includes(extension)) return STYLE_HEADER;
	return null;
};

async function processFile(path: string, stats: Stats): Promise<void> {
	const header = headerFor(path);
	if (!header) {
		stats.skipped += 1;
		return;
	}
	const content = await readFile(path, 'utf8');
	stats.processed += 1;
	if (content.includes(marker)) {
		stats.skipped += 1;
		return;
	}
	await writeFile(path, header + content, 'utf8');
	stats.added += 1;
}

async function walk(directory: string, stats: Stats): Promise<void> {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		if (ignoredDirectories.has(entry.name)) continue;
		const path = join(directory, entry.name);
		if (entry.isDirectory()) await walk(path, stats);
		else if (entry.isFile() && !ignoredFiles.has(entry.name)) await processFile(path, stats);
	}
}

async function main(): Promise<void> {
	const stats: Stats = { processed: 0, skipped: 0, added: 0 };
	for (const packageName of await readdir(join(process.cwd(), 'packages'))) {
		const source = join(process.cwd(), 'packages', packageName, 'src');
		try {
			if ((await stat(source)).isDirectory()) await walk(source, stats);
		} catch {
			/* package has no source directory */
		}
	}
	console.log(JSON.stringify(stats));
}

await main();

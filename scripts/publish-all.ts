/**
 * @fileoverview FrankFMY Platform — Publish all packages
 * @author Artyom Pryanishnikov <Pryanishnikovartem@gmail.com>
 * @license PolyForm-Shield-1.0.0
 *
 * Usage:
 *   bun run publish:github  - Publish to GitHub Packages (private)
 *   bun run publish:npm     - Publish to NPM (public)
 */

import { $ } from 'bun';

const PACKAGES = [
	'core', // Must be first (no deps)
	'validation', // Depends on core
	'ui', // No internal deps
	'db-utils', // Depends on core
	'elysia-kit' // Depends on core, validation
];

type Registry = 'github' | 'npm';

async function publishPackage(pkg: string, registry: Registry) {
	const cwd = `packages/${pkg}`;

	console.log(`\n📦 Publishing @frankfmy/${pkg} to ${registry}...`);

	try {
		if (registry === 'github') {
			await $`npm publish --registry=https://npm.pkg.github.com`.cwd(cwd);
		} else {
			await $`npm publish --registry=https://registry.npmjs.org --access=public`.cwd(cwd);
		}
		console.log(`✅ @frankfmy/${pkg} published to ${registry}`);
	} catch (error) {
		console.error(`❌ Failed to publish @frankfmy/${pkg}:`, error);
		throw error;
	}
}

async function main() {
	const registry = (process.argv[2] as Registry) || 'github';

	if (!['github', 'npm'].includes(registry)) {
		console.error('Usage: bun run scripts/publish-all.ts [github|npm]');
		process.exit(1);
	}

	console.log(`\n🚀 Publishing all packages to ${registry.toUpperCase()}...\n`);
	console.log('=' .repeat(50));

	// Build first
	console.log('\n🔨 Building all packages...');
	await $`bun run build`;

	// Publish in order (respecting dependencies)
	for (const pkg of PACKAGES) {
		await publishPackage(pkg, registry);
	}

	console.log('\n' + '='.repeat(50));
	console.log(`\n🎉 All packages published to ${registry.toUpperCase()}!`);

	if (registry === 'github') {
		console.log('\n📋 To install in projects, add to .npmrc:');
		console.log('   @frankfmy:registry=https://npm.pkg.github.com');
		console.log('   //npm.pkg.github.com/:_authToken=${NPM_TOKEN}');
	} else {
		console.log('\n📋 To install: bun add @frankfmy/core @frankfmy/ui ...');
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});


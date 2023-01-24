#!/usr/bin/env node
import { generateAllTWClasses, transpileCssToJs } from './compile-css-to-js.cjs';
import { mkdir, writeFile, rename, unlink } from 'fs/promises';

const INTELLISENSE_FILE_NAME = 'intellisense-classes.cjs';

exec();

async function exec() {
	// Deletes the previously generated CSS-in-JS file. If we don't, our plugin will
	// add duplicate classes to our newly generated CSS-in-JS file.
	await unlink(`src/lib/tailwind/generated/${INTELLISENSE_FILE_NAME}`).catch(() => {
		// file doesn't exist, don't worry about it
	});

	// Makes directory that's used for caching
	await mkdir('.temp').catch(() => {
		// directory already exists
	});

	// Makes directory that stores our generated CSS-in-JS
	await mkdir('src/lib/tailwind/generated').catch(() => {
		// directory already exists
	});

	const generatedJSS = await transpileCssToJs();
	const purgedJSS = await removeDuplicateClasses(generatedJSS);

	// Creates the generated CSS-in-JS file
	await writeFile(`src/lib/tailwind/generated/${INTELLISENSE_FILE_NAME}`, `module.exports = ${JSON.stringify(purgedJSS)}`).catch((e) =>
		console.error(e)
	);

	// A roundabout 'hack' to retrigger the tailwind extension to reload,
	// otherwise we'd have to reload vscode manually.
	await rename('tailwind.config.cjs', '.temp/tailwind.config.cjs');
	// We need to sleep for a bit so that the change is detected
	// by the extension's file watcher
	await new Promise((resolve) => setTimeout(resolve, 3000));
	await rename('.temp/tailwind.config.cjs', 'tailwind.config.cjs');
}

// Purges the generated CSS-in-JS file of duplicate TW classes
async function removeDuplicateClasses(cssInJs) {
	let twClasses;
	try {
		// import the cached TW classes...
		const classes = await import('../.temp/twClasses.cjs');
		twClasses = classes.default;
	} catch {
		// if the cache doesn't exist (first time install), generate it
		twClasses = await generateAllTWClasses();
	}

	// We delete classes that have 'token' and 'bg-' in their name since those classes
	// will already be generated by our plugin. We'll also delete any default TW classes.
	for (const [key] of Object.entries(cssInJs)) {
		// if it's a token, delete it
		if (key.includes('token')) delete cssInJs[key];

		// if it's a background color, delete it
		if (key.includes('bg-')) delete cssInJs[key];

		// if it's not a class selector, delete it (only want classes in the intellisense)
		if (key[0] !== '.') delete cssInJs[key];

		// if it's a default tailwind class, delete it
		if (twClasses[key]) delete cssInJs[key];
	}

	return cssInJs;
}

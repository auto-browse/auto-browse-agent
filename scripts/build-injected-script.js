#!/usr/bin/env node
/**
 * Build script for compiling TypeScript injected scripts into JS
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const DIST_DIR = path.join(ROOT, "src/browser/utils");

// Create dist directory if it doesn't exist
if (!fs.existsSync(DIST_DIR)) {
	fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Define the injected script to build
const injectedScript = path.join(SRC_DIR, "browser/snapshot/injectedScript.ts");
const outputDir = DIST_DIR;

(async () => {
	console.log(`Building injected script: ${injectedScript}`);

	try {
		const buildOutput = await esbuild.build({
			entryPoints: [injectedScript],
			bundle: true,
			outdir: outputDir,
			format: "iife", // Use IIFE format for browser compatibility
			globalName: "InjectedScriptExports", // Define a global name for the module
			platform: "browser",
			target: "ES2019"
		});

		for (const message of [...buildOutput.errors, ...buildOutput.warnings])
			console.log(message.text);

		const baseName = path.basename(injectedScript);
		const outFileJs = path.join(outputDir, baseName.replace(".ts", ".js"));

		// Read the output file
		const content = await fs.promises.readFile(outFileJs, "utf-8");

		// Create the script export file
		const scriptContent = `
// This file is auto-generated. Do not edit.
export const injectedScriptSource = ${JSON.stringify(content)};
`;

		await fs.promises.writeFile(
			path.join(outputDir, "injectedScriptSource.js"),
			scriptContent
		);

		// Create TypeScript declaration file
		const declarationContent = `/**
 * Type declaration for injectedScriptSource.js
 * This file is auto-generated by the build process.
 */

export const injectedScriptSource: string;
`;
		await fs.promises.writeFile(
			path.join(outputDir, "injectedScriptSource.d.ts"),
			declarationContent
		);

		console.log(`Successfully built injected script: ${outFileJs}`);
		console.log(
			`Generated source file: ${path.join(
				outputDir,
				"injectedScriptSource.js"
			)}`
		);
		console.log(
			`Generated declaration file: ${path.join(
				outputDir,
				"injectedScriptSource.d.ts"
			)}`
		);
	} catch (error) {
		console.error("Error building injected script:", error);
		process.exit(1);
	}
})();

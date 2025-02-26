/**
 * @license
 * Copyright 2024 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { cpSync } from "fs";

export default {
	input: "background.js",
	output: {
		format: "esm",
		dir: "out"
	},
	// If you do not need to use WebDriver BiDi protocol,
	// exclude chromium-bidi/lib/cjs/bidiMapper/BidiMapper.js to minimize the bundle size.
	external: ["chromium-bidi/lib/cjs/bidiMapper/BidiMapper.js"],
	plugins: [
		nodeResolve({
			browser: true,
			resolveOnly: ["puppeteer-core"]
		}),
		{
			name: "copy-files",
			buildEnd() {
				cpSync("manifest.json", "out/manifest.json");
				cpSync("popup.html", "out/popup.html");
				cpSync("popup.js", "out/popup.js");
			}
		}
	]
};

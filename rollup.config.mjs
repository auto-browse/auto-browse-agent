import { nodeResolve } from "@rollup/plugin-node-resolve";
import { cpSync } from "fs";

export default {
	input: "src/background/background.js",
	output: {
		format: "esm",
		dir: "dist"
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
				cpSync("public/manifest.json", "dist/manifest.json");
				cpSync("src/popup/popup.html", "dist/popup.html");
				cpSync("src/popup/popup.js", "dist/popup.js");
			}
		}
	]
};

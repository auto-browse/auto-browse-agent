import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

export default defineConfig({
	build: {
		minify: false, // Keep code readable and debuggable
		sourcemap: "inline",
		assetsDir: "", // Output assets in root instead of assets/
		rollupOptions: {
			input: {
				background: resolve(__dirname, "src/background/background.js"),
				popup: resolve(__dirname, "src/popup/popup.js")
			},
			output: {
				entryFileNames: "[name].js",
				format: "esm",
				dir: "dist",
				chunkFileNames: ({ name }) => `${name}.js`,
				assetFileNames: "[name].[ext]",
				manualChunks(id) {
					// Specific handling for puppeteer and chromium-bidi
					if (
						id.includes("node_modules/puppeteer-core") ||
						id.includes("node_modules/chromium-bidi")
					) {
						return "vendor";
					}

					// Keep other dependencies in their own chunk
					if (id.includes("node_modules")) {
						return "deps";
					}

					// Keep background files completely separate
					if (
						id.includes("background.js") ||
						id.includes("messageHandler.js") ||
						id.includes("actionTypes.js")
					) {
						return null;
					}

					// Bundle browserService with UI dependencies
					if (
						id.includes("browserService.js") ||
						id.includes("highlightService.js") ||
						id.includes("browserUtils.js")
					) {
						return "ui";
					}

					// Bundle remaining source files
					return null;
				}
			}
		}
	},
	plugins: [
		{
			name: "copy-extension-files",
			writeBundle(options, bundle) {
				// Find all chunks to include
				const chunks = ["vendor.js", "deps.js", "ui.js"]
					.filter((name) =>
						Object.keys(bundle).some((key) => key.endsWith(name))
					)
					.sort((a, b) => {
						// Load order: vendor -> deps -> app -> popup
						if (a.startsWith("vendor")) return -1;
						if (b.startsWith("vendor")) return 1;
						if (a.startsWith("deps")) return -1;
						if (b.startsWith("deps")) return 1;
						if (a.startsWith("app")) return -1;
						if (b.startsWith("app")) return 1;
						return 0;
					});

				// Copy and modify popup HTML
				const popupContent = fs.readFileSync(
					resolve(__dirname, "src/popup/popup.html"),
					"utf-8"
				);

				// Create script tags for chunks and popup.js
				const scriptTags = [
					...chunks.map(
						(chunk) => `<script src="${chunk}" type="module"></script>`
					),
					'<script src="popup.js" type="module"></script>'
				].join("\n");

				// Modify popup HTML to include all chunks
				const modifiedPopupContent = popupContent.replace(
					'<script src="popup.js" type="module"></script>',
					scriptTags
				);

				fs.writeFileSync(
					resolve(__dirname, "dist/popup.html"),
					modifiedPopupContent
				);

				// Copy manifest
				fs.copyFileSync(
					resolve(__dirname, "public/manifest.json"),
					resolve(__dirname, "dist/manifest.json")
				);
			}
		}
	],
	resolve: {
		alias: {
			"puppeteer-core": resolve(__dirname, "node_modules/puppeteer-core"),
			"chromium-bidi": resolve(__dirname, "node_modules/chromium-bidi"),
			crypto: resolve(__dirname, "src/utils/crypto-polyfill.js")
		}
	}
});

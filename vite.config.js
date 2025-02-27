import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

export default defineConfig({
	optimizeDeps: {
		include: ["puppeteer-core", "chromium-bidi"]
	},
	build: {
		minify: false,
		sourcemap: true, // Better for debugging than "inline"
		assetsDir: "",
		rollupOptions: {
			input: {
				background: resolve(__dirname, "src/background/background.ts"),
				popup: resolve(__dirname, "src/popup/popup.ts"),
				options: resolve(__dirname, "src/options/options.ts"),
				sidepanel: resolve(__dirname, "src/sidepanel/sidepanel.ts")
			},
			output: {
				entryFileNames: "[name].js",
				format: "esm",
				dir: "dist",
				chunkFileNames: ({ name }) => `${name}.js`,
				assetFileNames: "[name].[ext]",
				manualChunks(id) {
					// Vendor chunks (puppeteer and related)
					if (
						id.includes("node_modules") &&
						(id.includes("puppeteer-core") ||
							id.includes("chromium-bidi") ||
							id.includes("ws") ||
							id.includes("mitt"))
					) {
						return "vendor";
					}

					// Other dependencies
					if (id.includes("node_modules")) {
						return "deps";
					}

					// Core modules chunks
					if (id.includes("/browser/")) {
						return "browser";
					}
					if (id.includes("/messaging/")) {
						return "messaging";
					}
					if (id.includes("/storage/")) {
						return "storage";
					}
					if (id.includes("/llm/")) {
						return "llm";
					}
					if (id.includes("/common/")) {
						return "common";
					}

					// Feature modules (keep with their entries)
					if (id.includes("/popup/")) {
						return null;
					}
					if (id.includes("/options/")) {
						return null;
					}
					if (id.includes("/sidepanel/")) {
						return null;
					}
					if (id.includes("/background/")) {
						return null;
					}

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
				const chunks = [
					"vendor.js",
					"deps.js",
					"common.js",
					"browser.js",
					"messaging.js",
					"storage.js",
					"llm.js"
				]
					.filter((name) =>
						Object.keys(bundle).some((key) => key.endsWith(name))
					)
					.sort((a, b) => {
						// Load order: vendor -> deps -> core modules -> features
						if (a.startsWith("vendor")) return -1;
						if (b.startsWith("vendor")) return 1;
						if (a.startsWith("deps")) return -1;
						if (b.startsWith("deps")) return 1;
						return 0;
					});

				// Copy and modify HTML files
				const htmlFiles = [
					{ src: "src/popup/popup.html", dest: "popup.html" },
					{ src: "src/options/options.html", dest: "options.html" },
					{ src: "src/sidepanel/sidepanel.html", dest: "sidepanel.html" }
				];

				for (const { src, dest } of htmlFiles) {
					if (fs.existsSync(resolve(__dirname, src))) {
						const content = fs.readFileSync(resolve(__dirname, src), "utf-8");
						const scriptTags = [
							...chunks.map(
								(chunk) => `<script src="${chunk}" type="module"></script>`
							),
							`<script src="${dest.replace(
								".html",
								".js"
							)}" type="module"></script>`
						].join("\n");

						const modifiedContent = content.replace(
							/<script.*?src=["'].*?\.js["'].*?><\/script>/,
							scriptTags
						);

						fs.writeFileSync(
							resolve(__dirname, `dist/${dest}`),
							modifiedContent
						);
					}
				}

				// Copy manifest and assets
				fs.copyFileSync(
					resolve(__dirname, "public/manifest.json"),
					resolve(__dirname, "dist/manifest.json")
				);

				// Copy assets if they exist
				const assetDirs = ["icons", "images", "themes"];
				for (const dir of assetDirs) {
					const srcDir = resolve(__dirname, `src/assets/${dir}`);
					if (fs.existsSync(srcDir)) {
						const files = fs
							.readdirSync(srcDir)
							.filter((file) => fs.statSync(resolve(srcDir, file)).isFile());

						if (files.length > 0) {
							const destDir = resolve(__dirname, `dist/assets/${dir}`);
							fs.mkdirSync(destDir, { recursive: true });
							files.forEach((file) => {
								fs.copyFileSync(resolve(srcDir, file), resolve(destDir, file));
							});
						}
					}
				}
			}
		}
	],
	resolve: {
		alias: {
			"@browser": resolve(__dirname, "src/browser"),
			"@messaging": resolve(__dirname, "src/messaging"),
			"@storage": resolve(__dirname, "src/storage"),
			"@llm": resolve(__dirname, "src/llm"),
			"@common": resolve(__dirname, "src/common"),
			"puppeteer-core": resolve(__dirname, "node_modules/puppeteer-core"),
			"chromium-bidi": resolve(__dirname, "node_modules/chromium-bidi"),
			crypto: resolve(__dirname, "src/utils/crypto-polyfill.ts")
		}
	}
});

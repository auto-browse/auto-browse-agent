import { promises as fs } from "fs";
import { join } from "path";

async function copyHtmlFiles() {
	const files = {
		"src/sidepanel/sidepanel.html": "dist/sidepanel.html",
		"src/popup/popup.html": "dist/popup.html",
		"src/options/options.html": "dist/options.html"
	};

	for (const [src, dest] of Object.entries(files)) {
		try {
			// Create the directory if it doesn't exist
			await fs.mkdir(
				join(process.cwd(), dest.split("/").slice(0, -1).join("/")),
				{ recursive: true }
			);

			// Copy the file
			await fs.copyFile(join(process.cwd(), src), join(process.cwd(), dest));
			console.log(`Copied ${src} to ${dest}`);
		} catch (error) {
			console.error(`Error copying ${src}:`, error);
		}
	}
}

copyHtmlFiles().catch(console.error);

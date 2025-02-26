import {
	connect,
	ExtensionTransport
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

globalThis.testConnect = async (url) => {
	// Get the current active tab instead of creating a new one
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	const browser = await connect({
		transport: await ExtensionTransport.connectTab(tab.id)
	});

	const [page] = await browser.pages();
	const title = await page.title();

	await browser.disconnect();
	return title;
};

globalThis.highlightLinks = async () => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	const browser = await connect({
		transport: await ExtensionTransport.connectTab(tab.id)
	});

	const [page] = await browser.pages();

	await page.evaluate(() => {
		const links = document.querySelectorAll("a");
		links.forEach((link) => {
			link.style.backgroundColor = "yellow";
			link.style.border = "2px solid red";
		});
		return `Highlighted ${links.length} links`;
	});

	await browser.disconnect();
	return `Highlighted all links on the page`;
};

// Add message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "testConnection") {
		globalThis
			.testConnect(request.url)
			.then((title) => sendResponse(`Current page title: ${title}`))
			.catch((error) => sendResponse(`Error: ${error.message}`));
		return true; // Will respond asynchronously
	} else if (request.action === "highlightLinks") {
		globalThis
			.highlightLinks()
			.then(sendResponse)
			.catch((error) => sendResponse(`Error: ${error.message}`));
		return true;
	}
});

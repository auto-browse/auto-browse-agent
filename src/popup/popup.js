document.getElementById("testButton").addEventListener("click", async () => {
	try {
		document.getElementById("result").textContent = "Getting page title...";
		const result = await chrome.runtime.sendMessage({
			action: "testConnection"
		});
		document.getElementById("result").textContent = result;
	} catch (error) {
		document.getElementById("result").textContent = `Error: ${error.message}`;
	}
});

document
	.getElementById("highlightButton")
	.addEventListener("click", async () => {
		try {
			document.getElementById("result").textContent = "Highlighting links...";
			const result = await chrome.runtime.sendMessage({
				action: "highlightLinks"
			});
			document.getElementById("result").textContent = result;
		} catch (error) {
			document.getElementById("result").textContent = `Error: ${error.message}`;
		}
	});

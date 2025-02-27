import { storageService } from "../storage/services/storageService";

document.addEventListener("DOMContentLoaded", () => {
    // Example: Get settings when options page loads
    // This will be replaced with React components later
    async function loadSettings() {
        try
        {
            const response = await storageService.getData("settings");
            const root = document.getElementById("options-root");

            if (root)
            {
                root.textContent = response.data
                    ? `Current Settings: ${JSON.stringify(response.data, null, 2)}`
                    : "No settings configured yet";
            }
        } catch (error)
        {
            console.error("Error loading settings:", error);
        }
    }

    loadSettings();
});

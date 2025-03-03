import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./Popup";
import "@/styles/globals.css";

const root = document.getElementById("popup-root");

if (!root) {
    throw new Error("Root element not found");
}

const handleOpenSidepanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
            chrome.sidePanel.open({ tabId: tabs[0].id });
            window.close(); // Close popup after opening sidepanel
        }
    });
};

const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
    window.close(); // Close popup after opening options
};

createRoot(root).render(
    <React.StrictMode>
        <Popup onOpenSidepanel={handleOpenSidepanel} onOpenOptions={handleOpenOptions} />
    </React.StrictMode>
);

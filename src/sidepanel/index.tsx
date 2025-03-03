import React from "react";
import { createRoot } from "react-dom/client";
import { SidePanel } from "./SidePanel";
import "@/styles/globals.css";

const root = document.getElementById("sidepanel-root");

if (!root) {
    throw new Error("Root element not found");
}

const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
};

createRoot(root).render(
    <React.StrictMode>
        <SidePanel onOpenOptions={handleOpenOptions} />
    </React.StrictMode>
);

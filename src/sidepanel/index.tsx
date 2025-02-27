import React from "react";
import { createRoot } from "react-dom/client";
import { SidePanel } from "./SidePanel";
import "@/styles/globals.css";

const root = document.getElementById("sidepanel-root");

if (!root) {
    throw new Error("Root element not found");
}

createRoot(root).render(
    <React.StrictMode>
        <SidePanel />
    </React.StrictMode>
);

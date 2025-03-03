import React from "react";
import { createRoot } from "react-dom/client";
import OptionsPage from "./components/OptionsPage";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const root = document.getElementById("options-root");

if (!root) {
    throw new Error("Root element not found");
}

createRoot(root).render(
    <React.StrictMode>
        <>
            <OptionsPage />
            <Toaster />
        </>
    </React.StrictMode>
);

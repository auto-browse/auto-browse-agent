import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";
import { injectedScriptSource } from "../utils/injectedScriptSource";
// Use the specified import path for Puppeteer types
import type { Page, Frame, ElementHandle, JSHandle } from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

class AccessibilityService {
    /**
     * Get accessibility snapshot of the current page using Puppeteer
     * @returns {Promise<BrowserServiceResponse>} Response with accessibility data
     */
    async getAccessibilitySnapshot(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();

            // First inject our script into the page context
            await page.evaluate(`${injectedScriptSource}`);

            // Execute the script to get the accessibility snapshot
            const snapshotData = await page.evaluate(() => {
                // Use the globally exposed createAriaSnapshot function
                if (typeof (window as any).createAriaSnapshot !== 'function') // Check window as any
                {
                    throw new Error('createAriaSnapshot function not available');
                }

                // Get the aria snapshot of the document body
                const snapshot = (window as any).createAriaSnapshot(document.body, { // Use window as any
                    mode: 'raw',
                    ref: true  // Enable element references in output
                });

                return {
                    timestamp: new Date().toISOString(),
                    snapshot: snapshot
                };
            });

            return {
                success: true,
                message: "Accessibility Snapshot",
                data: snapshotData
            };
        } catch (error)
        {
            console.error("Error getting accessibility snapshot:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
        // Note: browserService connection closing is handled by the caller or a higher level service typically
    }

    /**
     * Recursively captures accessibility snapshots for the main page and all nested iframes,
     * modifying refs to include frame hierarchy.
     * @returns {Promise<BrowserServiceResponse>} Response with the combined accessibility data.
     */
    async enhancedAccessibilitySnapshot(): Promise<BrowserServiceResponse> {
        let page: Page | null = null;
        try
        {
            page = (await browserService.getOrCreateConnection()).page;

            // Ensure script is injected in the main page first
            await page.evaluate(`${injectedScriptSource}`);

            const combinedSnapshot = await this._snapshotFrame(page, 'f0');

            const formattedOutput = [
                `- Page Snapshot`,
                '```yaml',
                combinedSnapshot.trim(),
                '```',
            ].join('\n');

            return {
                success: true,
                message: "Enhanced Accessibility Snapshot",
                data: {
                    timestamp: new Date().toISOString(),
                    snapshot: formattedOutput
                }
            };
        } catch (error)
        {
            console.error("Error getting enhanced accessibility snapshot:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
        // Note: browserService connection closing is handled by the caller or a higher level service typically
    }

    /**
     * Helper function to recursively snapshot a frame and its children.
     * @param frame The Puppeteer Page or Frame to snapshot.
     * @param framePrefix The prefix to add to refs (e.g., "f0", "f0.f1").
     * @returns {Promise<string>} The snapshot string for the frame and its children.
     */
    private async _snapshotFrame(frame: Page | Frame, framePrefix: string): Promise<string> {
        // Ensure script is injected in the target frame (might be redundant for main page, but safe)
        try
        {
            await frame.evaluate(`${injectedScriptSource}`);
        } catch (e)
        {
            // Ignore errors if script is already injected or frame context is invalid
            // console.warn(`Could not inject script into frame ${framePrefix}:`, e);
        }


        // 1. Get the snapshot for the current frame
        let snapshotString: string = await frame.evaluate((prefix) => {
            if (typeof (window as any).createAriaSnapshot !== 'function')
            { // Check window as any
                // If the script wasn't injected successfully (e.g., cross-origin frame), return placeholder
                return `- frame ${prefix}: <snapshot unavailable>`;
            }
            // Use the globally exposed createAriaSnapshot function
            const snapshot = (window as any).createAriaSnapshot(document.body, { // Use window as any
                mode: 'raw',
                ref: true // Enable element references in output
            });

            // 2. Modify refs in the current snapshot string
            const modifiedSnapshot = snapshot.replace(/\[ref=(s\d+e\d+)\]/g, `[ref=${prefix}.$1]`);
            return modifiedSnapshot;

        }, framePrefix);


        // 3. Find iframe refs
        const originalIframeRefs = snapshotString.match(/- iframe \[ref=(s\d+e\d+)\]/gm)?.map(m => m.match(/s\d+e\d+/)?.[0]) || [];
        const modifiedIframeRefs = snapshotString.match(/- iframe \[ref=([a-zA-Z0-9.]+?)\]/gm)?.map(m => m.match(/\[ref=([a-zA-Z0-9.]+?)\]/)?.[1]) || [];


        // 4. Recursively process each iframe
        let childFrameIndex = 0;
        for (let i = 0; i < originalIframeRefs.length; i++)
        {
            const originalRef = originalIframeRefs[i];
            const modifiedRef = modifiedIframeRefs[i];
            if (!originalRef || !modifiedRef) continue;

            // Correct type for the return value of evaluateHandle
            let iframeHandle: JSHandle | ElementHandle | null = null;
            let contentFrame: Frame | null = null;
            let childSnapshot = `- iframe [ref=${modifiedRef}]: <snapshot unavailable>`;

            try
            {
                // 5. Get iframe element handle using the *original* ref
                iframeHandle = await frame.evaluateHandle((ref) => {
                    const injected = (window as any).__injectedScript;
                    if (injected && typeof injected.getElementByAriaRef === 'function')
                    {
                        return injected.getElementByAriaRef(ref);
                    }
                    return null;
                }, originalRef);


                if (iframeHandle && iframeHandle.asElement())
                {
                    // 6. Get the content frame, ensuring null if undefined
                    contentFrame = await iframeHandle.asElement()?.contentFrame() ?? null;
                }

                if (contentFrame)
                {
                    // 7. Recurse
                    const childFramePrefix = `${framePrefix}.f${childFrameIndex}`;
                    childSnapshot = await this._snapshotFrame(contentFrame, childFramePrefix);
                    childFrameIndex++;
                }

            } catch (error)
            {
                console.warn(`Error processing iframe ${modifiedRef}:`, error);
            } finally
            {
                if (iframeHandle)
                {
                    await iframeHandle.dispose();
                }
            }

            // 8. Replace iframe placeholder
            const placeholderRegex = new RegExp(`^- iframe \\[ref=${modifiedRef.replace(/\./g, '\\.')}\\](:.*)?$`, 'm');
            snapshotString = snapshotString.replace(placeholderRegex, childSnapshot.trim().split('\n').map((line, idx) => idx === 0 ? line : `  ${line}`).join('\n'));
        }

        return snapshotString;
    }
}

export const accessibilityService = new AccessibilityService();

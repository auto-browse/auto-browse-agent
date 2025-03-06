import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";

class AnalysisService {
    async analyzePage(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const analysis = await page.evaluate(() => {
                const stats = {
                    links: document.getElementsByTagName('a').length,
                    images: document.getElementsByTagName('img').length,
                    buttons: document.getElementsByTagName('button').length,
                    inputs: document.getElementsByTagName('input').length,
                    headings: {
                        h1: document.getElementsByTagName('h1').length,
                        h2: document.getElementsByTagName('h2').length,
                        h3: document.getElementsByTagName('h3').length
                    }
                };

                return stats;
            });

            return {
                success: true,
                message: `Page Analysis:\n` +
                    `- Links: ${analysis.links}\n` +
                    `- Images: ${analysis.images}\n` +
                    `- Buttons: ${analysis.buttons}\n` +
                    `- Input fields: ${analysis.inputs}\n` +
                    `- Headings: H1 (${analysis.headings.h1}), H2 (${analysis.headings.h2}), H3 (${analysis.headings.h3})`
            };
        } catch (error)
        {
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const analysisService = new AnalysisService();

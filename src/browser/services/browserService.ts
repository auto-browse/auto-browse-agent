import { pageInfoService } from "./pageInfoService";
import { accessibilityService } from "./accessibilityService";
import { screenshotService } from "./screenshotService";
import { analysisService } from "./analysisService";
import { cookieService } from "./cookieService";
import { shadowDomService } from "./shadowDomService";
import { interactiveMapService } from "./interactiveMapService";
import { xpathService } from "./xpathService";
import { urlService } from "./urlService";
import { viewportService } from "./viewportService";
import { browserStateService } from "./browserStateService";
// Removed ClickableElementResult from import as it no longer exists
import { clickableElementsService, ClickableElementsParams } from "./clickableElementsService"; // Import the singleton instance
import { BrowserServiceResponse } from "../types"; // Ensure BrowserServiceResponse is imported

/**
 * Service class for managing browser operations using Puppeteer
 */
class BrowserService {

    // Removed private instance creation


    async getPageTitle() {
        return pageInfoService.getPageTitle();
    }

    async countElements() {
        return pageInfoService.countElements();
    }

    async getMetadata() {
        return pageInfoService.getMetadata();
    }

    async getAccessibilitySnapshot() {
        return accessibilityService.getAccessibilitySnapshot();
    }

    async getEnhancedAccessibilitySnapshot() {
        return accessibilityService.enhancedAccessibilitySnapshot();
    }

    async takeScreenshot() {
        return screenshotService.takeScreenshot();
    }

    async analyzePage() {
        return analysisService.analyzePage();
    }



    async analyzeCookieBanners() {
        return cookieService.analyzeCookieBanners();
    }

    async exploreShadowDom() {
        return shadowDomService.exploreShadowDom();
    }

    async getInteractiveMap() {
        return interactiveMapService.getInteractiveMap();
    }

    async getFormattedInteractiveMap() {
        return interactiveMapService.getFormattedInteractiveMap();
    }

    async getElementXpaths() {
        return xpathService.getElementXpaths();
    }

    async getCurrentUrl() {
        return urlService.getCurrentUrl();
    }

    async getViewportState() {
        return viewportService.getViewportState();
    }

    async getBrowserState() {
        return browserStateService.getBrowserState();
    }

    // Updated method for clickable elements - connection handling moved to the service
    // Updated return type to BrowserServiceResponse
    async getClickableElements(params: ClickableElementsParams): Promise<BrowserServiceResponse> {
        // Directly call the service method, which now handles its own connection
        return await clickableElementsService.getClickableElements(params);
    }
}

export const browserService = new BrowserService();

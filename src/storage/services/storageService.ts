import { StorageData, StorageServiceResponse } from "../types";

/**
 * Service for managing Chrome extension storage operations
 */
class StorageService {
    /**
     * Get data from storage
     * @param {string} key - Storage key
     * @returns {Promise<StorageServiceResponse>} Response with data
     */
    async getData(key: keyof StorageData): Promise<StorageServiceResponse> {
        try
        {
            const data = await chrome.storage.local.get(key);
            return {
                success: true,
                message: "Data retrieved successfully",
                data: data[key]
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

    /**
     * Set data in storage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     * @returns {Promise<StorageServiceResponse>} Response indicating success/failure
     */
    async setData(key: keyof StorageData, value: any): Promise<StorageServiceResponse> {
        try
        {
            await chrome.storage.local.set({ [key]: value });
            return {
                success: true,
                message: "Data saved successfully"
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

    /**
     * Remove data from storage
     * @param {string} key - Storage key to remove
     * @returns {Promise<StorageServiceResponse>} Response indicating success/failure
     */
    async removeData(key: keyof StorageData): Promise<StorageServiceResponse> {
        try
        {
            await chrome.storage.local.remove(key);
            return {
                success: true,
                message: "Data removed successfully"
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

    /**
     * Clear all data from storage
     * @returns {Promise<StorageServiceResponse>} Response indicating success/failure
     */
    async clearData(): Promise<StorageServiceResponse> {
        try
        {
            await chrome.storage.local.clear();
            return {
                success: true,
                message: "Storage cleared successfully"
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

export const storageService = new StorageService();

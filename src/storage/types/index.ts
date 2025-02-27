export interface StorageData {
    // Add storage data types as needed
    settings?: {
        theme?: "light" | "dark";
        // Add more settings as needed
    };
}

export interface StorageServiceResponse {
    success: boolean;
    message: string;
    error?: Error;
    data?: any;
}

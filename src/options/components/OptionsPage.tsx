import React, { useState, useEffect } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { storageService } from "@/storage/services/storageService";
import { ApiKey, Settings } from "@/storage/types/settings";
import { toast } from "sonner";


const providerDisplayNames: Record<string, string> = {
    "openai": "OpenAI",
    "anthropic": "Anthropic",
    "google-ai": "Google AI",
    "cohere": "Cohere"
};

const initialApiKeys: ApiKey[] = [
    { provider: "openai", key: "" },
    { provider: "anthropic", key: "" },
    { provider: "google-ai", key: "" },
    { provider: "cohere", key: "" }
];

export const OptionsPage: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
    const [selectedProvider, setSelectedProvider] = useState("openai");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await storageService.getData("settings");
            if (response.data) {
                const settings = response.data as Settings;
                setApiKeys(settings.apiKeys);
                setSelectedProvider(settings.selectedProvider);
            }
        } catch (error) {
            toast.error("Error loading settings");
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApiKeyChange = (provider: string, key: string) => {
        setApiKeys(apiKeys.map(item =>
            item.provider === provider ? { ...item, key } : item
        ));
    };

    const handleSaveSettings = async () => {
        try {
            const settings: Settings = {
                apiKeys,
                selectedProvider
            };
            await storageService.setData("settings", settings);
            toast.success("Settings saved successfully!");
        } catch (error) {
            toast.error("Error saving settings");
            console.error("Error saving settings:", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4">
                <h2 className="text-white font-medium text-xl">Extension Options</h2>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Provider Selection */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Default LLM Provider</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label htmlFor="provider-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Select the AI provider to use for chat:
                        </label>
                        <select
                            id="provider-select"
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {apiKeys.map(item => (
                                <option key={item.provider} value={item.provider}>
                                    {providerDisplayNames[item.provider]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* API Keys Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">API Keys</h3>

                    <div className="space-y-4">
                        {apiKeys.map((item) => (
                            <div key={item.provider} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor={`api-key-${item.provider}`} className="block text-sm font-medium text-gray-700">
                                        {providerDisplayNames[item.provider]} API Key:
                                    </label>
                                    {item.provider === selectedProvider && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <div className="flex">
                                    <input
                                        id={`api-key-${item.provider}`}
                                        type="password"
                                        value={item.key}
                                        onChange={(e) => handleApiKeyChange(item.provider, e.target.value)}
                                        placeholder={`Enter your ${providerDisplayNames[item.provider]} API key`}
                                        className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="bg-gray-200 hover:bg-gray-300 px-3 rounded-r-md border-y border-r border-gray-300"
                                        title="Show/Hide API key"
                                        onClick={() => {
                                            const input = document.getElementById(`api-key-${item.provider}`) as HTMLInputElement;
                                            input.type = input.type === 'password' ? 'text' : 'password';
                                        }}
                                    >
                                        👁️
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Your API key is stored locally and never shared.
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-amber-800">Security Notice</h4>
                            <p className="text-xs text-amber-700 mt-1">
                                Your API keys are stored securely in your browser's local storage and are only used to make requests to the respective AI services. We never store or transmit your API keys to our servers.
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSaveSettings}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                        >
                            <Save size={18} />
                            <span>Save Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionsPage;

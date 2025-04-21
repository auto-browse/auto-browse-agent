import React, { useState, useEffect } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { storageService } from "@/storage/services/storageService";
import {
	BaseProviderSettings,
	OllamaSettings,
	ProviderSettings,
	Settings
} from "@/storage/types/settings";
import { LLMProviders, LLMProviderName } from "@/llm/types/providers";
import { toast } from "sonner";

const getModelPlaceholder = (provider: LLMProviderName) => {
	switch (provider) {
		case LLMProviders.OPENAI:
			return "gpt-4-turbo";
		case LLMProviders.ANTHROPIC:
			return "claude-2";
		case LLMProviders.GOOGLE_AI:
			return "gemini-pro";
		case LLMProviders.OLLAMA:
			return "llama2";
		default:
			return "Enter model name";
	}
};

const initialProviders: ProviderSettings[] = [
	{
		provider: LLMProviders.OPENAI,
		settings: { key: "", model: "gpt-4-turbo" }
	},
	{
		provider: LLMProviders.ANTHROPIC,
		settings: { key: "", model: "claude-2" }
	},
	{
		provider: LLMProviders.GOOGLE_AI,
		settings: { key: "", model: "gemini-pro" }
	},
	{
		provider: LLMProviders.OLLAMA,
		settings: { key: "", model: "llama2", baseUrl: "http://127.0.0.1:11434" }
	}
];

export const OptionsPage: React.FC = () => {
	const [providers, setProviders] =
		useState<ProviderSettings[]>(initialProviders);
	const [selectedProvider, setSelectedProvider] = useState<LLMProviderName>(
		LLMProviders.OPENAI
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const response = await storageService.getData("settings");
			if (response.data) {
				const settings = response.data as Settings;
				// Ensure the loaded data matches our provider types
				const validProviders = settings.providers.filter((p) =>
					Object.values(LLMProviders).includes(p.provider as LLMProviderName)
				);
				setProviders(validProviders.length ? validProviders : initialProviders);

				// Ensure the selected provider is valid
				const validProvider = Object.values(LLMProviders).includes(
					settings.selectedProvider as LLMProviderName
				)
					? settings.selectedProvider
					: LLMProviders.OPENAI;
				setSelectedProvider(validProvider as LLMProviderName);
			}
		} catch (error) {
			toast.error("Error loading settings");
			console.error("Error loading settings:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleProviderSettingChange = (
		provider: LLMProviderName,
		field: keyof OllamaSettings | keyof BaseProviderSettings,
		value: string
	) => {
		setProviders(
			providers.map((item) =>
				item.provider === provider
					? {
							...item,
							settings: { ...item.settings, [field]: value }
					  }
					: item
			)
		);
	};

	const handleSaveSettings = async () => {
		try {
			const settings: Settings = {
				providers,
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
					<h3 className="text-lg font-medium text-gray-800 mb-3">
						Default LLM Provider
					</h3>
					<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
						<label
							htmlFor="provider-select"
							className="block text-sm font-medium text-gray-700 mb-2">
							Select the AI provider to use for chat:
						</label>
						<select
							id="provider-select"
							value={selectedProvider}
							onChange={(e) =>
								setSelectedProvider(e.target.value as LLMProviderName)
							}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
							{providers.map((item) => (
								<option key={item.provider} value={item.provider}>
									{item.provider}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* API Keys Section */}
				<div>
					<h3 className="text-lg font-medium text-gray-800 mb-3">API Keys</h3>

					<div className="space-y-4">
						{providers.map((item) => (
							<div
								key={item.provider}
								className="bg-gray-50 p-4 rounded-lg border border-gray-200">
								<div className="flex justify-between items-center mb-2">
									<label className="block text-sm font-medium text-gray-700">
										{item.provider} Settings:
									</label>
									{item.provider === selectedProvider && (
										<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
											Active
										</span>
									)}
								</div>

								{/* API Key Input */}
								<div className="mb-4">
									<label
										htmlFor={`api-key-${item.provider}`}
										className="block text-sm font-medium text-gray-700 mb-1">
										API Key:
									</label>
									<div className="flex">
										<input
											id={`api-key-${item.provider}`}
											type="password"
											value={item.settings.key}
											onChange={(e) =>
												handleProviderSettingChange(
													item.provider,
													"key",
													e.target.value
												)
											}
											placeholder={`Enter your ${item.provider} API key`}
											className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<button
											type="button"
											className="bg-gray-200 hover:bg-gray-300 px-3 rounded-r-md border-y border-r border-gray-300"
											title="Show/Hide API key"
											onClick={() => {
												const input = document.getElementById(
													`api-key-${item.provider}`
												) as HTMLInputElement;
												input.type =
													input.type === "password" ? "text" : "password";
											}}>
											👁️
										</button>
									</div>
								</div>

								{/* Model Input */}
								<div className="mb-4">
									<label
										htmlFor={`model-${item.provider}`}
										className="block text-sm font-medium text-gray-700 mb-1">
										Model:
									</label>
									<input
										id={`model-${item.provider}`}
										type="text"
										value={item.settings.model}
										onChange={(e) =>
											handleProviderSettingChange(
												item.provider,
												"model",
												e.target.value
											)
										}
										placeholder={`e.g., ${getModelPlaceholder(item.provider)}`}
										className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Ollama Base URL */}
								{item.provider === LLMProviders.OLLAMA && (
									<div className="mb-4">
										<label
											htmlFor="ollama-url"
											className="block text-sm font-medium text-gray-700 mb-1">
											Base URL:
										</label>
										<input
											id="ollama-url"
											type="text"
											value={(item.settings as OllamaSettings).baseUrl}
											onChange={(e) =>
												handleProviderSettingChange(
													item.provider,
													"baseUrl",
													e.target.value
												)
											}
											placeholder="http://127.0.0.1:11434"
											className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								)}

								<p className="mt-1 text-xs text-gray-500">
									Your settings are stored locally and never shared.
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
							<h4 className="text-sm font-medium text-amber-800">
								Security Notice
							</h4>
							<p className="text-xs text-amber-700 mt-1">
								Your API keys are stored securely in your browser's local
								storage and are only used to make requests to the respective AI
								services. We never store or transmit your API keys to our
								servers.
							</p>
						</div>
					</div>

					{/* Save Button */}
					<div className="mt-8 flex justify-end">
						<button
							onClick={handleSaveSettings}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors">
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

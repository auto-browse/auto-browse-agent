import React, { useState, useRef, useEffect, FormEvent } from "react";
import { Settings, Send } from "lucide-react";
import { useMessageHandler } from "./hooks/useMessageHandler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { ActionType, ChatMessage } from "@/messaging/types";
import { ActionButtons } from "./components/ActionButtons";
import { NodeStatusDisplay } from "@/components/shared/NodeStatusDisplay";

interface SidePanelProps {
	onOpenOptions: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ onOpenOptions }) => {
	const { handleAction, handleChat, isLoading, nodeUpdates, currentNode } =
		useMessageHandler();
	const [isDebugMode, setIsDebugMode] = useState(false);
	const [inputMessage, setInputMessage] = useState("");
	const [showNodeUpdates, setShowNodeUpdates] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: "1",
			content: "Hello! How can I help you today?",
			sender: "assistant",
			timestamp: new Date()
		}
	]);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollToBottom();
	}, [messages, nodeUpdates]);

	// Handle theme changes
	useEffect(() => {
		const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		document.documentElement.classList.toggle("dark", isDark);

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const listener = (e: MediaQueryListEvent) => {
			document.documentElement.classList.toggle("dark", e.matches);
		};
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, []);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleSendMessage = async () => {
		if (!inputMessage.trim()) return;

		const userMessage: ChatMessage = {
			id: Date.now().toString(),
			content: inputMessage,
			sender: "user",
			timestamp: new Date()
		};

		setMessages((prev) => [...prev, userMessage]);
		const currentMessage = inputMessage;
		setInputMessage("");

		// Show node updates panel when sending a message
		setShowNodeUpdates(true);

		if (isDebugMode) {
			const assistantResponse: ChatMessage = {
				id: (Date.now() + 1).toString(),
				content:
					"Debug mode is active. Please use the debug commands for assistance.",
				sender: "assistant",
				timestamp: new Date()
			};
			setMessages((prev) => [...prev, assistantResponse]);
			return;
		}

		try {
			// Add a "thinking" message that will be updated with streaming updates
			const thinkingId = (Date.now() + 1).toString();
			const thinkingMessage: ChatMessage = {
				id: thinkingId,
				content: "Processing your request...",
				sender: "assistant",
				timestamp: new Date(),
				isProcessing: true
			};

			setMessages((prev) => [...prev, thinkingMessage]);

			const response = await handleChat(currentMessage);

			// Replace the thinking message with the final response
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === thinkingId
						? {
								...msg,
								content: response.message,
								isProcessing: false
						  }
						: msg
				)
			);

			if (!response.success) {
				toast.error(response.message);
			}
		} catch (error) {
			console.error("Error in chat:", error);
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";
			toast.error(errorMessage);

			const errorResponse: ChatMessage = {
				id: (Date.now() + 1).toString(),
				content: `Error: ${errorMessage}`,
				sender: "assistant",
				timestamp: new Date()
			};
			setMessages((prev) => [...prev, errorResponse]);
		}
	};

	const handleDebugCommand = async (action: ActionType) => {
		const userMessage: ChatMessage = {
			id: Date.now().toString(),
			content: `Executing: ${action}`,
			sender: "user",
			timestamp: new Date(),
			action
		};

		setMessages((prev) => [...prev, userMessage]);

		try {
			const response = await handleAction(action);
			const assistantMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				content: response.message,
				sender: "assistant",
				timestamp: new Date(),
				action,
				response
			};

			setMessages((prev) => [...prev, assistantMessage]);
			toast.success(`Command executed: ${action}`);
		} catch (error) {
			toast.error(`Error executing command: ${error}`);
		}
	};

	return (
		<div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 p-4">
				<h1 className="text-xl font-semibold text-white">Auto-Browse</h1>
				<div className="flex items-center gap-4">
					<div className="flex items-center">
						<span className="text-white text-sm mr-2">
							{isDebugMode ? "Debug Mode" : "Chat Mode"}
						</span>
						<button
							onClick={() => setIsDebugMode(!isDebugMode)}
							className={`w-12 h-6 rounded-full p-1 transition-colors ${
								isDebugMode ? "bg-green-400" : "bg-gray-300"
							}`}
							title="Toggle Debug Mode"
							aria-label="Toggle Debug Mode">
							<div
								className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
									isDebugMode ? "translate-x-6" : "translate-x-0"
								}`}
							/>
						</button>
					</div>
					<button
						onClick={onOpenOptions}
						className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
						title="Open Options">
						<Settings size={20} />
					</button>
				</div>
			</div>

			{/* Debug Panel */}
			{isDebugMode && (
				<>
					<div className="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
						<div className="flex items-center mb-2">
							<Badge
								variant="outline"
								className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300">
								Debug Commands
							</Badge>
						</div>
						<ActionButtons
							onAction={handleDebugCommand}
							isLoading={isLoading}
						/>
					</div>
					<Separator />
				</>
			)}

			{/* Split View: Messages and Node Updates */}
			<div className="flex flex-1 overflow-hidden">
				{/* Messages Panel */}
				<ScrollArea
					className={`${
						showNodeUpdates ? "w-7/12" : "w-full"
					} p-4 bg-gray-50 dark:bg-gray-900`}>
					<div className="space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.sender === "user" ? "justify-end" : "justify-start"
								}`}>
								<div
									className={`max-w-[80%] rounded-lg p-3 ${
										message.sender === "user"
											? "bg-blue-600 text-white rounded-tr-none"
											: "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
									}`}>
									{message.isProcessing ? (
										<div className="flex items-center space-x-2">
											<p className="text-sm">{message.content}</p>
											<div className="flex space-x-1">
												<div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"></div>
												<div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-75"></div>
												<div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-150"></div>
											</div>
										</div>
									) : (
										<p className="text-sm">{message.content}</p>
									)}
									{message.response?.screenshot && (
										<img
											src={message.response.screenshot}
											alt="Page Screenshot"
											className="mt-2 rounded-md w-full"
										/>
									)}
									{/* Snapshot data display */}
									{message.response?.data?.snapshot && (
										<div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-md p-2 overflow-auto max-h-96">
											<pre className="text-xs whitespace-pre-wrap">
												{JSON.stringify(
													message.response.data.snapshot,
													null,
													2
												)}
											</pre>
										</div>
									)}
									{/* DOM tree display */}
									{message.response?.data?.tree && (
										<div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-md p-2 overflow-auto max-h-96">
											<pre className="text-xs whitespace-pre-wrap">
												{JSON.stringify(message.response.data.tree, null, 2)}
											</pre>
										</div>
									)}
									{/* Element tree display */}
									{message.response?.data?.elementTree && (
										<div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-md p-2 overflow-auto max-h-96">
											<pre className="text-xs whitespace-pre-wrap">
												{JSON.stringify(
													message.response.data.elementTree,
													null,
													2
												)}
											</pre>
										</div>
									)}
									{/* Selector map display */}
									{message.response?.data?.selectorMap && (
										<div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-md p-2 overflow-auto max-h-96">
											<pre className="text-xs whitespace-pre-wrap">
												{JSON.stringify(
													message.response.data.selectorMap,
													null,
													2
												)}
											</pre>
										</div>
									)}
									{/* Text map display */}
									{message.response?.data?.textMap && (
										<div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-md p-2 overflow-auto max-h-96">
											<pre className="text-xs whitespace-pre-wrap">
												{JSON.stringify(message.response.data.textMap, null, 2)}
											</pre>
										</div>
									)}
									{/* Cookie banners and Interactive Map display */}
									{message.response?.data?.elements && (
										<div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-md p-2 overflow-auto max-h-96">
											{message.action ===
											ActionType.GET_FORMATTED_INTERACTIVE_MAP ? (
												<div className="space-y-2">
													{message.response.data.elements.map(
														(element: any, index: number) => (
															<div
																key={index}
																className="font-mono text-xs whitespace-pre-wrap">
																{element.formattedOutput}
															</div>
														)
													)}
												</div>
											) : (
												<pre className="text-xs whitespace-pre-wrap">
													{JSON.stringify(
														message.response.data.elements,
														null,
														2
													)}
												</pre>
											)}
										</div>
									)}
									{/* Shadow DOM display */}
									{message.response?.data?.shadowHosts && (
										<div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-md p-2 overflow-auto max-h-96">
											<pre className="text-xs whitespace-pre-wrap">
												{JSON.stringify(
													message.response.data.shadowHosts,
													null,
													2
												)}
											</pre>
										</div>
									)}
									<span
										className={`text-xs mt-1 block ${
											message.sender === "user"
												? "text-blue-100"
												: "text-gray-500 dark:text-gray-400"
										}`}>
										{message.timestamp.toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit"
										})}
									</span>
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>

				{/* Node Updates Panel */}
				{showNodeUpdates && (
					<div className="w-5/12 border-l border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 overflow-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-md font-medium">Processing Steps</h3>
							<button
								onClick={() => setShowNodeUpdates(false)}
								className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
								×
							</button>
						</div>

						{nodeUpdates.length > 0 ? (
							<NodeStatusDisplay
								updates={nodeUpdates}
								currentNode={currentNode}
							/>
						) : isLoading ? (
							<p className="text-gray-500 dark:text-gray-400 text-sm">
								Processing your request...
							</p>
						) : (
							<p className="text-gray-500 dark:text-gray-400 text-sm">
								No updates yet. Send a message to see the AI's thought process.
							</p>
						)}
					</div>
				)}
			</div>

			{/* Toaster */}
			<Toaster />

			{/* Input */}
			<div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<form
					onSubmit={(e: FormEvent<HTMLFormElement>) => {
						e.preventDefault();
						handleSendMessage();
					}}
					className="flex gap-2">
					<Input
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						placeholder={
							isDebugMode ? "Type a debug command..." : "Type a message..."
						}
						className="flex-1 rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
						disabled={isLoading}
					/>
					<Button
						type="submit"
						size="icon"
						className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
						disabled={isLoading}>
						<Send className="h-4 w-4" />
					</Button>
					{!showNodeUpdates && nodeUpdates.length > 0 && (
						<Button
							type="button"
							variant="outline"
							onClick={() => setShowNodeUpdates(true)}
							className="rounded-full">
							Show Process
						</Button>
					)}
				</form>
			</div>
		</div>
	);
};

import React, { useState, useRef, useEffect, FormEvent } from "react";
import { Settings, Send, FileText, Link as LinkIcon, Code, Info } from "lucide-react";
import { useMessageHandler } from "./hooks/useMessageHandler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { ActionType, ChatMessage } from "@/messaging/types";

interface SidePanelProps {
    onOpenOptions: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ onOpenOptions }) => {
    const { handleAction } = useMessageHandler();
    const [isDebugMode, setIsDebugMode] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            content: "Hello! How can I help you today?",
            sender: "assistant",
            timestamp: new Date(),
        },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle theme changes
    useEffect(() => {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => {
            document.documentElement.classList.toggle('dark', e.matches);
        };
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputMessage,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputMessage("");

        // Simulate assistant response
        const assistantResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: isDebugMode
                ? "Debug mode is active. Please use the debug commands for assistance."
                : "I understand your request. How else can I help you?",
            sender: "assistant",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantResponse]);
    };

    const handleDebugCommand = async (action: ActionType) => {
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: `Executing: ${action}`,
            sender: "user",
            timestamp: new Date(),
            action,
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
                response,
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
                <h1 className="text-xl font-semibold text-white">Auto Browse Extension</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <span className="text-white text-sm mr-2">{isDebugMode ? "Debug Mode" : "Chat Mode"}</span>
                        <button
                            onClick={() => setIsDebugMode(!isDebugMode)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isDebugMode ? "bg-green-400" : "bg-gray-300"}`}
                            title="Toggle Debug Mode"
                            aria-label="Toggle Debug Mode"
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${isDebugMode ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                    </div>
                    <button
                        onClick={onOpenOptions}
                        className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
                        title="Open Options"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Debug Panel */}
            {isDebugMode && (
                <>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-2">
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300">
                                Debug Commands
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                className="bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200"
                                onClick={() => handleDebugCommand(ActionType.GET_PAGE_TITLE)}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Get Page Title
                            </Button>
                            <Button
                                size="sm"
                                className="bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-200"
                                onClick={() => handleDebugCommand(ActionType.HIGHLIGHT_LINKS)}
                            >
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Highlight Links
                            </Button>
                            <Button
                                size="sm"
                                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:hover:bg-emerald-800 dark:text-emerald-200"
                                onClick={() => handleDebugCommand(ActionType.COUNT_ELEMENTS)}
                            >
                                <Code className="h-4 w-4 mr-2" />
                                Count Elements
                            </Button>
                            <Button
                                size="sm"
                                className="bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-200"
                                onClick={() => handleDebugCommand(ActionType.GET_METADATA)}
                            >
                                <Info className="h-4 w-4 mr-2" />
                                Get Metadata
                            </Button>
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                    message.sender === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <span
                                    className={`text-xs mt-1 block ${
                                        message.sender === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                                    }`}
                                >
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Toaster */}
            <Toaster />

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <form
                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={isDebugMode ? "Type a debug command..." : "Type a message..."}
                        className="flex-1 rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

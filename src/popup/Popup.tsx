import React from "react";
import { MessageSquare, Settings, ExternalLink, ChevronRight } from "lucide-react";

interface PopupProps {
    onOpenSidepanel: () => void;
    onOpenOptions: () => void;
}

const Popup: React.FC<PopupProps> = ({ onOpenSidepanel, onOpenOptions }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-80">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-center">
                <h2 className="text-white font-medium text-lg">Auto Browse Extension</h2>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                <div className="text-center mb-4">
                    <div className="inline-flex p-3 rounded-full bg-blue-100 mb-2">
                        <ExternalLink size={24} className="text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                        Quick access to extension features
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={onOpenSidepanel}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-between transition-colors border border-blue-200"
                    >
                        <div className="flex items-center">
                            <MessageSquare size={20} className="mr-2" />
                            <span>Open Sidepanel</span>
                        </div>
                        <ChevronRight size={16} />
                    </button>

                    <button
                        onClick={onOpenOptions}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg flex items-center justify-between transition-colors border border-gray-200"
                    >
                        <div className="flex items-center">
                            <Settings size={20} className="mr-2" />
                            <span>Open Options</span>
                        </div>
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                        <p className="font-medium mb-1">Extension v1.0.0</p>
                        <p>Use the sidepanel for chat assistance or debug tools.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;

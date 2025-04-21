import React from "react";

export interface NodeUpdate {
	node: string;
	status: "active" | "completed" | "idle";
	content?: string;
	timestamp: Date;
}

interface NodeStatusDisplayProps {
	updates: NodeUpdate[];
	currentNode?: string;
}

// Helper function to get a nice display name for nodes
const getNodeDisplayName = (nodeName: string): string => {
	switch (nodeName) {
		case "planner":
			return "Planning";
		case "browser":
			return "Browser Actions";
		case "verifier":
			return "Verification";
		default:
			return nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
	}
};

export const NodeStatusDisplay: React.FC<NodeStatusDisplayProps> = ({
	updates,
	currentNode
}) => {
	return (
		<div className="mt-4 space-y-2">
			{updates.map((update, index) => (
				<div
					key={`${update.node}-${index}`}
					className={`flex items-center p-2 rounded-md ${
						update.node === currentNode
							? "bg-blue-100 dark:bg-blue-900"
							: update.status === "completed"
							? "bg-green-50 dark:bg-green-900/20"
							: "bg-gray-50 dark:bg-gray-800/50"
					}`}>
					<div
						className={`h-2 w-2 rounded-full mr-2 ${
							update.node === currentNode
								? "bg-blue-500 animate-pulse"
								: update.status === "completed"
								? "bg-green-500"
								: "bg-gray-400"
						}`}
					/>
					<div className="flex-1">
						<div className="flex justify-between items-center">
							<span className="font-medium text-sm">
								{getNodeDisplayName(update.node)}
							</span>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								{update.timestamp.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit"
								})}
							</span>
						</div>
						{update.content && (
							<p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
								{update.content}
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

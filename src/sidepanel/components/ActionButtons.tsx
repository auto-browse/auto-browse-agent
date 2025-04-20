import React from "react";
import { Button } from "@/components/ui/button";
import { ActionType } from "@/messaging/types";
import {
	FileText,
	Link as LinkIcon,
	Code,
	Info,
	Camera,
	Accessibility,
	GitFork,
	Cookie,
	Ghost,
	Target,
	Compass,
	Link2,
	LayoutTemplate,
	Activity,
	GitBranch,
	Map as MapIcon,
	Type
} from "lucide-react";

interface ActionButtonsProps {
	onAction: (action: ActionType) => Promise<void>;
	isLoading: boolean;
}

interface DebugButton {
	action: ActionType;
	label: string;
	icon: React.ReactNode;
	className: string;
}

const debugButtons: DebugButton[] = [
	{
		action: ActionType.GET_PAGE_TITLE,
		label: "Get Page Title",
		icon: <FileText className="h-4 w-4 mr-2" />,
		className:
			"bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200"
	},
	{
		action: ActionType.HIGHLIGHT_LINKS,
		label: "Highlight Links",
		icon: <LinkIcon className="h-4 w-4 mr-2" />,
		className:
			"bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-200"
	},
	{
		action: ActionType.COUNT_ELEMENTS,
		label: "Count Elements",
		icon: <Code className="h-4 w-4 mr-2" />,
		className:
			"bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:hover:bg-emerald-800 dark:text-emerald-200"
	},
	{
		action: ActionType.GET_METADATA,
		label: "Get Metadata",
		icon: <Info className="h-4 w-4 mr-2" />,
		className:
			"bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900 dark:hover:bg-amber-800 dark:text-amber-200"
	},
	{
		action: ActionType.TAKE_SCREENSHOT,
		label: "Take Screenshot",
		icon: <Camera className="h-4 w-4 mr-2" />,
		className:
			"bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-900 dark:hover:bg-rose-800 dark:text-rose-200"
	},
	{
		action: ActionType.GET_ACCESSIBILITY_SNAPSHOT,
		label: "A11y Snapshot",
		icon: <Accessibility className="h-4 w-4 mr-2" />,
		className:
			"bg-violet-100 hover:bg-violet-200 text-violet-800 dark:bg-violet-900 dark:hover:bg-violet-800 dark:text-violet-200"
	},
	{
		action: ActionType.HIGHLIGHT_BY_REF,
		label: "Highlight By Ref",
		icon: <Target className="h-4 w-4 mr-2" />,
		className:
			"bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200"
	},
	{
		action: ActionType.GET_DOM_TREE,
		label: "DOM Tree (Original)",
		icon: <GitFork className="h-4 w-4 mr-2" />,
		className:
			"bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-200"
	},
	{
		action: ActionType.GET_DOM_TREE_WITH_BUILD,
		label: "DOM Tree (Cached)",
		icon: <GitFork className="h-4 w-4 mr-2" />,
		className:
			"bg-lime-100 hover:bg-lime-200 text-lime-800 dark:bg-lime-900 dark:hover:bg-lime-800 dark:text-lime-200"
	},
	{
		action: ActionType.GET_DOM_TREE_WITH_PAGE_SCRIPT,
		label: "DOM Tree (Page Script)",
		icon: <GitFork className="h-4 w-4 mr-2" />,
		className:
			"bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:hover:bg-emerald-800 dark:text-emerald-200"
	},
	{
		action: ActionType.GET_DOM_TREE_WITH_NEW_SCRIPT,
		label: "DOM Tree (New Script)",
		icon: <GitFork className="h-4 w-4 mr-2" />,
		className:
			"bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:text-indigo-200"
	},
	{
		action: ActionType.GET_CLICKABLE_ELEMENTS,
		label: "All Clickable Elements",
		icon: <Target className="h-4 w-4 mr-2" />,
		className:
			"bg-sky-100 hover:bg-sky-200 text-sky-800 dark:bg-sky-900 dark:hover:bg-sky-800 dark:text-sky-200"
	},
	{
		action: ActionType.GET_ELEMENT_TREE,
		label: "Element Tree",
		icon: <GitBranch className="h-4 w-4 mr-2" />,
		className:
			"bg-lime-100 hover:bg-lime-200 text-lime-800 dark:bg-lime-900 dark:hover:bg-lime-800 dark:text-lime-200"
	},
	{
		action: ActionType.GET_SELECTOR_MAP,
		label: "Selector Map",
		icon: <MapIcon className="h-4 w-4 mr-2" />,
		className:
			"bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200"
	},
	{
		action: ActionType.GET_TEXT_MAP,
		label: "Text Node Map",
		icon: <Type className="h-4 w-4 mr-2" />,
		className:
			"bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-200"
	},
	{
		action: ActionType.ANALYZE_COOKIE_BANNERS,
		label: "Cookie UI",
		icon: <Cookie className="h-4 w-4 mr-2" />,
		className:
			"bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900 dark:hover:bg-orange-800 dark:text-orange-200"
	},
	{
		action: ActionType.EXPLORE_SHADOW_DOM,
		label: "Shadow DOM",
		icon: <Ghost className="h-4 w-4 mr-2" />,
		className:
			"bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-200"
	},
	{
		action: ActionType.GET_INTERACTIVE_MAP,
		label: "Interactive Map",
		icon: <Target className="h-4 w-4 mr-2" />,
		className:
			"bg-pink-100 hover:bg-pink-200 text-pink-800 dark:bg-pink-900 dark:hover:bg-pink-800 dark:text-pink-200"
	},
	{
		action: ActionType.GET_FORMATTED_INTERACTIVE_MAP,
		label: "Formatted Interactive Map",
		icon: <Target className="h-4 w-4 mr-2" />,
		className:
			"bg-cyan-100 hover:bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:hover:bg-cyan-800 dark:text-cyan-200"
	},
	{
		action: ActionType.GET_ELEMENT_XPATHS,
		label: "XPath Map",
		icon: <Compass className="h-4 w-4 mr-2" />,
		className:
			"bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-900 dark:hover:bg-teal-800 dark:text-teal-200"
	},
	{
		action: ActionType.GET_CURRENT_URL,
		label: "Get Current URL",
		icon: <Link2 className="h-4 w-4 mr-2" />,
		className:
			"bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:text-indigo-200"
	},
	{
		action: ActionType.GET_VIEWPORT,
		label: "Get Viewport",
		icon: <LayoutTemplate className="h-4 w-4 mr-2" />,
		className:
			"bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200"
	},
	{
		action: ActionType.GET_BROWSER_STATE,
		label: "Browser State",
		icon: <Activity className="h-4 w-4 mr-2" />,
		className:
			"bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-900 dark:hover:bg-fuchsia-800 dark:text-fuchsia-200"
	}
];

export const ActionButtons: React.FC<ActionButtonsProps> = ({
	onAction,
	isLoading
}) => {
	return (
		<div className="flex flex-wrap gap-2">
			{debugButtons.map((button) => (
				<Button
					key={button.action}
					size="sm"
					className={button.className}
					onClick={() => onAction(button.action)}
					disabled={isLoading}>
					{button.icon}
					{button.label}
				</Button>
			))}
		</div>
	);
};

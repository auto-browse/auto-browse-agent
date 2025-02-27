import React from "react";

interface StatusDisplayProps {
  message: string;
}

export const StatusDisplay = React.forwardRef<HTMLDivElement, StatusDisplayProps>(
  ({ message }, ref) => {
    return (
      <div
        ref={ref}
        className="mt-4 p-4 border border-border rounded-md bg-background"
      >
        {message}
      </div>
    );
  }
);

StatusDisplay.displayName = "StatusDisplay";

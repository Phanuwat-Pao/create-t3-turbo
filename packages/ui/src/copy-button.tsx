"use client";

import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useState } from "react";

interface CopyButtonProps {
  textToCopy: string;
  /** Tooltip and screen-reader text before copying. */
  copyLabel?: string;
  /** Tooltip text for two seconds after a successful copy. */
  copiedLabel?: string;
}

export default function CopyButton({
  textToCopy,
  copyLabel = "Copy to clipboard",
  copiedLabel = "Copied!",
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
    } catch {
      // Failed to copy
    }
  }, [textToCopy]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="link"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
          >
            {isCopied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
            <span className="sr-only">{copyLabel}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCopied ? copiedLabel : copyLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

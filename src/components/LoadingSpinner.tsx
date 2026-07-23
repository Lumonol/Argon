import { useMemo } from "react";
import { Loader2 } from "lucide-react";

const LOADING_MESSAGES = [
  "Just a moment...",
  "Hang tight...",
  "Loading things up...",
  "Almost there...",
  "Getting everything ready...",
  "One sec...",
  "Fetching the good stuff...",
  "Working on it...",
  "Pulling it all together...",
  "Bear with us...",
  "On its way...",
  "Hold tight, magic happening...",
  "Warming up the servers...",
  "Brewing up your content...",
  "Sit tight, we're on it...",
  "Just a hot minute...",
];

interface LoadingSpinnerProps {
  fullPage?: boolean;
  className?: string;
}

const LoadingSpinner = ({ fullPage = false, className }: LoadingSpinnerProps) => {
  const message = useMemo(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    []
  );

  return (
    <div
      className={
        className ??
        (fullPage
          ? "min-h-screen flex flex-col items-center justify-center bg-background gap-3"
          : "flex flex-col items-center justify-center h-full gap-3")
      }
    >
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

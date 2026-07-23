import { useState, useEffect } from "react";
import { useSentinel } from "@/hooks/useSentinel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Key, Copy, Check, Code } from "lucide-react";

interface SentinelSetupProps {
  workspaceId: string;
}

const SentinelSetup = ({ workspaceId }: SentinelSetupProps) => {
  const { getSettings, generateApiKey, getScript } = useSentinel(workspaceId);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [script, setScript] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const settingsResult = await getSettings();
        setApiKey(settingsResult.sentinel_api_key);
        const scriptResult = await getScript();
        setScript(scriptResult.script);
      } catch {
        toast({ title: "Error", description: "Failed to load setup data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const result = await generateApiKey();
      setApiKey(result.sentinel_api_key);
      // Refresh script with new key
      const scriptResult = await getScript();
      setScript(scriptResult.script);
      toast({ title: "API Key Generated", description: "Your new Sentinel API key is ready" });
    } catch {
      toast({ title: "Error", description: "Failed to generate API key", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: "key" | "script") => {
    await navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
    toast({ title: "Copied", description: `${type === "key" ? "API key" : "Script"} copied to clipboard` });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: API Key */}
      <Card className="border-border/30 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <CardTitle className="text-lg">Generate API Key</CardTitle>
              <CardDescription>This key authenticates your Roblox game with Sentinel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {apiKey ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm font-mono truncate">
                {apiKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKey, "key")}
              >
                {copiedKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateKey}
                disabled={generating}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Regenerate"}
              </Button>
            </div>
          ) : (
            <Button onClick={handleGenerateKey} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Generate API Key
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Lua Script */}
      <Card className="border-border/30 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <CardTitle className="text-lg">Install the Lua Script</CardTitle>
              <CardDescription>Copy this script and paste it into ServerScriptService in Roblox Studio</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 gap-1 z-10"
              onClick={() => copyToClipboard(script, "script")}
            >
              {copiedScript ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copiedScript ? "Copied" : "Copy"}
            </Button>
            <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre">
              {script}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Enable */}
      <Card className="border-border/30 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <CardTitle className="text-lg">Enable & Configure</CardTitle>
              <CardDescription>
                Go to the Settings tab to enable Sentinel and configure detection modes for avatar checks, chat filtering, and exploit detection.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SentinelSetup;

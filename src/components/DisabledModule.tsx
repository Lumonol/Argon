import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DisabledModuleProps {
  moduleName: string;
}

const DisabledModule = ({ moduleName }: DisabledModuleProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-border/50">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Module Not Enabled</h2>
            <p className="text-muted-foreground">
              The <span className="font-medium text-foreground">{moduleName}</span> module is not enabled for this workspace. Please contact your workspace administrator to enable it.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisabledModule;

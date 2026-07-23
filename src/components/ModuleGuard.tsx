import { useModuleEnabled } from "@/hooks/useModuleEnabled";
import DisabledModule from "./DisabledModule";
import LoadingSpinner from "./LoadingSpinner";

interface ModuleGuardProps {
  moduleKey: string;
  moduleName: string;
  children: React.ReactNode;
}

const ModuleGuard = ({ moduleKey, moduleName, children }: ModuleGuardProps) => {
  const { enabled, loading } = useModuleEnabled(moduleKey);

  if (loading) return <LoadingSpinner />;
  if (!enabled) return <DisabledModule moduleName={moduleName} />;

  return <>{children}</>;
};

export default ModuleGuard;

import { useParams } from "react-router-dom";

/**
 * Hook to get the current workspace ID from the URL.
 * Used within /workspaces/:workspaceId/* routes.
 */
export const useWorkspaceId = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  return workspaceId || "";
};

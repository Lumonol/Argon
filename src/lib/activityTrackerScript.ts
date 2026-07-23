const API_BASE_URL = "https://api.prismspace.xyz";

export function generateActivityTrackerScript(apiKey: string, workspaceId: string): string {
  return `--[[
  Hive Activity Tracker
  Place as a Script (not LocalScript) inside ServerScriptService.
  Requires HTTP Requests to be enabled in Game Settings > Security.
  Auto-generated — do not edit API_KEY or WORKSPACE_ID manually.
--]]

local API_KEY = "${apiKey}"
local WORKSPACE_ID = "${workspaceId}"
local API_URL = "${API_BASE_URL}/activity-tracking"

local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

local pendingRequests = 0

local function sendRequest(userId: number, username: string, action: string)
  pendingRequests += 1
  local url = API_URL .. "/" .. action
  local ok, result = pcall(function()
    return HttpService:RequestAsync({
      Url = url,
      Method = "POST",
      Headers = {
        ["Authorization"] = "Bearer " .. API_KEY,
        ["Content-Type"] = "application/json",
      },
      Body = HttpService:JSONEncode({
        workspace_id = WORKSPACE_ID,
        roblox_user_id = userId,
        roblox_username = username,
      }),
    })
  end)
  if not ok then
    warn("[PrismTracker] Request error (" .. action .. ") for " .. username .. ": " .. tostring(result))
  elseif not result.Success then
    warn("[PrismTracker] " .. action .. " failed for " .. username .. " — HTTP " .. tostring(result.StatusCode) .. ": " .. tostring(result.Body))
  else
    print("[PrismTracker] " .. action .. " OK for " .. username)
  end
  pendingRequests -= 1
end

Players.PlayerAdded:Connect(function(player)
  sendRequest(player.UserId, player.Name, "start")
end)

Players.PlayerRemoving:Connect(function(player)
  sendRequest(player.UserId, player.Name, "stop")
end)

-- Handle players already in-game when the script starts (e.g. Studio testing)
for _, player in Players:GetPlayers() do
  task.spawn(sendRequest, player.UserId, player.Name, "start")
end

game:BindToClose(function()
  local t = os.clock()
  while pendingRequests > 0 and os.clock() - t < 3 do
    task.wait(0.1)
  end
end)
`;
}

export function downloadActivityTrackerScript(apiKey: string, workspaceId: string): void {
  const content = generateActivityTrackerScript(apiKey, workspaceId);
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "PrismActivityTracker.lua";
  a.click();
  URL.revokeObjectURL(url);
}

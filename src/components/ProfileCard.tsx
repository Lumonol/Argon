import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ProfileCardProps {
  displayName: string;
  robloxUsername: string;
  accountCode?: string;
  userId?: string;
  email?: string;
  isStaffView?: boolean;
  isLoadingStaffData?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileCard = ({ 
  displayName, 
  robloxUsername, 
  accountCode, 
  userId,
  email,
  isStaffView = false,
  isLoadingStaffData = false,
  isOpen, 
  onClose 
}: ProfileCardProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 border-0 bg-transparent overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>User Profile Card</DialogTitle>
        </VisuallyHidden>

        {/* Card container with rotating gradient background */}
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden">
          {/* Rotating gradient background */}
          <div className="absolute inset-0 rotating-gradient-bg" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-8">
            {/* Rotating holographic disc */}
            <div className="relative w-28 h-28 mb-4">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/30 via-cyan-500/30 to-purple-500/30 blur-xl animate-pulse" />
              
              {/* Main disc */}
              <div className="holographic-disc">
                <div className="disc-inner">
                  {/* Center hole */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#0a0a12] border-2 border-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* User info */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-white">
                {displayName || "User"}
              </h3>
              <p className="text-cyan-300/80 text-sm">
                @{robloxUsername || "unknown"}
              </p>
              {accountCode && (
                <div className="pt-3">
                  <p className="text-white/40 text-xs font-mono tracking-wider bg-white/5 px-3 py-1 rounded-full inline-block">
                    ID: {accountCode}
                  </p>
                </div>
              )}
              
              {/* Staff-only info */}
              {isStaffView && (
                <div className="pt-4 space-y-2">
                  {isLoadingStaffData ? (
                    <div className="flex items-center justify-center gap-2 text-white/50 text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading staff data...</span>
                    </div>
                  ) : (
                    <>
                      {email && (
                        <p className="text-white/50 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg">
                          ✉️ {email}
                        </p>
                      )}
                      {userId && (
                        <p className="text-white/40 text-[10px] font-mono bg-white/5 px-3 py-1 rounded-lg break-all">
                          UUID: {userId}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hive branding */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span className="text-white/30 text-xs tracking-widest uppercase">
                Hive
              </span>
            </div>
          </div>
        </div>
      </DialogContent>

      <style>{`
        .rotating-gradient-bg {
          background: linear-gradient(
            135deg,
            #0a0a12 0%,
            #1e3a5f 25%,
            #0f3460 50%,
            #16213e 75%,
            #0a0a12 100%
          );
          background-size: 400% 400%;
          animation: gradient-shift 2s ease infinite;
        }

        .rotating-gradient-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(6, 182, 212, 0.15) 25%,
            rgba(139, 92, 246, 0.15) 50%,
            rgba(236, 72, 153, 0.1) 75%,
            transparent 100%
          );
          background-size: 300% 300%;
          animation: gradient-shift 1.5s ease infinite reverse;
        }

        .rotating-gradient-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            rgba(6, 182, 212, 0.1) 0%,
            transparent 70%
          );
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .holographic-disc {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          animation: disc-rotate 8s linear infinite;
          background: conic-gradient(
            from 0deg,
            #ec4899 0deg,
            #f472b6 30deg,
            #c084fc 60deg,
            #a78bfa 90deg,
            #818cf8 120deg,
            #60a5fa 150deg,
            #38bdf8 180deg,
            #22d3ee 210deg,
            #2dd4bf 240deg,
            #4ade80 270deg,
            #a3e635 300deg,
            #facc15 330deg,
            #ec4899 360deg
          );
          box-shadow: 
            0 0 30px rgba(168, 85, 247, 0.4),
            inset 0 0 30px rgba(255, 255, 255, 0.1);
        }

        .holographic-disc::before {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: conic-gradient(
            from 180deg,
            rgba(255, 255, 255, 0.3) 0deg,
            transparent 60deg,
            rgba(255, 255, 255, 0.2) 120deg,
            transparent 180deg,
            rgba(255, 255, 255, 0.3) 240deg,
            transparent 300deg,
            rgba(255, 255, 255, 0.2) 360deg
          );
          animation: disc-rotate 4s linear infinite reverse;
        }

        .disc-inner {
          position: absolute;
          inset: 15%;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.1) 100%
          );
          backdrop-filter: blur(2px);
        }

        @keyframes disc-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Dialog>
  );
};

export default ProfileCard;
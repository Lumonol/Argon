import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Shield } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import prismIcon from "@/assets/prism-icon.png";

interface MobileNavDrawerProps {
  user: any;
  isSiteAdmin: boolean;
  signOut: () => void;
  productFeatures: { name: string; description: string; href: string; icon: React.ReactNode }[];
  discoveryItems: { name: string; description: string; href: string; icon: React.ReactNode }[];
  resourceItems: { name: string; description: string; href: string; icon: React.ReactNode; external?: boolean }[];
  legalItems: { name: string; description: string; href: string; icon: React.ReactNode }[];
}

const MobileNavDrawer = ({ user, isSiteAdmin, signOut, productFeatures, discoveryItems, resourceItems, legalItems }: MobileNavDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle menu">
          <Menu className="w-5 h-5" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] bg-background border-border">
        <div className="overflow-y-auto px-6 pb-8 pt-2">
          {/* Logo */}
          <div className="flex justify-center py-4 mb-2">
            <img src={prismIcon} alt="Prism" className="h-8 w-auto" />
            <span className="font-display text-xl tracking-wide text-foreground leading-none whitespace-nowrap font-extrabold ml-2.5 self-center">
              Hive
            </span>
          </div>

          {/* Auth buttons at top */}
          {user ? (
            <div className="flex items-center gap-2 mb-2">
              <DrawerClose asChild>
                <Link to="/account" className="flex-1 text-center px-3 py-2.5 text-sm font-medium text-foreground border border-border rounded-xl hover:bg-accent transition-colors">
                  Account
                </Link>
              </DrawerClose>
              <button
                onClick={() => { signOut(); close(); }}
                className="flex-1 text-center px-3 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <DrawerClose asChild>
                <Link to="/signin" className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-foreground border border-border rounded-xl hover:bg-accent transition-colors">
                  Sign in
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link to="/signup" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                  Sign up
                </Link>
              </DrawerClose>
            </div>
          )}

          <div className="h-px bg-border/40 mb-2" />

          {/* Home */}
          <DrawerClose asChild>
            <Link to="/" className="block px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors">
              Home
            </Link>
          </DrawerClose>

          {/* Workspaces (if logged in) */}
          {user && (
            <DrawerClose asChild>
              <Link to="/workspaces" className="block px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors">
                Workspaces
              </Link>
            </DrawerClose>
          )}

          {/* Product collapsible */}
          <button
            onClick={() => setProductOpen(!productOpen)}
            className="flex items-center justify-between w-full px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            Product
            <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 ${productOpen ? "rotate-180" : ""}`} />
          </button>
          <div
            className="pl-4 space-y-0.5 mb-1 overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: productOpen ? `${productFeatures.length * 52}px` : "0px",
              opacity: productOpen ? 1 : 0,
            }}
          >
            {productFeatures.map((item, i) => (
              <DrawerClose asChild key={item.href}>
                <Link
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-all duration-200"
                  style={{
                    transform: productOpen ? "translateX(0)" : "translateX(-8px)",
                    opacity: productOpen ? 1 : 0,
                    transition: `transform 300ms ease-out ${i * 50}ms, opacity 300ms ease-out ${i * 50}ms`,
                  }}
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </Link>
              </DrawerClose>
            ))}
          </div>

          {/* Pricing */}
          <DrawerClose asChild>
            <Link to="/pricing" className="block px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors">
              Pricing
            </Link>
          </DrawerClose>

          {/* Hive Premium */}
          <DrawerClose asChild>
            <Link to="/prism-plus" className="block px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors">
              Hive Premium
            </Link>
          </DrawerClose>



          {/* About */}
          <DrawerClose asChild>
            <Link to="/about" className="block px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors">
              About
            </Link>
          </DrawerClose>

          {/* Discovery collapsible */}
          <button
            onClick={() => setDiscoveryOpen(!discoveryOpen)}
            className="flex items-center justify-between w-full px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            Discovery
            <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 ${discoveryOpen ? "rotate-180" : ""}`} />
          </button>
          <div
            className="pl-4 space-y-0.5 mb-1 overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: discoveryOpen ? `${discoveryItems.length * 52}px` : "0px",
              opacity: discoveryOpen ? 1 : 0,
            }}
          >
            {discoveryItems.map((item, i) => (
              <DrawerClose asChild key={item.href}>
                <Link
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-all duration-200"
                  style={{
                    transform: discoveryOpen ? "translateX(0)" : "translateX(-8px)",
                    opacity: discoveryOpen ? 1 : 0,
                    transition: `transform 300ms ease-out ${i * 50}ms, opacity 300ms ease-out ${i * 50}ms`,
                  }}
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </Link>
              </DrawerClose>
            ))}
          </div>

          {/* Resources collapsible */}
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            className="flex items-center justify-between w-full px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            Resources
            <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`} />
          </button>
          <div
            className="pl-4 space-y-0.5 mb-1 overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: resourcesOpen ? `${resourceItems.length * 52}px` : "0px",
              opacity: resourcesOpen ? 1 : 0,
            }}
          >
            {resourceItems.map((item, i) =>
              item.external ? (
                <DrawerClose asChild key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-all duration-200"
                    style={{
                      transform: resourcesOpen ? "translateX(0)" : "translateX(-8px)",
                      opacity: resourcesOpen ? 1 : 0,
                      transition: `transform 300ms ease-out ${i * 50}ms, opacity 300ms ease-out ${i * 50}ms`,
                    }}
                  >
                    <span className="text-primary">{item.icon}</span>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </a>
                </DrawerClose>
              ) : (
                <DrawerClose asChild key={item.href}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-all duration-200"
                    style={{
                      transform: resourcesOpen ? "translateX(0)" : "translateX(-8px)",
                      opacity: resourcesOpen ? 1 : 0,
                      transition: `transform 300ms ease-out ${i * 50}ms, opacity 300ms ease-out ${i * 50}ms`,
                    }}
                  >
                    <span className="text-primary">{item.icon}</span>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </Link>
                </DrawerClose>
              )
            )}
          </div>

          {/* Legal collapsible */}
          <button
            onClick={() => setLegalOpen(!legalOpen)}
            className="flex items-center justify-between w-full px-3 py-3.5 text-base font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            Legal
            <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 ${legalOpen ? "rotate-180" : ""}`} />
          </button>
          <div
            className="pl-4 space-y-0.5 mb-1 overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: legalOpen ? `${legalItems.length * 52}px` : "0px",
              opacity: legalOpen ? 1 : 0,
            }}
          >
            {legalItems.map((item, i) => (
              <DrawerClose asChild key={item.href}>
                <Link
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-all duration-200"
                  style={{
                    transform: legalOpen ? "translateX(0)" : "translateX(-8px)",
                    opacity: legalOpen ? 1 : 0,
                    transition: `transform 300ms ease-out ${i * 50}ms, opacity 300ms ease-out ${i * 50}ms`,
                  }}
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </Link>
              </DrawerClose>
            ))}
          </div>

        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileNavDrawer;

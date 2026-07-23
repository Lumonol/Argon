// Argon Module SDK - UI Components
// Modules should import UI components from this file rather than reaching directly into @/components/ui
// Example: import { Button, Card, CardContent } from "@/sdk/ui"

// Basic UI
export * from "@/components/ui/button"
export * from "@/components/ui/card"
export * from "@/components/ui/badge"
export * from "@/components/ui/separator"
export * from "@/components/ui/skeleton"
export * from "@/components/ui/stat-widget"

// Forms & Inputs
export * from "@/components/ui/input"
export * from "@/components/ui/label"
export * from "@/components/ui/checkbox"
export * from "@/components/ui/switch"
export * from "@/components/ui/radio-group"
export * from "@/components/ui/slider"
export * from "@/components/ui/textarea"
export * from "@/components/ui/select"
export * from "@/components/ui/form"

// Navigation & Layout
export * from "@/components/ui/tabs"
export * from "@/components/ui/scroll-area"
export * from "@/components/ui/accordion"
export * from "@/components/ui/collapsible"
export * from "@/components/ui/resizable"

// Overlays & Feedback
export * from "@/components/ui/dialog"
export * from "@/components/ui/sheet"
export * from "@/components/ui/popover"
export * from "@/components/ui/tooltip"
export * from "@/components/ui/hover-card"
export * from "@/components/ui/context-menu"
export * from "@/components/ui/dropdown-menu"
export * from "@/components/ui/alert"
export * from "@/components/ui/alert-dialog"
export * from "@/components/ui/toast"
export * from "@/components/ui/use-toast"
export * from "@/components/ui/progress"

// Advanced/Data
export * from "@/components/ui/table"
export * from "@/components/ui/avatar"
export * from "@/components/ui/command"

// Notifications API
export { notify } from "@/lib/notifications"

// Icons
export * as Icons from "lucide-react"

// Module Settings API
export interface ModuleSettingsField {
  id: string;
  type: 'string' | 'boolean' | 'number' | 'select';
  label: string;
  description?: string;
  default?: any;
  options?: { label: string; value: string }[]; // For 'select' type
}

export type ModuleSettingsSchema = ModuleSettingsField[];

// Module Home Dashboard API
export interface ModuleTile {
  id: string;
  label: string;
  description: string;
  icon: any; // Lucide Icon component
  href?: string;
}

export interface ModuleWidget {
  id: string;
  label: string;
  description: string;
  icon: any; // Lucide Icon component
  component: React.ComponentType<any>;
  defaultSize?: 'small' | 'medium' | 'large' | 'widget' | 'full';
}

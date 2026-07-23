import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { BookOpen, Shield, Users, Building2, LifeBuoy, AlertTriangle, Award, Clock, MessageSquare, Zap, UserCheck, ClipboardList, FileText } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  "file-text": FileText,
  "book-open": BookOpen,
  "shield": Shield,
  "users": Users,
  "building-2": Building2,
  "life-buoy": LifeBuoy,
  "alert-triangle": AlertTriangle,
  "award": Award,
  "clock": Clock,
  "message-square": MessageSquare,
  "zap": Zap,
  "user-check": UserCheck,
  "clipboard-list": ClipboardList,
};

const COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  blue: { text: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500" },
  green: { text: "text-green-500", bg: "bg-green-500/10", border: "border-green-500" },
  purple: { text: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500" },
  red: { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500" },
  yellow: { text: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500" },
  orange: { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500" },
  emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500" },
  pink: { text: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500" },
};

interface ContentBlock {
  id: string;
  type: "text" | "callout" | "table";
  text?: string;
  calloutTitle?: string;
  calloutText?: string;
  calloutColor?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
}

interface DocSection {
  id: string;
  title: string;
  icon: string;
  blocks: ContentBlock[];
}

interface DocumentRendererProps {
  title: string;
  description?: string;
  icon: string;
  color: string;
  sections: DocSection[];
}

const DocumentRenderer = ({ title, description, icon, color, sections }: DocumentRendererProps) => {
  const DocIcon = ICON_MAP[icon] || FileText;
  const colorSet = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-border">
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", colorSet.bg)}>
          <DocIcon className={cn("h-8 w-8", colorSet.text)} />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const SectionIcon = ICON_MAP[section.icon] || BookOpen;
        return (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <SectionIcon className="w-5 h-5 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.blocks.map((block) => {
                if (block.type === "text" && block.text) {
                  return (
                    <p key={block.id} className="text-foreground/80 whitespace-pre-wrap">
                      {block.text}
                    </p>
                  );
                }

                if (block.type === "callout") {
                  const calloutColor = COLOR_MAP[block.calloutColor || "yellow"] || COLOR_MAP.yellow;
                  return (
                    <div
                      key={block.id}
                      className={cn(
                        "border-l-4 rounded-lg p-3",
                        calloutColor.bg,
                        calloutColor.border
                      )}
                      style={{ borderLeftColor: undefined }}
                    >
                      {block.calloutTitle && (
                        <h4 className={cn("font-medium mb-1", calloutColor.text)}>
                          {block.calloutTitle}
                        </h4>
                      )}
                      {block.calloutText && (
                        <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                          {block.calloutText}
                        </p>
                      )}
                    </div>
                  );
                }

                if (block.type === "table" && block.tableHeaders) {
                  return (
                    <Table key={block.id}>
                      <TableHeader>
                        <TableRow>
                          {block.tableHeaders.map((h, i) => (
                            <TableHead key={i}>{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(block.tableRows || []).map((row, ri) => (
                          <TableRow key={ri}>
                            {row.map((cell, ci) => (
                              <TableCell key={ci}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  );
                }

                return null;
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DocumentRenderer;

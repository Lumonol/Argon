import { ChevronUp, ChevronDown, Trash2, GripVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface FormField {
  field_type: string;
  label: string;
  placeholder: string;
  description: string;
  required: boolean;
  options: string[];
  validation_rules: Record<string, unknown>;
  sort_order: number;
}

interface FieldType {
  value: string;
  label: string;
}

interface FormFieldEditorProps {
  field: FormField;
  index: number;
  totalFields: number;
  fieldTypes: FieldType[];
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const FormFieldEditor = ({
  field,
  index,
  totalFields,
  fieldTypes,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: FormFieldEditorProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasOptions = ["select", "radio", "checkbox"].includes(field.field_type);

  const addOption = () => {
    onUpdate({ options: [...field.options, ""] });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    onUpdate({ options: field.options.filter((_, i) => i !== optionIndex) });
  };

  return (
    <Card className="border-l-4 border-l-primary/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 p-3 border-b">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-1 justify-start font-medium">
              {field.label || `Field ${index + 1}`}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Button>
          </CollapsibleTrigger>
          <span className="text-xs text-muted-foreground">
            {fieldTypes.find((t) => t.value === field.field_type)?.label}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveUp}
              disabled={index === 0}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveDown}
              disabled={index === totalFields - 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                  value={field.field_type}
                  onValueChange={(value) => onUpdate({ field_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Label *</Label>
                <Input
                  value={field.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Field label"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Placeholder text"
                />
              </div>

              <div className="space-y-2">
                <Label>Help Text</Label>
                <Input
                  value={field.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Additional instructions"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Required Field</Label>
                <p className="text-xs text-muted-foreground">
                  Users must fill this field
                </p>
              </div>
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
            </div>

            {hasOptions && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                {field.options.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No options added. Click "Add Option" to add choices.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {field.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => removeOption(optionIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {field.field_type === "number" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Minimum Value</Label>
                  <Input
                    type="number"
                    value={(field.validation_rules.min as number) || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation_rules: {
                          ...field.validation_rules,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="No minimum"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Value</Label>
                  <Input
                    type="number"
                    value={(field.validation_rules.max as number) || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation_rules: {
                          ...field.validation_rules,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="No maximum"
                  />
                </div>
              </div>
            )}

            {["text", "textarea"].includes(field.field_type) && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Minimum Length</Label>
                  <Input
                    type="number"
                    value={(field.validation_rules.minLength as number) || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation_rules: {
                          ...field.validation_rules,
                          minLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="No minimum"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Length</Label>
                  <Input
                    type="number"
                    value={(field.validation_rules.maxLength as number) || ""}
                    onChange={(e) =>
                      onUpdate({
                        validation_rules: {
                          ...field.validation_rules,
                          maxLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="No maximum"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FormFieldEditor;

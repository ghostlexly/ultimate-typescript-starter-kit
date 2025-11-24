"use client";

/**
 * @author GhostLexly <ghostlexly@gmail.com>
 *
 * DataTableFilters Component - Filter dialog for DataTable
 * Provides a dialog for filtering table data
 *
 * Usage Example:
 * ```tsx
 * <DataTableFilters
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   fields={[
 *     { id: "name", label: "Name", type: "text" },
 *     { id: "status", label: "Status", type: "select", options: [...] }
 *   ]}
 *   values={filters}
 *   onValuesChange={setFilters}
 * />
 * ```
 */

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// TYPES
// ============================================================================

export interface FilterField {
  id: string;
  label: string;
  type: "text" | "select" | "number" | "date";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
}

export interface DataTableFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FilterField[];
  values: Record<string, any>;
  onValuesChange: (values: Record<string, any>) => void;
  onApply?: () => void;
  onReset?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataTableFilters({
  open,
  onOpenChange,
  fields,
  values,
  onValuesChange,
  onApply,
  onReset,
}: DataTableFiltersProps) {
  // ========================================
  // 1. State management
  // ========================================
  const [localValues, setLocalValues] = React.useState(values);

  // Sync local values when external values change
  React.useEffect(() => {
    setLocalValues(values);
  }, [values]);

  // ========================================
  // 2. Handlers
  // ========================================
  const handleValueChange = (id: string, value: any) => {
    setLocalValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleApply = () => {
    onValuesChange(localValues);
    onApply?.();
    onOpenChange(false);
  };

  const handleReset = () => {
    // Reset to default values defined in fields
    const resetValues = fields.reduce((acc, field) => {
      acc[field.id] = field.defaultValue ?? "";
      return acc;
    }, {} as Record<string, any>);

    setLocalValues(resetValues);
    onValuesChange(resetValues);
    onReset?.();
    onOpenChange(false);
  };

  // ========================================
  // 3. Render field helper
  // ========================================
  const renderField = (field: FilterField) => {
    switch (field.type) {
      case "text":
        return (
          <Field key={field.id}>
            <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
            <Input
              id={field.id}
              type="text"
              value={localValues[field.id] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
            />
          </Field>
        );

      case "number":
        return (
          <Field key={field.id}>
            <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
            <Input
              id={field.id}
              type="number"
              value={localValues[field.id] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
            />
          </Field>
        );

      case "date":
        return (
          <Field key={field.id}>
            <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
            <Input
              id={field.id}
              type="date"
              value={localValues[field.id] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
            />
          </Field>
        );

      case "select":
        return (
          <Field key={field.id}>
            <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
            <Select
              value={localValues[field.id] ?? ""}
              onValueChange={(value) => handleValueChange(field.id, value)}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your results
          </DialogDescription>
        </DialogHeader>

        {/* Filter Fields */}
        <FieldGroup>{fields.map((field) => renderField(field))}</FieldGroup>

        {/* Action Buttons */}
        <DialogFooter>
          <Field orientation="horizontal">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

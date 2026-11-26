"use client";

import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Search } from "lucide-react";

/** The search box above a data table; the server does the searching. */
export function TableSearch({
  id,
  label,
  onChange,
  placeholder,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <div className="relative min-w-60 flex-1">
      <Label className="sr-only" htmlFor={id}>
        {label}
      </Label>
      <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
      <Input
        className="pl-8"
        id={id}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  );
}

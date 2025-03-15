"use client";

import React, { useId } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe, Languages, Flag } from "lucide-react";

interface LanguageSelectorProps {
  value: 'en' | 'ar' | 'both';
  onChange: (value: 'en' | 'ar' | 'both') => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled = false }: LanguageSelectorProps) {
  const id = useId();
  
  return (
    <RadioGroup 
      className="gap-2 w-full" 
      value={value} 
      onValueChange={(val) => onChange(val as 'en' | 'ar' | 'both')}
      disabled={disabled}
    >
      <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
        <RadioGroupItem
          value="en"
          id={`${id}-en`}
          aria-describedby={`${id}-en-description`}
          className="order-1 after:absolute after:inset-0"
        />
        <div className="flex grow items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Flag className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grow gap-1">
            <Label htmlFor={`${id}-en`}>
              English Only
            </Label>
            <p id={`${id}-en-description`} className="text-xs text-muted-foreground">
              Generate metadata in English language only
            </p>
          </div>
        </div>
      </div>
      
      <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
        <RadioGroupItem
          value="ar"
          id={`${id}-ar`}
          aria-describedby={`${id}-ar-description`}
          className="order-1 after:absolute after:inset-0"
        />
        <div className="flex grow items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Languages className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grow gap-1">
            <Label htmlFor={`${id}-ar`}>
              Arabic Only
            </Label>
            <p id={`${id}-ar-description`} className="text-xs text-muted-foreground">
              Generate metadata in Arabic language only
            </p>
          </div>
        </div>
      </div>
      
      <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
        <RadioGroupItem
          value="both"
          id={`${id}-both`}
          aria-describedby={`${id}-both-description`}
          className="order-1 after:absolute after:inset-0"
        />
        <div className="flex grow items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grow gap-1">
            <Label htmlFor={`${id}-both`}>
              Bilingual
            </Label>
            <p id={`${id}-both-description`} className="text-xs text-muted-foreground">
              Generate metadata in both English and Arabic
            </p>
          </div>
        </div>
      </div>
    </RadioGroup>
  );
} 
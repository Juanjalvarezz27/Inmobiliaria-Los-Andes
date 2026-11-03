"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  dotColor?: string;
  description?: string;
  icon?: ReactNode;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Componente de seleccion personalizada de alta fidelidad para formularios administrativos
export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  disabled = false,
  className = "",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Cierre automatico al hacer click fuera o presionar escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? "z-30" : "z-10"} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm font-semibold flex items-center justify-between text-left transition-all duration-150 shadow-2xs ${
          isOpen
            ? "border-brand-accent ring-2 ring-brand-accent/20"
            : "border-neutral-300 hover:border-neutral-400"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-neutral-100" : "cursor-pointer"}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.dotColor && (
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedOption.dotColor}`}
            />
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-brand-accent">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? "text-text-primary" : "text-neutral-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-brand-accent" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-2xl border border-neutral-200 shadow-xl z-50 p-1.5 space-y-0.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-orange-50/80 text-brand-accent font-bold"
                    : "text-text-primary font-medium hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {option.dotColor && (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${option.dotColor}`}
                    />
                  )}
                  {option.icon && (
                    <span className="shrink-0">{option.icon}</span>
                  )}
                  <div className="truncate">
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-text-secondary font-normal">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-brand-accent shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


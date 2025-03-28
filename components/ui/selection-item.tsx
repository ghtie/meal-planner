"use client"

import { Check } from "lucide-react"

interface SelectionItemProps {
  name: string
  description?: string
  icon?: string
  isSelected: boolean
  onClick: () => void
  isFullWidth?: boolean
  className?: string
  children?: React.ReactNode
}

export function SelectionItem({
  name,
  description,
  icon,
  isSelected,
  onClick,
  isFullWidth,
  className = "",
  children,
}: SelectionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 p-4 rounded-lg border-2 transition-all
        ${isFullWidth ? "col-span-2 md:col-span-3 justify-center" : ""}
        ${
          isSelected
            ? "border-primary bg-primary/5 hover:bg-primary/10"
            : "border-muted hover:border-primary/50"
        }
        ${className}
      `}
    >
      {children ? (
        children
      ) : (
        <>
          {icon && <span className="text-2xl">{icon}</span>}
          <div className="flex flex-col items-start">
            <span className="font-medium">{name}</span>
            {description && <span className="text-xs text-muted-foreground">{description}</span>}
          </div>
        </>
      )}
      {isSelected && <Check className="w-4 h-4 text-primary absolute top-2 right-2" />}
    </button>
  )
} 
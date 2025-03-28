"use client"

import { Check, XCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Types
type CuisineInfo = {
  description: string
  emoji: string
}

// Constants
const NO_PREFERENCE = "No Preference" as const

// Move this to a separate config file in the future
const cuisineData = {
  Italian: {
    description: "Pasta, pizza, and Mediterranean flavors",
    emoji: "🇮🇹",
  },
  Chinese: {
    description: "Stir-fries, dumplings, and rice dishes",
    emoji: "🇨🇳",
  },
  Japanese: {
    description: "Sushi, ramen, and teriyaki",
    emoji: "🇯🇵",
  },
  Mexican: {
    description: "Tacos, enchiladas, and spicy flavors",
    emoji: "🇲🇽",
  },
  Indian: {
    description: "Curries, tandoori, and aromatic spices",
    emoji: "🇮🇳",
  },
  Thai: {
    description: "Curries, pad thai, and fresh herbs",
    emoji: "🇹🇭",
  },
  French: {
    description: "Classic sauces, pastries, and refined dishes",
    emoji: "🇫🇷",
  },
  Greek: {
    description: "Mediterranean dishes with olive oil and herbs",
    emoji: "🇬🇷",
  },
  Spanish: {
    description: "Paella, tapas, and seafood",
    emoji: "🇪🇸",
  },
  Korean: {
    description: "Kimchi, bibimbap, and Korean BBQ",
    emoji: "🇰🇷",
  },
  Vietnamese: {
    description: "Pho, banh mi, and fresh ingredients",
    emoji: "🇻🇳",
  },
  American: {
    description: "Burgers, comfort food, and BBQ",
    emoji: "🇺🇸",
  },
  Mediterranean: {
    description: "Healthy dishes with olive oil and fresh ingredients",
    emoji: "🌊",
  },
  "Middle Eastern": {
    description: "Kebabs, hummus, and aromatic spices",
    emoji: "🥙",
  },
  Turkish: {
    description: "Kebabs, pide, and mezze",
    emoji: "🇹🇷",
  },
} as const

type Cuisine = keyof typeof cuisineData
type SelectableCuisine = Cuisine | typeof NO_PREFERENCE

interface CuisineSelectorProps {
  selected: Cuisine[]
  onSelectionChange: (cuisines: Cuisine[]) => void
  maxSelections?: number
}

// Component for individual cuisine button
function CuisineButton({ 
  cuisine, 
  info, 
  isSelected, 
  onSelect 
}: { 
  cuisine: Cuisine
  info: CuisineInfo
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "relative flex items-center gap-2 p-4 rounded-lg border-2 transition-all w-full",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "hover:border-primary/50 hover:bg-muted/5",
            isSelected
              ? "border-primary bg-primary/5"
              : "border-muted"
          )}
          aria-pressed={isSelected}
        >
          <span className="text-2xl" aria-hidden="true">{info.emoji}</span>
          <span className="font-medium">{cuisine}</span>
          {isSelected && (
            <Check 
              className="w-4 h-4 text-primary absolute top-2 right-2" 
              aria-hidden="true"
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{info.description}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function CuisineSelector({ 
  selected, 
  onSelectionChange, 
  maxSelections = 5 // Add reasonable default limit
}: CuisineSelectorProps) {
  const handleCuisineSelection = (cuisine: SelectableCuisine) => {
    if (cuisine === NO_PREFERENCE) {
      onSelectionChange([])
      return
    }

    const isSelected = selected.includes(cuisine)
    if (isSelected) {
      onSelectionChange(selected.filter((c) => c !== cuisine))
      return
    }

    // Prevent selecting more than maxSelections
    if (selected.length >= maxSelections) {
      return
    }

    // Since NO_PREFERENCE is a different type than cuisine, we don't need to filter it
    onSelectionChange([...selected, cuisine])
  }

  const noPreferenceSelected = selected.length === 0

  return (
    <TooltipProvider>
      <div 
        className="space-y-4" 
        role="region" 
        aria-label="Cuisine Selection"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleCuisineSelection(NO_PREFERENCE)}
            className={cn(
              "relative flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all col-span-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              noPreferenceSelected
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50 bg-muted/30 hover:bg-muted/50"
            )}
            aria-pressed={noPreferenceSelected}
          >
            <XCircle 
              className="w-5 h-5 mr-2 text-muted-foreground" 
              aria-hidden="true" 
            />
            <span className="font-medium">Open to All Cuisines</span>
            {noPreferenceSelected && (
              <Check 
                className="w-4 h-4 text-primary absolute top-2 right-2" 
                aria-hidden="true"
              />
            )}
          </button>

          {(Object.entries(cuisineData) as [Cuisine, CuisineInfo][]).map(([cuisine, info]) => (
            <CuisineButton
              key={cuisine}
              cuisine={cuisine}
              info={info}
              isSelected={selected.includes(cuisine)}
              onSelect={() => handleCuisineSelection(cuisine)}
            />
          ))}
        </div>

        <div 
          className="text-sm text-muted-foreground space-y-1"
          aria-live="polite"
        >
          <p>
            {noPreferenceSelected 
              ? "No specific cuisine preference selected" 
              : `Selected cuisines: ${selected.join(", ")}`
            }
          </p>
          {!noPreferenceSelected && (
            <p className="text-xs">
              You can select up to {maxSelections} cuisines
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}


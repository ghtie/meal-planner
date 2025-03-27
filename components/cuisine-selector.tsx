import { Check, XCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Top 15 most popular cuisines with their descriptions and emojis
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
}

interface CuisineSelectorProps {
  selected: string[]
  onSelectionChange: (cuisines: string[]) => void
}

export function CuisineSelector({ selected, onSelectionChange }: CuisineSelectorProps) {
  const handleCuisineSelection = (cuisine: string) => {
    if (cuisine === "No Preference") {
      onSelectionChange([]) // Clear all selections
    } else {
      onSelectionChange(
        selected.includes(cuisine)
          ? selected.filter((c) => c !== cuisine)
          : [...selected.filter((c) => c !== "No Preference"), cuisine],
      )
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleCuisineSelection("No Preference")}
            className={`relative flex items-center gap-2 p-4 rounded-lg border-2 transition-all
              col-span-full justify-center
              ${
                selected.length === 0
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50 bg-muted/30 hover:bg-muted/50"
              }
            `}
          >
            <XCircle className="w-5 h-5 mr-2 text-muted-foreground" />
            <span className="font-medium">Open to All Cuisines</span>
            {selected.length === 0 && <Check className="w-4 h-4 text-primary absolute top-2 right-2" />}
          </button>

          {Object.entries(cuisineData).map(([cuisine, data]) => (
            <Tooltip key={cuisine}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleCuisineSelection(cuisine)}
                  className={`relative flex items-center gap-2 p-4 rounded-lg border-2 transition-all w-full
                    ${
                      selected.includes(cuisine)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }
                  `}
                >
                  <span className="text-2xl">{data.emoji}</span>
                  <span className="font-medium">{cuisine}</span>
                  {selected.includes(cuisine) && <Check className="w-4 h-4 text-primary absolute top-2 right-2" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{data.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {selected.length === 0 ? "No specific cuisine preference selected" : `Selected: ${selected.join(", ")}`}
        </div>
      </div>
    </TooltipProvider>
  )
}


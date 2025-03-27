import { Check, XCircle } from "lucide-react"

const dietaryPreferences = [
  {
    name: "None",
    description: "No specific dietary preferences",
    icon: "✓",
  },
  {
    name: "Vegetarian",
    description: "No meat, fish, or poultry",
    icon: "🥗",
  },
  {
    name: "Vegan",
    description: "No animal products",
    icon: "🌱",
  },
  {
    name: "Pescatarian",
    description: "Vegetarian plus seafood",
    icon: "🐟",
  },
  {
    name: "Keto",
    description: "High-fat, very low-carb",
    icon: "🥑",
  },
  {
    name: "Low-Carb",
    description: "Reduced carbohydrate intake",
    icon: "🥬",
  },
  {
    name: "Paleo",
    description: "Based on whole foods",
    icon: "🍖",
  },
  {
    name: "Dairy-Free",
    description: "No dairy products",
    icon: "🥛",
  },
  {
    name: "Halal",
    description: "Meat and ingredients prepared according to halal guidelines",
    icon: "🥩",
  },
]

interface DietaryPreferencesProps {
  selected: string[]
  onSelectionChange: (selected: string[]) => void
}

export function DietaryPreferences({ selected, onSelectionChange }: DietaryPreferencesProps) {
  const handleSelection = (preferenceName: string) => {
    if (preferenceName === "None") {
      onSelectionChange([]) // Clear all selections
    } else {
      onSelectionChange(
        selected.includes(preferenceName)
          ? selected.filter((p) => p !== preferenceName)
          : [...selected.filter((p) => p !== "None"), preferenceName],
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {dietaryPreferences.map((diet) => (
          <button
            key={diet.name}
            type="button"
            onClick={() => handleSelection(diet.name)}
            className={`relative flex items-center gap-2 p-4 rounded-lg border-2 transition-all
              ${diet.name === "None" ? "col-span-2 md:col-span-3 justify-center" : ""}
              ${
                selected.includes(diet.name) || (diet.name === "None" && selected.length === 0)
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }
              ${diet.name === "None" ? "bg-muted/30 hover:bg-muted/50" : ""}
            `}
          >
            {diet.name === "None" ? (
              <XCircle className="w-5 h-5 mr-2 text-muted-foreground" />
            ) : (
              <span className="text-2xl">{diet.icon}</span>
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium">{diet.name}</span>
              {diet.name !== "None" && <span className="text-xs text-muted-foreground">{diet.description}</span>}
            </div>
            {(selected.includes(diet.name) || (diet.name === "None" && selected.length === 0)) && (
              <Check className="w-4 h-4 text-primary absolute top-2 right-2" />
            )}
          </button>
        ))}
      </div>
      {selected.length > 0 && <div className="text-sm text-muted-foreground">Selected: {selected.join(", ")}</div>}
    </div>
  )
}


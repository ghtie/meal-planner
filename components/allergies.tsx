import { Check, XCircle } from "lucide-react"

const allergyOptions = [
  {
    name: "None",
    description: "No food allergies",
    icon: "✓",
  },
  {
    name: "Milk",
    description: "Dairy and lactose products",
    icon: "🥛",
  },
  {
    name: "Eggs",
    description: "Eggs and egg products",
    icon: "🥚",
  },
  {
    name: "Peanuts",
    description: "Peanuts and peanut derivatives",
    icon: "🥜",
  },
  {
    name: "Tree Nuts",
    description: "Almonds, cashews, walnuts, etc.",
    icon: "🌰",
  },
  {
    name: "Soy",
    description: "Soybeans and soy products",
    icon: "🫘",
  },
  {
    name: "Wheat",
    description: "Wheat and gluten-containing grains",
    icon: "🌾",
  },
  {
    name: "Fish",
    description: "Fish and fish products",
    icon: "🐟",
  },
  {
    name: "Shellfish",
    description: "Shrimp, crab, lobster, etc.",
    icon: "🦐",
  },
  {
    name: "Sesame",
    description: "Sesame seeds and oil",
    icon: "🫘",
  },
  {
    name: "Gluten",
    description: "All gluten-containing grains",
    icon: "🌾",
  },
]

interface AllergiesProps {
  selected: string[]
  onSelectionChange: (selected: string[]) => void
}

export function Allergies({ selected, onSelectionChange }: AllergiesProps) {
  const handleSelection = (allergyName: string) => {
    if (allergyName === "None") {
      onSelectionChange([]) // Clear all selections
    } else {
      onSelectionChange(
        selected.includes(allergyName)
          ? selected.filter((a) => a !== allergyName)
          : [...selected.filter((a) => a !== "None"), allergyName],
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {allergyOptions.map((allergy) => (
          <button
            key={allergy.name}
            type="button"
            onClick={() => handleSelection(allergy.name)}
            aria-pressed={selected.includes(allergy.name) || (allergy.name === "None" && selected.length === 0)}
            aria-label={`Select ${allergy.name}${allergy.description ? `: ${allergy.description}` : ""}`}
            className={`relative flex items-center gap-2 p-4 rounded-lg border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${allergy.name === "None" ? "col-span-2 md:col-span-3 justify-center" : ""}
              ${
                selected.includes(allergy.name) || (allergy.name === "None" && selected.length === 0)
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }
              ${allergy.name === "None" ? "bg-muted/30 hover:bg-muted/50" : ""}
            `}
          >
            {allergy.name === "None" ? (
              <XCircle className="w-5 h-5 mr-2 text-muted-foreground" />
            ) : (
              <span className="text-2xl">{allergy.icon}</span>
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium">{allergy.name}</span>
              {allergy.name !== "None" && <span className="text-xs text-muted-foreground">{allergy.description}</span>}
            </div>
            {(selected.includes(allergy.name) || (allergy.name === "None" && selected.length === 0)) && (
              <Check className="w-4 h-4 text-primary absolute top-2 right-2" />
            )}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="text-sm text-muted-foreground">Selected allergies: {selected.join(", ")}</div>
      )}
    </div>
  )
}


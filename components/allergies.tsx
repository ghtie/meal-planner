import { XCircle } from "lucide-react"
import { SelectionItem } from "@/components/ui/selection-item"

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
    icon: "🌱",
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
          <SelectionItem
            key={allergy.name}
            name={allergy.name}
            description={allergy.description}
            icon={allergy.icon}
            isSelected={selected.includes(allergy.name) || (allergy.name === "None" && selected.length === 0)}
            onClick={() => handleSelection(allergy.name)}
            isFullWidth={allergy.name === "None"}
            className={allergy.name === "None" ? "bg-muted/30 hover:bg-muted/50" : ""}
          >
            {allergy.name === "None" && (
              <>
                <XCircle className="w-5 h-5 mr-2 text-muted-foreground" />
                <span className="font-medium">{allergy.name}</span>
              </>
            )}
          </SelectionItem>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="text-sm text-muted-foreground">Selected allergies: {selected.join(", ")}</div>
      )}
    </div>
  )
}


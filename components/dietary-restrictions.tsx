import { Check } from "lucide-react"
import { Label } from "@/components/ui/label"

// Top 10 most common food allergies according to medical sources
const allergyOptions = ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Soy", "Wheat", "Fish", "Shellfish", "Sesame", "Gluten"]

interface DietaryRestrictionsProps {
  selected: string[]
  onSelectionChange: (selected: string[]) => void
}

export function DietaryRestrictions({ selected, onSelectionChange }: DietaryRestrictionsProps) {
  return (
    <div className="space-y-4">
      {allergyOptions.map((allergy) => (
        <Label
          key={allergy}
          className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-accent [&:has(:checked)]:bg-accent"
        >
          <input
            type="checkbox"
            className="sr-only peer"
            checked={selected.includes(allergy)}
            onChange={(e) => {
              if (e.target.checked) {
                onSelectionChange([...selected, allergy])
              } else {
                onSelectionChange(selected.filter((a) => a !== allergy))
              }
            }}
          />
          <Check className="w-4 h-4 mr-2 opacity-0 peer-checked:opacity-100" />
          {allergy}
        </Label>
      ))}
    </div>
  )
}


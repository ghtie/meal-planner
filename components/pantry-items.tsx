"use client"

import { useState } from "react"
import { Check, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const commonPantryItems = {
  Spices: [
    "Salt",
    "Black Pepper",
    "Garlic Powder",
    "Onion Powder",
    "Cumin",
    "Coriander",
    "Turmeric",
    "Ginger Powder",
    "Cinnamon",
    "Paprika",
    "Chili Powder",
    "Oregano",
    "Basil",
    "Thyme",
    "Rosemary",
    "Bay Leaves",
    "Cardamom",
    "Nutmeg",
    "Cloves",
    "Allspice",
  ],
  Sauces: [
    "Soy Sauce",
    "Fish Sauce",
    "Oyster Sauce",
    "Worcestershire Sauce",
    "Hot Sauce",
    "BBQ Sauce",
    "Teriyaki Sauce",
    "Hoisin Sauce",
    "Sriracha",
    "Sesame Oil",
    "Olive Oil",
    "Vegetable Oil",
    "Balsamic Vinegar",
    "Rice Vinegar",
    "Apple Cider Vinegar",
  ],
  Other: [
    "Honey",
    "Maple Syrup",
    "Brown Sugar",
    "White Sugar",
    "Flour",
    "Cornstarch",
    "Baking Powder",
    "Baking Soda",
    "Vanilla Extract",
    "Coconut Milk",
    "Canned Tomatoes",
    "Tomato Paste",
    "Beans",
    "Rice",
    "Pasta",
  ],
}

interface PantryItemsProps {
  selected: string[]
  onSelectionChange: (selected: string[]) => void
}

export function PantryItems({ selected, onSelectionChange }: PantryItemsProps) {
  const [customItem, setCustomItem] = useState("")

  const handleItemSelection = (item: string) => {
    if (selected.includes(item)) {
      onSelectionChange(selected.filter((i) => i !== item))
    } else {
      onSelectionChange([...selected, item])
    }
  }

  const handleAddCustomItem = () => {
    if (customItem.trim() && !selected.includes(customItem.trim())) {
      onSelectionChange([...selected, customItem.trim()])
      setCustomItem("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(commonPantryItems).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-medium mb-2">{category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleItemSelection(item)}
                  className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors
                    ${
                      selected.includes(item)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }
                  `}
                >
                  {selected.includes(item) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Add Custom Item</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom pantry item"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddCustomItem()
              }
            }}
          />
          <Button type="button" onClick={handleAddCustomItem}>
            Add
          </Button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Selected Items</h3>
          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <div
                key={item}
                className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleItemSelection(item)}
                  className="hover:text-primary/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
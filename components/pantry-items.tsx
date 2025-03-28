"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectionItem } from "@/components/ui/selection-item"
import { Badge } from "@/components/ui/badge"
import { PantryCategory, commonPantryItems, type PantryItem } from "@/lib/pantry-items"

interface PantryItemsProps {
  selected: string[]
  onSelectionChange: (selected: string[]) => void
}

export function PantryItems({ selected, onSelectionChange }: PantryItemsProps) {
  const [inputValue, setInputValue] = useState("")

  // Helper function to get all common pantry items
  const getAllCommonPantryItems = () => {
    return Object.values(PantryCategory).flatMap(category => 
      commonPantryItems[category].map(item => item.name)
    )
  }

  // Get custom items (items that aren't in the common pantry items list)
  const getCustomItems = () => {
    const commonItems = getAllCommonPantryItems()
    return selected.filter(item => !commonItems.includes(item))
  }

  const handleSelectAll = (category: PantryCategory) => {
    const allItemsInCategory = commonPantryItems[category].map(item => item.name)
    const newSelected = [...selected]
    
    // Add all items from the category that aren't already selected
    allItemsInCategory.forEach(item => {
      if (!newSelected.includes(item)) {
        newSelected.push(item)
      }
    })
    
    onSelectionChange(newSelected)
  }

  const handleDeselectAll = (category: PantryCategory) => {
    const allItemsInCategory = commonPantryItems[category].map(item => item.name)
    const newSelected = selected.filter(item => !allItemsInCategory.includes(item))
    onSelectionChange(newSelected)
  }

  const handleAddItem = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault()
    const trimmedValue = inputValue.trim()
    
    if (!trimmedValue) return
    
    // Prevent duplicates (case-insensitive)
    const normalizedValue = trimmedValue.toLowerCase()
    const isExisting = selected.some(item => item.toLowerCase() === normalizedValue)
    
    if (!isExisting) {
      onSelectionChange([...selected, trimmedValue])
      setInputValue("")
    }
  }

  const handleRemoveItem = (item: string) => {
    onSelectionChange(selected.filter((i) => i !== item))
  }

  const customItems = getCustomItems()

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Add custom pantry item..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddItem(e)
                }
              }}
              className="pr-20"
              aria-label="Custom pantry item input"
            />
            <Button 
              size="sm"
              onClick={(e) => handleAddItem(e)}
              type="button"
              className="absolute right-1 top-1 h-7"
              disabled={!inputValue.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {customItems.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 border-b">
            {customItems.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="inline-flex items-center gap-1 text-sm"
              >
                {item}
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="ml-1 p-0.5 hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {Object.values(PantryCategory).map((category) => (
          <section key={category} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">{category}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    handleSelectAll(category)
                  }}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeselectAll(category)
                  }}
                >
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonPantryItems[category].map((item) => (
                <SelectionItem
                  key={item.name}
                  name={item.name}
                  isSelected={selected.includes(item.name)}
                  onClick={() => {
                    if (selected.includes(item.name)) {
                      handleRemoveItem(item.name)
                    } else {
                      onSelectionChange([...selected, item.name])
                    }
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
} 
"use client"

import { useState } from "react"
import { Share2, FileDown, Copy, ShoppingBasket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import type { Recipe, GroceryList, GroceryItem } from "@/lib/recipe-generator"

interface GroceryListProps {
  recipes: Recipe[]
  pantryItems?: string[]
}

// Helper function to normalize ingredient names
function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes
    .replace(/\s*\[[^\]]*\]/g, '') // Remove bracketed notes
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/s$/, '') // Remove trailing 's' for plurals
    .replace(/^(fresh|dried|ground|chopped|diced|minced|sliced|whole|organic|raw)\s+/, '') // Remove common prefixes
    .replace(/,.*$/, '') // Remove everything after a comma
    .trim()
}

// Helper function to standardize units
function standardizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'g': 'grams',
    'gram': 'grams',
    'grams': 'grams',
    'kg': 'kilograms',
    'kgs': 'kilograms',
    'kilogram': 'kilograms',
    'oz': 'ounces',
    'ozs': 'ounces',
    'ounce': 'ounces',
    'lb': 'pounds',
    'lbs': 'pounds',
    'pound': 'pounds',
    'ml': 'milliliters',
    'milliliter': 'milliliters',
    'l': 'liters',
    'liter': 'liters',
    'cup': 'cups',
    'tbsp': 'tablespoons',
    'tbs': 'tablespoons',
    'tablespoon': 'tablespoons',
    'tsp': 'teaspoons',
    'teaspoon': 'teaspoons',
    'piece': '',
    'pieces': '',
    'whole': '',
    'unit': '',
    'units': '',
  }
  
  unit = unit.toLowerCase().trim()
  return unitMap[unit] || unit
}

// Helper function to parse amount and unit
function parseAmount(amount: string): { value: number; unit: string } {
  const match = amount.match(/^([\d.\/]+)\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)?/)
  if (!match) return { value: 1, unit: '' }
  
  const numStr = match[1]
  const unit = standardizeUnit(match[2] || '')
  
  // Handle fractions
  let value: number
  if (numStr.includes('/')) {
    const [numerator, denominator] = numStr.split('/')
    value = Number(numerator) / Number(denominator)
  } else {
    value = Number(numStr)
  }
    
  return { value: isNaN(value) ? 1 : value, unit }
}

// Helper function to combine amounts
function combineAmounts(items: GroceryItem[]): GroceryItem {
  const firstItem = items[0]
  
  let totalValue = 0
  let commonUnit = ''
  
  // Find the most common unit
  const unitCounts = items.reduce((acc, item) => {
    const { unit } = parseAmount(item.amount)
    const standardUnit = standardizeUnit(unit)
    acc[standardUnit] = (acc[standardUnit] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  commonUnit = Object.entries(unitCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || ''

  // Sum up values with matching units
  items.forEach(item => {
    const { value, unit } = parseAmount(item.amount)
    const standardUnit = standardizeUnit(unit)
    if (standardUnit === commonUnit || (!standardUnit && !commonUnit)) {
      totalValue += value
    }
  })

  // Format the combined amount
  let combinedAmount: string
  if (commonUnit) {
    // Round to 2 decimal places and remove trailing zeros
    const formattedValue = Number(totalValue.toFixed(2)).toString()
    combinedAmount = `${formattedValue} ${commonUnit}`
  } else {
    combinedAmount = Number(totalValue.toFixed(2)).toString()
  }

  // Clean up the item name
  const cleanedItemName = firstItem.item
    .replace(/^(fresh|dried|ground|chopped|diced|minced|sliced|whole|organic|raw)\s+/, '')
    .replace(/,.*$/, '')
    .trim()

  return {
    amount: combinedAmount.trim(),
    unit: '',
    item: cleanedItemName
  }
}

export function GroceryList({ recipes, pantryItems = [] }: GroceryListProps) {
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  // Combine grocery lists from all recipes and deduplicate items
  const combinedGroceryList = recipes.reduce((acc, recipe) => {
    if (!recipe.groceryList) return acc

    Object.entries(recipe.groceryList).forEach(([category, items]) => {
      if (!acc[category]) {
        acc[category] = []
      }

      // Group items by normalized name
      const itemGroups = new Map<string, GroceryItem[]>()
      items.forEach(item => {
        const normalizedName = normalizeItemName(item.item)
        if (!itemGroups.has(normalizedName)) {
          itemGroups.set(normalizedName, [])
        }
        itemGroups.get(normalizedName)?.push(item)
      })

      // Combine amounts for each group and add to the category
      itemGroups.forEach(groupItems => {
        acc[category].push(combineAmounts(groupItems))
      })
    })

    return acc
  }, {} as GroceryList)

  // Format the grocery list for sharing
  const formatGroceryList = (format: "text" | "html" = "text"): string => {
    const lines: string[] = ["Grocery List:"]

    Object.entries(combinedGroceryList).forEach(([category, items]) => {
      if (format === "html") {
        lines.push(`\n<strong>${category}</strong>`)
      } else {
        lines.push(`\n${category}:`)
      }

      items.forEach(({ amount, item }) => {
        if (format === "html") {
          lines.push(`• ${amount} ${item}`)
        } else {
          lines.push(`- ${amount} ${item}`)
        }
      })
    })

    return lines.join("\n")
  }

  const handleShare = async (method: "sms" | "copy") => {
    setIsSharing(true)
    try {
      switch (method) {
        case "sms":
          // Use Web Share API if available
          if (navigator.share) {
            await navigator.share({
              title: "Grocery List",
              text: formatGroceryList("text"),
            })
          } else {
            // Fallback for SMS using tel: protocol
            window.location.href = `sms:?body=${encodeURIComponent(formatGroceryList("text"))}`
          }
          break

        case "copy":
          // Copy to clipboard
          await navigator.clipboard.writeText(formatGroceryList("text"))
          toast({
            title: "Copied to clipboard",
            description: "Your grocery list has been copied to the clipboard.",
          })
          break
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        title: "Error sharing list",
        description: "There was an error sharing your grocery list. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  // Don't show the component if there are no items
  if (Object.keys(combinedGroceryList).length === 0) {
    return null
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl">Grocery List</CardTitle>
          <CardDescription>Everything you need for your meal plan</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={isSharing}>
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share grocery list</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => handleShare("sms")} className="text-sm">
              <FileDown className="mr-2 h-4 w-4" />
              <span>Export To...</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare("copy")} className="text-sm">
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy to Clipboard</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(combinedGroceryList).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold mb-2">{category}</h3>
              <ul className="space-y-1">
                {items.map((item, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <ShoppingBasket className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>
                      {item.amount} {item.item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


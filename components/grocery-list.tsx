"use client"

import { ArrowRight, Mail, MessageSquare, Share2, ShoppingBasket } from "lucide-react"
import { useState } from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Recipe } from "@/lib/recipe-generator"

interface GroceryListProps {
  recipes: Recipe[]
  pantryItems: string[]
}

export function GroceryList({ recipes = [], pantryItems = [] }: GroceryListProps) {
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  // Combine all ingredients from all recipes
  const allIngredients = recipes?.flatMap((recipe) =>
    recipe.ingredients.map((ing) => ({
      item: ing.item.toLowerCase(),
      amount: ing.amount,
    }))
  ) || []

  // Helper function to normalize ingredient names
  const normalizeIngredientName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes
      .replace(/\s*\[[^\]]*\]/g, '') // Remove bracketed notes
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/s$/, '') // Remove trailing 's' for plurals
      .trim()
  }

  // Helper function to parse amount and unit
  const parseAmount = (amount: string) => {
    const match = amount.match(/^([\d.\/]+)\s*([a-zA-Z]+)?/)
    if (!match) return { value: 1, unit: '' }
    
    const numStr = match[1]
    const unit = match[2] || ''
    
    // Handle fractions
    const value = numStr.includes('/')
      ? numStr.split('/').reduce((a, b) => Number(a) / Number(b))
      : Number(numStr)
      
    return { value: isNaN(value) ? 1 : value, unit }
  }

  // Combine duplicate ingredients and sum their amounts
  const combinedIngredients = allIngredients.reduce((acc, curr) => {
    const normalizedName = normalizeIngredientName(curr.item)
    const existingItem = acc.find(item => normalizeIngredientName(item.item) === normalizedName)

    if (existingItem) {
      const current = parseAmount(curr.amount)
      const existing = parseAmount(existingItem.amount)

      if (current.unit === existing.unit) {
        // Same units - add values
        const totalValue = current.value + existing.value
        existingItem.amount = `${totalValue} ${current.unit}`.trim()
      } else if (!current.unit && !existing.unit) {
        // No units - add values
        const totalValue = current.value + existing.value
        existingItem.amount = `${totalValue}`
      } else {
        // Different units or can't combine - list both
        existingItem.amount = `${existingItem.amount}, ${curr.amount}`
      }
    } else {
      acc.push({ ...curr })
    }
    return acc
  }, [] as { item: string; amount: string }[])

  // Filter out pantry items
  const groceryItems = combinedIngredients
    .filter((ing) => !pantryItems.some(item => 
      normalizeIngredientName(ing.item).includes(normalizeIngredientName(item))
    ))
    .sort((a, b) => a.item.localeCompare(b.item))

  const formatGroceryList = (format: "text" | "html") => {
    let list = "Grocery List:\n\n"
    if (format === "html") {
      list = "<h2>Grocery List</h2>"
    }

    groceryItems.forEach((item) => {
      if (format === "text") {
        list += `${item.amount} ${item.item}\n`
      } else {
        list += `<li>${item.amount} ${item.item}</li>`
      }
    })

    return list
  }

  const handleShare = async (method: "email" | "sms" | "notes" | "copy") => {
    setIsSharing(true)
    try {
      switch (method) {
        case "email":
          // Create mailto link with formatted list
          window.location.href = `mailto:?subject=My%20Grocery%20List&body=${encodeURIComponent(formatGroceryList("text"))}`
          break

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

        case "notes":
          // Deep link to Apple Notes
          // Note: This only works on iOS devices
          const notesList = formatGroceryList("text")
          window.location.href = `mobilenotes://x-callback-url/create?text=${encodeURIComponent(notesList)}`
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

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="w-4 h-4 md:w-5 md:h-5" />
            <CardTitle className="text-base md:text-lg">Grocery List</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={isSharing}>
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => handleShare("email")} className="text-sm">
                <Mail className="mr-2 h-4 w-4" />
                <span>Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("sms")} className="text-sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Message</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("notes")} className="text-sm">
                <ShoppingBasket className="mr-2 h-4 w-4" />
                <span>Apple Notes</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("copy")} className="text-sm">
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>Copy to Clipboard</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-sm">Everything you need for your selected meals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Grocery List</h3>
          <ul className="space-y-2">
            {groceryItems.map((ing, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="font-medium">{ing.amount}</span>
                <span>{ing.item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}


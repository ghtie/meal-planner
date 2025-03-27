"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Clock, UtensilsCrossed } from "lucide-react"

interface RecipeModalProps {
  recipe: {
    name: string
    ingredients: { item: string; amount: string }[]
    prepTime: string
    cookTime: string
    steps: string[]
  }
  isOpen: boolean
  onClose: () => void
}

export function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe.name}</DialogTitle>
          <DialogDescription asChild>
            <span className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
              <span>Prep: {recipe.prepTime} mins</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Cook: {recipe.cookTime} mins</span>
            </span>
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">
                  {ingredient.amount} {ingredient.item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Steps</h3>
            <ol className="list-decimal pl-5 space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={index} className="text-sm">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


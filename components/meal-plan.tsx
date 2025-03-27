"use client"

import { useEffect, useState } from "react"
import type { WeeklyMealPlan } from "@/lib/recipe-generator"
import { generateMealPlan } from "@/lib/recipe-generator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RotateCcw, UtensilsCrossed, Clock } from "lucide-react"
import { RecipeModal } from "@/components/recipe-modal"
import { GroceryList } from "@/components/grocery-list"

interface MealPlanProps {
  preferences: {
    cuisines: string[]
    prepTime: string
    cookTime: string
    allergies: string[]
    dietaryPreferences: string[]
    mealSelection: {
      [key: string]: {
        breakfast: boolean
        lunch: boolean
        dinner: boolean
      }
    }
    pantryItems: string[]
  }
  onRestart: () => void
}

export function MealPlan({ preferences, onRestart }: MealPlanProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMealPlan() {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Generating meal plan with preferences:", preferences)
        const plan = await generateMealPlan(preferences)
        console.log("Generated meal plan:", plan)
        setMealPlan(plan)
      } catch (err) {
        console.error("Error in fetchMealPlan:", err)
        setError(err instanceof Error ? err.message : "Failed to generate meal plan. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMealPlan()
  }, [preferences])

  // Get unique ingredients across selected meals
  const groceryList = mealPlan
    ? Object.values(mealPlan)
        .flatMap((day) => Object.values(day))
        .filter(Boolean)
        .flatMap((meal) => meal?.ingredients ?? [])
        .filter(ing => !preferences.pantryItems.includes(ing.item))
        .reduce((acc, ing) => {
          // Normalize ingredient names by removing common variations
          const normalizedName = ing.item
            .toLowerCase()
            .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes
            .replace(/\s*\[[^\]]*\]/g, '') // Remove bracketed notes
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

          // Find existing ingredient
          const existing = acc.find((item: { item: string; amount: string }) => 
            item.item.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedName
          );

          if (existing) {
            // Combine amounts
            const existingAmount = parseFloat(existing.amount);
            const newAmount = parseFloat(ing.amount);
            if (!isNaN(existingAmount) && !isNaN(newAmount)) {
              existing.amount = `${existingAmount + newAmount} ${ing.amount.split(' ').slice(1).join(' ')}`;
            }
          } else {
            acc.push({ ...ing, item: normalizedName });
          }
          return acc;
        }, [] as { item: string; amount: string }[])
        .sort((a: { item: string; amount: string }, b: { item: string; amount: string }) => a.item.localeCompare(b.item))
    : [];

  // Group grocery list by category
  const groceryCategories = {
    Produce: groceryList.filter((item: { item: string; amount: string }) => ["tomatoes", "cucumber", "spinach", "onion", "basil", "garlic", "lemon", "lime", "ginger", "mushrooms", "bell peppers", "carrots", "celery", "lettuce", "avocado"].includes(item.item.toLowerCase())),
    Protein: groceryList.filter((item: { item: string; amount: string }) => ["tofu", "eggs", "chickpeas", "chicken", "fish", "beef", "pork", "shrimp", "lentils", "beans", "tempeh", "seitan"].includes(item.item.toLowerCase())),
    Dairy: groceryList.filter((item: { item: string; amount: string }) => ["cheese", "yogurt", "mozzarella", "feta", "milk", "cream", "butter", "sour cream", "cottage cheese"].includes(item.item.toLowerCase())),
    Other: groceryList.filter(
      (item: { item: string; amount: string }) =>
        ![
          "tomatoes", "cucumber", "spinach", "onion", "basil", "garlic", "lemon", "lime", "ginger", "mushrooms", "bell peppers", "carrots", "celery", "lettuce", "avocado",
          "tofu", "eggs", "chickpeas", "chicken", "fish", "beef", "pork", "shrimp", "lentils", "beans", "tempeh", "seitan",
          "cheese", "yogurt", "mozzarella", "feta", "milk", "cream", "butter", "sour cream", "cottage cheese"
        ].includes(item.item.toLowerCase()),
    ),
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={onRestart}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Weekly Meal Plan</h1>
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Start New Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Meals</CardTitle>
          <CardDescription>Based on your preferences and dietary restrictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            // Loading state
            <div className="space-y-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-24 mb-4" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-[150px]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            mealPlan &&
            Object.entries(mealPlan).map(([day, meals]) => {
              // Only show days that have meals
              const hasMeals = Object.values(meals).some(Boolean)
              if (!hasMeals) return null

              return (
                <div key={day}>
                  <h3 className="font-semibold capitalize mb-4">{day}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(meals).map(([mealType, meal]) => {
                      if (!meal) return null

                      return (
                        <Card
                          key={mealType}
                          className="cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => setSelectedRecipe(meal)}
                        >
                          <CardHeader className="p-4 md:p-6">
                            <CardTitle className="text-base md:text-lg capitalize">{mealType}</CardTitle>
                            <CardDescription className="text-sm">{meal.name}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 md:p-6 pt-0">
                            <div className="text-xs md:text-sm space-y-2">
                              <div className="flex items-center gap-2">
                                <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                                <div className="text-muted-foreground">Prep:</div>
                                <div>{meal.prepTime} mins</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <div className="text-muted-foreground">Cook:</div>
                                <div>{meal.cookTime} mins</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  <Separator className="my-6" />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {!isLoading && mealPlan && (
        <GroceryList 
          recipes={Object.values(mealPlan)
            .flatMap(day => Object.values(day))
            .filter(Boolean)}
          pantryItems={preferences.pantryItems}
        />
      )}

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} isOpen={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  )
}


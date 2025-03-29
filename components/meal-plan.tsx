"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { WeeklyMealPlan } from "@/lib/recipe-generator"
import { generateMealPlan } from "@/lib/recipe-generator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RotateCcw, UtensilsCrossed, Clock, Share2, FileDown, Copy } from "lucide-react"
import { RecipeModal } from "@/components/recipe-modal"
import { GroceryList } from "@/components/grocery-list"
import { useToast } from "@/components/ui/use-toast"
import type { HouseholdSize } from "@/components/household-size-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    familySize: HouseholdSize
  }
  onRestart: () => void
}

export function MealPlan({ preferences, onRestart }: MealPlanProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatingRecipes, setGeneratingRecipes] = useState<{ day: string; mealType: string }[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchMealPlan() {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Generating meal plan with preferences:", preferences)
        
        // Initialize generating recipes state
        const recipesToGenerate: { day: string; mealType: string }[] = []
        Object.entries(preferences.mealSelection).forEach(([day, meals]) => {
          Object.entries(meals).forEach(([mealType, isSelected]) => {
            if (isSelected) {
              recipesToGenerate.push({ day, mealType })
            }
          })
        })
        setGeneratingRecipes(recipesToGenerate)

        const { familySize, ...otherPreferences } = preferences
        const plan = await generateMealPlan({
          ...otherPreferences,
          familySize,
          onRecipeGenerated: (day, mealType) => {
            setGeneratingRecipes(prev => prev.filter(recipe => 
              !(recipe.day === day && recipe.mealType === mealType)
            ))
          }
        })
        console.log("Generated meal plan:", plan)
        setMealPlan(plan)
      } catch (err) {
        console.error("Error in fetchMealPlan:", err)
        setError(err instanceof Error ? err.message : "Failed to generate meal plan. Please try again.")
      } finally {
        setIsLoading(false)
        setGeneratingRecipes([])
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

  const formatMealPlan = (format: "text" | "html") => {
    if (!mealPlan) return ""

    let output = "Weekly Meal Plan:\n\n"
    if (format === "html") {
      output = "<h2>Weekly Meal Plan</h2>"
    }

    Object.entries(mealPlan).forEach(([day, meals]) => {
      const hasMeals = Object.values(meals).some(Boolean)
      if (!hasMeals) return

      if (format === "text") {
        output += `${day.toUpperCase()}\n${"=".repeat(day.length)}\n\n`
      } else {
        output += `<h3>${day}</h3>`
      }

      Object.entries(meals).forEach(([mealType, meal]) => {
        if (!meal) return

        if (format === "text") {
          output += `${mealType.toUpperCase()}: ${meal.name}\n`
          output += `Prep Time: ${meal.prepTime} mins | Cook Time: ${meal.cookTime} mins\n\n`
          
          // Add ingredients
          output += "Ingredients:\n"
          meal.ingredients.forEach((ing: { amount: string; item: string }) => {
            output += `- ${ing.amount} ${ing.item}\n`
          })
          output += "\n"
          
          // Add steps
          output += "Instructions:\n"
          meal.steps.forEach((step: string, index: number) => {
            output += `${index + 1}. ${step}\n`
          })
          output += "\n-------------------\n\n"
        } else {
          output += `<div class="meal">
            <h4>${mealType}: ${meal.name}</h4>
            <div>Prep Time: ${meal.prepTime} mins | Cook Time: ${meal.cookTime} mins</div>
            
            <h5>Ingredients:</h5>
            <ul>
              ${meal.ingredients.map((ing: { amount: string; item: string }) => `<li>${ing.amount} ${ing.item}</li>`).join("")}
            </ul>
            
            <h5>Instructions:</h5>
            <ol>
              ${meal.steps.map((step: string) => `<li>${step}</li>`).join("")}
            </ol>
          </div>
          <hr/>`
        }
      })

      output += format === "text" ? "\n" : "<br/>"
    })

    return output
  }

  const handleShare = async (method: "sms" | "copy") => {
    if (!mealPlan) return

    setIsSharing(true)
    try {
      switch (method) {
        case "sms":
          if (navigator.share) {
            await navigator.share({
              title: "Weekly Meal Plan",
              text: formatMealPlan("text"),
            })
          } else {
            window.location.href = `sms:?body=${encodeURIComponent(formatMealPlan("text"))}`
          }
          break
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Only show error toast if it's not an AbortError (user canceling)
      if (!(error instanceof Error) || error.name !== "AbortError") {
        toast({
          title: "Error sharing meal plan",
          description: "There was an error sharing your meal plan. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSharing(false)
    }
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-red-500 mb-4">
          <div className="text-lg font-semibold mb-2">Failed to Generate Meal Plan</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
        <div className="space-y-2">
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          <p className="text-sm text-muted-foreground">
            If the problem persists, please try:
            <ul className="mt-2 space-y-1">
              <li>• Reducing the number of meals selected</li>
              <li>• Adding more pantry items</li>
              <li>• Adjusting your dietary preferences</li>
              <li>• Refreshing the page</li>
            </ul>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl md:text-2xl">Your Weekly Meal Plan</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Here are your personalized meals for the week
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isSharing} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => handleShare("sms")} className="text-sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    <span>Export To...</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Generate New Plan
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          {isLoading ? (
            // Loading state with recipe generation progress
            <div className="space-y-6">
              <div className="text-center text-muted-foreground mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>
                  {generatingRecipes.length > 0 
                    ? `Generating ${generatingRecipes[0].mealType.charAt(0).toUpperCase() + generatingRecipes[0].mealType.slice(1)} for ${generatingRecipes[0].day.charAt(0).toUpperCase() + generatingRecipes[0].day.slice(1)}...`
                    : "Almost Done!"}
                </p>
              </div>
              {Object.keys(preferences.mealSelection).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-24 mb-4" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.keys(preferences.mealSelection[Object.keys(preferences.mealSelection)[0]]).map((_, j) => (
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
                          className="cursor-pointer transition-colors hover:bg-accent/50"
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
                              <div className="flex items-center gap-2">
                                <div className="text-muted-foreground">Servings:</div>
                                <div>{meal.servings} servings</div>
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


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, ChevronRight, Clock, UtensilsCrossed, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CuisineSelector } from "./cuisine-selector"
import { DietaryPreferences } from "./dietary-preferences"
import { WeeklyMealSelector } from "./weekly-meal-selector"
import { MealPlan } from "./meal-plan"
import { Allergies } from "./allergies"
import { PantryItems } from "./pantry-items"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type MealSelection = {
  [key: string]: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
}

const defaultMealSelection: MealSelection = {
  monday: { breakfast: false, lunch: false, dinner: false },
  tuesday: { breakfast: false, lunch: false, dinner: false },
  wednesday: { breakfast: false, lunch: false, dinner: false },
  thursday: { breakfast: false, lunch: false, dinner: false },
  friday: { breakfast: false, lunch: false, dinner: false },
  saturday: { breakfast: false, lunch: false, dinner: false },
  sunday: { breakfast: false, lunch: false, dinner: false },
}

interface MealPlannerFormProps {
  onRestart: () => void
}

export function MealPlannerForm({ onRestart }: MealPlannerFormProps) {
  const [step, setStep] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false)
  const { toast } = useToast()
  const [preferences, setPreferences] = useState({
    allergies: [] as string[],
    dietaryPreferences: [] as string[],
    cuisines: [] as string[],
    pantryItems: [] as string[],
    prepTime: "30",
    cookTime: "30",
    mealSelection: defaultMealSelection,
  })

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedAllergies = localStorage.getItem('mealPlannerAllergies')
    const savedPantryItems = localStorage.getItem('mealPlannerPantryItems')
    const savedDietaryPreferences = localStorage.getItem('mealPlannerDietaryPreferences')
    const savedCuisines = localStorage.getItem('mealPlannerCuisines')
    const hasSavedData = savedAllergies || savedPantryItems || savedDietaryPreferences || savedCuisines
    
    if (hasSavedData) {
      setHasLoadedPreferences(true)
      setPreferences(prev => ({
        ...prev,
        allergies: savedAllergies ? JSON.parse(savedAllergies) : [],
        dietaryPreferences: savedDietaryPreferences ? JSON.parse(savedDietaryPreferences) : [],
        cuisines: savedCuisines ? JSON.parse(savedCuisines) : [],
        pantryItems: savedPantryItems ? JSON.parse(savedPantryItems) : [],
      }))
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mealPlannerAllergies', JSON.stringify(preferences.allergies))
    localStorage.setItem('mealPlannerPantryItems', JSON.stringify(preferences.pantryItems))
    localStorage.setItem('mealPlannerDietaryPreferences', JSON.stringify(preferences.dietaryPreferences))
    localStorage.setItem('mealPlannerCuisines', JSON.stringify(preferences.cuisines))
  }, [preferences.allergies, preferences.pantryItems, preferences.dietaryPreferences, preferences.cuisines])

  const clearAllPreferences = () => {
    localStorage.removeItem('mealPlannerAllergies')
    localStorage.removeItem('mealPlannerPantryItems')
    localStorage.removeItem('mealPlannerDietaryPreferences')
    localStorage.removeItem('mealPlannerCuisines')
    setPreferences(prev => ({
      ...prev,
      allergies: [],
      pantryItems: [],
      dietaryPreferences: [],
      cuisines: [],
    }))
    setHasLoadedPreferences(false)
    toast({
      title: "Preferences cleared",
      description: "All your saved preferences have been cleared.",
    })
  }

  const clearIndividualPreference = (type: 'allergies' | 'pantryItems' | 'dietaryPreferences' | 'cuisines') => {
    const storageKey = `mealPlanner${type.charAt(0).toUpperCase() + type.slice(1)}`
    localStorage.removeItem(storageKey)
    setPreferences(prev => ({
      ...prev,
      [type]: [],
    }))
    
    // Check if any preferences are still saved
    const hasRemainingPreferences = Object.keys(localStorage).some(key => 
      key.startsWith('mealPlanner') && key !== storageKey
    )
    if (!hasRemainingPreferences) {
      setHasLoadedPreferences(false)
    }

    toast({
      title: "Preference cleared",
      description: `Your saved ${type.replace(/([A-Z])/g, ' $1').toLowerCase()} have been cleared.`,
    })
  }

  // Add effect to scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResults(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalMealsSelected = Object.values(preferences.mealSelection).reduce(
    (acc, day) => acc + Object.values(day).filter(Boolean).length,
    0,
  )

  if (showResults) {
    return <MealPlan preferences={preferences} onRestart={onRestart} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasLoadedPreferences && (
        <div className="flex flex-col gap-2 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Using your previously saved preferences
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Preferences
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => clearIndividualPreference('allergies')}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Allergies
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => clearIndividualPreference('dietaryPreferences')}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Dietary Preferences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => clearIndividualPreference('cuisines')}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Cuisine Preferences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => clearIndividualPreference('pantryItems')}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Pantry Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearAllPreferences} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Preferences
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {preferences.allergies.length > 0 && (
              <span className="bg-background px-2 py-1 rounded">
                {preferences.allergies.length} allergies
              </span>
            )}
            {preferences.dietaryPreferences.length > 0 && (
              <span className="bg-background px-2 py-1 rounded">
                {preferences.dietaryPreferences.length} dietary preferences
              </span>
            )}
            {preferences.cuisines.length > 0 && (
              <span className="bg-background px-2 py-1 rounded">
                {preferences.cuisines.length} cuisines
              </span>
            )}
            {preferences.pantryItems.length > 0 && (
              <span className="bg-background px-2 py-1 rounded">
                {preferences.pantryItems.length} pantry items
              </span>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#6AB04C]" />
              Any Food Allergies?
            </CardTitle>
            <CardDescription className="text-base">Select any foods you&apos;re allergic to</CardDescription>
          </CardHeader>
          <CardContent>
            <Allergies
              selected={preferences.allergies}
              onSelectionChange={(allergies) =>
                setPreferences({
                  ...preferences,
                  allergies,
                })
              }
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="ghost" disabled>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(2)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Dietary Preferences</CardTitle>
            <CardDescription className="text-base">Select any dietary preferences you follow</CardDescription>
          </CardHeader>
          <CardContent>
            <DietaryPreferences
              selected={preferences.dietaryPreferences}
              onSelectionChange={(dietaryPreferences) =>
                setPreferences({
                  ...preferences,
                  dietaryPreferences,
                })
              }
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(3)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Cuisine Preferences</CardTitle>
            <CardDescription className="text-base">Select the types of cuisine you enjoy eating</CardDescription>
          </CardHeader>
          <CardContent>
            <CuisineSelector
              selected={preferences.cuisines}
              onSelectionChange={(cuisines) =>
                setPreferences({
                  ...preferences,
                  cuisines,
                })
              }
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(4)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Your Pantry</CardTitle>
            <CardDescription className="text-base">Select the spices, sauces, and other items you already have</CardDescription>
          </CardHeader>
          <CardContent>
            <PantryItems
              selected={preferences.pantryItems}
              onSelectionChange={(pantryItems) =>
                setPreferences({
                  ...preferences,
                  pantryItems,
                })
              }
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(5)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 5 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Time Preferences</CardTitle>
            <CardDescription className="text-base">
              How long do you want to spend preparing and cooking?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Maximum prep time (minutes)</Label>
              <div className="flex items-center space-x-4">
                <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                <RadioGroup
                  defaultValue={preferences.prepTime}
                  onValueChange={(value) => setPreferences({ ...preferences, prepTime: value })}
                  className="flex space-x-4"
                  aria-label="Maximum preparation time in minutes"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15" id="prep-15" />
                    <Label htmlFor="prep-15">15</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="prep-30" />
                    <Label htmlFor="prep-30">30</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="45" id="prep-45" />
                    <Label htmlFor="prep-45">45</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="60" id="prep-60" />
                    <Label htmlFor="prep-60">60+</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Maximum cooking time (minutes)</Label>
              <div className="flex items-center space-x-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <RadioGroup
                  defaultValue={preferences.cookTime}
                  onValueChange={(value) => setPreferences({ ...preferences, cookTime: value })}
                  className="flex space-x-4"
                  aria-label="Maximum cooking time in minutes"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15" id="cook-15" />
                    <Label htmlFor="cook-15">15</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="cook-30" />
                    <Label htmlFor="cook-30">30</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="45" id="cook-45" />
                    <Label htmlFor="cook-45">45</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="60" id="cook-60" />
                    <Label htmlFor="cook-60">60+</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(4)} aria-label="Go back to previous step">
              Back
            </Button>
            <Button type="button" onClick={() => setStep(6)} aria-label="Continue to next step">
              Next
              <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 6 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Meal Selection</CardTitle>
            <CardDescription className="text-base">Choose which meals you want to plan for each day</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyMealSelector
              mealSelection={preferences.mealSelection}
              onChange={(newSelection) =>
                setPreferences({
                  ...preferences,
                  mealSelection: newSelection,
                })
              }
            />
            <div className="mt-4 text-sm text-muted-foreground">Total meals selected: {totalMealsSelected}</div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(5)} aria-label="Go back to previous step">
              Back
            </Button>
            <Button type="submit" disabled={totalMealsSelected === 0} aria-label="Generate Meal Plan">
              Generate Meal Plan
            </Button>
          </CardFooter>
        </Card>
      )}
    </form>
  )
}


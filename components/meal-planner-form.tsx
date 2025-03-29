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
import { HouseholdSizeSelector, type HouseholdSize } from "@/components/household-size-selector"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
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
  const [familySize, setFamilySize] = useState<HouseholdSize>({
    adults: 1,
    teenagers: 0,
    children: 0,
  })

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedAllergies = localStorage.getItem('mealPlannerAllergies')
    const savedPantryItems = localStorage.getItem('mealPlannerPantryItems')
    const savedDietaryPreferences = localStorage.getItem('mealPlannerDietaryPreferences')
    const savedCuisines = localStorage.getItem('mealPlannerCuisines')
    const savedHouseholdSize = localStorage.getItem('mealPlannerHouseholdSize')
    const hasSavedData = savedAllergies || savedPantryItems || savedDietaryPreferences || savedCuisines || savedHouseholdSize
    
    if (hasSavedData) {
      setHasLoadedPreferences(true)
      setPreferences(prev => ({
        ...prev,
        allergies: savedAllergies ? JSON.parse(savedAllergies) : [],
        dietaryPreferences: savedDietaryPreferences ? JSON.parse(savedDietaryPreferences) : [],
        cuisines: savedCuisines ? JSON.parse(savedCuisines) : [],
        pantryItems: savedPantryItems ? JSON.parse(savedPantryItems) : [],
      }))
      
      if (savedHouseholdSize) {
        setFamilySize(JSON.parse(savedHouseholdSize))
      }
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (hasLoadedPreferences) {
      localStorage.setItem('mealPlannerAllergies', JSON.stringify(preferences.allergies))
      localStorage.setItem('mealPlannerPantryItems', JSON.stringify(preferences.pantryItems))
      localStorage.setItem('mealPlannerDietaryPreferences', JSON.stringify(preferences.dietaryPreferences))
      localStorage.setItem('mealPlannerCuisines', JSON.stringify(preferences.cuisines))
      localStorage.setItem('mealPlannerHouseholdSize', JSON.stringify(familySize))
    }
  }, [preferences.allergies, preferences.pantryItems, preferences.dietaryPreferences, preferences.cuisines, familySize, hasLoadedPreferences])

  const clearAllPreferences = () => {
    localStorage.removeItem('mealPlannerAllergies')
    localStorage.removeItem('mealPlannerPantryItems')
    localStorage.removeItem('mealPlannerDietaryPreferences')
    localStorage.removeItem('mealPlannerCuisines')
    localStorage.removeItem('mealPlannerHouseholdSize')
    setPreferences(prev => ({
      ...prev,
      allergies: [],
      pantryItems: [],
      dietaryPreferences: [],
      cuisines: [],
    }))
    setFamilySize({
      adults: 1,
      teenagers: 0,
      children: 0,
    })
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
    return <MealPlan 
      preferences={{
        ...preferences,
        familySize,
      }} 
      onRestart={onRestart} 
    />
  }

  const renderStep = () => {
    const navigationButtons = (backStep: number, nextStep: number | (() => void), isDisabled = false) => (
      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
        <Button 
          variant="outline" 
          onClick={() => setStep(backStep)}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Back
        </Button>
        {typeof nextStep === "function" ? (
          <Button 
            onClick={nextStep} 
            disabled={isDisabled}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isDisabled ? "No meals selected" : "Generate Meal Plan"}
          </Button>
        ) : (
          <Button 
            onClick={() => setStep(nextStep)}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Next
          </Button>
        )}
      </div>
    )

    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
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
            </Card>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <DietaryPreferences
              selected={preferences.dietaryPreferences}
              onSelectionChange={(dietaryPreferences) =>
                setPreferences({
                  ...preferences,
                  dietaryPreferences,
                })
              }
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <PantryItems
              selected={preferences.pantryItems}
              onSelectionChange={(pantryItems) =>
                setPreferences({
                  ...preferences,
                  pantryItems,
                })
              }
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>Next</Button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <HouseholdSizeSelector familySize={familySize} onChange={setFamilySize} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={() => setStep(5)}>Next</Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <WeeklyMealSelector mealSelection={preferences.mealSelection} onChange={(newSelection) =>
              setPreferences({
                ...preferences,
                mealSelection: newSelection,
              })
            } />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={totalMealsSelected === 0}>
                {totalMealsSelected === 0 ? "No meals selected" : "Generate Meal Plan"}
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-4 sm:p-6">
        {hasLoadedPreferences && (
          <div className="flex flex-col gap-2 p-3 sm:p-4 bg-muted rounded-lg mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
                    className="text-destructive hover:text-destructive w-full sm:w-auto justify-center"
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
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs text-muted-foreground">
              {preferences.allergies.length > 0 && (
                <span className="bg-background px-2 py-1 rounded text-center">
                  {preferences.allergies.length} allergies
                </span>
              )}
              {preferences.dietaryPreferences.length > 0 && (
                <span className="bg-background px-2 py-1 rounded text-center">
                  {preferences.dietaryPreferences.length} dietary preferences
                </span>
              )}
              {preferences.cuisines.length > 0 && (
                <span className="bg-background px-2 py-1 rounded text-center">
                  {preferences.cuisines.length} cuisines
                </span>
              )}
              {preferences.pantryItems.length > 0 && (
                <span className="bg-background px-2 py-1 rounded text-center">
                  {preferences.pantryItems.length} pantry items
                </span>
              )}
            </div>
          </div>
        )}
        <div className="space-y-4">
          {renderStep()}
        </div>
      </div>
    </Card>
  )
}


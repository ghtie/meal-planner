"use client"

import { useState } from "react"
import { MealPlannerForm } from "@/components/meal-planner-form"

export default function Home() {
  const [key, setKey] = useState(0)

  const handleRestart = () => {
    setKey((prev) => prev + 1)
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main id="main-content" className="min-h-screen py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Weekly Meal Planner</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Tell us your preferences and we&apos;ll create a personalized meal plan for you
            </p>
          </div>

          <div className="bg-background" role="region" aria-label="Meal Planning Form">
            <MealPlannerForm key={key} onRestart={handleRestart} />
          </div>
        </div>
      </main>
    </>
  )
}


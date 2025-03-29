import type { MealSelection } from "@/components/meal-planner-form"
import type { HouseholdSize } from "@/components/household-size-selector"

export interface GroceryItem {
  amount: string
  unit: string
  item: string
}

export interface GroceryList {
  [category: string]: GroceryItem[]
}

export interface Recipe {
  name: string
  prepTime: string
  cookTime: string
  servings: number
  ingredients: { item: string; amount: string }[]
  steps: string[]
  groceryList?: GroceryList
}

export interface DailyMeals {
  breakfast?: Recipe
  lunch?: Recipe
  dinner?: Recipe
}

export interface WeeklyMealPlan {
  [key: string]: DailyMeals
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"

// Add error handling for missing API key
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

if (!API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_GOOGLE_API_KEY environment variable")
}

const API_CONFIG = {
  generationConfig: {
    temperature: 0.9,
    maxOutputTokens: 1000,
  },
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
  ]
}

const RATE_LIMIT_DELAY = 1000 // 1 second delay between API calls

// Add the list of all available cuisines
const ALL_CUISINES = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "French",
  "Greek",
  "Spanish",
  "Korean",
  "Vietnamese",
  "American",
  "Mediterranean",
  "Middle Eastern",
  "Turkish",
] as const

function createBasePrompt(context: {
  cuisines: string[]
  prepTime: string
  cookTime: string
  allergies: string[]
  dietaryPreferences: string[]
  pantryItems: string[]
  familySize: HouseholdSize
}): string {
  const { cuisines, prepTime, cookTime, allergies, dietaryPreferences, pantryItems, familySize } = context
  
  // Calculate total servings based on family size
  const totalServings = familySize.adults + familySize.teenagers + Math.ceil(familySize.children * 0.5)
  
  return `Create a healthy, beginner-friendly recipe:

Requirements:
- Cuisine: ${cuisines.length === 0 ? "Any" : cuisines.join(", ")}
- Max prep: ${prepTime}min, cook: ${cookTime}min
- Servings: ${totalServings} (${familySize.adults} adults, ${familySize.teenagers} teenagers, ${familySize.children} young children)
- Avoid: ${allergies.join(", ")}
${dietaryPreferences.length > 0 ? `- Diet: ${dietaryPreferences.join(", ")}\n` : ""}${
  pantryItems.length > 0
    ? `- Use these pantry items: ${pantryItems.join(", ")}\n`
    : ""
}
Guidelines:
- Use healthy ingredients, herbs/spices
- 6-8 common ingredients
- 3-5 simple steps
- Basic cooking methods only
- Adjust portions for family size

Format:
Name: [Name]
Prep Time: [Number] minutes
Cook Time: [Number] minutes
Servings: ${totalServings}

Ingredients:
- [Amount] [Unit] [Item]

Steps:
1. [Step]

Generate a grocery list following these STRICT rules:

IMPORTANT - Pantry Items:
- NEVER include any items that were listed in "Use these pantry items" section
- Remove ALL ingredients that match pantry items from the final grocery list
- Double check the final list to ensure NO pantry items are included

1. Units: Use ONLY these units and follow these rules:
   - For whole items (e.g., onions, tomatoes, lemons): Use count only (e.g., "2 onions")
   - For weight items: Use "grams", "kg", "oz", "lbs" (e.g., "200 grams rice")
   - For volume: Use "ml", "liters", "cups", "tbsp", "tsp"
   - NEVER use ranges or "to taste"
   - NEVER omit units for weight or volume measurements

2. Common whole items (ALWAYS use count, NEVER use weight):
   - Vegetables: onion, tomato, carrot, potato, cucumber, bell pepper, garlic clove
   - Fruits: apple, orange, lemon, lime, banana
   - Others: egg

3. Amounts:
   - ALWAYS include a specific amount
   - Use decimal numbers (e.g., 0.5, not 1/2)
   - NEVER use zero amounts
   - NEVER leave amounts empty
   - Round to 2 decimal places maximum
   - For whole items: Use whole numbers only (e.g., "2 onions" not "2.5 onions")

4. Names:
   - Use base names only (e.g., "onion" not "yellow onion")
   - Remove ALL descriptive words (fresh, dried, chopped, diced, etc.)
   - Use singular form for the item name
   - NEVER include preparation instructions in name

5. Categories: Group into ONLY these categories:
   - Produce
   - Meat/Poultry/Seafood
   - Dairy
   - Pantry

6. Duplicates:
   - Combine identical ingredients
   - Add amounts together
   - Use same unit when combining
   - Example: "2 onions" + "1 onion" = "3 onions"

Format:
Grocery List:
[Category]:
- [Number] [Unit] [Item]

Example:
Grocery List:
Produce:
- 3 onions
- 2 tomatoes
- 500 grams spinach
Meat/Poultry/Seafood:
- 1.5 lbs chicken breast
Dairy:
- 2 cups milk`
}

interface GenerateMealPlanProps {
  cuisines: string[]
  prepTime: string
  cookTime: string
  allergies: string[]
  dietaryPreferences: string[]
  pantryItems: string[]
  mealSelection: MealSelection
  familySize: HouseholdSize
  onRecipeGenerated?: (day: string, mealType: string) => void
}

export async function generateMealPlan({
  cuisines,
  prepTime,
  cookTime,
  allergies,
  dietaryPreferences,
  pantryItems,
  mealSelection,
  familySize,
  onRecipeGenerated,
}: GenerateMealPlanProps): Promise<WeeklyMealPlan> {
  const generatedRecipes = new Set<string>()
  const cuisineCount = new Map<string, number>()
  cuisines.forEach(cuisine => cuisineCount.set(cuisine, 0))

  try {
    const weeklyPlan: WeeklyMealPlan = {}
    const days = Object.keys(mealSelection)

    for (const day of days) {
      const meals = mealSelection[day]
      weeklyPlan[day] = {}

      for (const [mealType, isSelected] of Object.entries(meals)) {
        if (!isSelected) continue

        try {
          console.log(`Generating ${mealType} for ${day}...`)
          const targetCuisine = getTargetCuisine(cuisines, cuisineCount)
          const recipe = await generateRecipe(day, mealType, targetCuisine, {
            cuisines,
            prepTime,
            cookTime,
            allergies,
            dietaryPreferences,
            pantryItems,
            familySize,
            generatedRecipes,
            cuisineCount,
            onRecipeGenerated,
          })
          weeklyPlan[day][mealType as keyof DailyMeals] = recipe
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
        } catch (error) {
          console.error(`Error generating recipe for ${day} ${mealType}:`, error)
          throw new Error(`Failed to generate ${mealType} for ${day}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    return weeklyPlan
  } catch (error) {
    console.error("Error generating meal plan:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to generate meal plan")
  }
}

function getTargetCuisine(cuisines: string[], cuisineCount: Map<string, number>): string {
  // If no cuisines are selected, use all available cuisines
  if (cuisines.length === 0) {
    const allCuisinesCounts = new Map<string, number>()
    ALL_CUISINES.forEach(cuisine => allCuisinesCounts.set(cuisine, cuisineCount.get(cuisine) || 0))
    
    // Get the least used cuisine from all available cuisines
    const leastUsedCuisine = [...allCuisinesCounts.entries()]
      .sort((a, b) => a[1] - b[1])[0]?.[0]
    return leastUsedCuisine || ALL_CUISINES[0]
  }
  
  if (cuisines.length === 1) return cuisines[0]
  
  const leastUsedCuisine = [...cuisineCount.entries()]
    .sort((a, b) => a[1] - b[1])[0]?.[0]
  return leastUsedCuisine || cuisines[0]
}

async function generateRecipe(
  day: string,
  mealType: string,
  targetCuisine: string,
  context: {
    cuisines: string[]
    prepTime: string
    cookTime: string
    allergies: string[]
    dietaryPreferences: string[]
    pantryItems: string[]
    familySize: HouseholdSize
    generatedRecipes: Set<string>
    cuisineCount: Map<string, number>
    onRecipeGenerated?: (day: string, mealType: string) => void
  }
): Promise<Recipe> {
  const { generatedRecipes, cuisineCount, onRecipeGenerated, familySize } = context
  const mealContext = `Create a ${mealType} recipe specifically from ${targetCuisine} cuisine.
Important: This should be an authentic ${targetCuisine} dish commonly eaten for ${mealType}.
Make sure the recipe name, ingredients, and cooking methods are authentic to ${targetCuisine} cuisine.`

  const recipe = await makeApiRequest(day, mealType, targetCuisine, context, mealContext)
  
  // Check for duplicate recipes
  if (generatedRecipes.has(recipe.name.toLowerCase())) {
    console.log(`Duplicate recipe detected for ${day} ${mealType}, regenerating...`)
    const remainingCuisines = context.cuisines.filter(c => c !== targetCuisine)
    const alternateCuisine = remainingCuisines[Math.floor(Math.random() * remainingCuisines.length)] || targetCuisine

    const retryContext = `Create a ${mealType} recipe specifically from ${alternateCuisine} cuisine.
Important: This should be an authentic ${alternateCuisine} dish commonly eaten for ${mealType}.
Make sure the recipe name, ingredients, and cooking methods are authentic to ${alternateCuisine} cuisine.
Create a completely different recipe with a unique name and ingredients.`

    return await makeApiRequest(day, mealType, alternateCuisine, context, retryContext)
  }

  if (!isValidRecipe(recipe)) {
    throw new Error("Invalid recipe format. Please try again.")
  }

  generatedRecipes.add(recipe.name.toLowerCase())
  cuisineCount.set(targetCuisine, (cuisineCount.get(targetCuisine) || 0) + 1)
  onRecipeGenerated?.(day, mealType)

  return recipe
}

async function makeApiRequest(
  day: string,
  mealType: string,
  cuisine: string,
  context: {
    cuisines: string[]
    prepTime: string
    cookTime: string
    allergies: string[]
    dietaryPreferences: string[]
    pantryItems: string[]
    familySize: HouseholdSize
  },
  mealContext: string
): Promise<Recipe> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${createBasePrompt(context)}\n\n${mealContext}`
          }]
        }],
        ...API_CONFIG
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error?.message || response.statusText || `HTTP error! status: ${response.status}`
      throw new Error(`API request failed: ${errorMessage}`)
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid API response:", data)
      throw new Error("No recipe generated. The API response was empty or invalid.")
    }

    const recipe = parseRecipeResponse(data.candidates[0].content.parts[0].text)
    
    if (!isValidRecipe(recipe)) {
      console.error("Invalid recipe format:", recipe)
      throw new Error("The generated recipe was invalid. Please try again.")
    }

    return recipe
  } catch (error) {
    console.error("API request error:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to generate recipe: ${error.message}`)
    }
    throw new Error("Failed to generate recipe: Unknown error occurred")
  }
}

function isValidRecipe(recipe: Recipe): boolean {
  return (
    recipe.name.length > 0 &&
    recipe.name !== "Recipe Name" &&
    recipe.ingredients.length >= 3 &&
    recipe.steps.length >= 2 &&
    recipe.servings > 0 &&
    !recipe.name.includes("[") && // Check for placeholder text
    !recipe.ingredients.some((ing) => ing.item.includes("[") || ing.amount.includes("["))
  )
}

function parseRecipeResponse(response: string): Recipe {
  try {
    console.log("Raw API response:", response)

    // Clean up the response
    const cleanResponse = response
      .replace(/```/g, '') // Remove markdown code blocks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\r\n/g, '\n') // Normalize line endings

    // Extract recipe details using more robust regex patterns
    const nameMatch = cleanResponse.match(/Name:\s*([^\n]+)/i)
    const prepTimeMatch = cleanResponse.match(/Prep Time:\s*(\d+)/i)
    const cookTimeMatch = cleanResponse.match(/Cook Time:\s*(\d+)/i)
    const servingsMatch = cleanResponse.match(/Servings:\s*(\d+)/i)

    if (!servingsMatch) {
      console.error("No servings information found in recipe response")
      throw new Error("Recipe is missing serving size information")
    }

    // Extract ingredients section
    const ingredientsSection = cleanResponse
      .split(/Ingredients:?/i)[1]
      ?.split(/Steps:?/i)[0]
      ?.trim()

    if (!ingredientsSection) {
      throw new Error("No ingredients section found in recipe response")
    }

    const ingredients = ingredientsSection
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && (line.startsWith('-') || /^\d+\.?\s/.test(line)))
      .map(line => {
        const cleanLine = line.replace(/^[-\d.]\s*/, '').trim()
        const words = cleanLine.split(' ')
        let amountParts: string[] = []
        let itemParts: string[] = []
        let foundItem = false

        for (const word of words) {
          if (!foundItem && (
            /^\d/.test(word) ||
            /^(?:cup|cups|tbsp|tsp|g|oz|pound|pounds|ml|piece|pieces|pinch|handful|large|medium|small)s?$/i.test(word) ||
            /^(?:a|an|one|two|three|four|five)$/i.test(word) ||
            /^(?:to|taste)$/i.test(word)
          )) {
            amountParts.push(word)
          } else {
            foundItem = true
            itemParts.push(word)
          }
        }

        if (amountParts.length === 0 || itemParts.length === 0) {
          const parts = cleanLine.split(' ')
          return {
            amount: parts[0] || "1",
            item: parts.slice(1).join(' ') || cleanLine
          }
        }

        return {
          amount: amountParts.join(' '),
          item: itemParts.join(' ')
        }
      })

    // Extract steps section
    const stepsSection = cleanResponse
      .split(/Steps:?/i)[1]
      ?.split(/Grocery List:?/i)[0]
      ?.trim()

    if (!stepsSection) {
      throw new Error("No steps section found in recipe response")
    }

    const steps = stepsSection
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())

    // Extract grocery list section
    const groceryListSection = cleanResponse
      .split(/Grocery List:?/i)[1]
      ?.trim()

    let groceryList: GroceryList = {}
    
    if (groceryListSection) {
      let currentCategory = ""
      const validCategories = ["Produce", "Meat/Poultry/Seafood", "Dairy", "Pantry"]
      
      groceryListSection.split('\n').forEach(line => {
        line = line.trim()
        if (!line) return

        // Handle category lines
        if (line.endsWith(':')) {
          currentCategory = line.slice(0, -1).trim()
          if (validCategories.includes(currentCategory)) {
            groceryList[currentCategory] = []
          }
          return
        }

        // Parse grocery items
        if (line.startsWith('-') && currentCategory && validCategories.includes(currentCategory)) {
          const cleanLine = line.replace(/^-\s*/, '').trim()
          
          // Enhanced parsing regex to capture amount, unit, and item
          const match = cleanLine.match(/^([\d.]+)\s*((?:grams|kg|oz|lbs|ml|liters|cups|tbsp|tsp|)\s*)?(.+)/)
          
          if (match) {
            const [, amount, unit, item] = match
            const numAmount = parseFloat(amount)
            
            // Skip invalid items
            if (numAmount <= 0 || !item.trim()) {
              return
            }

            // Normalize the item name
            const normalizedItem = item
              .toLowerCase()
              .replace(/^(fresh|dried|ground|chopped|diced|minced|sliced|whole|organic|raw)\s+/, '')
              .replace(/\s*\([^)]*\)/g, '')
              .replace(/\s*\[[^\]]*\]/g, '')
              .replace(/,.*$/, '')
              .replace(/\s+/g, ' ')
              .trim()

            // Add to grocery list with normalized values
            groceryList[currentCategory].push({
              amount: numAmount.toFixed(2),
              unit: unit ? unit.trim() : '',
              item: normalizedItem
            })
          }
        }
      })

      // Remove empty categories
      Object.keys(groceryList).forEach(category => {
        if (groceryList[category].length === 0) {
          delete groceryList[category]
        }
      })

      // Combine duplicates within each category
      Object.keys(groceryList).forEach(category => {
        const combinedItems = new Map<string, GroceryItem>()
        
        groceryList[category].forEach(item => {
          const key = item.item
          if (combinedItems.has(key)) {
            const existing = combinedItems.get(key)!
            const newAmount = parseFloat(existing.amount) + parseFloat(item.amount)
            combinedItems.set(key, {
              ...existing,
              amount: newAmount.toFixed(2)
            })
          } else {
            combinedItems.set(key, item)
          }
        })
        
        groceryList[category] = Array.from(combinedItems.values())
      })
    }

    if (!ingredients.length) {
      throw new Error("No ingredients found in recipe response")
    }

    if (!steps.length) {
      throw new Error("No steps found in recipe response")
    }

    const recipe = {
      name: nameMatch?.[1]?.trim() || "Recipe Name",
      prepTime: prepTimeMatch?.[1] || "15",
      cookTime: cookTimeMatch?.[1] || "15",
      servings: Number(servingsMatch[1]),
      ingredients,
      steps,
      groceryList
    }

    // Validate servings
    if (recipe.servings <= 0) {
      console.error("Invalid serving size:", recipe.servings)
      throw new Error("Recipe has invalid serving size")
    }

    console.log("Final parsed recipe:", recipe)
    return recipe
  } catch (error) {
    console.error("Error parsing recipe response:", error)
    console.error("Failed response:", response)
    throw error
  }
}
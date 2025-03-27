import type { MealSelection } from "@/components/meal-planner-form"

export interface Recipe {
  name: string
  prepTime: string
  cookTime: string
  servings: number
  ingredients: { item: string; amount: string }[]
  steps: string[]
}

export interface DailyMeals {
  breakfast?: Recipe
  lunch?: Recipe
  dinner?: Recipe
}

export interface WeeklyMealPlan {
  [key: string]: DailyMeals
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// Add error handling for missing API key
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

if (!API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_GOOGLE_API_KEY environment variable")
}

interface GenerateMealPlanProps {
  cuisines: string[]
  prepTime: string
  cookTime: string
  allergies: string[]
  dietaryPreferences: string[]
  pantryItems: string[]
  mealSelection: MealSelection
}

export async function generateMealPlan({
  cuisines,
  prepTime,
  cookTime,
  allergies,
  dietaryPreferences,
  pantryItems,
  mealSelection,
}: GenerateMealPlanProps): Promise<WeeklyMealPlan> {
  // Track previously generated recipes and cuisines
  const generatedRecipes = new Set<string>()
  const cuisineCount = new Map<string, number>()
  cuisines.forEach(cuisine => cuisineCount.set(cuisine, 0))

  // Create a more direct prompt that doesn't use placeholders
  const basePrompt = `As a professional chef and nutritionist, create a healthy, well-balanced, beginner-friendly recipe following these requirements:
${
  cuisines.length === 0
    ? "- Create a recipe from any cuisine type"
    : `- Choose from these cuisines: ${cuisines.join(", ")}`
}
- Maximum prep time: ${prepTime} minutes
- Maximum cook time: ${cookTime} minutes
- Avoid these ingredients: ${allergies.join(", ")}
${dietaryPreferences.length > 0 ? `- Follow these dietary preferences: ${dietaryPreferences.join(", ")}` : ""}
${pantryItems.length > 0 ? `- Use these pantry items when possible: ${pantryItems.join(", ")}
- Minimize additional spices and sauces beyond what's in the pantry
- If using additional spices/sauces, limit to 1-2 new items maximum
- Prioritize using the provided pantry items for seasoning and flavoring` : ""}

Important requirements for healthy, balanced meals:
- Nutritional balance requirements:
  * Include vegetables or fruits in each meal if possible
  * Limit added sugars and processed ingredients
  * Include healthy fats (olive oil, avocado, nuts, etc.)
- Cooking methods:
  * Prioritize healthy cooking methods:
    - Steaming
    - Baking
    - Grilling
    - Light sautéing
  * Minimize use of added fats/oils (1-2 tbsp max)
  * No deep frying
- Seasoning guidelines:
  * Use herbs and spices for flavor instead of excess salt
  * Limit sodium content
  * Use natural flavor enhancers (citrus, herbs, garlic, ginger)

Important requirements for beginner-friendly cooking:
- Use only these basic cooking techniques:
  * Boiling/simmering (pasta, rice, vegetables)
  * Basic sautéing/stir-frying in a pan
  * Simple baking (one pan/dish in oven)
  * Basic chopping and mixing
- Avoid these complex techniques:
  * Deep frying
  * Multiple cooking methods per recipe
  * Precise temperature control
  * Complex sauce-making
  * Multi-step preparations
- Equipment requirements:
  * Only use basic kitchen tools: pot, pan, baking dish
  * No food processor, blender, or special equipment
  * Minimal number of pots/pans (ideally just 1-2)
- Recipe structure:
  * Maximum 6-8 ingredients total
  * 3-5 simple, clear steps
  * Each step should be a single action
  * No concurrent tasks or timing-sensitive steps
  * Ingredients should be common supermarket items

Important requirements for cuisine diversity:
- Create an authentic but simplified version of the cuisine
- Focus on the most basic, popular dishes from the cuisine
- Use readily available ingredients as substitutes when needed
- Ensure the recipe name reflects its cultural origin
- Make each recipe distinct from others in the meal plan

Generate a complete recipe in this format (do not use placeholders, generate actual values):

Name: (generate a specific recipe name that reflects the cuisine)
Prep Time: (number of minutes)
Cook Time: (number of minutes)
Servings: 4

Ingredients:
- 2 cups rice
- 1 pound chicken
- 3 cloves garlic
(list 6-8 common ingredients with amounts)

Steps:
1. Preheat the oven to 350°F
2. Season the chicken with salt and pepper
(list 3-7 simple, single-action steps)

Make it suitable for busy weeknight cooking with minimal kitchen experience.`

  try {
    const weeklyPlan: WeeklyMealPlan = {}
    const days = Object.keys(mealSelection)

    for (const day of days) {
      const meals = mealSelection[day]
      weeklyPlan[day] = {}

      for (const [mealType, isSelected] of Object.entries(meals)) {
        if (isSelected) {
          try {
            console.log(`Generating ${mealType} for ${day}...`)

            // Determine which cuisine to use based on current distribution
            let targetCuisine = cuisines[0]
            if (cuisines.length > 1) {
              // Find the least used cuisine
              const leastUsedCuisine = [...cuisineCount.entries()]
                .sort((a, b) => a[1] - b[1])[0]?.[0]
              if (leastUsedCuisine) {
                targetCuisine = leastUsedCuisine
              }
            }

            // Add meal type and cuisine-specific context to the prompt
            const mealContext = `Create a ${mealType} recipe specifically from ${targetCuisine} cuisine.
Important: This should be an authentic ${targetCuisine} dish commonly eaten for ${mealType}.
Make sure the recipe name, ingredients, and cooking methods are authentic to ${targetCuisine} cuisine.`

            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `${basePrompt}\n\n${mealContext}`
                  }]
                }],
                generationConfig: {
                  temperature: 0.9,
                  maxOutputTokens: 1000,
                },
                safetySettings: [
                  {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE"
                  },
                  {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE"
                  },
                  {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_NONE"
                  },
                  {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE"
                  }
                ]
              }),
            })

            if (!response.ok) {
              console.error(`API error: ${response.status} ${response.statusText}`)
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            console.log(`Raw API response for ${day} ${mealType}:`, data)

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              let recipe = parseRecipeResponse(data.candidates[0].content.parts[0].text)

              // Check for duplicate recipes
              if (generatedRecipes.has(recipe.name.toLowerCase())) {
                console.log(`Duplicate recipe detected for ${day} ${mealType}, regenerating...`)
                // Try a different cuisine if available
                const remainingCuisines = cuisines.filter(c => c !== targetCuisine)
                const alternateCuisine = remainingCuisines[Math.floor(Math.random() * remainingCuisines.length)] || targetCuisine

                const retryContext = `Create a ${mealType} recipe specifically from ${alternateCuisine} cuisine.
Important: This should be an authentic ${alternateCuisine} dish commonly eaten for ${mealType}.
Make sure the recipe name, ingredients, and cooking methods are authentic to ${alternateCuisine} cuisine.
Create a completely different recipe with a unique name and ingredients.`

                const retryResponse = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{
                        text: `${basePrompt}\n\n${retryContext}`
                      }]
                    }],
                    generationConfig: {
                      temperature: 0.95,
                      maxOutputTokens: 1000,
                    },
                    safetySettings: [
                      {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE"
                      },
                      {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_NONE"
                      },
                      {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE"
                      },
                      {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE"
                      }
                    ]
                  }),
                })

                if (retryResponse.ok) {
                  const retryData = await retryResponse.json()
                  if (retryData.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const retryRecipe = parseRecipeResponse(retryData.candidates[0].content.parts[0].text)
                    if (!generatedRecipes.has(retryRecipe.name.toLowerCase())) {
                      recipe = retryRecipe
                      targetCuisine = alternateCuisine // Update target cuisine if retry was successful
                    }
                  }
                }
              }

              if (!isValidRecipe(recipe)) {
                console.error(`Invalid recipe generated for ${day} ${mealType}:`, recipe)
                throw new Error("Invalid recipe format")
              }

              // Update tracking
              generatedRecipes.add(recipe.name.toLowerCase())
              cuisineCount.set(targetCuisine, (cuisineCount.get(targetCuisine) || 0) + 1)

              console.log(`Parsed recipe for ${day} ${mealType}:`, recipe)
              weeklyPlan[day][mealType as keyof DailyMeals] = recipe
            } else {
              throw new Error("Invalid API response format")
            }
          } catch (error) {
            console.error(`Error generating recipe for ${day} ${mealType}:`, error)
            weeklyPlan[day][mealType as keyof DailyMeals] = generateFallbackRecipe(mealType, cuisines[0])
          }

          // Add a delay between requests to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    return weeklyPlan
  } catch (error) {
    console.error("Error generating meal plan:", error)
    throw new Error("Failed to generate meal plan")
  }
}

function isValidRecipe(recipe: Recipe): boolean {
  return (
    recipe.name.length > 0 &&
    recipe.name !== "Recipe Name" &&
    recipe.ingredients.length >= 3 &&
    recipe.steps.length >= 2 &&
    !recipe.name.includes("[") && // Check for placeholder text
    !recipe.ingredients.some((ing) => ing.item.includes("[") || ing.amount.includes("["))
  )
}

function parseRecipeResponse(response: string): Recipe {
  try {
    console.log("Parsing recipe response:", response)

    // Extract recipe details using more robust regex patterns
    const nameMatch = response.match(/Name:\s*([^\n]+)/)
    const prepTimeMatch = response.match(/Prep Time:\s*(\d+)/)
    const cookTimeMatch = response.match(/Cook Time:\s*(\d+)/)
    const servingsMatch = response.match(/Servings:\s*(\d+)/)

    // Extract ingredients section
    const ingredientsSection = response.split("Ingredients:")[1]?.split("Steps:")[0]
    const ingredients =
      ingredientsSection
        ?.split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => {
          const cleanLine = line.replace(/^-\s*/, "").trim()
          // Enhanced regex pattern for ingredient parsing
          const match = cleanLine.match(
            /^([\d./]+\s*(?:cup|cups|tbsp|tsp|g|oz|pound|pounds|ml|piece|pieces|to taste|pinch|handful|large|medium|small)[s]?\s+)(.+)/,
          )

          if (match) {
            return {
              amount: match[1].trim(),
              item: match[2].trim(),
            }
          }

          // More sophisticated fallback parsing
          const words = cleanLine.split(" ")
          const amountParts: string[] = []
          const itemParts: string[] = []
          let foundAmount = false

          for (const word of words) {
            if (
              !foundAmount &&
              (/^\d/.test(word) || // Starts with number
                /^(?:a|an|one|two|three|four|five)$/i.test(word) || // Number words
                /^(?:pinch|handful|splash|dash)$/i.test(word)) // Measurement words
            ) {
              amountParts.push(word)
            } else {
              foundAmount = true
              itemParts.push(word)
            }
          }

          return {
            amount: amountParts.length > 0 ? amountParts.join(" ") : "1",
            item: itemParts.length > 0 ? itemParts.join(" ") : cleanLine,
          }
        }) || []

    // Extract steps section
    const stepsSection = response.split("Steps:")[1]
    const steps =
      stepsSection
        ?.split("\n")
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) => line.replace(/^\d+\.\s*/, "").trim()) || []

    const recipe = {
      name: nameMatch?.[1] || "Recipe Name",
      prepTime: prepTimeMatch?.[1] || "15",
      cookTime: cookTimeMatch?.[1] || "15",
      servings: Number(servingsMatch?.[1] || "4"),
      ingredients: ingredients.length > 0 ? ingredients : generateFallbackRecipe("meal").ingredients,
      steps: steps.length > 0 ? steps : generateFallbackRecipe("meal").steps,
    }

    console.log("Parsed recipe:", recipe)
    return recipe
  } catch (error) {
    console.error("Error parsing recipe response:", error)
    return generateFallbackRecipe("meal")
  }
}

function generateFallbackRecipe(mealType: string, cuisine = "International"): Recipe {
  const fallbackRecipes = {
    breakfast: {
      name: `${cuisine} Breakfast Bowl`,
      prepTime: "10",
      cookTime: "15",
      servings: 2,
      ingredients: [
        { amount: "1 cup", item: "rolled oats" },
        { amount: "1 medium", item: "banana" },
        { amount: "1 tbsp", item: "honey" },
        { amount: "1/4 cup", item: "mixed nuts" },
        { amount: "1 cup", item: "milk of choice" },
        { amount: "1/2 tsp", item: "cinnamon" },
        { amount: "1 pinch", item: "salt" },
      ],
      steps: [
        "Combine oats and milk in a microwave-safe bowl",
        "Microwave for 2 minutes, stirring halfway through",
        "Slice banana and add on top",
        "Add cinnamon and a pinch of salt",
        "Drizzle with honey and sprinkle with nuts",
      ],
    },
    lunch: {
      name: `${cuisine} Garden Bowl`,
      prepTime: "15",
      cookTime: "0",
      servings: 2,
      ingredients: [
        { amount: "3 cups", item: "mixed greens" },
        { amount: "1 medium", item: "tomato" },
        { amount: "1", item: "cucumber" },
        { amount: "1/4 cup", item: "olive oil" },
        { amount: "2 tbsp", item: "lemon juice" },
        { amount: "1/2 cup", item: "quinoa, cooked" },
        { amount: "1/4 cup", item: "mixed seeds" },
      ],
      steps: [
        "Wash and chop all vegetables",
        "Cook quinoa according to package instructions",
        "Combine greens, tomato, and cucumber in a bowl",
        "Whisk together olive oil and lemon juice",
        "Top with quinoa and seeds, then drizzle with dressing",
      ],
    },
    dinner: {
      name: `${cuisine} Rice Bowl`,
      prepTime: "15",
      cookTime: "25",
      servings: 2,
      ingredients: [
        { amount: "1 cup", item: "jasmine rice" },
        { amount: "2 cups", item: "vegetable broth" },
        { amount: "2 tbsp", item: "olive oil" },
        { amount: "2 cloves", item: "garlic" },
        { amount: "1 cup", item: "mixed vegetables" },
        { amount: "1 tbsp", item: "soy sauce" },
        { amount: "2", item: "eggs" },
      ],
      steps: [
        "Cook rice in vegetable broth according to package instructions",
        "Mince garlic and sauté in olive oil until fragrant",
        "Add mixed vegetables and stir-fry until tender",
        "Fry eggs to desired doneness",
        "Combine rice and vegetables, top with fried egg and soy sauce",
      ],
    },
  }

  return fallbackRecipes[mealType as keyof typeof fallbackRecipes] || fallbackRecipes.dinner
}
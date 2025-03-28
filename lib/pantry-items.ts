export enum PantryCategory {
  Spices = "Spices",
  Sauces = "Sauces",
  Other = "Other"
}

export interface PantryItem {
  name: string
  category: PantryCategory
  commonUnits?: string[]
  description?: string
}

export const commonPantryItems: Record<PantryCategory, PantryItem[]> = {
  [PantryCategory.Spices]: [
    { name: "Salt", category: PantryCategory.Spices, commonUnits: ["tsp", "tbsp", "pinch"] },
    { name: "Black Pepper", category: PantryCategory.Spices, commonUnits: ["tsp", "pinch"] },
    { name: "Garlic Powder", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Onion Powder", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Cumin", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Coriander", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Turmeric", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Ginger Powder", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Cinnamon", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Paprika", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Chili Powder", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Oregano", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Basil", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Thyme", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Rosemary", category: PantryCategory.Spices, commonUnits: ["tsp"] },
    { name: "Bay Leaves", category: PantryCategory.Spices, commonUnits: ["whole"] },
    { name: "Cardamom", category: PantryCategory.Spices, commonUnits: ["pod", "tsp"] },
    { name: "Nutmeg", category: PantryCategory.Spices, commonUnits: ["tsp", "whole"] },
    { name: "Cloves", category: PantryCategory.Spices, commonUnits: ["whole", "tsp"] },
    { name: "Allspice", category: PantryCategory.Spices, commonUnits: ["tsp", "whole"] },
  ],
  [PantryCategory.Sauces]: [
    { name: "Soy Sauce", category: PantryCategory.Sauces, commonUnits: ["tbsp", "cup"] },
    { name: "Fish Sauce", category: PantryCategory.Sauces, commonUnits: ["tbsp", "tsp"] },
    { name: "Oyster Sauce", category: PantryCategory.Sauces, commonUnits: ["tbsp"] },
    { name: "Worcestershire Sauce", category: PantryCategory.Sauces, commonUnits: ["tbsp", "tsp"] },
    { name: "Hot Sauce", category: PantryCategory.Sauces, commonUnits: ["tbsp", "tsp"] },
    { name: "BBQ Sauce", category: PantryCategory.Sauces, commonUnits: ["tbsp", "cup"] },
    { name: "Teriyaki Sauce", category: PantryCategory.Sauces, commonUnits: ["tbsp", "cup"] },
    { name: "Hoisin Sauce", category: PantryCategory.Sauces, commonUnits: ["tbsp"] },
    { name: "Sriracha", category: PantryCategory.Sauces, commonUnits: ["tbsp", "tsp"] },
    { name: "Sesame Oil", category: PantryCategory.Sauces, commonUnits: ["tbsp", "tsp"] },
    { name: "Olive Oil", category: PantryCategory.Sauces, commonUnits: ["tbsp", "cup"] },
    { name: "Vegetable Oil", category: PantryCategory.Sauces, commonUnits: ["tbsp", "cup"] },
    { name: "Balsamic Vinegar", category: PantryCategory.Sauces, commonUnits: ["tbsp", "tsp"] },
    { name: "Rice Vinegar", category: PantryCategory.Sauces, commonUnits: ["tbsp", "tsp"] },
    { name: "Apple Cider Vinegar", category: PantryCategory.Sauces, commonUnits: ["tbsp", "tsp"] },
  ],
  [PantryCategory.Other]: [
    { name: "Honey", category: PantryCategory.Other, commonUnits: ["tbsp", "tsp"] },
    { name: "Maple Syrup", category: PantryCategory.Other, commonUnits: ["tbsp", "cup"] },
    { name: "Brown Sugar", category: PantryCategory.Other, commonUnits: ["cup", "tbsp"] },
    { name: "White Sugar", category: PantryCategory.Other, commonUnits: ["cup", "tbsp"] },
    { name: "Flour", category: PantryCategory.Other, commonUnits: ["cup"] },
    { name: "Cornstarch", category: PantryCategory.Other, commonUnits: ["tbsp", "tsp"] },
    { name: "Baking Powder", category: PantryCategory.Other, commonUnits: ["tsp"] },
    { name: "Baking Soda", category: PantryCategory.Other, commonUnits: ["tsp"] },
    { name: "Vanilla Extract", category: PantryCategory.Other, commonUnits: ["tsp"] },
    { name: "Coconut Milk", category: PantryCategory.Other, commonUnits: ["can", "cup"] },
    { name: "Canned Tomatoes", category: PantryCategory.Other, commonUnits: ["can"] },
    { name: "Tomato Paste", category: PantryCategory.Other, commonUnits: ["tbsp", "can"] },
    { name: "Beans", category: PantryCategory.Other, commonUnits: ["can", "cup"] },
    { name: "Rice", category: PantryCategory.Other, commonUnits: ["cup"] },
    { name: "Pasta", category: PantryCategory.Other, commonUnits: ["cup", "pound"] },
  ],
}

// Helper function to get all items in a category
export function getItemsByCategory(category: PantryCategory): PantryItem[] {
  return commonPantryItems[category]
}

// Helper function to get all items
export function getAllItems(): PantryItem[] {
  return Object.values(commonPantryItems).flat()
}

// Helper function to get item by name
export function getItemByName(name: string): PantryItem | undefined {
  return getAllItems().find(item => item.name === name)
} 
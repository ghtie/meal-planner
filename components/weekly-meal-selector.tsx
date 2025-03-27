import { Coffee, Sun, Moon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { MealSelection } from "./meal-planner-form"

interface WeeklyMealSelectorProps {
  mealSelection: MealSelection
  onChange: (selection: MealSelection) => void
}

export function WeeklyMealSelector({ mealSelection, onChange }: WeeklyMealSelectorProps) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  const handleMealToggle = (day: string, meal: "breakfast" | "lunch" | "dinner") => {
    const newSelection = {
      ...mealSelection,
      [day]: {
        ...mealSelection[day],
        [meal]: !mealSelection[day][meal],
      },
    }
    onChange(newSelection)
  }

  return (
    <div className="space-y-4" role="group" aria-label="Weekly meal selection">
      <div className="grid grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm font-medium text-center">
        <div className="col-span-1"></div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-1">
          <Coffee className="w-4 h-4" aria-hidden="true" />
          <span className="hidden md:inline">Breakfast</span>
          <span className="md:hidden">Bfast</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-1">
          <Sun className="w-4 h-4" aria-hidden="true" />
          <span>Lunch</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-1">
          <Moon className="w-4 h-4" aria-hidden="true" />
          <span>Dinner</span>
        </div>
      </div>
      <div className="space-y-2">
        {days.map((day) => (
          <div key={day} className="grid grid-cols-4 gap-2 md:gap-4 items-center">
            <div className="col-span-1 capitalize text-xs md:text-sm">{day}</div>
            <div className="flex justify-center">
              <Checkbox
                id={`${day}-breakfast`}
                checked={mealSelection[day].breakfast}
                onCheckedChange={() => handleMealToggle(day, "breakfast")}
                aria-label={`Select breakfast for ${day}`}
              />
            </div>
            <div className="flex justify-center">
              <Checkbox
                id={`${day}-lunch`}
                checked={mealSelection[day].lunch}
                onCheckedChange={() => handleMealToggle(day, "lunch")}
                aria-label={`Select lunch for ${day}`}
              />
            </div>
            <div className="flex justify-center">
              <Checkbox
                id={`${day}-dinner`}
                checked={mealSelection[day].dinner}
                onCheckedChange={() => handleMealToggle(day, "dinner")}
                aria-label={`Select dinner for ${day}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


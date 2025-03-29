import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus } from "lucide-react"

export interface HouseholdSize {
  adults: number
  teenagers: number
  children: number
}

interface HouseholdSizeSelectorProps {
  familySize: HouseholdSize
  onChange: (size: HouseholdSize) => void
}

export function HouseholdSizeSelector({ familySize, onChange }: HouseholdSizeSelectorProps) {
  const handleChange = (field: keyof HouseholdSize, value: number) => {
    // Ensure value is non-negative and within reasonable limits (0-99)
    const numValue = Math.max(0, Math.min(99, value))
    onChange({
      ...familySize,
      [field]: numValue,
    })
  }

  const renderNumberInput = (field: keyof HouseholdSize, label: string, description?: string) => {
    return (
      <div className="grid gap-2">
        <Label htmlFor={field} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium">{label}</span>
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </Label>
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 sm:h-8 sm:w-8"
            onClick={() => handleChange(field, familySize[field] - 1)}
            disabled={familySize[field] <= 0}
            aria-label={`Decrease ${label.toLowerCase()}`}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id={field}
            type="number"
            min="0"
            max="99"
            value={familySize[field]}
            onChange={(e) => handleChange(field, parseInt(e.target.value) || 0)}
            className="w-16 sm:w-20 text-center text-lg sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label={`Number of ${label.toLowerCase()}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 sm:h-8 sm:w-8"
            onClick={() => handleChange(field, familySize[field] + 1)}
            disabled={familySize[field] >= 99}
            aria-label={`Increase ${label.toLowerCase()}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 sm:space-y-2">
        <CardTitle className="text-xl sm:text-2xl text-center sm:text-left">Household Size</CardTitle>
        <CardDescription className="text-sm sm:text-base text-center sm:text-left">
          Help us adjust portion sizes for your family
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:gap-8">
          {renderNumberInput("adults", "Adults")}
          {renderNumberInput("teenagers", "Teenagers")}
          {renderNumberInput("children", "Young Children")}
        </div>
      </CardContent>
    </Card>
  )
} 
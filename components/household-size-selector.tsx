import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  const handleChange = (field: keyof HouseholdSize, value: string) => {
    // Convert to number and ensure it's non-negative
    const numValue = Math.max(0, parseInt(value) || 0)
    onChange({
      ...familySize,
      [field]: numValue,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Household Size</CardTitle>
        <CardDescription>
          Help us adjust portion sizes for your family
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="adults">Adults</Label>
            <Input
              id="adults"
              type="number"
              min="0"
              value={familySize.adults}
              onChange={(e) => handleChange("adults", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="teenagers">
              Teenagers
              <span className="text-sm text-muted-foreground ml-2">(13-19 years)</span>
            </Label>
            <Input
              id="teenagers"
              type="number"
              min="0"
              value={familySize.teenagers}
              onChange={(e) => handleChange("teenagers", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="children">
              Young Children
              <span className="text-sm text-muted-foreground ml-2">(4-12 years)</span>
            </Label>
            <Input
              id="children"
              type="number"
              min="0"
              value={familySize.children}
              onChange={(e) => handleChange("children", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceRangeFilter({ minPrice, maxPrice, value, onChange }: PriceRangeFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    const tuple: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(tuple);
  };

  const handleValueCommit = (newValue: number[]) => {
    const tuple: [number, number] = [newValue[0], newValue[1]];
    onChange(tuple);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Εύρος Τιμής</span>
      </div>
      <div className="flex items-center gap-4">
        <Input
          type="number"
          min={minPrice}
          max={localValue[1]}
          value={localValue[0]}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= minPrice && val <= localValue[1]) {
              const newValue: [number, number] = [val, localValue[1]];
              setLocalValue(newValue);
              onChange(newValue);
            }
          }}
          className="h-8 w-20"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          min={localValue[0]}
          max={maxPrice}
          value={localValue[1]}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= localValue[0] && val <= maxPrice) {
              const newValue: [number, number] = [localValue[0], val];
              setLocalValue(newValue);
              onChange(newValue);
            }
          }}
          className="h-8 w-20"
        />
      </div>
      <Slider
        value={localValue}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        min={minPrice}
        max={maxPrice}
        step={10}
        className="w-full"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>€{minPrice}</span>
        <span>€{maxPrice}</span>
      </div>
    </div>
  );
}

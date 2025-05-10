
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { WodFilters as FiltersType } from '@/types/wod';
import { Label } from '@/components/ui/label';

interface WodFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

const difficultyOptions = [
  { value: '', label: 'All Difficulties' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Elite', label: 'Elite' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Girl', label: 'Girl' },
  { value: 'Hero', label: 'Hero' },
  { value: 'Benchmark', label: 'Benchmark' },
];

const WodFilters: React.FC<WodFiltersProps> = ({ filters, onChange }) => {
  const handleDifficultyChange = (value: string) => {
    onChange({ ...filters, difficulty: value || undefined });
  };

  const handleCategoryChange = (value: string) => {
    onChange({ ...filters, category: value || undefined });
  };

  const handleDurationChange = (value: number[]) => {
    onChange({ ...filters, duration: value[0] });
  };

  const handleReset = () => {
    onChange({});
  };

  return (
    <div className="space-y-4 p-4 bg-background rounded-lg border">
      <h3 className="font-medium">Filter Workouts</h3>
      
      <div className="space-y-2">
        <Label htmlFor="difficulty-filter">Difficulty</Label>
        <Select 
          value={filters.difficulty || ''} 
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger id="difficulty-filter" className="w-full">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            {difficultyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category-filter">Category</Label>
        <Select 
          value={filters.category || ''} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger id="category-filter" className="w-full">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="duration-filter">Max Duration (minutes)</Label>
          <span className="text-sm text-muted-foreground">
            {filters.duration || 60} min
          </span>
        </div>
        <Slider
          id="duration-filter"
          defaultValue={[filters.duration || 60]}
          max={60}
          min={5}
          step={5}
          onValueChange={handleDurationChange}
        />
      </div>
      
      <Button 
        variant="outline" 
        onClick={handleReset}
        className="w-full"
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default WodFilters;

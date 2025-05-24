
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WodFilters as FiltersType } from '@/types/wod';
import { RefreshCcw } from 'lucide-react';

interface WodFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

const WodFilters: React.FC<WodFiltersProps> = ({ filters, onChange }) => {
  const handleDifficultyChange = (value: string) => {
    const newValue = value === 'all' ? [] : [value.toLowerCase()];
    onChange({ ...filters, difficulty: newValue });
  };

  const handleCategoryChange = (value: string) => {
    const newValue = value === 'all' ? [] : [value];
    onChange({ ...filters, category: newValue });
  };

  const handleDurationChange = (value: number[]) => {
    onChange({ ...filters, duration: [`${value[0]}`] });
  };

  const handleReset = () => {
    onChange({
      search: '',
      difficulty: [],
      category: [],
      duration: [],
      equipment: [],
      special: []
    });
  };

  const hasFilters = filters.category.length > 0 || filters.difficulty.length > 0 || filters.duration.length > 0;
  
  const getDifficultyValue = () => {
    if (!filters.difficulty || filters.difficulty.length === 0) return 'all';
    return filters.difficulty[0].toLowerCase();
  };
  
  const getCategoryValue = () => {
    return filters.category && filters.category.length > 0 ? filters.category[0] : 'all';
  };
  
  const getDurationValue = () => {
    if (filters.duration && filters.duration.length > 0) {
      const value = parseInt(filters.duration[0], 10);
      return isNaN(value) ? 60 : value;
    }
    return 60;
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Filters</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleReset}
            disabled={!hasFilters}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select 
            value={getDifficultyValue()} 
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={getCategoryValue()} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="girl">Girl WODs</SelectItem>
              <SelectItem value="hero">Hero WODs</SelectItem>
              <SelectItem value="benchmark">Benchmark WODs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label htmlFor="duration">Max Duration</Label>
            <span className="text-sm">{getDurationValue()} min</span>
          </div>
          <Slider
            id="duration"
            min={5}
            max={60}
            step={5}
            value={[getDurationValue()]}
            onValueChange={handleDurationChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WodFilters;

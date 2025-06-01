
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function CalendarNavigation({ currentDate, onDateChange }: CalendarNavigationProps) {
  const goToPreviousMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };
  
  const goToNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };
  
  const goToToday = () => {
    onDateChange(new Date());
  };
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>
      
      <h1 className="text-xl font-semibold">
        {format(currentDate, 'MMMM yyyy')}
      </h1>
      
      <div className="w-[120px]" />
    </div>
  );
}

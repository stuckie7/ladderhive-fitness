
import { Button } from "@/components/ui/button";

interface ExercisePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ExercisePagination = ({
  currentPage,
  totalPages,
  onPageChange
}: ExercisePaginationProps) => {
  const visiblePages = Math.min(5, totalPages);
  
  // Create page buttons with a sliding window effect for large number of pages
  const getPageNumbers = () => {
    if (totalPages <= visiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    // When we're at the start
    if (currentPage < 3) {
      return [0, 1, 2, 3, 4];
    }
    
    // When we're at the end
    if (currentPage > totalPages - 4) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 5 + i);
    }
    
    // In the middle - show current and 2 on each side
    return [
      currentPage - 2,
      currentPage - 1, 
      currentPage,
      currentPage + 1,
      currentPage + 2
    ];
  };
  
  return (
    <div className="flex justify-between mt-8">
      <Button 
        variant="outline" 
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
      >
        Previous
      </Button>
      
      <div className="hidden md:flex items-center gap-2">
        {getPageNumbers().map((pageNum) => (
          <Button 
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"} 
            className="w-10 h-10 p-0"
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum + 1}
          </Button>
        ))}
      </div>
      
      <div className="md:hidden flex items-center">
        <span className="text-sm">{currentPage + 1} / {totalPages}</span>
      </div>
      
      <Button 
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        Next
      </Button>
    </div>
  );
};

export default ExercisePagination;

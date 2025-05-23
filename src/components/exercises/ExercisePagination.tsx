
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  siblingsCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export default function ExercisePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = "",
  siblingsCount = 1,
}: PaginationProps) {
  // Calculate start and end item numbers for current page
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    // Always show first page, last page, and pages around current page
    const range = (start: number, end: number) => 
      Array.from({ length: end - start + 1 }, (_, i) => start + i);
    
    const firstPage = 1;
    const lastPage = totalPages;
    
    // Calculate range around current page
    let startPage = Math.max(firstPage, currentPage - siblingsCount);
    let endPage = Math.min(lastPage, currentPage + siblingsCount);
    
    // Adjust range if at boundaries
    if (currentPage <= siblingsCount + 1) {
      endPage = Math.min(firstPage + siblingsCount * 2, lastPage);
    }
    
    if (currentPage >= lastPage - siblingsCount) {
      startPage = Math.max(lastPage - siblingsCount * 2, firstPage);
    }
    
    // Build the array of page numbers to display
    const pages = range(startPage, endPage);
    
    // Add first page and ellipsis if needed
    if (startPage > firstPage + 1) {
      pages.unshift(-1); // Ellipsis
      pages.unshift(firstPage);
    } else if (startPage === firstPage + 1) {
      pages.unshift(firstPage);
    }
    
    // Add last page and ellipsis if needed
    if (endPage < lastPage - 1) {
      pages.push(-1); // Ellipsis
      pages.push(lastPage);
    } else if (endPage === lastPage - 1) {
      pages.push(lastPage);
    }
    
    return pages;
  };

  const handleManualPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      onPageChange(value);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-muted/20 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Show:</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder={`${pageSize}`} />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        <div className="hidden md:flex items-center gap-1">
          {pageNumbers.map((pageNum, idx) => 
            pageNum === -1 ? (
              <span key={`ellipsis-${idx}`} className="px-2">...</span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(pageNum)}
                aria-current={pageNum === currentPage ? "page" : undefined}
                className="h-8 w-8"
              >
                {pageNum}
              </Button>
            )
          )}
        </div>
        
        <div className="flex md:hidden items-center gap-1 px-2">
          <span className="text-sm font-medium">Page</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handleManualPageChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label={`Current page, page ${currentPage} of ${totalPages}`}
          />
          <span className="text-sm text-muted-foreground">
            of {totalPages}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Last page"
          aria-label={`Last page, page ${totalPages}`}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        <span className="font-medium">
          {totalItems === 0 ? 0 : startItem.toLocaleString()}
        </span>
        {' - '}
        <span className="font-medium">
          {endItem.toLocaleString()}
        </span>
        {' of '}
        <span className="font-medium">
          {totalItems.toLocaleString()}
        </span>
        {' exercises'}
      </div>
    </div>
  );
}

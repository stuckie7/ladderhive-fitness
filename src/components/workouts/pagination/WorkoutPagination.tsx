
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Loader } from "lucide-react";

interface WorkoutPaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  paginationType?: 'classic' | 'loadMore';
  showItemCount?: boolean;
}

export const WorkoutPagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  isLoading = false,
  paginationType = 'classic',
  showItemCount = true
}: WorkoutPaginationProps) => {
  const [totalPages, setTotalPages] = useState(Math.ceil(totalItems / itemsPerPage));
  
  // Update total pages when items or per page changes
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(totalItems / itemsPerPage)));
  }, [totalItems, itemsPerPage]);
  
  // Calculate which page links to show
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);
      
      // Middle pages
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(currentPage + 1, totalPages - 2);
      
      // Adjust if we're near the start
      if (currentPage < 2) {
        endPage = 3;
      }
      
      // Adjust if we're near the end
      if (currentPage > totalPages - 3) {
        startPage = totalPages - 4;
      }
      
      // Show ellipsis before middle pages if needed
      if (startPage > 1) {
        pages.push("ellipsis-start");
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Show ellipsis after middle pages if needed
      if (endPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }
      
      // Always show last page
      pages.push(totalPages - 1);
    }
    
    return pages;
  };
  
  if (totalItems === 0) return null;
  
  if (paginationType === 'loadMore') {
    return (
      <div className="flex justify-center mt-8">
        {currentPage < totalPages - 1 ? (
          <Button 
            className="w-full max-w-xs"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLoading || currentPage >= totalPages - 1}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        ) : (
          showItemCount && (
            <p className="text-center text-muted-foreground">
              Showing all {totalItems} items
            </p>
          )
        )}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center mt-8 gap-2">
      {/* Mobile pagination */}
      <div className="flex md:hidden items-center justify-between w-full">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
        >
          Previous
        </Button>
        <span className="text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || isLoading}
        >
          Next
        </Button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden md:flex">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 0) onPageChange(currentPage - 1);
                }}
                className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return (
                <PaginationItem key={index}>
                  <PaginationLink 
                    href="#" 
                    isActive={pageNum === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(pageNum as number);
                    }}
                  >
                    {(pageNum as number) + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
                }}
                className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      
      {showItemCount && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {Math.min(currentPage * itemsPerPage + 1, totalItems)} - {Math.min((currentPage + 1) * itemsPerPage, totalItems)} of {totalItems} items
        </p>
      )}
    </div>
  );
};

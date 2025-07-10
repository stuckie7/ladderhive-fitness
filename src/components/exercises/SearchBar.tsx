
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar = ({ searchQuery, handleSearchChange }: SearchBarProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Search exercises..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="pl-10"
      />
    </div>
  );
};

export default SearchBar;

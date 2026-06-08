import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchFilters {
  query: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: 'recent' | 'oldest' | 'alphabetical';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isDarkMode?: boolean;
}

export function AdvancedSearch({ onSearch, isDarkMode = false }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'recent',
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      sortBy: 'recent',
    });
  };

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 p-2 rounded-lg border ${
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-300'
      }`}>
        <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className={`flex-1 bg-transparent outline-none ${
            isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
          }`}
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1 rounded transition-colors ${
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-400'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className={`p-3 rounded-lg space-y-3 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className={`w-full p-2 rounded border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Search
            </Button>
            <Button
              onClick={handleReset}
              className={`flex-1 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
              }`}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

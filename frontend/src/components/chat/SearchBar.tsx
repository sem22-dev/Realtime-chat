
import React from 'react';
import { BiSearchAlt } from 'react-icons/bi';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => (
  <div className="p-4 border-b border-gray-200">
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        className="w-full p-2 pl-10 rounded-lg border bg-gray-100"
      />
      <BiSearchAlt className="w-6 h-6 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />


    </div>
  </div>
);

export default SearchBar;
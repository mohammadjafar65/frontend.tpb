const SearchBar = ({ searchTerm, onSearch }) => (
    <input
        type="text"
        placeholder="Search packages by title..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full border px-4 py-2 rounded-md shadow"
    />
);

export default SearchBar;

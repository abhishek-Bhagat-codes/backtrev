import Filter from "./TouristFilter";

const SearchFilterBar = ({ search, setSearch, status, setStatus }) => {
    return (
        <div className="flex gap-4 mb-4">
            {/* Search box */}
            <input type="text" placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-950 border border-gray-700 rounded-md px-4 py-2 text-sm outline-none focus:border-blue-500"
            />
            
            <Filter status={status} setStatus={setStatus} />
        </div>
    );
};

export default SearchFilterBar;

import { useState, useMemo, useCallback } from 'react';

export const useProteinData = (initialData = []) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeESM1b, setActiveESM1b] = useState("ALL");
  const [activeClass, setActiveClass] = useState("ALL");
  const [activeMech, setActiveMech] = useState("ALL");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Small number = Fast performance

  // 1. Filter the big list down based on search and buttons
  const filteredData = useMemo(() => {
    if (!initialData) return [];
    
    return initialData.filter((item) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search || 
        String(item.variant_id).toLowerCase().includes(search);
        
      const matchesESM = activeESM1b === "ALL" || item.ESM1b_is_pathogenic === activeESM1b;
      const matchesClass = activeClass === "ALL" || item.am_class === activeClass;
      const matchesMech = activeMech === "ALL" || (item.mechanistic_label || "Unassigned") === activeMech;
      
      return matchesSearch && matchesESM && matchesClass && matchesMech;
    });
  }, [initialData, searchTerm, activeESM1b, activeClass, activeMech]);

  // 2. Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  
  // 3. Slice the data so we only render 20 rows
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // 4. Unified filter updater that resets the page to 1
  const updateFilter = useCallback((type, value) => {
    if (type === 'esm') setActiveESM1b(value);
    if (type === 'class') setActiveClass(value);
    if (type === 'mech') setActiveMech(value);
    if (type === 'search') setSearchTerm(value);
    setCurrentPage(1); // Crucial: Reset to page 1 on every filter change
  }, []);

  return {
    paginatedData,
    filteredData,
    searchTerm,
    activeESM1b,
    activeClass,
    activeMech,
    currentPage,
    totalPages,
    updateFilter,
    setCurrentPage,
  };
};
'use client';

import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setTotalItems: (total: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  skip: number;
  take: number;
}

export function usePagination({
  initialPage = 1,
  itemsPerPage: initialItemsPerPage = 10,
  totalItems: initialTotalItems = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(initialTotalItems);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const setItemsPerPage = useCallback((items: number) => {
    setItemsPerPageState(Math.max(1, items));
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  const setTotalItemsCount = useCallback((total: number) => {
    setTotalItems(Math.max(0, total));
    // Adjust current page if it's beyond the new total pages
    const newTotalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [itemsPerPage, currentPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const skip = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const take = itemsPerPage;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    setPage,
    setItemsPerPage,
    setTotalItems: setTotalItemsCount,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    skip,
    take,
  };
}


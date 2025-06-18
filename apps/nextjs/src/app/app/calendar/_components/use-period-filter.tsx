import { parseAsIsoDate, useQueryStates } from "nuqs";

export function usePeriodFilter() {
  const [filters, setFilters] = useQueryStates({
    startDate: parseAsIsoDate.withDefault(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    endDate: parseAsIsoDate.withDefault(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    ),
  });

  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    setStartDate: (date: Date | null) => setFilters({ startDate: date }),
    setEndDate: (date: Date | null) => setFilters({ endDate: date }),
    setPeriod: (startDate: Date | null, endDate: Date | null) =>
      setFilters({ startDate, endDate }),
    resetFilters: () =>
      setFilters({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
        ),
      }),
  };
}

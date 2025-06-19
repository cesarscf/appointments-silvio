// src/hooks/useMetrics.ts

import { api } from "@/utils/api";

export const useMetrics = () => {
  const utils = api.useUtils();

  const totalRevenue = api.metrics.totalRevenue.useQuery();
  const monthlyRevenue = api.metrics.monthlyRevenue.useQuery();
  const revenueByPaymentType = api.metrics.revenueByPaymentType.useQuery();
  const revenueByService = api.metrics.revenueByService.useQuery();
  const revenueByEmployee = api.metrics.revenueByEmployee.useQuery();

  const refreshAll = async () => {
    await Promise.all([
      utils.metrics.totalRevenue.invalidate(),
      utils.metrics.monthlyRevenue.invalidate(),
      utils.metrics.revenueByPaymentType.invalidate(),
      utils.metrics.revenueByService.invalidate(),
      utils.metrics.revenueByEmployee.invalidate(),
    ]);
  };

  return {
    totalRevenue,
    monthlyRevenue,
    revenueByPaymentType,
    revenueByService,
    revenueByEmployee,
    refreshAll,
  };
};

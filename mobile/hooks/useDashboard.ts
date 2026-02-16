import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

interface DashboardKPI {
    totalOrders: number;
    totalSpent: number;
    deliveredOrders: number;
    pendingOrders: number;
}

export const useDashboardKPI = () => {
    const api = useApi();

    return useQuery<DashboardKPI>({
        queryKey: ["dashboard-kpi"],
        queryFn: async () => {
            const { data } = await api.get("/orders/dashboard-kpi");
            return data;
        },
    });
};

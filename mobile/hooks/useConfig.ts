import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { AppConfig } from "@/types";

export const useConfig = () => {
    const api = useApi();

    return useQuery<AppConfig>({
        queryKey: ["app-config"],
        queryFn: async () => {
            const { data } = await api.get("/config", { timeout: 5000 }); // 5 second timeout
            return data;
        },
        staleTime: 1000 * 60, // 1 minute
        refetchInterval: 1000 * 30, // Poll every 30 seconds for live sale sync
        retry: 1,
        refetchOnWindowFocus: true,
    });
};

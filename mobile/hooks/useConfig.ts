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
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1, // Only retry once to avoid long hangs
        refetchOnWindowFocus: true,
    });
};

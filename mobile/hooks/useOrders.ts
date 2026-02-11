import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Order } from "@/types";

export const useOrders = () => {
  const api = useApi();

  return useInfiniteQuery({
    queryKey: ["orders"],
    queryFn: async ({ pageParam = null }) => {
      const { data } = await api.get("/orders", {
        params: {
          cursor: pageParam,
          limit: 10
        }
      });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: null,
  });
};

export const useOrderDetails = (id: string) => {
  const api = useApi();

  return useQuery<Order>({
    queryKey: ["order", id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        return data.order;
      } catch (error: any) {
        console.error("useOrderDetails fetch error:", error?.response?.data || error.message);
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useUpdateOrderProof = () => {
  const api = useApi();

  return {
    updateProofAsync: async ({ id, paymentProof }: { id: string; paymentProof: any }) => {
      const { data } = await api.put(`/orders/${id}/payment-proof`, { paymentProof });
      return data.order;
    }
  };
};

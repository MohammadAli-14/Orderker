import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    isPhoneVerified: boolean;
    imageUrl?: string;
    role: "user" | "admin";
}

export const useProfile = () => {
    const api = useApi();
    const queryClient = useQueryClient();

    const {
        data: profile,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data } = await api.get<{ user: UserProfile }>("/users/me");
            return data.user;
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (profileData: Partial<UserProfile>) => {
            const { data } = await api.put<{ user: UserProfile }>("/users/me", profileData);
            return data.user;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });

    return {
        profile,
        isLoading,
        isError,
        updateProfile: updateProfileMutation.mutate,
        isUpdating: updateProfileMutation.isPending,
    };
};

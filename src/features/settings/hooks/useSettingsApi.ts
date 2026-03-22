import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { useToast } from "@/hooks/use-toast";
import { fetchSettings, patchSettings } from "@/lib/settingsService";
import type { SettingsFormValues } from "../types";

const settingsKey = (uid: string) => ["settings", uid] as const;

export function useSettingsApi() {
	const { user } = useAuth();
	const uid = user?.uid;
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const query = useQuery({
		queryKey: settingsKey(uid ?? ""),
		queryFn: () => fetchSettings(uid!),
		enabled: !!uid,
		staleTime: Infinity,
	});

	const mutation = useMutation({
		mutationFn: (data: SettingsFormValues) => patchSettings(uid!, data),
		onSuccess: (_, variables) => {
			queryClient.setQueryData(settingsKey(uid!), variables);
			toast({ title: "Settings saved" });
		},
		onError: () => {
			toast({
				title: "Failed to save settings",
				description: "Please check your connection and try again.",
				variant: "destructive",
			});
		},
	});

	return {
		settings: query.data,
		isLoading: query.isLoading,
		updateSettings: mutation.mutate,
		isSaving: mutation.isPending,
	};
}

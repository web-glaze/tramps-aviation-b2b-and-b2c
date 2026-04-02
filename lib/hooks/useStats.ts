import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api/services";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

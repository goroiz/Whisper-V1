import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function SiteRatingInput() {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [userSessionId, setUserSessionId] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = localStorage.getItem("userSessionId") || `session-${Date.now()}-${Math.random()}`;
    localStorage.setItem("userSessionId", sessionId);
    setUserSessionId(sessionId);
  }, []);

  const { data: siteRating } = useQuery({
    queryKey: ["/api/site-rating"],
    queryFn: async () => {
      const res = await fetch("/api/site-rating");
      return res.json();
    },
  });

  const { mutate: submitRating, isPending } = useMutation({
    mutationFn: async (rating: number) => {
      return await apiRequest("POST", "/api/site-rating", {
        rating,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-rating"] });
      toast({
        title: "Thank you!",
        description: "Your rating has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const averageRating = siteRating?.averageRating || 0;
  const ratingCount = siteRating?.ratingCount || 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => submitRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            disabled={isPending}
            className="transition-transform hover:scale-110 disabled:opacity-50"
            data-testid={`button-site-rate-${star}`}
          >
            <Star
              className={`w-5 h-5 transition-all ${
                (hoveredRating || 0) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {averageRating > 0 ? `${(averageRating / 20).toFixed(1)}/5 (${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"})` : "Be the first to rate"}
      </span>
      {isPending && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RatingInputProps {
  postId: number;
  currentRating?: number;
}

export function RatingInput({ postId, currentRating }: RatingInputProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [userSessionId, setUserSessionId] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = localStorage.getItem("userSessionId") || Math.random().toString(36).substring(7);
    localStorage.setItem("userSessionId", sessionId);
    setUserSessionId(sessionId);
  }, []);

  const { mutate: submitRating, isPending } = useMutation({
    mutationFn: async (rating: number) => {
      return await apiRequest("POST", `/api/posts/${postId}/rating`, {
        rating,
        userSession: userSessionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this post!",
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

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => submitRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            disabled={isPending}
            className="transition-transform hover:scale-110 disabled:opacity-50"
            data-testid={`button-rate-${star}`}
          >
            <Star
              className={`w-5 h-5 transition-all ${
                (hoveredRating || currentRating || 0) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
    </div>
  );
}

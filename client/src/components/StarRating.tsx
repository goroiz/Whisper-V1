import { Star } from "lucide-react";

interface StarRatingProps {
  averageRating: number;
  ratingCount: number;
}

export function StarRating({ averageRating, ratingCount }: StarRatingProps) {
  const displayRating = Math.round(averageRating / 20); // Convert 0-100 to 1-5 scale
  const stars = Array.from({ length: 5 }, (_, i) => i < displayRating);

  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      <div className="flex gap-1">
        {stars.map((isFilled, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {displayRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
      </span>
    </div>
  );
}

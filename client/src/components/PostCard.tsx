import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface PostCardProps {
  post: Post;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const [userSessionId, setUserSessionId] = useState<string>("");
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const sessionId = localStorage.getItem("userSessionId") || `session-${Date.now()}-${Math.random()}`;
    localStorage.setItem("userSessionId", sessionId);
    setUserSessionId(sessionId);
  }, []);

  const { mutate: toggleLike, isPending } = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`, {});
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <div className="bg-card rounded-2xl p-6 border border-border/40 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 border border-border/50">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.id}`} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs">U</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">Anonymous</span>
                <span className="text-xs text-muted-foreground">@{post.id}</span>
              </div>
              <time className="text-xs font-medium text-muted-foreground/60 whitespace-nowrap">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </time>
            </div>

            <Link href={`/post/${post.id}`} className="block group cursor-pointer">
              <p className="text-base leading-relaxed text-foreground/90 font-medium group-hover:text-primary/80 transition-colors">
                {post.content}
              </p>
            </Link>

            <div className="flex items-center justify-between pt-2">
              <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground group hover:text-primary/70 transition-colors">
                <div className="p-1.5 rounded-full group-hover:bg-primary/5 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="font-medium">Comments</span>
              </Link>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => toggleLike()}
                disabled={isPending}
                className="gap-1.5 px-2"
                data-testid="button-like-post"
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                <span className="text-xs font-medium">{post.likesCount || 0}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

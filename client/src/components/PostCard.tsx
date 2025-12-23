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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/post/${post.id}`} className="block group">
        <div className="bg-card rounded-3xl p-8 border border-border/30 shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:bg-card/80 backdrop-blur-sm">
          <div className="flex gap-5">
            <Avatar className="h-12 w-12 border-2 border-border/50 flex-shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.id}`} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">A</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm">Anonymous</span>
                  <span className="text-xs text-muted-foreground/60">@{String(post.id).slice(0, 8)}</span>
                </div>
                <time className="text-xs font-medium text-muted-foreground/50 whitespace-nowrap ml-auto">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </time>
              </div>

              <p className="text-base leading-relaxed text-foreground/85 font-medium group-hover:text-foreground transition-colors duration-200 break-words">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border/20">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-primary/80 transition-colors duration-200"
                >
                  <div className="p-2 rounded-full hover:bg-primary/5 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Comments</span>
                </motion.button>
                
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleLike();
                  }}
                  disabled={isPending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-red-500/80 transition-colors duration-200 disabled:opacity-50"
                >
                  <div className="p-2 rounded-full hover:bg-red-500/5 transition-colors">
                    <Heart className={`w-4 h-4 transition-all duration-200 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  </div>
                  <span className="text-xs font-semibold">{post.likesCount || 0}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

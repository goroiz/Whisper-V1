import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Post } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingInput } from "@/components/RatingInput";
import { StarRating } from "@/components/StarRating";

interface PostCardProps {
  post: Post;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
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
                <span className="font-medium">View thread</span>
              </Link>
              
              <div className="flex flex-col items-end gap-2">
                {(post.ratingCount ?? 0) > 0 && (
                  <StarRating averageRating={post.averageRating ?? 0} ratingCount={post.ratingCount ?? 0} />
                )}
                <RatingInput postId={post.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

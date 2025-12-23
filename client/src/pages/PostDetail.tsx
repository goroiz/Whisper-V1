import { usePost, useComments, useCreateComment } from "@/hooks/use-posts";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ArrowLeft, Send, Heart } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: post, isLoading: postLoading } = usePost(id);
  const { data: comments, isLoading: commentsLoading } = useComments(id);
  
  const [commentContent, setCommentContent] = useState("");
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});
  const createComment = useCreateComment();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const sessionId = localStorage.getItem("userSessionId") || `session-${Date.now()}-${Math.random()}`;
    localStorage.setItem("userSessionId", sessionId);
  }, []);

  const { mutate: toggleCommentLike } = useMutation({
    mutationFn: async (commentId: number) => {
      const isLiked = commentLikes[commentId];
      if (isLiked) {
        await apiRequest("DELETE", `/api/comments/${commentId}/like`);
      } else {
        await apiRequest("POST", `/api/comments/${commentId}/like`, {});
      }
    },
    onSuccess: (_, commentId) => {
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/posts", id, "comments"] });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    createComment.mutate(
      { postId: id, content: commentContent },
      {
        onSuccess: () => {
          setCommentContent("");
          toast({
            title: "Reply sent",
            description: "Your comment has been added to the thread.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to post comment. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Post not found</h2>
          <Link href="/" className="text-primary hover:underline">Return to feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to feed
        </Link>

        {/* Main Post */}
        <motion.article 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12 border border-border/50">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.id}`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg text-foreground">Anonymous</h2>
              <time className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </time>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl leading-relaxed text-foreground font-medium font-display">
            {post.content}
          </p>
        </motion.article>

        {/* Comment Form */}
        <div className="mb-10 pl-6 border-l-2 border-border/30">
          <form onSubmit={handleCommentSubmit} className="relative">
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your reply..."
              className="min-h-[100px] resize-none border border-border/50 focus:border-primary/50 bg-background/50 rounded-xl p-4 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
              maxLength={280}
            />
            <div className="flex justify-end mt-3">
              <Button 
                type="submit" 
                disabled={!commentContent.trim() || createComment.isPending}
                className="rounded-full"
                size="sm"
              >
                {createComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Reply
              </Button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6 pl-2">
            Comments ({comments?.length || 0})
          </h3>

          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
            </div>
          ) : comments?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground italic bg-muted/30 rounded-2xl">
              No comments yet. Start the conversation.
            </div>
          ) : (
            comments?.map((comment, idx) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex gap-4 p-5 bg-background border border-border/30 rounded-2xl hover:border-border/60 transition-colors"
              >
                <Avatar className="h-8 w-8 mt-1 border border-border/30">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.id + 100}`} />
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Anonymous</span>
                    <span className="text-xs text-muted-foreground/60">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-sm">
                    {comment.content}
                  </p>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleCommentLike(comment.id)}
                      className="gap-1 px-2 h-7"
                      data-testid={`button-like-comment-${comment.id}`}
                    >
                      <Heart className={`w-3 h-3 ${commentLikes[comment.id] ? "fill-red-500 text-red-500" : ""}`} />
                      <span className="text-xs">{comment.likesCount || 0}</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useCreatePost } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutate, isPending } = useCreatePost();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    mutate(
      { content },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          setTimeout(() => {
            setContent("");
            setIsSubmitted(false);
            toast({
              title: "Post published",
              description: "Your thought has been shared with the world.",
            });
            onSuccess?.();
          }, 600);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-3xl p-6 shadow-sm mb-8"
    >
      <form onSubmit={handleSubmit} className="relative">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <Check className="w-6 h-6 text-green-500" />
              </motion.div>
              <p className="text-sm font-medium text-foreground">Post published!</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none border-none bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 p-0"
                maxLength={280}
                data-testid="textarea-post-content"
              />
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <div className="text-xs font-medium text-muted-foreground">
                  <span className={content.length > 250 ? "text-orange-500" : ""}>
                    {content.length}
                  </span>
                  <span className="opacity-50"> / 280</span>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!content.trim() || isPending}
                  className="rounded-full px-6"
                  data-testid="button-submit-post"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}

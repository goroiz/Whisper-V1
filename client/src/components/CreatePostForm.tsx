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
      className="bg-card border border-border/40 rounded-3xl p-8 shadow-lg mb-8"
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
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeatDelay: 0.5 }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400/20 to-green-500/20 flex items-center justify-center"
              >
                <Check className="w-7 h-7 text-green-500 font-bold" />
              </motion.div>
              <motion.p 
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-base font-semibold text-foreground"
              >
                Post published!
              </motion.p>
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
                className="min-h-[140px] resize-none border-0 bg-transparent text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 p-0 focus-visible:outline-none"
                maxLength={280}
                data-testid="textarea-post-content"
              />
              
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/30">
                <motion.div 
                  animate={{ scale: content.length > 250 ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-xs font-semibold text-muted-foreground"
                >
                  <span className={content.length > 250 ? "text-orange-500 font-bold" : ""}>
                    {content.length}
                  </span>
                  <span className="opacity-40"> / 280</span>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: !content.trim() || isPending ? 1 : 1.05 }}
                  whileTap={{ scale: !content.trim() || isPending ? 1 : 0.95 }}
                >
                  <Button 
                    type="submit" 
                    disabled={!content.trim() || isPending}
                    className="rounded-full px-8 font-semibold bg-primary hover:bg-primary/90"
                    data-testid="button-submit-post"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Post
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}

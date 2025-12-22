import { useState } from "react";
import { useCreatePost } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const { mutate, isPending } = useCreatePost();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    mutate(
      { content },
      {
        onSuccess: () => {
          setContent("");
          toast({
            title: "Post published",
            description: "Your thought has been shared with the world.",
          });
          onSuccess?.();
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
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none border-none bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 p-0"
          maxLength={280}
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
            className="rounded-full px-6 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Post
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

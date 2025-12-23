import { useState } from "react";
import { useCreatePost } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Check, Image, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GifSearchModal } from "./GifSearchModal";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGifModalOpen, setIsGifModalOpen] = useState(false);
  const { mutate, isPending } = useCreatePost();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    mutate(
      { content, gifUrl: gifUrl || undefined },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          setTimeout(() => {
            setContent("");
            setGifUrl(null);
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
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-card border border-border/40 rounded-3xl p-8 shadow-lg"
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
                className="space-y-4"
              >
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[140px] resize-none border-0 bg-transparent text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 p-0 focus-visible:outline-none"
                  maxLength={280}
                  data-testid="textarea-post-content"
                />

                {/* GIF Preview */}
                {gifUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-2xl overflow-hidden bg-muted"
                  >
                    <img
                      src={gifUrl}
                      alt="Selected GIF"
                      className="w-full h-auto max-h-[200px] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setGifUrl(null)}
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      data-testid="button-remove-gif"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
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

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsGifModalOpen(true)}
                      className="rounded-full"
                      data-testid="button-add-gif"
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                    
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      <AnimatePresence>
        {isGifModalOpen && (
          <GifSearchModal
            onSelectGif={setGifUrl}
            onClose={() => setIsGifModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

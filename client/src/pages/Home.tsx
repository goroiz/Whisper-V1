import { useState } from "react";
import { usePosts } from "@/hooks/use-posts";
import { CreatePostForm } from "@/components/CreatePostForm";
import { PostCard } from "@/components/PostCard";
import { Header } from "@/components/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PenTool, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: posts, isLoading, isError } = usePosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mb-3 tracking-tight text-foreground"
          >
            Share your thoughts.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            A simple, quiet place for your words.
          </motion.p>
        </div>

        <div className="space-y-6 mt-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground/50">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium animate-pulse">Loading feed...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 p-6 rounded-3xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
              <p className="font-medium">Failed to load posts. Please try again later.</p>
            </div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-3xl">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <PenTool className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-1">It's quiet here</h3>
              <p className="text-muted-foreground">Be the first to share something.</p>
            </div>
          ) : (
            posts?.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share your thoughts</DialogTitle>
          </DialogHeader>
          <CreatePostForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-8 right-8 z-40"
      >
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
          data-testid="button-create-post"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
}

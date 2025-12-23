import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GifSearchModalProps {
  onSelectGif: (gifUrl: string) => void;
  onClose: () => void;
}

interface GifResult {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
  };
}

export function GifSearchModal({ onSelectGif, onClose }: GifSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingGifs, setTrendingGifs] = useState<GifResult[]>([]);

  const apiKey = import.meta.env.VITE_GIPHY_API_KEY;

  // Load trending GIFs on mount
  useEffect(() => {
    const fetchTrendingGifs = async () => {
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`
        );
        const data = await response.json();
        setTrendingGifs(data.data || []);
        setGifs(data.data || []);
      } catch (error) {
        console.error("Error fetching trending GIFs:", error);
      }
    };

    fetchTrendingGifs();
  }, [apiKey]);

  const searchGifs = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setGifs(trendingGifs);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
            query
          )}&limit=20&rating=g`
        );
        const data = await response.json();
        setGifs(data.data || []);
      } catch (error) {
        console.error("Error searching GIFs:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, trendingGifs]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchGifs(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchGifs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-background rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Search GIFs
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for GIFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted border-0 rounded-xl focus-visible:ring-1"
              data-testid="input-gif-search"
            />
          </div>
        </div>

        {/* GIFs Grid */}
        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Searching GIFs...</p>
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-sm text-muted-foreground">No GIFs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {gifs.map((gif, index) => (
                  <motion.button
                    key={gif.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => {
                      onSelectGif(gif.images.fixed_height.url);
                      onClose();
                    }}
                    className="relative group overflow-hidden rounded-2xl aspect-square"
                  >
                    <img
                      src={gif.images.fixed_height.url}
                      alt="GIF"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectGif(gif.images.fixed_height.url);
                          onClose();
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}

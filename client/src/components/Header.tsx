import { Link } from "wouter";
import { motion } from "framer-motion";
import { Feather } from "lucide-react";

export function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl transition-transform group-hover:rotate-12 duration-300 shadow-lg shadow-primary/20">
            <Feather className="w-5 h-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Whisper
          </span>
        </Link>
      </div>
    </motion.header>
  );
}

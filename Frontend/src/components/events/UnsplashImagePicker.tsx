import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface UnsplashImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function UnsplashImagePicker({
  isOpen,
  onClose,
  onSelect,
}: UnsplashImagePickerProps) {
  const [query, setQuery] = useState("event");
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchImages = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=12&client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`
      );
      const data = await response.json();
      setImages(data.results || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to fetch images. Please check your Unsplash API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(query);
  };

  // Load initial images when dialog opens
  useEffect(() => {
    if (isOpen && images.length === 0) {
      searchImages(query);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Cover Image</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for images..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 py-4">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image.urls.regular)}
                  className="relative aspect-video overflow-hidden rounded-lg border-2 border-transparent hover:border-purple-500 transition-all"
                >
                  <img
                    src={image.urls.small}
                    alt={image.description || "Unsplash image"}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          {!loading && images.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              Search for images to get started
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Photos from{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Unsplash
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}


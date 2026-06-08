import { useState, useEffect } from 'react';
import { Streamdown } from 'streamdown';
import { getImagesForMessage, ImageResult } from '@/services/imageSearch';
import { Loader2 } from 'lucide-react';

interface MessageWithImagesProps {
  content: string;
  role: 'user' | 'assistant';
  showImages?: boolean;
}

export function MessageWithImages({ content, role, showImages = true }: MessageWithImagesProps) {
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    if (showImages && role === 'assistant' && content) {
      setIsLoadingImages(true);
      getImagesForMessage(content)
        .then(setImages)
        .catch(err => console.error('Error fetching images:', err))
        .finally(() => setIsLoadingImages(false));
    }
  }, [content, role, showImages]);

  return (
    <div className="space-y-3">
      {/* Text content */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <Streamdown>{content}</Streamdown>
      </div>

      {/* Images */}
      {showImages && role === 'assistant' && (
        <div className="mt-3">
          {isLoadingImages ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading images...</span>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {images.map((image, idx) => (
                <div key={idx} className="overflow-hidden rounded-lg border border-border">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-32 object-cover hover:scale-105 transition-transform"
                    loading="lazy"
                    onError={(e) => {
                      // Hide broken images
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

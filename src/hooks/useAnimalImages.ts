import { useState, useEffect } from 'react';

interface AnimalImageSet {
  watchImages: string[];
  hideImages: string[];
  peakImages: string[];
}

interface AnimalImages {
  bear: AnimalImageSet;
  dog: AnimalImageSet;
  cat: AnimalImageSet;
}

export function useAnimalImages(): AnimalImages {
  const [images, setImages] = useState<AnimalImages>({
    bear: { watchImages: [], hideImages: [], peakImages: [] },
    dog: { watchImages: [], hideImages: [], peakImages: [] },
    cat: { watchImages: [], hideImages: [], peakImages: [] },
  });

  useEffect(() => {
    type ImageModule = { default: string };

    const loadAnimalImages = async (animal: 'bear' | 'dog' | 'cat') => {
      const watchGlob = import.meta.glob<ImageModule>(`/src/assets/img/watch_${animal}_*.png`, { eager: true });
      const hideGlob = import.meta.glob<ImageModule>(`/src/assets/img/hide_${animal}_*.png`, { eager: true });
      const peakGlob = import.meta.glob<ImageModule>(`/src/assets/img/peak_${animal}_*.png`, { eager: true });

      const sortImages = (glob: Record<string, ImageModule>) =>
        Object.values(glob)
          .map((img) => img.default)
          .sort((a, b) => {
            const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
            const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
            return aNum - bNum;
          });

      return {
        watchImages: sortImages(watchGlob),
        hideImages: sortImages(hideGlob),
        peakImages: sortImages(peakGlob),
      };
    };

    const loadAllImages = async () => {
      try {
        const [bear, dog, cat] = await Promise.all([
          loadAnimalImages('bear'),
          loadAnimalImages('dog'),
          loadAnimalImages('cat'),
        ]);
        setImages({ bear, dog, cat });
      } catch {
        console.info('Some animal images not yet available');
      }
    };

    loadAllImages();
  }, []);

  return images;
}

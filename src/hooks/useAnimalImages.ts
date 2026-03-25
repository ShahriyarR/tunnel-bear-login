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

    const sortImages = (glob: Record<string, ImageModule>) =>
      Object.values(glob)
        .map((img) => img.default)
        .sort((a, b) => {
          const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
          const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
          return aNum - bNum;
        });

    const loadAllImages = () => {
      try {
        const bearWatchGlob = import.meta.glob<ImageModule>('/src/assets/img/watch_bear_*.png', { eager: true });
        const bearHideGlob = import.meta.glob<ImageModule>('/src/assets/img/hide_bear_*.png', { eager: true });
        const bearPeakGlob = import.meta.glob<ImageModule>('/src/assets/img/peak_bear_*.png', { eager: true });

        const dogWatchGlob = import.meta.glob<ImageModule>('/src/assets/img/watch_dog_*.png', { eager: true });
        const dogHideGlob = import.meta.glob<ImageModule>('/src/assets/img/hide_dog_*.png', { eager: true });
        const dogPeakGlob = import.meta.glob<ImageModule>('/src/assets/img/peak_dog_*.png', { eager: true });

        const catWatchGlob = import.meta.glob<ImageModule>('/src/assets/img/watch_cat_*.png', { eager: true });
        const catHideGlob = import.meta.glob<ImageModule>('/src/assets/img/hide_cat_*.png', { eager: true });
        const catPeakGlob = import.meta.glob<ImageModule>('/src/assets/img/peak_cat_*.png', { eager: true });

        setImages({
          bear: {
            watchImages: sortImages(bearWatchGlob),
            hideImages: sortImages(bearHideGlob),
            peakImages: sortImages(bearPeakGlob),
          },
          dog: {
            watchImages: sortImages(dogWatchGlob),
            hideImages: sortImages(dogHideGlob),
            peakImages: sortImages(dogPeakGlob),
          },
          cat: {
            watchImages: sortImages(catWatchGlob),
            hideImages: sortImages(catHideGlob),
            peakImages: sortImages(catPeakGlob),
          },
        });
      } catch {
        console.info('Some animal images not yet available');
      }
    };

    loadAllImages();
  }, []);

  return images;
}

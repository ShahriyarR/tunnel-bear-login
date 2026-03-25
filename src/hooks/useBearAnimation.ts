import { useState, useEffect, useRef, useCallback } from 'react';

type InputFocus = 'EMAIL' | 'PASSWORD';

type AnimalType = 'bear' | 'dog' | 'cat';

interface AnimalImages {
  bear: { watchImages: string[]; hideImages: string[]; peakImages: string[] };
  dog: { watchImages: string[]; hideImages: string[]; peakImages: string[] };
  cat: { watchImages: string[]; hideImages: string[]; peakImages: string[] };
}

interface UseBearAnimationProps {
  watchBearImages: string[];
  hideBearImages: string[];
  peakBearImages: string[];
  emailLength: number;
  showPassword: boolean;
  animalImages?: AnimalImages;
}

export function useBearAnimation({
  watchBearImages,
  hideBearImages,
  peakBearImages,
  emailLength,
  showPassword,
  animalImages,
}: UseBearAnimationProps) {
  const [currentFocus, setCurrentFocus] = useState<InputFocus>('EMAIL');
  const [currentAnimalType] = useState<AnimalType>('bear');
  const [currentBearImage, setCurrentBearImage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const prevFocus = useRef(currentFocus);
  const prevShowPassword = useRef(showPassword);
  const timeouts = useRef<number[]>([]);

  const getCurrentAnimalImages = useCallback(() => {
    if (animalImages) {
      return animalImages[currentAnimalType];
    }
    return {
      watchImages: watchBearImages,
      hideImages: hideBearImages,
      peakImages: peakBearImages,
    };
  }, [animalImages, currentAnimalType, watchBearImages, hideBearImages, peakBearImages]);

  useEffect(() => {
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // Clear existing timeouts
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    const animateImages = (
      images: string[],
      interval: number,
      reverse = false,
      onComplete?: () => void,
    ) => {
      if (images.length === 0) {
        onComplete?.();
        return;
      }

      setIsAnimating(true);
      const imageSequence = reverse ? [...images].reverse() : images;

      imageSequence.forEach((img, index) => {
        const timeoutId = setTimeout(() => {
          setCurrentBearImage(img);
          if (index === imageSequence.length - 1) {
            setIsAnimating(false);
            onComplete?.();
          }
        }, index * interval);
        timeouts.current.push(timeoutId);
      });
    };

    const currentImages = getCurrentAnimalImages();

    // For password input, animate through hide bear images
    const animateWatchingBearImages = () => {
      const progress = Math.min(emailLength / 30, 1);
      const index = Math.min(
        Math.floor(progress * (currentImages.watchImages.length - 1)),
        currentImages.watchImages.length - 1,
      );
      setCurrentBearImage(currentImages.watchImages[Math.max(0, index)]);
      setIsAnimating(false);
    };

    // Animation Logic based on Focus and ShowPassword
    if (currentFocus === 'EMAIL') {
      if (prevFocus.current === 'PASSWORD') {
        // Reverse hideBearImages when moving from PASSWORD to EMAIL
        animateImages(currentImages.hideImages, 60, true, animateWatchingBearImages);
      } else {
        animateWatchingBearImages();
      }
    } else if (currentFocus === 'PASSWORD') {
      if (prevFocus.current !== 'PASSWORD') {
        // First time entering password field
        animateImages(currentImages.hideImages, 40, false, () => {
          if (showPassword) {
            animateImages(currentImages.peakImages, 50);
          }
        });
      } else if (showPassword && prevShowPassword.current === false) {
        // Show password selected
        animateImages(currentImages.peakImages, 50);
      } else if (!showPassword && prevShowPassword.current === true) {
        // Hide password selected
        animateImages(currentImages.peakImages, 50, true);
      }
    }

    prevFocus.current = currentFocus;
    prevShowPassword.current = showPassword;
  }, [
    currentFocus,
    showPassword,
    emailLength,
    watchBearImages,
    hideBearImages,
    peakBearImages,
    animalImages,
    currentAnimalType,
    getCurrentAnimalImages,
  ]);

  return {
    currentFocus,
    setCurrentFocus,
    currentBearImage:
      currentBearImage ?? (getCurrentAnimalImages().watchImages.length > 0 
        ? getCurrentAnimalImages().watchImages[0] 
        : null),
    isAnimating,
    currentAnimalType,
  };
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  Globe,
  Film,
  Tv,
  Trash2,
  ImageOff,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Info,
  Layers,
} from 'lucide-react';
import { Poster } from '../types';

interface PosterDetailModalProps {
  poster: Poster | null;
  posters?: Poster[];
  onClose: () => void;
  onNavigatePoster?: (nextPoster: Poster) => void;
  onDelete?: (poster: Poster) => void;
  isAdmin?: boolean;
}

export const PosterDetailModal: React.FC<PosterDetailModalProps> = ({
  poster,
  posters = [],
  onClose,
  onNavigatePoster,
  onDelete,
  isAdmin = false,
}) => {
  if (!poster) return null;

  return (
    <DirectLargePhotoViewer
      poster={poster}
      posters={posters}
      onClose={onClose}
      onNavigatePoster={onNavigatePoster}
      onDelete={onDelete}
      isAdmin={isAdmin}
    />
  );
};

interface DirectLargePhotoViewerProps {
  poster: Poster;
  posters: Poster[];
  onClose: () => void;
  onNavigatePoster?: (nextPoster: Poster) => void;
  onDelete?: (poster: Poster) => void;
  isAdmin?: boolean;
}

const DirectLargePhotoViewer: React.FC<DirectLargePhotoViewerProps> = ({
  poster,
  posters,
  onClose,
  onNavigatePoster,
  onDelete,
  isAdmin = false,
}) => {
  // Find current index in the active poster collection
  const currentIndex = posters.findIndex((p) => p.id === poster.id);
  const totalCount = posters.length;
  const hasMultiple = totalCount > 1;

  // High-resolution image source resolver
  const getHighResSrc = (p: Poster) => {
    if (p.driveFileId) {
      return `https://drive.google.com/thumbnail?id=${p.driveFileId}&sz=w1600`;
    }
    return p.imageUrl;
  };

  const [imgSrc, setImgSrc] = useState<string>(() => getHighResSrc(poster));
  const [retryStep, setRetryStep] = useState<number>(0);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);

  // Navigation handlers (Next & Previous with wrap-around)
  const handleGoNext = useCallback(() => {
    if (!hasMultiple || !onNavigatePoster) return;
    const nextIdx = (currentIndex + 1) % totalCount;
    const nextPoster = posters[nextIdx];
    if (nextPoster) {
      onNavigatePoster(nextPoster);
    }
  }, [hasMultiple, onNavigatePoster, currentIndex, totalCount, posters]);

  const handleGoPrev = useCallback(() => {
    if (!hasMultiple || !onNavigatePoster) return;
    const prevIdx = (currentIndex - 1 + totalCount) % totalCount;
    const prevPoster = posters[prevIdx];
    if (prevPoster) {
      onNavigatePoster(prevPoster);
    }
  }, [hasMultiple, onNavigatePoster, currentIndex, totalCount, posters]);

  // Preload adjacent images in background for instant transitions
  useEffect(() => {
    if (!hasMultiple) return;
    const nextIdx = (currentIndex + 1) % totalCount;
    const prevIdx = (currentIndex - 1 + totalCount) % totalCount;
    const adjacent = [posters[nextIdx], posters[prevIdx]];

    adjacent.forEach((p) => {
      if (p) {
        const img = new Image();
        img.src = getHighResSrc(p);
      }
    });
  }, [currentIndex, totalCount, posters, hasMultiple]);

  // Reset image state whenever poster ID changes
  useEffect(() => {
    setImgSrc(getHighResSrc(poster));
    setRetryStep(0);
    setHasFailedAll(false);
    setIsLoading(true);
    setZoomLevel(1);
  }, [poster.id, poster.imageUrl, poster.driveFileId]);

  // Global Keyboard Navigation: Left (Previous), Right (Next), Escape (Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        e.preventDefault();
        handleGoNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        e.preventDefault();
        handleGoPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGoNext, handleGoPrev, onClose]);

  // Touch swipe support for mobile and tablet
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Only treat as horizontal swipe if deltaX is significantly larger than vertical movement
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        // Swiped left -> Go Next
        handleGoNext();
      } else {
        // Swiped right -> Go Prev
        handleGoPrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Resilient multi-tier fallback for Google Drive images
  const handleImageError = () => {
    if (poster.driveFileId) {
      if (retryStep === 0) {
        setRetryStep(1);
        setImgSrc(`https://lh3.googleusercontent.com/d/${poster.driveFileId}`);
        return;
      }
      if (retryStep === 1) {
        setRetryStep(2);
        setImgSrc(`https://drive.google.com/thumbnail?id=${poster.driveFileId}&sz=w1000`);
        return;
      }
      if (retryStep === 2 && poster.thumbnailUrl && poster.thumbnailUrl !== imgSrc) {
        setRetryStep(3);
        setImgSrc(poster.thumbnailUrl);
        return;
      }
      if (retryStep <= 3) {
        setRetryStep(4);
        setImgSrc(`https://drive.google.com/uc?export=view&id=${poster.driveFileId}`);
        return;
      }
    }
    setHasFailedAll(true);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setHasFailedAll(false);
    setIsLoading(true);
    setRetryStep(0);
    setImgSrc(`${getHighResSrc(poster)}&t=${Date.now()}`);
  };

  // Thumbnail thumbnail strip ref for auto-scrolling to active thumbnail
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (thumbStripRef.current && currentIndex >= 0) {
      const activeEl = thumbStripRef.current.children[currentIndex] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  const cleanDescription = () => {
    if (!poster.description) {
      return poster.type === 'movie' && poster.year
        ? `${poster.title} (${poster.year}) full resolution poster.`
        : `${poster.title} full resolution poster.`;
    }
    if (poster.description.includes('Google Drive') || poster.description.includes('Auto-imported')) {
      return poster.type === 'movie' && poster.year
        ? `${poster.title} (${poster.year}) - Cinema High-Definition Poster.`
        : `${poster.title} - High-Definition Series Poster.`;
    }
    return poster.description;
  };

  return (
    <div
      id="direct-large-photo-viewer"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-fade-in overflow-hidden"
      onClick={onClose}
    >
      {/* 🌟 TOP CONTROL HEADER */}
      <header
        className="w-full flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 z-30 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-sm shrink-0 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Poster Title, Year, Category & Sequence Counter */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-white truncate max-w-[160px] sm:max-w-md">
                {poster.title}
              </h2>
              {poster.year && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                  {poster.year}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-400 mt-0.5">
              <span className="font-semibold text-zinc-300">
                {poster.type === 'movie' ? '🎬 Movie' : `📺 ${poster.country || ''} Series`}
              </span>
              {typeof poster.rating === 'number' && poster.rating > 0 && (
                <span className="text-amber-400 font-bold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {poster.rating.toFixed(1)}
                </span>
              )}
              {hasMultiple && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono text-[10px] font-bold">
                  {currentIndex + 1} / {totalCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons (Zoom, Details Drawer, Drive link, Delete, Close) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.6, +(z - 0.25).toFixed(2)))}
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors font-mono"
              title="Reset to 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle Info / Synopsis Drawer */}
          <button
            type="button"
            id="btn-viewer-toggle-info"
            onClick={() => setShowInfoDrawer((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showInfoDrawer
                ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="အချက်အလက်နှင့် ဇာတ်လမ်းအကျဉ်း ကြည့်ရှုရန်"
          >
            <Info className="w-4 h-4" />
            <span className="hidden md:inline">အသေးစိတ်</span>
          </button>

          {/* Toggle Thumbnail Filmstrip */}
          {hasMultiple && (
            <button
              type="button"
              onClick={() => setShowThumbnails((prev) => !prev)}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                showThumbnails
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="အောက်ခြေ ပုံငယ်ပြခန်း ဖွင့်/ပိတ်ရန်"
            >
              <Layers className="w-4 h-4" />
            </button>
          )}

          {/* Open Original in Google Drive */}
          {(poster.driveWebViewLink || poster.driveFileId) && (
            <a
              href={
                poster.driveWebViewLink ||
                `https://drive.google.com/file/d/${poster.driveFileId}/view?usp=sharing`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-sky-950/60 border border-zinc-800 hover:border-sky-800 text-sky-400 transition-colors"
              title="Google Drive တွင် မူရင်းဖိုင်ဖွင့်ရန်"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Delete Button (Only for Admin) */}
          {isAdmin && onDelete && (
            <button
              type="button"
              id="btn-viewer-delete-poster"
              onClick={() => {
                onDelete(poster);
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-rose-900/60 border border-zinc-800 hover:border-rose-700 text-rose-400 hover:text-rose-200 transition-colors"
              title="ဤ Poster ကို ဖျက်ရန်"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close Viewer Button */}
          <button
            type="button"
            id="btn-close-direct-viewer"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-800 hover:border-rose-500 transition-all shadow-md active:scale-95 ml-1"
            title="ပိတ်မည် (ESC)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 🌟 CENTER STAGE: DIRECT LARGE PHOTO & FLOATING NEXT / PREV BUTTONS */}
      <div
        className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ⬅️ PREVIOUS BUTTON (နောက်) */}
        {hasMultiple && (
          <button
            type="button"
            id="btn-viewer-prev"
            onClick={(e) => {
              e.stopPropagation();
              handleGoPrev();
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-rose-600 border border-white/20 hover:border-rose-500 text-white flex items-center justify-center transition-all duration-200 active:scale-90 shadow-2xl backdrop-blur-md group"
            title="နောက်တစ်ပုံ (Previous - Left Arrow key)"
            aria-label="Previous poster"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* ➡️ NEXT BUTTON (ရှေ့) */}
        {hasMultiple && (
          <button
            type="button"
            id="btn-viewer-next"
            onClick={(e) => {
              e.stopPropagation();
              handleGoNext();
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-rose-600 border border-white/20 hover:border-rose-500 text-white flex items-center justify-center transition-all duration-200 active:scale-90 shadow-2xl backdrop-blur-md group"
            title="ရှေ့တစ်ပုံ (Next - Right Arrow key)"
            aria-label="Next poster"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Loading Spinner */}
        {isLoading && !hasFailedAll && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-3 bg-zinc-950/80 px-6 py-4 rounded-2xl border border-zinc-800/80 shadow-2xl backdrop-blur-md">
              <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-300 font-semibold">HD ဓာတ်ပုံ ဖွင့်နေပါသည်...</span>
            </div>
          </div>
        )}

        {/* Image Display */}
        {!hasFailedAll ? (
          <div
            className="w-full h-full flex items-center justify-center overflow-auto cursor-zoom-in"
            onClick={() => setZoomLevel((z) => (z > 1 ? 1 : 1.75))}
          >
            <img
              key={poster.id}
              src={imgSrc}
              alt={poster.title}
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease-out, opacity 0.25s ease-in',
              }}
              className={`max-h-[82vh] sm:max-h-[84vh] max-w-[94vw] w-auto h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl transition-opacity select-none ${
                isLoading ? 'opacity-0 scale-95' : 'opacity-100'
              }`}
              onLoad={() => setIsLoading(false)}
              onError={handleImageError}
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl">
            <ImageOff className="w-12 h-12 text-rose-500 mb-3" />
            <h4 className="text-sm font-bold text-white">ဓာတ်ပုံ ဖွင့်မရပါ (Load Failed)</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Google Drive တွင် ဤပုံအား <strong className="text-amber-300">"Anyone with the link"</strong> ဖြင့် မျှဝေထားရန် လိုအပ်ပါသည်။
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-colors shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ပြန်လည်စမ်းသပ်ရန် (Retry)</span>
            </button>
          </div>
        )}

        {/* 🌟 SLIDE-OVER / FLOATING DETAILS DRAWER (When user clicks "အသေးစိတ်") */}
        {showInfoDrawer && (
          <div
            className="absolute top-4 right-4 bottom-4 w-80 sm:w-96 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-5 z-40 backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Poster Details
                </span>
                <button
                  type="button"
                  onClick={() => setShowInfoDrawer(false)}
                  className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-black text-white leading-snug">{poster.title}</h3>
                {poster.originalFileName && (
                  <p className="text-[11px] text-zinc-500 font-mono truncate mt-0.5" title={poster.originalFileName}>
                    File: {poster.originalFileName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Type / အမျိုးအစား</span>
                  <span className="text-zinc-200 font-bold capitalize">
                    {poster.type === 'movie' ? '🎬 Movie' : '📺 Series'}
                  </span>
                </div>
                {poster.year && (
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">Year / ခုနှစ်</span>
                    <span className="text-zinc-200 font-bold">{poster.year}</span>
                  </div>
                )}
                {poster.country && (
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 col-span-2">
                    <span className="text-zinc-500 block text-[10px]">Country / နိုင်ငံ</span>
                    <span className="text-emerald-400 font-bold">{poster.country} Series</span>
                  </div>
                )}
                {poster.genre && (
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 col-span-2">
                    <span className="text-zinc-500 block text-[10px]">Genre</span>
                    <span className="text-zinc-300 font-medium">{poster.genre}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-zinc-400 font-semibold text-xs block mb-1">
                  Synopsis / ဇာတ်လမ်းအကျဉ်း
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 max-h-48 overflow-y-auto">
                  {cleanDescription()}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono">
                {currentIndex + 1} of {totalCount}
              </span>
              <button
                type="button"
                onClick={() => setShowInfoDrawer(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 BOTTOM THUMBNAIL FILMSTRIP & QUICK NAVIGATION */}
      {hasMultiple && showThumbnails && (
        <footer
          className="w-full px-3 sm:px-6 py-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-sm z-30 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            {/* Quick Previous Button */}
            <button
              type="button"
              onClick={handleGoPrev}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
              title="နောက်တစ်ပုံ"
            >
              <ChevronLeft className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">နောက်</span>
            </button>

            {/* Horizontal Thumbnails Carousel */}
            <div
              ref={thumbStripRef}
              className="flex-1 flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none justify-start sm:justify-center"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {posters.map((p, idx) => {
                const isActive = p.id === poster.id;
                const thumbSrc =
                  p.thumbnailUrl ||
                  (p.driveFileId
                    ? `https://drive.google.com/thumbnail?id=${p.driveFileId}&sz=w160`
                    : p.imageUrl);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onNavigatePoster && onNavigatePoster(p)}
                    className={`relative shrink-0 w-9 h-13 sm:w-11 sm:h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'ring-2 ring-rose-500 scale-110 shadow-lg z-10'
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                    title={`${p.title} (${idx + 1}/${totalCount})`}
                  >
                    <img
                      src={thumbSrc}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Next Button */}
            <button
              type="button"
              onClick={handleGoNext}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
              title="ရှေ့တစ်ပုံ"
            >
              <span className="hidden sm:inline">ရှေ့</span>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

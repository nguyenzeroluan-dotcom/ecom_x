
import React from 'react';

interface ProductMediaSectionProps {
  formData: {
    image_url: string;
    video_url: string;
    collection_id: number | null;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  videoError: string | null;
  videoType: 'youtube' | 'vimeo' | 'file' | null;
  isUrlMode: boolean;
  setIsUrlMode: (val: boolean) => void;
  urlInputValue: string;
  setUrlInputValue: (val: string) => void;
  handleUrlSubmit: () => void;
  openMediaLibrary: () => void;
  handleRemoveMedia: () => void;
  previewGallery: string[];
  galleryImageCount: number;
}

const ProductMediaSection: React.FC<ProductMediaSectionProps> = ({
  formData,
  handleInputChange,
  videoError,
  videoType,
  isUrlMode,
  setIsUrlMode,
  urlInputValue,
  setUrlInputValue,
  handleUrlSubmit,
  openMediaLibrary,
  handleRemoveMedia,
  previewGallery,
  galleryImageCount
}) => {

  const getEmbedUrl = (url: string, type: string | null): string => {
    if (!type) return url;
    if (type === 'youtube') {
        let id = '';
        if (url.includes('youtu.be')) id = url.split('/').pop()?.split('?')[0] || '';
        else if (url.includes('v=')) id = url.split('v=')[1]?.split('&')[0] || '';
        return `https://www.youtube.com/embed/${id}`;
    }
    if (type === 'vimeo') {
        const id = url.split('/').pop();
        if (!url.includes('player.vimeo.com')) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Product Media</label>
      
      <div className="flex gap-4 items-start flex-wrap sm:flex-nowrap">
          {/* Main Media Card */}
          <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden group shadow-sm transition-all hover:border-primary shrink-0">
              {formData.image_url ? (
                  <>
                      <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button type="button" onClick={openMediaLibrary} className="text-white text-xs font-bold bg-white/20 px-2 py-1 rounded hover:bg-white/30">Change</button>
                          <button type="button" onClick={handleRemoveMedia} className="text-red-300 text-xs font-bold hover:text-red-100">Remove</button>
                      </div>
                      {formData.collection_id && (
                          <div className="absolute bottom-1 right-1 bg-primary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                              Gallery
                          </div>
                      )}
                  </>
              ) : isUrlMode ? (
                  <div className="p-2 w-full h-full flex flex-col justify-center gap-2 animate-fade-in">
                      <input 
                          type="text"
                          autoFocus 
                          placeholder="https://..."
                          className="w-full text-[10px] p-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-primary"
                          value={urlInputValue}
                          onChange={(e) => setUrlInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      />
                      <div className="flex gap-1">
                          <button type="button" onClick={handleUrlSubmit} className="flex-1 bg-primary text-white text-[10px] rounded py-1 font-bold">OK</button>
                          <button type="button" onClick={() => setIsUrlMode(false)} className="flex-1 bg-slate-200 text-slate-600 text-[10px] rounded py-1">Cancel</button>
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-col items-center text-slate-400 gap-2">
                      <button type="button" onClick={openMediaLibrary} className="flex flex-col items-center hover:text-primary transition-colors">
                          <i className="fas fa-image text-2xl"></i>
                          <span className="text-[10px] font-bold mt-1">Library</span>
                      </button>
                      <div className="w-full h-px bg-slate-200 dark:bg-slate-600"></div>
                      <button type="button" onClick={() => setIsUrlMode(true)} className="text-[10px] font-bold hover:text-primary transition-colors">
                          Paste URL
                      </button>
                  </div>
              )}
          </div>

          {/* Context / Preview Area */}
          <div className="flex-1 flex flex-col min-h-[128px]">
              <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Video URL (Optional) 
                      {videoType && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">{videoType}</span>}
                  </label>
                  <div className="flex items-center gap-2">
                      <input 
                          type="text" 
                          name="video_url" 
                          value={formData.video_url} 
                          onChange={handleInputChange} 
                          placeholder="https://youtube.com/watch?v=... or .mp4 link"
                          className={`w-full text-sm border ${videoError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white`}
                      />
                      {formData.video_url && !videoError && (
                          <div className="h-9 w-9 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-600 relative group">
                              {videoType === 'youtube' || videoType === 'vimeo' ? (
                                  <div className="w-full h-full flex items-center justify-center bg-black text-white">
                                      <i className="fab fa-youtube text-xs"></i>
                                  </div>
                              ) : (
                                  <video src={formData.video_url} className="w-full h-full object-cover" muted playsInline />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition-all">
                                  <i className="fas fa-play text-[8px] text-white"></i>
                              </div>
                          </div>
                      )}
                  </div>
                  {videoError && <p className="text-[10px] text-red-500 mt-1">{videoError}</p>}
                  {formData.video_url && !videoError && (
                        <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-black border border-slate-300 dark:border-slate-600 shadow-sm">
                            {(videoType === 'youtube' || videoType === 'vimeo') ? (
                                <iframe 
                                  src={getEmbedUrl(formData.video_url, videoType)} 
                                  className="w-full h-full" 
                                  frameBorder="0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                  allowFullScreen 
                                />
                            ) : (
                                <video src={formData.video_url} controls className="w-full h-full" />
                            )}
                        </div>
                  )}
              </div>

              {formData.image_url ? (
                  <div className="animate-fade-in mt-auto">
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-800 dark:text-white">Cover Image Set</span>
                          <i className="fas fa-check-circle text-green-500"></i>
                      </div>
                      {previewGallery.length > 0 ? (
                          <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                  Linked Gallery: <span className="font-bold text-primary">{galleryImageCount} images</span>
                              </p>
                              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar max-w-[200px] sm:max-w-xs">
                                  {previewGallery.map((img, idx) => (
                                      <img key={idx} src={img} alt="" className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0" />
                                  ))}
                              </div>
                          </div>
                      ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                              Single image selected. <br/>To add a gallery, select a Collection from the library.
                          </p>
                      )}
                  </div>
              ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic mt-auto">
                      No media selected.<br/>Choose an image or collection to display.
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default ProductMediaSection;


import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toast } from 'sonner';

// Create a singleton FFMPEG instance
let ffmpeg: FFmpeg | null = null;

/**
 * Initializes and loads the FFmpeg instance from CDN
 */
export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) return ffmpeg;
  
  const instance = new FFmpeg();
  
  try {
    // Load ffmpeg directly from CDN without toBlobURL
    // This should be more reliable in browser environments
    await instance.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.wasm'
    });
    
    console.log('FFmpeg loaded successfully');
    ffmpeg = instance;
    return instance;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    toast.error('Failed to load video processing library. Please try again.');
    throw error;
  }
};

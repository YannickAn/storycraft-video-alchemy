
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
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
    // Use toBlobURL which is more reliable for browser environments
    const baseURL = 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/';
    const coreURL = await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm');
    
    await instance.load({
      coreURL,
      wasmURL
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

/**
 * Check if FFmpeg is loaded
 */
export const isFFmpegLoaded = (): boolean => {
  return ffmpeg !== null;
}

/**
 * Reset FFmpeg instance (useful for testing and recovery from errors)
 */
export const resetFFmpeg = (): void => {
  ffmpeg = null;
}

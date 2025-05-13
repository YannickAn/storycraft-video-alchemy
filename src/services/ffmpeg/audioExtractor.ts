
import { fetchFile } from '@ffmpeg/util';
import { toast } from 'sonner';
import { loadFFmpeg } from './ffmpegLoader';

/**
 * Extracts audio track from a video file
 */
export const extractAudioFromVideo = async (videoFile: File): Promise<Blob> => {
  try {
    console.log('Extracting audio from video...');
    const ff = await loadFFmpeg();
    
    // Write the input video file to FFmpeg's virtual file system
    const inputFileName = 'input.' + videoFile.name.split('.').pop();
    ff.writeFile(inputFileName, await fetchFile(videoFile));
    
    // Extract audio using FFmpeg
    await ff.exec([
      '-i', inputFileName,
      '-vn', // No video
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      'output.mp3'
    ]);
    
    // Read the output audio file
    const data = await ff.readFile('output.mp3');
    console.log('Audio extraction successful');
    return new Blob([data], { type: 'audio/mp3' });
  } catch (error) {
    console.error('Error extracting audio:', error);
    toast.error('Failed to extract audio from video');
    throw error;
  }
};

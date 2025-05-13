
import { fetchFile } from '@ffmpeg/util';
import { loadFFmpeg } from './ffmpegLoader';

/**
 * Extracts audio from a video file and returns it as an MP3 blob
 */
export const extractAudioFromVideo = async (videoFile: File): Promise<Blob> => {
  try {
    console.log('Starting audio extraction from video...');
    
    // Load FFmpeg
    const ff = await loadFFmpeg();
    console.log('FFmpeg loaded for audio extraction');
    
    // Write the input file to FFmpeg's virtual filesystem
    const inputFileName = 'input_video';
    await ff.writeFile(inputFileName, await fetchFile(videoFile));
    console.log('Input video written to FFmpeg filesystem');
    
    // Extract audio using FFmpeg command
    const outputFileName = 'output.mp3';
    await ff.exec([
      '-i', inputFileName,
      '-vn', // No video
      '-acodec', 'libmp3lame',
      '-q:a', '2', // High quality audio
      outputFileName
    ]);
    console.log('Audio extraction completed');
    
    // Read the output file
    const data = await ff.readFile(outputFileName);
    console.log('Audio file read successfully');
    
    // Create a blob from the output data
    if (data instanceof Uint8Array) {
      console.log('Audio file size:', data.length);
      return new Blob([data], { type: 'audio/mp3' });
    } else {
      throw new Error('Extracted audio is not in the expected format');
    }
  } catch (error) {
    console.error('Error extracting audio:', error);
    throw new Error(`Failed to extract audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

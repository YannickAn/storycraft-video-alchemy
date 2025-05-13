
import { fetchFile } from '@ffmpeg/util';
import { toast } from 'sonner';
import { loadFFmpeg } from './ffmpegLoader';
import { analyzeTranscripts, buildFilterComplex } from '../transcript/transcriptAnalyzer';

/**
 * Process and edit video based on transcription changes
 */
export const processVideoWithTranscript = async (
  videoUrl: string, 
  originalTranscript: string, 
  editedTranscript: string,
  onProgressUpdate: (progress: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting video processing...');
      onProgressUpdate(5);
      
      // Load FFmpeg
      const ff = await loadFFmpeg();
      console.log('FFmpeg loaded for video processing');
      
      // Set up progress callback
      ff.on('progress', (progress) => {
        const percent = Math.round(progress.progress * 100);
        console.log(`Processing progress: ${percent}%`);
        onProgressUpdate(Math.max(10, percent));
      });
      
      // Fetch the video file
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      console.log('Video blob fetched:', videoBlob.type, videoBlob.size);
      onProgressUpdate(15);
      
      // Write the input file to FFmpeg's virtual filesystem
      const inputFileName = 'input.mp4';
      await ff.writeFile(inputFileName, await fetchFile(videoBlob));
      console.log('Video file written to FFmpeg filesystem');
      onProgressUpdate(20);
      
      // Analyze transcripts to determine edit points
      const editPoints = analyzeTranscripts(originalTranscript, editedTranscript);
      console.log('Edit points determined:', editPoints);
      onProgressUpdate(30);
      
      const outputFileName = 'output.mp4';
      
      if (editPoints.length === 0) {
        // No edits needed, just convert to MP4
        console.log('No edit points detected, converting video format only');
        await ff.exec([
          '-i', inputFileName,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '22',
          '-c:a', 'aac',
          '-strict', 'experimental',
          outputFileName
        ]);
      } else {
        // Process video with edit points
        const filterComplex = buildFilterComplex(editPoints);
        console.log('Using filter complex:', filterComplex);
        
        // Build FFmpeg command for editing
        const ffmpegArgs = [
          '-i', inputFileName,
          '-filter_complex', filterComplex,
          '-map', '[v]',
          '-map', '[a]',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '22',
          '-c:a', 'aac',
          '-strict', 'experimental',
          outputFileName
        ];
        
        console.log('Executing FFmpeg command with args:', ffmpegArgs);
        // Execute FFmpeg command
        await ff.exec(ffmpegArgs);
      }
      
      console.log('FFmpeg processing completed, reading output file');
      // Read the output file
      const data = await ff.readFile(outputFileName);
      console.log('Output file read successfully');
      
      // Create a URL for the output video
      if (data instanceof Uint8Array) {
        console.log('Output file size:', data.length);
        const outputBlob = new Blob([data], { type: 'video/mp4' });
        const url = URL.createObjectURL(outputBlob);
        console.log('Output URL created');
        
        onProgressUpdate(100);
        resolve(url);
      } else {
        throw new Error('Output file is not in the expected format');
      }
    } catch (error) {
      console.error('Error processing video:', error);
      reject(error);
    }
  });
};

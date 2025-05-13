
// This file re-exports video processing functionality from modular services
export { extractAudioFromVideo } from './ffmpeg/audioExtractor';
export { processVideoWithTranscript } from './ffmpeg/videoProcessor';
export { loadFFmpeg, isFFmpegLoaded, resetFFmpeg } from './ffmpeg/ffmpegLoader';

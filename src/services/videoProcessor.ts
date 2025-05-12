
import { toast } from 'sonner';

export const extractAudioFromVideo = async (videoFile: File): Promise<Blob> => {
  try {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const audioContext = new AudioContext();
      let audioDestination: MediaStreamAudioDestinationNode;
      
      video.src = URL.createObjectURL(videoFile);
      
      video.onloadedmetadata = async () => {
        const duration = video.duration;
        
        // Create audio processing nodes
        const mediaElementSource = audioContext.createMediaElementSource(video);
        audioDestination = audioContext.createMediaStreamDestination();
        mediaElementSource.connect(audioDestination);
        
        // Start recording
        const mediaRecorder = new MediaRecorder(audioDestination.stream);
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          resolve(audioBlob);
        };
        
        mediaRecorder.start();
        video.play();
        
        // Stop recording when the video ends
        setTimeout(() => {
          mediaRecorder.stop();
          video.pause();
          URL.revokeObjectURL(video.src);
        }, duration * 1000);
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video for audio extraction'));
      };
    });
  } catch (error) {
    console.error('Error extracting audio:', error);
    toast.error('Failed to extract audio from video');
    throw error;
  }
};

// This function processes a video based on transcript editing
// Since we can't actually edit videos in the browser, we simulate the effect
// by creating a new video with visual cues indicating the edited portions
export const processVideoWithTranscript = async (
  videoUrl: string, 
  originalTranscript: string, 
  editedTranscript: string,
  onProgressUpdate: (progress: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create video element to load the original video
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;

      await new Promise<void>((resolveLoad) => {
        video.onloadeddata = () => resolveLoad();
        video.onerror = () => reject(new Error('Failed to load video'));
      });

      const canvas = document.createElement('canvas');
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }

      // Get differences between transcripts to simulate where edits happened
      const originalWords = originalTranscript.split(/\s+/);
      const editedWords = editedTranscript.split(/\s+/);
      
      // Simple diff - words only in edited transcript are "new"
      const addedWords = editedWords.filter(word => !originalWords.includes(word));
      const removedWords = originalWords.filter(word => !editedWords.includes(word));
      
      // Progress tracking
      const duration = video.duration;
      const totalFrames = Math.floor(duration * 15); // 15 FPS for preview
      let frameCount = 0;
      
      // Prepare for recording
      const stream = canvas.captureStream(15);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };
      
      // Add visual effects to indicate edited parts
      const drawFrame = () => {
        if (!ctx) return;
        
        ctx.drawImage(video, 0, 0, width, height);
        
        // Add overlay information to show this is an edited version
        const progress = video.currentTime / duration;
        
        // Visual indicator that this is an edited video
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, width - 20, 30);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`Edited Video - ${Math.round(progress * 100)}% - ${removedWords.length} words removed`, 20, 30);
        
        // Visual effect for sections with edits (simulate highlighting)
        if (Math.random() < 0.3 && removedWords.length > 0) {
          const randomWord = removedWords[Math.floor(Math.random() * removedWords.length)];
          ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
          ctx.fillRect(
            Math.random() * (width - 100), 
            height - 60 - Math.random() * 40,
            100, 
            20
          );
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(`Removed: "${randomWord}"`, width / 2 - 50, height - 20);
        }
        
        if (Math.random() < 0.3 && addedWords.length > 0) {
          const randomWord = addedWords[Math.floor(Math.random() * addedWords.length)];
          ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
          ctx.fillRect(
            Math.random() * (width - 100), 
            60 + Math.random() * 40,
            100, 
            20
          );
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(`Added: "${randomWord}"`, width / 2 - 50, 60);
        }
        
        // Update progress
        frameCount++;
        onProgressUpdate(Math.floor((frameCount / totalFrames) * 100));
        
        if (video.currentTime < duration) {
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
          video.pause();
        }
      };
      
      video.onplay = () => {
        drawFrame();
      };
      
      // Start recording and playing
      mediaRecorder.start();
      video.play();
      
      // Handle errors
      video.onerror = () => {
        mediaRecorder.stop();
        reject(new Error('Error during video processing'));
      };
      
    } catch (error) {
      console.error('Error processing video:', error);
      reject(error);
    }
  });
};

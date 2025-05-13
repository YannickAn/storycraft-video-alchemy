
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import VideoUploader from '@/components/VideoUploader';
import TranscriptionEditor from '@/components/TranscriptionEditor';
import VideoProcessor from '@/components/VideoProcessor';
import ApiKeyInput from '@/components/ApiKeyInput';
import { transcribeAudio, enhanceTranscription } from '@/services/openai';
import { extractAudioFromVideo, processVideoWithTranscript } from '@/services/videoProcessor';
import { toast } from 'sonner';

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ file: File; url: string } | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [editedTranscription, setEditedTranscription] = useState<string>('');
  const [originalTranscription, setOriginalTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [editedVideoUrl, setEditedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
  };

  const handleVideoSelect = (file: File, url: string) => {
    setSelectedVideo({ file, url });
    setTranscription('');
    setEditedTranscription('');
    setOriginalTranscription('');
    setEditedVideoUrl(null);
  };

  const handleTranscribeVideo = async () => {
    if (!selectedVideo || !apiKey) {
      toast.error('Please select a video and provide an API key first');
      return;
    }
    
    try {
      setIsTranscribing(true);
      toast.info('Extracting audio from video...');
      
      const audioBlob = await extractAudioFromVideo(selectedVideo.file);
      toast.info('Transcribing audio...');
      
      const text = await transcribeAudio(audioBlob, apiKey);
      setTranscription(text);
      setEditedTranscription(text);
      setOriginalTranscription(text);
      
      toast.success('Video transcribed successfully!');
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error('Failed to process video. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranscriptionChange = (text: string) => {
    setEditedTranscription(text);
  };

  const handleEnhanceTranscription = async () => {
    if (!apiKey) {
      toast.error('Please enter your OpenAI API key first');
      return;
    }
    
    try {
      setIsEnhancing(true);
      const enhanced = await enhanceTranscription(editedTranscription, apiKey);
      setEditedTranscription(enhanced);
      toast.success('Transcription enhanced!');
    } catch (error) {
      console.error('Error enhancing transcription:', error);
      toast.error('Failed to enhance transcription. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleProcessVideo = async () => {
    if (!selectedVideo) {
      toast.error('No video selected');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(0);
      
      const processedVideoUrl = await processVideoWithTranscript(
        selectedVideo.url,
        originalTranscription,
        editedTranscription,
        (progress) => setProgress(progress)
      );
      
      setEditedVideoUrl(processedVideoUrl);
      toast.success('Video processed successfully!');
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error('Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-editor-dark text-foreground">
        <Header />
        <main className="container py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Welcome to AI Video Editor</h1>
            <p className="text-center mb-8 text-gray-600 dark:text-gray-300">
              Create enhanced videos by removing duplicate sentences and improving the narrative flow
            </p>
            <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-editor-dark text-foreground">
      <Header />
      <main className="container py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI Video Editor</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Upload a video, edit the transcript, and generate an enhanced version
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <VideoUploader 
                onVideoSelected={handleVideoSelect}
                onRequestTranscription={handleTranscribeVideo}
              />
              <TranscriptionEditor 
                transcription={editedTranscription}
                isLoading={isTranscribing}
                onTranscriptionChange={handleTranscriptionChange}
                onEnhanceTranscription={handleEnhanceTranscription}
                isEnhancing={isEnhancing}
              />
            </div>
            <div>
              <VideoProcessor 
                isProcessing={isProcessing}
                progress={progress}
                editedVideoUrl={editedVideoUrl}
                originalVideoUrl={selectedVideo?.url}
                onProcessVideo={handleProcessVideo}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

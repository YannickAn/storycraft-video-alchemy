
import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface VideoUploaderProps {
  onVideoSelected: (file: File, url: string) => void;
  onRequestTranscription: () => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelected, onRequestTranscription }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ file: File; url: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedVideo({ file, url });
    onVideoSelected(file, url);
  };

  const removeSelectedVideo = () => {
    if (selectedVideo) {
      URL.revokeObjectURL(selectedVideo.url);
    }
    setSelectedVideo(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const openFileSelector = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
        {!selectedVideo ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              dragActive ? 'border-editor-accent bg-editor-accent/10' : 'border-gray-300 hover:border-editor-accent/50'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={openFileSelector}
          >
            <input 
              ref={inputRef}
              type="file" 
              accept="video/*"
              onChange={handleChange} 
              className="hidden" 
            />
            <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p className="text-lg font-medium">Drag and drop your video here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse</p>
            <Button variant="outline" type="button" className="mt-2">
              Select Video
            </Button>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden">
            <video
              src={selectedVideo.url}
              controls
              className="w-full h-auto rounded-lg"
            />
            <Button 
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeSelectedVideo}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-4 flex flex-col gap-3">
              <div className="text-sm flex justify-between items-center">
                <span className="font-medium truncate">{selectedVideo.file.name}</span>
                <span className="text-gray-500">
                  {(selectedVideo.file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <Button 
                onClick={onRequestTranscription} 
                className="bg-editor-accent hover:bg-editor-accent/80 w-full"
              >
                Transcribe Video
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoUploader;

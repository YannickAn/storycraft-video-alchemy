
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Film, Download, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface VideoProcessorProps {
  isProcessing: boolean;
  progress: number;
  editedVideoUrl: string | null;
  originalVideoUrl: string | null;
  onProcessVideo: () => void;
}

const VideoProcessor: React.FC<VideoProcessorProps> = ({
  isProcessing,
  progress,
  editedVideoUrl,
  originalVideoUrl,
  onProcessVideo
}) => {
  const [comparing, setComparing] = useState(false);
  
  const handleDownload = () => {
    if (editedVideoUrl) {
      const link = document.createElement('a');
      link.href = editedVideoUrl;
      link.download = 'edited-video.mp4'; // Changed from .webm to .mp4
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Video Output</h2>
        
        {!editedVideoUrl && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-4">
            <Film className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-center">Ready to process your video</p>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Create your edited video based on the transcription
            </p>
            <Button 
              onClick={onProcessVideo} 
              className="bg-editor-accent hover:bg-editor-accent/80"
              disabled={!originalVideoUrl}
            >
              <RotateCw className="mr-2 h-4 w-4" /> Process Video
            </Button>
          </div>
        )}
        
        {isProcessing && (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-full mb-4">
              <Progress value={progress} className="h-2 bg-gray-200" />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              This may take several minutes to process your video
            </p>
          </div>
        )}
        
        {editedVideoUrl && !isProcessing && (
          <div className="flex flex-col gap-4">
            <div className="relative rounded-lg overflow-hidden">
              {comparing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {originalVideoUrl && (
                    <div>
                      <p className="text-sm font-medium mb-1 text-gray-400">Original Video</p>
                      <video
                        src={originalVideoUrl}
                        controls
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-1 text-gray-400">Edited Video</p>
                    <video
                      src={editedVideoUrl}
                      controls
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <video
                  src={editedVideoUrl}
                  controls
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setComparing(!comparing);
                  toast.info(comparing ? "Showing edited video only" : "Comparing original and edited videos");
                }}
              >
                {comparing ? "Show Edited Only" : "Compare Videos"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  toast.info("Starting new edit");
                  window.location.reload();
                }}>
                  New Edit
                </Button>
                <Button onClick={handleDownload} className="bg-editor-accent hover:bg-editor-accent/80">
                  <Download className="mr-2 h-4 w-4" /> Download Video
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoProcessor;

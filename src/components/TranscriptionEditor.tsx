
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WandIcon, Loader2, RefreshCw } from 'lucide-react';

interface TranscriptionEditorProps {
  transcription: string;
  isLoading: boolean;
  onTranscriptionChange: (text: string) => void;
  onEnhanceTranscription: () => void;
  isEnhancing: boolean;
}

const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({
  transcription,
  isLoading,
  onTranscriptionChange,
  onEnhanceTranscription,
  isEnhancing
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transcribing Video...</h2>
          <div className="flex items-center justify-center h-64">
            <div className="flex justify-center items-end h-20">
              <div className="loading-wave"></div>
              <div className="loading-wave"></div>
              <div className="loading-wave"></div>
              <div className="loading-wave"></div>
              <div className="loading-wave"></div>
              <div className="loading-wave"></div>
              <div className="loading-wave"></div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            This may take a few minutes depending on the length of your video
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Transcription</h2>
          <Button
            onClick={onEnhanceTranscription}
            disabled={isEnhancing || !transcription}
            className="bg-editor-accent hover:bg-editor-accent/80"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <WandIcon className="mr-2 h-4 w-4" />
                Enhance Story
              </>
            )}
          </Button>
        </div>
        <Textarea
          value={transcription}
          onChange={(e) => onTranscriptionChange(e.target.value)}
          placeholder="Video transcript will appear here after processing. You can edit it to create your story."
          className="min-h-[300px] font-medium"
        />
        <div className="mt-4 text-sm text-gray-500">
          <p>Edit the transcription above to create your story. Remove duplicates, rearrange content, or add new elements.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptionEditor;

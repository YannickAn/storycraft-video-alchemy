
import { toast } from 'sonner';

interface TranscriptionResponse {
  text: string;
}

export const transcribeAudio = async (audioBlob: Blob, apiKey: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to transcribe audio');
    }

    const data = await response.json() as TranscriptionResponse;
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    toast.error('Failed to transcribe audio. Please check your API key and try again.');
    throw error;
  }
};

export const enhanceTranscription = async (transcription: string, apiKey: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert video editor. Your task is to improve the provided video transcription by removing duplicate sentences, repetitive ideas, and creating a more coherent story. Maintain the original meaning and key points, but make the content flow better. Do not add fictional information. Only output the edited transcript text without any explanations, formatting, or additional notes.'
          },
          {
            role: 'user',
            content: transcription
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to enhance transcription');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error enhancing transcription:', error);
    toast.error('Failed to enhance transcription. Please check your API key and try again.');
    throw error;
  }
};

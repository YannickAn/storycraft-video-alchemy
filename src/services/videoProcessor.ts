// src/services/videoProcessor.ts

import { toast } from 'sonner';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

// Eine einzige, wiederverwendbare FFmpeg-Instanz
const ffmpeg = new FFmpeg();
/**
 * Schneidet und verarbeitet ein Video basierend auf Transkript-Änderungen.
 * @param videoFile File- oder Blob-Objekt
 * @param originalTranscript Ursprüngliches Transkript
 * @param editedTranscript Bearbeitetes Transkript
 * @param onProgressUpdate Callback für Fortschritts-Updates (0–100)
 * @returns Promise mit der Blob-URL des neuen Videos
 */
export const processVideoWithTranscript = async (
  videoFile: File | Blob,
  originalTranscript: string,
  editedTranscript: string,
  onProgressUpdate: (progress: number) => void
): Promise<string> => {
  try {
    onProgressUpdate(10);

    // FFmpeg laden (ggf. coreURL/wasmURL-Optionen übergeben, s.u.)
    await ffmpeg.load();
    onProgressUpdate(20);

    // Video-Datei ins WASM-Filesystem schreiben
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
    onProgressUpdate(30);

    // Schnittpunkte aus Transkript-Änderungen berechnen
    const editPoints = analyzeTranscripts(originalTranscript, editedTranscript);

    const outputName = 'output.mp4';
    if (editPoints.length === 0) {
      // Nur neu enkodieren
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
        '-c:a', 'aac',
        outputName
      ]);
    } else {
      // Komplexe Schnitte über filter_complex
      const filter = buildFilterComplex(editPoints);
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-filter_complex', filter,
        '-map', '[v]', '-map', '[a]',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
        '-c:a', 'aac',
        outputName
      ]);
    }
    onProgressUpdate(90);

    // Ergebnis auslesen und als Blob-URL zurückgeben
    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    onProgressUpdate(100);

    return url;
  } catch (error) {
    console.error('Error processing video:', error);
    toast.error('Failed to process video');
    throw error;
  }
};
/**
 * Vergleicht Original- und bearbeitetes Transkript
 * und ermittelt, welche Segmente behalten werden.
 */
const analyzeTranscripts = (
  orig: string,
  edited: string
): Array<{ keep: boolean; startTime: number; endTime: number }> => {
  const origSent = orig.match(/[^.!?]+[.!?]+/g) || [];
  const editSent = edited.match(/[^.!?]+[.!?]+/g) || [];
  const points: Array<{ keep: boolean; startTime: number; endTime: number }> = [];
  const totalDuration = 100; // Beispiel: Gesamtdauer in Sekunden
  const secPer = totalDuration / origSent.length;
  let current = 0;

  for (let i = 0; i < origSent.length; i++) {
    const keep = editSent.some(sentence => sentence.trim() === origSent[i].trim());
    points.push({ keep, startTime: current, endTime: current + secPer });
    current += secPer;
  }
  return points;
};
/**
 * Baut aus den editPoints einen FFmpeg filter_complex-String
 * (hier beispielhaft mit einem Text-Overlay).
 */
const buildFilterComplex = (
  pts: Array<{ keep: boolean; startTime: number; endTime: number }>
): string => {
  return "[0:v]drawtext=text='Edited Video':fontcolor=white:fontsize=24:" +
         "box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=10[v];" +
         "[0:a]volume=1[a]";
};

# Storycraft Video Alchemy

Ein browserbasierter KI-Videoeditor, der Videos automatisch anhand von Transkripten zuschneidet und verarbeitet.

## Features

- **KI-gestützte Videoverarbeitung**: Nutzt in-browser ffmpeg.wasm für Schnitt und Zusammensetzung.  
- **Automatisches Zuschneiden**: Erkennt und entfernt anhand von Transkript-Markierungen unerwünschte Segmente.  
- **Live-Vorschau & Export**: Sofortige Vorschau und Export des bearbeiteten Videos.

## Tech-Stack

- **Vite**  
- **React**  
- **TypeScript**  
- **shadcn/ui**  
- **Tailwind CSS**  
- **ffmpeg.wasm** (`@ffmpeg/ffmpeg`, `@ffmpeg/util`)

## Installation

1. Repository klonen:
   ```bash
   git clone https://github.com/YannickAn/storycraft-video-alchemy.git
   cd storycraft-video-alchemy


import React from 'react';
import { VideoIcon } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-4 px-6 bg-editor-dark text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VideoIcon className="h-6 w-6 text-editor-accent" />
          <h1 className="text-xl font-bold">AI Video Editor</h1>
        </div>
        <div className="text-sm text-gray-400">
          Powered by OpenAI
        </div>
      </div>
    </header>
  );
};

export default Header;

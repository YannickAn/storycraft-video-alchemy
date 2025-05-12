
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim().startsWith('sk-')) {
      toast.error('Please enter a valid OpenAI API key starting with "sk-"');
      return;
    }
    
    localStorage.setItem('openai-api-key', apiKey.trim());
    onApiKeySubmit(apiKey.trim());
    toast.success('API key saved');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-editor-accent" />
          Enter your OpenAI API Key
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          
          <Button type="submit" className="w-full mt-4 bg-editor-accent hover:bg-editor-accent/80">
            Save API Key
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-4">
          Your API key is stored locally in your browser and is only used to make requests to OpenAI. 
          We never store or access your API key on our servers.
        </p>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;

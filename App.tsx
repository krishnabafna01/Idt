
import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { GeminiService } from './services/geminiService';
import { CHAPTER_LIST } from './constants';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: "Hello CA Final Aspirant! 👋 I'm your IDT Expert AI. I'm updated with Finance Act 2025 and the Sep '25 amendments. You can now type, speak, or even upload a photo of your IDT query. How can I help you today?" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const geminiRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    geminiRef.current = new GeminiService();
  }, []);

  const handleSendMessage = async (content: string, imageBase64?: string) => {
    if ((!content.trim() && !imageBase64) || !geminiRef.current) return;

    const userMsg: Message = { role: 'user', content: content || (imageBase64 ? "[Sent an image]" : "") };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let fullResponse = "";
      const stream = geminiRef.current.streamDoubtSolution(messages, content, imageBase64);
      
      setMessages(prev => [...prev, { role: 'model', content: "" }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = fullResponse;
          return updated;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error while processing your request. Please check your connection or API key and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectQuickChapter = (chapter: string) => {
    handleSendMessage(`Explain the core concept of ${chapter} briefly in exam format.`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar chapters={CHAPTER_LIST} onSelectChapter={selectQuickChapter} />

      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl">
        <Header />
        
        <main className="flex-1 relative overflow-y-auto">
          <ChatInterface 
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={handleSendMessage} 
          />
        </main>
      </div>
    </div>
  );
};

export default App;

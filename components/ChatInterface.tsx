
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, imageBase64?: string) => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition failed', err);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setShowCamera(false);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputValue.trim() || selectedImage) && !isLoading) {
      onSendMessage(inputValue, selectedImage || undefined);
      setInputValue('');
      setSelectedImage(null);
      if (isRecording) recognitionRef.current?.stop();
    }
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.trim() === '---') return <hr key={i} className="my-4 border-slate-200" />;
      return (
        <p key={i} 
           className={`mb-2 leading-relaxed ${line.startsWith('-') || line.startsWith('•') ? 'ml-4' : ''}`}
           dangerouslySetInnerHTML={{ __html: processed }} 
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Camera UI Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
          <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[70vh] rounded-lg shadow-2xl" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="mt-8 flex space-x-6">
            <button onClick={stopCamera} className="p-4 bg-slate-800 text-white rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button onClick={capturePhoto} className="p-6 bg-emerald-600 text-white rounded-full shadow-lg border-4 border-white">
              <div className="w-8 h-8 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-4 md:p-6 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-100 border border-emerald-200 text-slate-900 rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none prose prose-slate'
            }`}>
              <div className={`text-xs font-bold uppercase mb-2 ${msg.role === 'user' ? 'text-emerald-700' : 'text-emerald-600'}`}>
                {msg.role === 'user' ? 'Your Query' : 'Expert IDT Faculty'}
              </div>
              <div className="text-sm md:text-base whitespace-pre-wrap">
                {msg.role === 'model' ? renderMessageContent(msg.content) : msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1].content === "" && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm rounded-bl-none flex space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-emerald-800 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-10">
        {/* Image Preview */}
        {selectedImage && (
          <div className="max-w-4xl mx-auto mb-4 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-32 rounded-lg shadow-md border-2 border-emerald-500" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Upload Photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            
            <button
              type="button"
              onClick={startCamera}
              className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Capture Photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={selectedImage ? "Add notes about this image..." : "Ask your IDT doubt..."}
              className="w-full p-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-900 transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={toggleRecording}
              className={`absolute right-2 p-2 rounded-lg transition-all ${
                isRecording ? 'text-red-600 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-emerald-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isRecording ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                )}
              </svg>
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || (!inputValue.trim() && !selectedImage)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-slate-300 transition-all flex items-center shadow-md"
          >
            <span className="hidden md:inline">Send</span>
            <svg className="w-5 h-5 md:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-3 uppercase tracking-wider font-medium">
          {isRecording ? "Listening..." : "Snap a photo of your module question for an instant step-by-step solution."}
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;

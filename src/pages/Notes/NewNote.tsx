import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Save, ArrowLeft } from 'lucide-react';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

// Global types for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function NewNote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('id');
  
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!noteId);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // If we have an ID, load the draft
    if (noteId) {
      const fetchNote = async () => {
        const { data, error } = await supabase.from('notes').select('*').eq('id', noteId).single();
        if (data && !error) {
          setText(data.text || '');
        }
        setIsLoading(false);
      };
      fetchNote();
    }
  }, [noteId]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'tr-TR';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setText((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Only trigger end if we intended to stop
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tarayıcınız ses tanıma özelliğini desteklemiyor.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSave = async (isDraft = false) => {
    if (!text.trim()) {
      alert('Lütfen boş bir not kaydetmeyin.');
      return;
    }
    
    setIsSaving(true);
    
    const noteData = {
      id: noteId || crypto.randomUUID(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: isDraft ? 'draft' : 'completed'
    };
    
    const { error } = await supabase.from('notes').upsert([noteData]);
    
    setIsSaving(false);
    
    if (error) {
      alert('Kaydedilirken hata oluştu: ' + error.message);
    } else {
      navigate('/notes');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Not yükleniyor...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/notes')}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{noteId ? 'Notu Düzenle / Devam Et' : 'Yeni Not'}</h1>
          <p className="text-gray-500">Sesinizi kullanarak veya yazarak hızlı not alın.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 mb-24">
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <Button 
            onClick={toggleListening}
            variant={isListening ? 'primary' : 'outline'}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
              isListening ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-100 text-white animate-pulse border-transparent' : 'text-gray-700'
            }`}
          >
            {isListening ? <Mic size={24} /> : <MicOff size={24} />}
            {isListening ? 'Dinleniyor... (Durdur)' : 'Sesle Yazdır (Mikrofonu Aç)'}
          </Button>
          {isListening && (
            <p className="text-sm text-red-500 font-medium animate-pulse hidden sm:block">
              Konuşmaya başlayın...
            </p>
          )}
        </div>

        <Textarea 
          placeholder="Notunuzu buraya yazın veya mikrofon ile dikte edin..."
          className="min-h-[300px] text-lg resize-y p-4 bg-gray-50 border-gray-200 focus:bg-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="fixed md:absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe flex gap-3 justify-end z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button 
          onClick={() => handleSave(true)} 
          disabled={isSaving || !text.trim()}
          variant="secondary" 
          className="w-full md:w-auto md:px-8 h-14 text-sm md:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          Taslak Kaydet
        </Button>
        <Button 
          onClick={() => handleSave(false)} 
          disabled={isSaving || !text.trim()}
          variant="primary" 
          className="w-full md:w-auto md:px-12 bg-green-600 hover:bg-green-700 h-14 text-sm md:text-lg shadow-lg shrink-0"
        >
          <Save size={24} className="mr-2 hidden md:block" />
          {isSaving ? 'Kaydediliyor...' : 'Tamamla'}
        </Button>
      </div>
    </div>
  );
}

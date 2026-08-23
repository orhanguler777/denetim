import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Note } from '../../types';
import { Link } from 'react-router-dom';
import { Trash2, Calendar, Search, Plus, Mic } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export default function Notes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) {
        setNotes(data as Note[]);
      }
      setLoading(false);
    };
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note => {
    const searchLower = searchTerm.toLowerCase();
    return (note.text || '').toLowerCase().includes(searchLower);
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Bu notu silmek istediğinize emin misiniz?')) {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (!error) {
        setNotes(prev => prev.filter(n => n.id !== id));
      } else {
        alert('Silinirken hata oluştu: ' + error.message);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serbest Notlar</h1>
          <p className="text-gray-500">Saha çalışmalarında aldığınız hızlı notlar.</p>
        </div>
        <Link 
          to="/notes/new" 
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Mic size={20} />
          Yeni Not Al
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
        <Input
          placeholder="Notlarda ara..."
          className="pl-12"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm mt-4">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm mt-4">
          <p className="text-gray-500">Kayıtlı not bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-800">
                  Not
                </span>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(note.createdAt).toLocaleDateString('tr-TR')} {new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-gray-700 text-sm mb-5 flex-1 whitespace-pre-wrap line-clamp-6">
                {note.text}
              </p>

              <div className="flex items-center justify-end pt-3 border-t border-gray-100 mt-auto">
                <button
                  onClick={(e) => handleDelete(note.id, e)}
                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  title="Sil"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

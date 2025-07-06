import React, { useState, useEffect, useRef } from 'react';
import { Note, Attachment, AttachmentType } from '../types';
import { ArrowBackIcon, SaveIcon, ImageIcon, MicIcon, DrawIcon, DeleteIcon, CloseIcon } from './icons';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  onClose: () => void;
  onDelete: (noteId: string) => void;
  accentColor: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose, onDelete, accentColor }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const accentClasses = {
      bg: {
        yellow: 'bg-yellow-500 hover:bg-yellow-600',
        blue: 'bg-blue-500 hover:bg-blue-600',
        green: 'bg-green-500 hover:bg-green-600',
        pink: 'bg-pink-500 hover:bg-pink-600',
        purple: 'bg-purple-500 hover:bg-purple-600',
      },
      text: {
        yellow: 'text-yellow-500',
        blue: 'text-blue-500',
        green: 'text-green-500',
        pink: 'text-pink-500',
        purple: 'text-purple-500',
      },
      ring: {
        yellow: 'focus:ring-yellow-500',
        blue: 'focus:ring-blue-500',
        green: 'focus:ring-green-500',
        pink: 'focus:ring-pink-500',
        purple: 'focus:ring-purple-500',
      }
  };
  const currentAccentBg = accentClasses.bg[accentColor] || accentClasses.bg.yellow;
  const currentAccentText = accentClasses.text[accentColor] || accentClasses.text.yellow;
  const currentAccentRing = accentClasses.ring[accentColor] || accentClasses.ring.yellow;

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setAttachments(note.attachments);
    }
  }, [note]);

  const handleSave = () => {
    const now = Date.now();
    const newNote: Note = {
      id: note?.id || `note_${now}`,
      title,
      content,
      attachments,
      folder: note?.folder || null,
      createdAt: note?.createdAt || now,
      modifiedAt: now,
    };
    onSave(newNote);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        addAttachment('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            addAttachment('audio', reader.result as string);
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Microphone access is required for voice notes. Please enable it in your browser settings.");
      }
    }
  };

  const addAttachment = (type: AttachmentType, data: string) => {
    const newAttachment: Attachment = { id: `att_${Date.now()}`, type, data };
    setAttachments(prev => [...prev, newAttachment]);
  };
  
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  }

  const handleDoodleSave = (dataUrl: string) => {
      addAttachment('doodle', dataUrl);
      setIsDrawing(false);
  }

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-20 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ArrowBackIcon /></button>
        <div className="flex items-center space-x-2">
            {note && <button onClick={() => onDelete(note.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500"><DeleteIcon /></button>}
            <button onClick={handleSave} className={`${currentAccentBg} text-white px-4 py-2 rounded-full flex items-center space-x-2 transition`}>
                <SaveIcon />
                <span>Save</span>
            </button>
        </div>
      </header>
      
      <main className="flex-grow p-4 overflow-y-auto">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className={`w-full bg-transparent text-3xl font-bold mb-4 p-2 focus:outline-none focus:ring-2 ${currentAccentRing} rounded-lg text-gray-800 dark:text-gray-100`}
        />
        <div className="relative w-full">
            <div
                contentEditable
                suppressContentEditableWarning
                onBlur={e => setContent(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: content }}
                className={`w-full min-h-[200px] bg-transparent text-lg p-2 focus:outline-none focus:ring-2 ${currentAccentRing} rounded-lg text-gray-600 dark:text-gray-300`}
            ></div>
            {(!content || content === '<br>') && (
                <div className="absolute top-2 left-2 text-lg text-gray-400 dark:text-gray-500 pointer-events-none">
                    Start writing...
                </div>
            )}
        </div>

        <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Attachments</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {attachments.map(att => (
                    <div key={att.id} className="relative group aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {att.type === 'image' && <img src={att.data} className="w-full h-full object-cover" alt="attachment"/>}
                        {att.type === 'doodle' && <img src={att.data} className="w-full h-full object-cover" alt="doodle"/>}
                        {att.type === 'audio' && (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                <MicIcon className="text-4xl text-gray-500 dark:text-gray-400"/>
                                <audio src={att.data} controls className="w-full mt-2"/>
                            </div>
                        )}
                        <button onClick={() => removeAttachment(att.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CloseIcon className="text-sm"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </main>
      
      <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around">
        <label className={`p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition ${currentAccentText}`}>
            <ImageIcon />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
        </label>
        <button onClick={handleAudioRecord} className={`p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition ${currentAccentText} ${isRecording ? 'animate-pulse' : ''}`}>
            <MicIcon />
        </button>
        <button onClick={() => setIsDrawing(true)} className={`p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition ${currentAccentText}`}>
            <DrawIcon />
        </button>
      </footer>
      {isDrawing && <DoodleCanvas onSave={handleDoodleSave} onClose={() => setIsDrawing(false)} accentColor={accentColor} />}
    </div>
  );
};

const DoodleCanvas: React.FC<{onSave: (data:string) => void, onClose: () => void, accentColor: string}> = ({onSave, onClose, accentColor}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    const currentAccentBg = `bg-${accentColor}-500 hover:bg-${accentColor}-600`;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.stroke();
    };
    
    const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        if ('touches' in e) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    const stopDrawing = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.closePath();
        setIsDrawing(false);
    };

    const handleSave = () => {
        const dataUrl = canvasRef.current?.toDataURL('image/png');
        if (dataUrl) {
            onSave(dataUrl);
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 z-30 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl flex flex-col">
                <canvas 
                    ref={canvasRef} 
                    width="300" 
                    height="400" 
                    className="border border-gray-300 rounded-md cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                <div className="flex justify-end space-x-2 mt-4">
                     <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Cancel</button>
                    <button onClick={handleSave} className={`px-4 py-2 rounded-lg text-white ${currentAccentBg}`}>Save Doodle</button>
                </div>
            </div>
        </div>
    );
};

export default NoteEditor;
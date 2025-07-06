
import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { Note, Task, AppSettings, Tab, Subtask, AccentColor, MindMap } from './types';
import { NoteIcon, TaskIcon, CheckCircleIcon, SettingsIcon, AddIcon, SearchIcon, MindMapIcon, RadioButtonUncheckedIcon, CheckBoxIcon, DeleteIcon } from './components/icons';
import NoteEditor from './components/NoteEditor';
import SettingsModal from './components/SettingsModal';
import LockScreen from './components/LockScreen';
import HalloweenKeyboard from './components/HalloweenKeyboard';
import MindMapView from './components/MindMapView';

const initialSettings: AppSettings = {
  theme: 'light',
  accentColor: 'yellow',
  fontSize: 'base',
  highPriorityReminders: true,
  lockEnabled: false,
  lockPin: '1234',
  halloweenKeyboard: false,
};

type AppState = {
  notes: Note[];
  tasks: Task[];
  mindMaps: MindMap[];
  settings: AppSettings;
};

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SAVE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_TASK'; payload: string }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'CREATE_MIND_MAP'; payload: { title: string; id: string; now: number } }
  | { type: 'UPDATE_MIND_MAP'; payload: MindMap }
  | { type: 'DELETE_MIND_MAP'; payload: string };


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
        return action.payload;
    case 'SAVE_NOTE':
        const existingNote = state.notes.find(n => n.id === action.payload.id);
        const notes = existingNote 
            ? state.notes.map(n => n.id === action.payload.id ? action.payload : n)
            : [...state.notes, action.payload];
        return { ...state, notes };
    case 'DELETE_NOTE':
        return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };
    case 'ADD_TASK':
        const newTask: Task = { id: `task_${Date.now()}`, text: action.payload, completed: false, subtasks: [], reminder: null, highPriorityReminder: false, createdAt: Date.now(), modifiedAt: Date.now() };
        return { ...state, tasks: [...state.tasks, newTask] };
    case 'UPDATE_TASK':
        return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
        return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'UPDATE_SETTINGS':
        return { ...state, settings: action.payload };
    case 'CREATE_MIND_MAP':
        const { title, id, now } = action.payload;
        const rootId = `node_${now}`;
        const newMindMap: MindMap = {
            id: id,
            title: title,
            rootId: rootId,
            nodes: {
                [rootId]: { id: rootId, text: 'Central Idea', position: { x: 0, y: 0 }, parentId: null }
            },
            createdAt: now,
            modifiedAt: now,
        };
        return { ...state, mindMaps: [...state.mindMaps, newMindMap] };
    case 'UPDATE_MIND_MAP':
        return { ...state, mindMaps: state.mindMaps.map(m => m.id === action.payload.id ? {...action.payload, modifiedAt: Date.now()} : m) };
    case 'DELETE_MIND_MAP':
        return { ...state, mindMaps: state.mindMaps.filter(m => m.id !== action.payload) };
    default:
      return state;
  }
};

const ACCENT_CLASSES: Record<AccentColor, { bg: string, text: string, border: string, ring: string }> = {
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500', ring: 'ring-yellow-500' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', ring: 'ring-blue-500' },
    green: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', ring: 'ring-green-500' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500', ring: 'ring-pink-500' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', ring: 'ring-purple-500' },
};

const App: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, { notes: [], tasks: [], mindMaps: [], settings: initialSettings });
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Notes);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [editingMindMapId, setEditingMindMapId] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortMethod, setSortMethod] = useState<'modifiedAt' | 'createdAt' | 'title'>('modifiedAt');

    useEffect(() => {
        try {
            const storedState = localStorage.getItem('noteNestState');
            if (storedState) {
                const parsedState = JSON.parse(storedState);
                // Ensure mindMaps exists if loading from older state
                if (!parsedState.mindMaps) {
                    parsedState.mindMaps = [];
                }
                dispatch({ type: 'SET_STATE', payload: parsedState });
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('noteNestState', JSON.stringify(state));
            const { theme, fontSize, lockEnabled, lockPin } = state.settings;
            document.documentElement.className = theme;
            document.body.className = `bg-gray-100 dark:bg-gray-900 transition-colors duration-300 ${fontSize}`;
            setIsLocked(lockEnabled && !!lockPin);
        } catch (error) {
             console.error("Failed to save state to localStorage", error);
        }
    }, [state]);

    const handleSaveNote = (note: Note) => {
        dispatch({ type: 'SAVE_NOTE', payload: note });
        setIsEditorOpen(false);
        setEditingNote(null);
    };

    const handleDeleteNote = (noteId: string) => {
        if(window.confirm('Are you sure you want to delete this note?')) {
            dispatch({ type: 'DELETE_NOTE', payload: noteId });
            setIsEditorOpen(false);
            setEditingNote(null);
        }
    };
    
    const handleFabClick = () => {
        if (activeTab === Tab.Notes) {
            setEditingNote(null);
            setIsEditorOpen(true);
        } else if (activeTab === Tab.MindMap) {
            const title = prompt("Enter new Mind Map title:", "New Mind Map");
            if (title) {
                const now = Date.now();
                const newMapId = `map_${now}`;
                dispatch({ type: 'CREATE_MIND_MAP', payload: { title, id: newMapId, now } });
                setEditingMindMapId(newMapId);
            }
        }
    };

    const handleBackup = () => {
        const dataStr = JSON.stringify(state);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'notenest_backup.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const restoredState = JSON.parse(event.target?.result as string);
                if (restoredState.notes && restoredState.tasks && restoredState.settings) {
                    // Ensure mindMaps exists for older backups
                    if (!restoredState.mindMaps) {
                        restoredState.mindMaps = [];
                    }
                    dispatch({ type: 'SET_STATE', payload: restoredState });
                    alert('Restore successful!');
                } else {
                    alert('Invalid backup file.');
                }
            } catch (error) {
                alert('Failed to parse backup file.');
            }
        };
        reader.readAsText(file);
    };
    
    const accent = ACCENT_CLASSES[state.settings.accentColor];
    const { notes, tasks, mindMaps } = state;
    
    const filteredNotes = useMemo(() => notes.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase())), [notes, searchTerm]);
    const filteredTasks = useMemo(() => tasks.filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase())), [tasks, searchTerm]);
    const filteredMindMaps = useMemo(() => mindMaps.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase())), [mindMaps, searchTerm]);
    
    const sortedNotes = useMemo(() => {
        return [...filteredNotes].sort((a, b) => {
            if (sortMethod === 'title') return a.title.localeCompare(b.title);
            return b[sortMethod] - a[sortMethod];
        });
    }, [filteredNotes, sortMethod]);
    
    const sortedMindMaps = useMemo(() => {
        return [...filteredMindMaps].sort((a, b) => b.modifiedAt - a.modifiedAt);
    }, [filteredMindMaps]);

    const editingMindMap = useMemo(() => mindMaps.find(m => m.id === editingMindMapId), [mindMaps, editingMindMapId]);

    if (isLocked) {
        return <LockScreen correctPin={state.settings.lockPin!} onUnlock={() => setIsLocked(false)} accentColor={state.settings.accentColor} />;
    }

    if (isEditorOpen) {
        return <NoteEditor note={editingNote} onSave={handleSaveNote} onClose={() => setIsEditorOpen(false)} onDelete={handleDeleteNote} accentColor={state.settings.accentColor} />;
    }

    if (editingMindMap) {
        return <MindMapView 
            mindMap={editingMindMap}
            onSave={(updatedMap) => dispatch({ type: 'UPDATE_MIND_MAP', payload: updatedMap })}
            onClose={() => setEditingMindMapId(null)}
            accentColor={state.settings.accentColor}
        />
    }

    return (
        <div className="h-screen w-screen flex flex-col font-sans text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col">
                <header className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm flex items-center justify-between sticky top-0 z-10 w-full">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 ${accent.ring}`}
                        />
                    </div>
                    <button onClick={() => setIsSettingsOpen(true)} className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <SettingsIcon />
                    </button>
                </header>
                
                <main className="flex-grow overflow-y-auto pb-24">
                    {activeTab === Tab.Notes && <NotesView notes={sortedNotes} onNoteClick={(note) => {setEditingNote(note); setIsEditorOpen(true)}} sortMethod={sortMethod} setSortMethod={setSortMethod} accentColor={state.settings.accentColor}/>}
                    {activeTab === Tab.Tasks && <TasksView tasks={filteredTasks.filter(t=>!t.completed)} dispatch={dispatch} accentColor={state.settings.accentColor} settings={state.settings} />}
                    {activeTab === Tab.Completed && <TasksView tasks={filteredTasks.filter(t=>t.completed)} dispatch={dispatch} accentColor={state.settings.accentColor} settings={state.settings} />}
                    {activeTab === Tab.MindMap && <MindMapListView mindMaps={sortedMindMaps} onSelectMindMap={setEditingMindMapId} onDeleteMindMap={(id) => dispatch({type: 'DELETE_MIND_MAP', payload: id})} accentColor={state.settings.accentColor}/>}
                </main>
            </div>
            
            {(activeTab === Tab.Notes || activeTab === Tab.MindMap) && 
                <FloatingActionButton onClick={handleFabClick} accentColor={state.settings.accentColor}/>
            }
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} accentColor={state.settings.accentColor} />

            {isSettingsOpen && <SettingsModal settings={state.settings} onClose={() => setIsSettingsOpen(false)} onSettingsChange={(s) => dispatch({type: 'UPDATE_SETTINGS', payload: s})} onBackup={handleBackup} onRestore={handleRestore} />}
        </div>
    );
};

const NotesView: React.FC<{notes: Note[], onNoteClick: (note:Note) => void, sortMethod: string, setSortMethod: (method: any) => void, accentColor: AccentColor}> = ({notes, onNoteClick, sortMethod, setSortMethod, accentColor}) => (
    <div className="p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Notes</h1>
            <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1">
                <button onClick={() => setSortMethod('modifiedAt')} className={`px-3 py-1 text-sm rounded-full ${sortMethod === 'modifiedAt' ? `text-white ${ACCENT_CLASSES[accentColor].bg}` : ''}`}>Recent</button>
                <button onClick={() => setSortMethod('createdAt')} className={`px-3 py-1 text-sm rounded-full ${sortMethod === 'createdAt' ? `text-white ${ACCENT_CLASSES[accentColor].bg}` : ''}`}>Created</button>
                <button onClick={() => setSortMethod('title')} className={`px-3 py-1 text-sm rounded-full ${sortMethod === 'title' ? `text-white ${ACCENT_CLASSES[accentColor].bg}` : ''}`}>Name</button>
            </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {notes.map(note => (
                <div key={note.id} onClick={() => onNoteClick(note)} className="bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-400 aspect-square flex flex-col">
                    <h3 className="font-bold truncate text-lg">{note.title || 'Untitled Note'}</h3>
                    <p className="flex-grow text-sm text-gray-500 dark:text-gray-400 line-clamp-5 mt-2" dangerouslySetInnerHTML={{ __html: note.content }}></p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 self-start">{new Date(note.modifiedAt).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    </div>
);

const MindMapListView: React.FC<{mindMaps: MindMap[], onSelectMindMap: (id: string) => void, onDeleteMindMap: (id: string) => void, accentColor: AccentColor}> = ({ mindMaps, onSelectMindMap, onDeleteMindMap, accentColor }) => (
    <div className="p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Mind Maps</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mindMaps.map(map => (
                <div key={map.id} className="group bg-white dark:bg-gray-800 rounded-xl cursor-pointer shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-400 aspect-square flex flex-col p-4 relative">
                    <div onClick={() => onSelectMindMap(map.id)} className="flex-grow flex flex-col justify-center items-center text-center">
                        <MindMapIcon className={`text-4xl mb-2 ${ACCENT_CLASSES[accentColor].text}`} />
                        <h3 className="font-bold truncate">{map.title}</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(map.modifiedAt).toLocaleDateString()}</p>
                    </div>
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm(`Are you sure you want to delete "${map.title}"?`)) {
                                onDeleteMindMap(map.id)
                            }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-gray-200 dark:bg-gray-700 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete mind map"
                    >
                        <DeleteIcon className="text-base" />
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const TasksView: React.FC<{tasks: Task[], dispatch: React.Dispatch<Action>, accentColor: AccentColor, settings: AppSettings}> = ({tasks, dispatch, accentColor, settings}) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [inputFocused, setInputFocused] = useState(false);

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            dispatch({ type: 'ADD_TASK', payload: newTaskText.trim() });
            setNewTaskText('');
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAddTask();
    }
    
    const handleHalloweenKey = (key: string) => setNewTaskText(prev => prev + key);
    const handleHalloweenBackspace = () => setNewTaskText(prev => prev.slice(0, -1));

    return (
        <div className="p-4 space-y-4">
             {tasks.map(task => <TaskItem key={task.id} task={task} dispatch={dispatch} accentColor={accentColor} />)}
             <div className="flex items-center space-x-2 mt-4">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a new task..."
                    className={`flex-grow bg-gray-200 dark:bg-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 ${ACCENT_CLASSES[accentColor].ring}`}
                />
                <button onClick={handleAddTask} className={`p-3 rounded-full text-white ${ACCENT_CLASSES[accentColor].bg} hover:opacity-90 transition`}>
                    <AddIcon />
                </button>
             </div>
             {settings.halloweenKeyboard && inputFocused && <HalloweenKeyboard onKeyPress={handleHalloweenKey} onBackspace={handleHalloweenBackspace} onEnter={handleAddTask} />}
        </div>
    );
};

function TaskItem({task, dispatch, accentColor}: {task:Task, dispatch: React.Dispatch<Action>, accentColor: AccentColor}) {
    const [newSubtask, setNewSubtask] = useState('');

    const toggleComplete = () => {
        dispatch({type: 'UPDATE_TASK', payload: {...task, completed: !task.completed, modifiedAt: Date.now()}});
    }
    
    const handleAddSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSubtask.trim()) {
            const subtask: Subtask = {id: `sub_${Date.now()}`, text: newSubtask.trim(), completed: false};
            dispatch({type: 'UPDATE_TASK', payload: {...task, subtasks: [...task.subtasks, subtask]}});
            setNewSubtask('');
        }
    }
    
    const toggleSubtask = (subtaskId: string) => {
        const subtasks = task.subtasks.map(st => st.id === subtaskId ? {...st, completed: !st.completed} : st);
        dispatch({type: 'UPDATE_TASK', payload: {...task, subtasks, modifiedAt: Date.now()}});
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="flex items-center">
                <button onClick={toggleComplete} className="mr-3">
                    {task.completed ? <CheckBoxIcon className={ACCENT_CLASSES[accentColor].text} /> : <RadioButtonUncheckedIcon className="text-gray-400"/>}
                </button>
                <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.text}</span>
            </div>
            {task.subtasks.length > 0 && 
                <div className="ml-8 mt-2 space-y-1">
                    {task.subtasks.map(st => 
                         <div key={st.id} className="flex items-center text-sm">
                             <button onClick={() => toggleSubtask(st.id)} className="mr-2">
                                {st.completed ? <CheckBoxIcon className={`text-sm ${ACCENT_CLASSES[accentColor].text}`} /> : <RadioButtonUncheckedIcon className="text-sm text-gray-400"/>}
                             </button>
                             <span className={st.completed ? 'line-through text-gray-500' : ''}>{st.text}</span>
                         </div>
                    )}
                </div>
            }
            <div className="ml-8 mt-2">
                <input 
                    type="text"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyPress={handleAddSubtask}
                    placeholder="Add subtask..."
                    className="w-full bg-transparent text-sm p-1 focus:outline-none focus:border-b"
                />
            </div>
        </div>
    );
}

const FloatingActionButton: React.FC<{onClick: () => void, accentColor: AccentColor}> = ({onClick, accentColor}) => (
    <button onClick={onClick} className={`fixed bottom-24 right-6 w-16 h-16 rounded-2xl text-white shadow-lg flex items-center justify-center z-10 transform hover:scale-105 transition-transform ${ACCENT_CLASSES[accentColor].bg}`}>
        <AddIcon className="text-4xl"/>
    </button>
);

const BottomNav: React.FC<{activeTab: Tab, setActiveTab: (tab:Tab) => void, accentColor: AccentColor}> = ({activeTab, setActiveTab, accentColor}) => {
    const tabs = [
        { id: Tab.Notes, icon: NoteIcon, label: 'Notes' },
        { id: Tab.Tasks, icon: TaskIcon, label: 'Tasks' },
        { id: Tab.Completed, icon: CheckCircleIcon, label: 'Completed' },
        { id: Tab.MindMap, icon: MindMapIcon, label: 'Mind Map' },
    ];
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-10">
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-colors ${isActive ? `text-white ${ACCENT_CLASSES[accentColor].bg}` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        <tab.icon className="text-2xl"/>
                        <span className="text-xs mt-1">{tab.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}

export default App;


export enum Tab {
  Notes = 'Notes',
  Tasks = 'Tasks',
  Completed = 'Completed',
  MindMap = 'MindMap'
}

export type AttachmentType = 'image' | 'audio' | 'doodle';

export interface Attachment {
  id: string;
  type: AttachmentType;
  data: string; // Base64 encoded data
}

export interface Note {
  id: string;
  title: string;
  content: string; // Could be simple text or stringified rich text representation
  attachments: Attachment[];
  folder: string | null;
  createdAt: number;
  modifiedAt: number;
}

export interface Subtask {
  id:string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  subtasks: Subtask[];
  reminder: number | null;
  highPriorityReminder: boolean;
  createdAt: number;
  modifiedAt: number;
}

export interface MindMapNode {
    id: string;
    text: string;
    position: { x: number; y: number };
    parentId: string | null;
}

export interface MindMap {
    id: string;
    title: string;
    nodes: Record<string, MindMapNode>; // O(1) access
    rootId: string;
    createdAt: number;
    modifiedAt: number;
}

export type AccentColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';

export interface AppSettings {
  theme: 'light' | 'dark';
  accentColor: AccentColor;
  fontSize: 'sm' | 'base' | 'lg';
  highPriorityReminders: boolean;
  lockEnabled: boolean;
  lockPin: string | null;
  halloweenKeyboard: boolean;
}

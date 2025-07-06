
import React, { useState } from 'react';
import { AppSettings, AccentColor } from '../types';
import { CloseIcon, PaletteIcon, FontSizeIcon, LockIcon, BackupIcon, KeyboardIcon, VisibilityIcon, VisibilityOffIcon } from './icons';

interface SettingsModalProps {
  settings: AppSettings;
  onClose: () => void;
  onSettingsChange: (newSettings: AppSettings) => void;
  onBackup: () => void;
  onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSettingsChange, onBackup, onRestore }) => {
  const [pin, setPin] = useState(settings.lockPin || '');
  const [pinVisible, setPinVisible] = useState(false);

  const handleSettingChange = <K extends keyof AppSettings,>(key: K, value: AppSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(newPin);
    handleSettingChange('lockPin', newPin);
  }

  const accentColors: { name: AccentColor, class: string }[] = [
    { name: 'yellow', class: 'bg-yellow-400' },
    { name: 'blue', class: 'bg-blue-400' },
    { name: 'green', class: 'bg-green-400' },
    { name: 'pink', class: 'bg-pink-400' },
    { name: 'purple', class: 'bg-purple-400' },
  ];
  
  const currentAccentColor = `bg-${settings.accentColor}-500`;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <CloseIcon />
          </button>
        </header>
        <main className="flex-grow p-6 overflow-y-auto space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <label className="text-gray-700 dark:text-gray-300">Dark Mode</label>
            <button onClick={() => handleSettingChange('theme', settings.theme === 'dark' ? 'light' : 'dark')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.theme === 'dark' ? currentAccentColor : 'bg-gray-300 dark:bg-gray-600'}`}>
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {/* Accent Color */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Accent Color</label>
            <div className="flex space-x-3">
              {accentColors.map(color => (
                <button key={color.name} onClick={() => handleSettingChange('accentColor', color.name)} className={`w-8 h-8 rounded-full ${color.class} ${settings.accentColor === color.name ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-500' : ''}`} />
              ))}
            </div>
          </div>
          
          {/* Font Size */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              {(['sm', 'base', 'lg'] as const).map(size => (
                 <button key={size} onClick={() => handleSettingChange('fontSize', size)} className={`w-full py-1 text-sm rounded-md capitalize transition ${settings.fontSize === size ? `text-white ${currentAccentColor}` : 'text-gray-600 dark:text-gray-300'}`}>{size}</button>
              ))}
            </div>
          </div>

          {/* Halloween Keyboard */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <KeyboardIcon className="text-gray-500 dark:text-gray-400"/>
                <label className="text-gray-700 dark:text-gray-300">Halloween Keyboard</label>
            </div>
            <button onClick={() => handleSettingChange('halloweenKeyboard', !settings.halloweenKeyboard)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.halloweenKeyboard ? currentAccentColor : 'bg-gray-300 dark:bg-gray-600'}`}>
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.halloweenKeyboard ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Privacy Lock */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <LockIcon className="text-gray-500 dark:text-gray-400"/>
                    <label className="text-gray-700 dark:text-gray-300">Enable App Lock</label>
                </div>
                <button onClick={() => handleSettingChange('lockEnabled', !settings.lockEnabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.lockEnabled ? currentAccentColor : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.lockEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            {settings.lockEnabled && (
                <div className="relative">
                    <input type={pinVisible ? 'text' : 'password'} value={pin} onChange={handlePinChange} placeholder="Enter 4-6 digit PIN" className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-2 pr-10 border border-transparent focus:ring-2 focus:ring-blue-500"/>
                    <button onClick={() => setPinVisible(!pinVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                        {pinVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                </div>
            )}
          </div>
          
          {/* Backup & Restore */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Data Management</h3>
            <div className="flex space-x-2">
              <button onClick={onBackup} className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                <BackupIcon />
                <span>Backup to File</span>
              </button>
              <label className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer">
                <BackupIcon className="transform rotate-180" />
                <span>Restore</span>
                <input type="file" accept=".json" className="hidden" onChange={onRestore}/>
              </label>
            </div>
             <button disabled className="w-full flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg opacity-50 cursor-not-allowed">
                <span>Sync with Google Drive</span>
              </button>
          </div>
          
          {/* Privacy Policy */}
          <div className="text-center">
            <button className="text-sm text-blue-500 hover:underline">Privacy Policy</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsModal;

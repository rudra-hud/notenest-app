
import React from 'react';

interface HalloweenKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

const HalloweenKeyboard: React.FC<HalloweenKeyboardProps> = ({ onKeyPress, onBackspace, onEnter }) => {
  const keys = [
    'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
    'z', 'x', 'c', 'v', 'b', 'n', 'm'
  ];

  const Key = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick: () => void, className?: string }) => (
    <button
      onClick={onClick}
      className={`h-12 rounded-lg bg-[#2a2a2a] text-white font-bold border-b-4 border-orange-500 shadow-lg transform transition hover:bg-orange-700 hover:-translate-y-1 active:translate-y-0 active:border-b-2 flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-gray-900 to-transparent z-30" style={{ fontFamily: "'Creepster', cursive" }}>
      <div className="max-w-3xl mx-auto p-2 bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl shadow-2xl border border-orange-500/50">
        <div className="grid grid-cols-10 gap-1.5 mb-1.5">
          {keys.slice(0, 10).map(key => <Key key={key} onClick={() => onKeyPress(key)}>{key}</Key>)}
        </div>
        <div className="grid grid-cols-10 gap-1.5 mb-1.5">
          <div className="col-span-1" />
          {keys.slice(10, 19).map(key => <Key key={key} onClick={() => onKeyPress(key)}>{key}</Key>)}
          <div className="col-span-1" />
        </div>
        <div className="grid grid-cols-10 gap-1.5 mb-1.5">
          <Key onClick={onBackspace} className="col-span-2">⌫</Key>
          {keys.slice(19).map(key => <Key key={key} onClick={() => onKeyPress(key)}>{key}</Key>)}
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          <Key onClick={() => onKeyPress(' ')} className="col-span-7">SPACE</Key>
          <Key onClick={onEnter} className="col-span-3">ENTER</Key>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet"/>
        <div className="text-center text-xs text-orange-400 mt-2">🎃 Happy Halloween! 👻</div>
      </div>
    </div>
  );
};

export default HalloweenKeyboard;


import React, { useState, useEffect } from 'react';
import { LockIcon } from './icons';

interface LockScreenProps {
  correctPin: string;
  onUnlock: () => void;
  accentColor: string;
}

const LockScreen: React.FC<LockScreenProps> = ({ correctPin, onUnlock, accentColor }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === correctPin.length) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPin('');
        }, 1000);
      }
    }
  }, [pin, correctPin, onUnlock]);

  const handleKeyClick = (key: string) => {
    if (pin.length < correctPin.length) {
      setPin(pin + key);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };
  
  const accentClasses = {
    yellow: 'text-yellow-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    pink: 'text-pink-500',
    purple: 'text-purple-500',
  }

  const errorClass = error ? 'animate-shake' : '';
  const pinDotClass = `w-4 h-4 rounded-full border-2 ${accentClasses[accentColor] || 'border-gray-500'}`;
  const pinDotFilledClass = `w-4 h-4 rounded-full bg-${accentColor}-500`;

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center z-50">
      <LockIcon className={`text-6xl mb-4 ${accentClasses[accentColor] || 'text-gray-500'}`} />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Enter PIN</h2>
      <div className={`flex space-x-4 mb-8 ${errorClass}`}>
        {Array.from({ length: correctPin.length }).map((_, i) => (
          <div key={i} className={i < pin.length ? pinDotFilledClass.replace(accentColor, accentColor) : pinDotClass.replace(accentColor, accentColor)}></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => {
           const num = i + 1;
           return (
            <button key={num} onClick={() => handleKeyClick(num.toString())} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 text-2xl text-gray-800 dark:text-gray-200 flex items-center justify-center transition-transform transform hover:scale-105">
              {num}
            </button>
           )
        })}
        <div/>
        <button onClick={() => handleKeyClick('0')} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 text-2xl text-gray-800 dark:text-gray-200 flex items-center justify-center transition-transform transform hover:scale-105">
          0
        </button>
        <button onClick={handleDelete} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 text-2xl text-gray-800 dark:text-gray-200 flex items-center justify-center transition-transform transform hover:scale-105">
          ⌫
        </button>
      </div>
    </div>
  );
};

export default LockScreen;

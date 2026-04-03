'use client';

import { useState, useRef, useEffect } from 'react';

interface ColumnResizerProps {
  onResize: (newWidth: number) => void;
  isDragging?: boolean;
  setIsDragging?: (dragging: boolean) => void;
}

export default function ColumnResizer({ onResize, isDragging, setIsDragging }: ColumnResizerProps) {
  const [isLocalDragging, setIsLocalDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLocalDragging(true);
    setIsDragging?.(true);
    startXRef.current = e.clientX;
    
    // Get the current width of the parent container
    const parent = e.currentTarget.parentElement?.parentElement;
    if (parent) {
      startWidthRef.current = parent.offsetWidth;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocalDragging) return;
      
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(150, Math.min(600, startWidthRef.current + deltaX));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsLocalDragging(false);
      setIsDragging?.(false);
    };

    if (isLocalDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isLocalDragging, onResize]);

  return (
    <div
      className={`
        w-1 bg-slate-200 hover:bg-blue-400 transition-colors cursor-col-resize relative
        ${isLocalDragging || isDragging ? 'bg-blue-500' : ''}
      `}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-1 h-4 bg-slate-400 rounded-full transition-all ${isLocalDragging || isDragging ? 'bg-blue-600' : ''}`} />
      </div>
    </div>
  );
}

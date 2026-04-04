'use client';

import { useState, useRef, useEffect } from 'react';

interface ColumnResizerProps {
  onResize: (newWidthPercentage: number) => void;
  isDragging?: boolean;
  setIsDragging?: (dragging: boolean) => void;
}

export default function ColumnResizer({ onResize, isDragging, setIsDragging }: ColumnResizerProps) {
  const [isLocalDragging, setIsLocalDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const containerWidthRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLocalDragging(true);
    setIsDragging?.(true);
    startXRef.current = e.clientX;
    hasMovedRef.current = false;
    
    // Get the current width of the preceding sibling (the column being resized)
    const prevSibling = e.currentTarget.previousElementSibling as HTMLElement;
    // Get the width of the shared parent container
    const parentContainer = e.currentTarget.parentElement as HTMLElement;
    
    if (prevSibling && parentContainer) {
      startWidthRef.current = prevSibling.offsetWidth;
      containerWidthRef.current = parentContainer.offsetWidth;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocalDragging) return;
      
      const deltaX = e.clientX - startXRef.current;
      
      // 3px Threshold to prevent accidental moves on simple clicks
      if (!hasMovedRef.current && Math.abs(deltaX) < 3) {
        return;
      }
      hasMovedRef.current = true;

      // Use requestAnimationFrame to throttle state updates for smoother dragging
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        const newPixelWidth = startWidthRef.current + deltaX;
        
        // Convert to percentage of parent container width
        if (containerWidthRef.current > 0) {
          const newPercentage = (newPixelWidth / containerWidthRef.current) * 100;
          onResize(newPercentage);
        }
      });
    };

    const handleMouseUp = () => {
      setIsLocalDragging(false);
      setIsDragging?.(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };

    if (isLocalDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      // Add an invisible overlay to prevent iframes/maps from capturing mouse events during drag
      const overlay = document.createElement('div');
      overlay.id = 'resize-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.zIndex = '9999';
      overlay.style.cursor = 'col-resize';
      document.body.appendChild(overlay);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      const overlay = document.getElementById('resize-overlay');
      if (overlay) {
        overlay.remove();
      }
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isLocalDragging, onResize]);

  return (
    <div
      className={`
        w-2 bg-slate-200 hover:bg-blue-400 transition-colors cursor-col-resize relative z-50
        ${isLocalDragging || isDragging ? 'bg-blue-500' : ''}
      `}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-1 h-8 bg-slate-400 rounded-full transition-all ${isLocalDragging || isDragging ? 'bg-blue-600 h-12' : ''}`} />
      </div>
    </div>
  );
}

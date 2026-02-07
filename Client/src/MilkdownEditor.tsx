import React, { useEffect, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';

// Import essential Crepe styling
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

export const MilkdownEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Crepe
    const crepe = new Crepe({
      root: editorRef.current,
      defaultValue: '# Welcome to VibeScribe\nReady for your handwritten notes!',
    });

    crepe.create();

    // Cleanup to prevent memory leaks or duplicate editors on hot-reload
    return () => {
      crepe.destroy();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div ref={editorRef} />
    </div>
  );
};
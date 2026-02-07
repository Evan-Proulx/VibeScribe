import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Crepe } from '@milkdown/crepe';
import { replaceAll } from '@milkdown/utils';
import { useMarkdownPersistence } from './hooks/useMarkdownPersistence';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

export const MilkdownEditor: React.FC = () => {
  const editorRootRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const syncTimerRef = useRef<number | undefined>(undefined);

  // Drawer state - when open, textarea is completely independent
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerOpenRef = useRef(false); // Ref to track in callbacks

  // Persistence hook for markdown content
  const [markdown, setMarkdown] = useMarkdownPersistence();
  const markdownRef = useRef(markdown); // Keep ref in sync for callbacks

  // Keep refs in sync with state
  useEffect(() => {
    drawerOpenRef.current = drawerOpen;
  }, [drawerOpen]);

  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  // Initialize the Milkdown editor
  useEffect(() => {
    if (!editorRootRef.current || crepeRef.current) return;

    const crepe = new Crepe({
      root: editorRootRef.current,
      defaultValue: markdown,
    });

    crepeRef.current = crepe;

    // Listen for changes from the main editor ONLY when drawer is closed
    crepe.on((listener) => {
      listener.markdownUpdated((_, nextMd) => {
        // CRITICAL: If drawer is open, do NOT update anything
        // The textarea is the source of truth while open
        if (drawerOpenRef.current) return;

        // Only update state when drawer is closed
        setMarkdown(nextMd);
      });
    });

    crepe.create().then(() => {
      console.log('Milkdown Editor Ready');
    }).catch(console.error);

    return () => {
      crepe.destroy();
      crepeRef.current = null;
      clearTimeout(syncTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync textarea value when drawer opens
  useEffect(() => {
    if (drawerOpen && textareaRef.current) {
      // Set the current markdown value when opening
      textareaRef.current.value = markdownRef.current;
      textareaRef.current.focus();
    }
  }, [drawerOpen]);

  // Update the Milkdown editor
  const syncToEditor = useCallback((text: string) => {
    const crepe = crepeRef.current;
    if (!crepe) return;

    try {
      // @ts-expect-error - Crepe API access
      if (typeof crepe.action === 'function') {
        crepe.action(replaceAll(text));
        // @ts-expect-error - Crepe API access
      } else if (crepe.editor) {
        // @ts-expect-error - Crepe API access
        crepe.editor.action(replaceAll(text));
      }
    } catch (e) {
      console.warn('Failed to sync to editor:', e);
    }
  }, []);

  // Handle textarea input - NO cursor manipulation needed with uncontrolled input
  const handleTextareaInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const newText = textarea.value;

    // Update persisted state
    setMarkdown(newText);

    // Debounce sync to Milkdown editor (heavier operation)
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      syncToEditor(newText);
    }, 400);
  }, [setMarkdown, syncToEditor]);

  // Handle drawer close - sync final state
  const handleCloseDrawer = useCallback(() => {
    // Clear any pending sync
    clearTimeout(syncTimerRef.current);

    // Sync final textarea content immediately
    if (textareaRef.current) {
      const finalText = textareaRef.current.value;
      setMarkdown(finalText);
      syncToEditor(finalText);
    }

    setDrawerOpen(false);
  }, [setMarkdown, syncToEditor]);

  return (
    <div style={{ padding: 20 }}>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            background: '#333',
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
          }}
        >
          Open Markdown Source
        </button>
      </div>

      {/* Main Editor Area */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={editorRootRef} />
      </div>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          onClick={handleCloseDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 999,
          }}
        />
      )}

      {/* Markdown Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(520px, 92vw)',
          background: '#0f1115',
          color: 'white',
          zIndex: 1000,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 180ms ease',
          boxShadow: '0 0 40px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: 14,
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <strong>Markdown Source</strong>
          <button onClick={handleCloseDrawer} style={{ cursor: 'pointer' }}>
            Close
          </button>
        </div>

        <div style={{ padding: 12, flex: 1 }}>
          <textarea
            ref={textareaRef}
            onInput={handleTextareaInput}
            spellCheck={false}
            style={{
              width: '100%',
              height: '100%',
              resize: 'none',
              padding: 12,
              borderRadius: 12,
              background: '#0b0d11',
              color: '#e0e0e0',
              border: '1px solid #333',
              fontFamily: 'monospace',
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              wordWrap: 'normal',
            }}
          />
        </div>
      </div>
    </div>
  );
};
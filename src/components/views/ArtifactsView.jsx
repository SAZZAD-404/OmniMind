import React, { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sparkles, Code, FileCode2 } from 'lucide-react';

export default function ArtifactsView({ chats }) {
  // Extract all code blocks from all chats
  const artifacts = useMemo(() => {
    const list = [];
    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.role === 'assistant' && typeof msg.content === 'string') {
          // regex to find markdown code blocks
          const regex = /```(\w+)?\n([\s\S]*?)```/g;
          let match;
          while ((match = regex.exec(msg.content)) !== null) {
            list.push({
              id: `${chat.id}-${match.index}`,
              chatTitle: chat.title,
              language: match[1] || 'text',
              code: match[2].trim(),
              date: chat.updatedAt
            });
          }
        }
      });
    });
    return list.sort((a, b) => b.date - a.date);
  }, [chats]);

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <Sparkles size={24} style={{ color: 'var(--brand-color)' }} />
        <h1>Your Artifacts Gallery</h1>
      </header>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: '32px' }}>
        OmniMind automatically scans all your Chat Logs and saves every piece of code generated into this central repository.
      </p>

      {artifacts.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FileCode2 size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No Artifacts found.</h3>
          <p>Ask OmniMind to write some code, and it will appear here!</p>
        </div>
      ) : (
        <div className="artifacts-grid">
          {artifacts.map(art => (
            <div key={art.id} className="artifact-card">
               <div className="artifact-card-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)'}}>
                   <Code size={16} />
                   <span style={{ fontWeight: '500'}}>{art.language.toUpperCase()}</span>
                 </div>
                 <span style={{ fontSize: '12px', color: 'var(--text-tertiary)'}}>{art.chatTitle}</span>
               </div>
               <div className="artifact-preview">
                  <SyntaxHighlighter
                    language={art.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '12px',
                      background: 'transparent',
                      fontSize: '12px',
                    }}
                  >
                    {art.code}
                  </SyntaxHighlighter>
               </div>
               <div className="artifact-footer">
                  <button onClick={() => navigator.clipboard.writeText(art.code)}>Copy Source</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

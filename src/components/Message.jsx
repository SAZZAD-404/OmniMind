import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ErrorBoundary from './ErrorBoundary';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Check, PenLine, X, Trash2, Reply, Eye, Download } from 'lucide-react';
import assistantIcon from '../assets/logo_icon.svg';
import CodeBlock from './CodeBlock';

export default function Message({ index, role, content, imageUrl, onEdit, onRetry, onDelete, onReply, onArtifactPreview, onArtifactUpdate, addToast }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  
  const safeContent = typeof content === 'string' ? content : '';
  const [editText, setEditText] = useState(safeContent);

  const isUser = role === 'user';
  
  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      if (addToast) addToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const submitEdit = () => {
    if (typeof editText === 'string' && editText.trim() && editText !== safeContent) {
      onEdit(index, editText.trim());
    }
    setIsEditing(false);
  };

  if (isUser) {
    if (isEditing) {
      return (
        <div className="message-row user">
          <div className="message-edit-container">
            <textarea 
               className="message-edit-textarea"
               value={editText}
               onChange={(e) => setEditText(e.target.value)}
               rows={4}
               autoFocus
            />
            <div className="message-edit-actions">
              <button className="edit-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="edit-submit-btn" onClick={submitEdit}>Save & Submit</button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="message-row user">
        <div className="message-bubble-user-wrapper">
          <div className="message-bubble-user">
            {imageUrl && (
               <img src={imageUrl} alt="Attached" style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '8px', display: 'block'}} />
            )}
            {safeContent && <span>{safeContent}</span>}
          </div>
          
          <div className="message-actions user-actions">
            <div className="action-icon" title="Copy" onClick={handleCopy}>
               {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            </div>
            <div className="action-icon" title="Edit Message" onClick={() => setIsEditing(true)}>
               <PenLine size={14} />
            </div>
            <div className="action-icon" title="Delete Pair" onClick={() => onDelete(index)}>
               <Trash2 size={14} style={{ color: '#ef4444' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-row assistant">
      <div className="message-bubble-assistant">
        <div className="assistant-avatar-wrapper">
          <img src={assistantIcon} alt="OmniMind" className="assistant-logo" />
        </div>
        <div className="assistant-content">
          <ErrorBoundary>
            <div className="markdown-body">
              <ReactMarkdown
                components={{
                  code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <CodeBlock 
                        language={match[1]} 
                        value={String(children).replace(/\n$/, '')} 
                        onPreview={onArtifactPreview}
                        onUpdate={onArtifactUpdate}
                        addToast={addToast}
                      />
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {safeContent}
              </ReactMarkdown>
            </div>
          </ErrorBoundary>
          
          <div className="message-actions">
            <div className="action-icon" title="Copy" onClick={handleCopy}>
               {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            </div>
            <div 
              className="action-icon" 
              title="Thumbs Up" 
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              style={{ color: feedback === 'up' ? 'var(--text-primary)' : '' }}
            >
              <ThumbsUp size={14} />
            </div>
            <div 
              className="action-icon" 
              title="Thumbs Down" 
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              style={{ color: feedback === 'down' ? '#ef4444' : '' }}
            >
              <ThumbsDown size={14} />
            </div>
            <div className="action-icon" title="Reload Option" onClick={() => onRetry(index)}>
               <RotateCcw size={14} />
            </div>
            <div className="action-icon" title="Reply" onClick={() => onReply(index)}>
               <Reply size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

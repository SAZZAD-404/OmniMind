import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Eye, Download, PenLine, Save, X } from 'lucide-react';

export default function CodeBlock({ language, value, onPreview, onUpdate, addToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(value);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedCode);
    setCopied(true);
    if (addToast) addToast("Code copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      python: 'py',
      jsx: 'jsx',
      tsx: 'tsx',
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([editedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnimind-snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    if (addToast) addToast("File download started", "success");
  };

  const handleSave = () => {
    onUpdate(editedCode);
    setIsEditing(false);
    if (addToast) addToast("Code saved to history", "success");
  };

  const showPreview = ['html', 'svg', 'xml', 'jsx', 'javascript', 'css'].includes(language?.toLowerCase());

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-lang-tag">{language?.toUpperCase() || 'TEXT'}</span>
        <div className="code-block-actions">
          {isEditing ? (
            <>
              <button className="code-action-btn save" onClick={handleSave} title="Save Changes">
                <Save size={14} /> <span>Save</span>
              </button>
              <button className="code-action-btn" onClick={() => { setEditedCode(value); setIsEditing(false); }} title="Cancel">
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button className="code-action-btn" onClick={handleCopy} title="Copy">
                {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              </button>
              <button className="code-action-btn" onClick={() => setIsEditing(true)} title="Edit Code">
                <PenLine size={14} />
              </button>
              {showPreview && (
                <button className="code-action-btn preview" onClick={() => onPreview(editedCode, language)} title="Preview">
                  <Eye size={14} /> <span>Preview</span>
                </button>
              )}
              <button className="code-action-btn" onClick={handleDownload} title="Download">
                <Download size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="code-content-wrapper">
        {isEditing ? (
          <textarea
            className="code-edit-textarea"
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            spellCheck="false"
          />
        ) : (
          <SyntaxHighlighter
            language={language || 'text'}
            style={vscDarkPlus}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0 0 8px 8px',
              padding: '16px',
              fontSize: '14px',
              backgroundColor: '#161616'
            }}
          >
            {editedCode}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}

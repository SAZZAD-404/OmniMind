import React from 'react';
import { CodeXml, Terminal } from 'lucide-react';

export default function CodeView() {
  return (
    <div className="dashboard-container animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="dashboard-header">
        <CodeXml size={24} style={{ color: 'var(--brand-color)' }} />
        <h1>OmniMind Code Engine</h1>
      </header>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>
        Run AI agents directly in your environment. Advanced file system access and orchestration toolchains.
      </p>

      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span style={{ background: '#ff5f56' }}></span>
            <span style={{ background: '#ffbd2e' }}></span>
            <span style={{ background: '#27c93f' }}></span>
          </div>
          <div style={{ color: '#a3a3a3', fontSize: '12px'}}>omnimind@engine: ~</div>
        </div>
        <div className="terminal-body" style={{ flex: 1, padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#e5e5e5', backgroundColor: '#000' }}>
          <p style={{ color: '#a3a3a3', marginBottom: '8px' }}>// Starting OmniMind Code Interactive Agent</p>
          <p><span style={{ color: '#27c93f'}}>user@local</span>:~$ omnimind code init</p>
          <p style={{ marginTop: '8px', color: '#60a5fa' }}>Setting up local environment linkages...</p>
          <p>✔ Linked to workspace root</p>
          <p>✔ Verified API credentials securely</p>
          <p style={{ marginTop: '8px', color: '#a3a3a3' }}>Agent is listening for system commands. Please execute a script.</p>
          <br />
          <p><span style={{ color: '#27c93f'}}>user@local</span>:~$ <span className="terminal-cursor">█</span></p>
        </div>
      </div>
    </div>
  );
}

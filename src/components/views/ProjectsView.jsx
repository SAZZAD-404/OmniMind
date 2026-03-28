import React, { useState, useEffect } from 'react';
import { LayoutTemplate, FolderPlus, Folder, Trash2 } from 'lucide-react';
import Modal from '../Modal';

export default function ProjectsView({ projects, createProject, deleteProject, onSelectProject }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleCreate = () => {
    if(!newProjectName.trim()) return;
    createProject(newProjectName.trim());
    setNewProjectName('');
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header" style={{ justifyContent: 'space-between', width: '100%'}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutTemplate size={24} style={{ color: 'var(--brand-color)' }} />
          <h1>Projects Workspace</h1>
        </div>
        <button className="create-project-btn" onClick={() => setIsModalOpen(true)}>
          <FolderPlus size={16} /> New Project
        </button>
      </header>
      
      <p style={{ color: 'var(--text-tertiary)', marginBottom: '32px' }}>
        Create isolated Workspaces to group specific chats together with system-wide context.
      </p>

      {projects.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Folder size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No Projects yet.</h3>
          <p>Click 'New Project' to create an isolated workspace.</p>
        </div>
      ) : (
        <div className="projects-grid">
           {projects.map(proj => (
             <div key={proj.id} className="project-card" onClick={() => onSelectProject(proj.id)}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px'}}>
                    <Folder size={20} style={{ color: '#60a5fa'}} />
                    <h3>{proj.name}</h3>
                 </div>
                 <button 
                   className="action-icon" 
                   style={{ opacity: 0.1 }}
                   onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }}
                 >
                   <Trash2 size={14} />
                 </button>
               </div>
               <div style={{ color: 'var(--text-secondary)', fontSize: '14px'}}>
                 {proj.chatIds.length} Chats linked
               </div>
               <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '16px'}}>
                 Created {new Date(proj.createdAt).toLocaleDateString()}
               </div>
             </div>
           ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block'}}>Project Name</label>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="e.g. Marketing Campaign 2026"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              autoFocus
            />
          </div>
          <button className="send-btn" style={{ width: '100%'}} onClick={handleCreate} disabled={!newProjectName.trim()}>
            Initialize Workspace
          </button>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, FileText, LayoutTemplate, Sparkles, CodeXml, PanelLeftClose, MoreHorizontal, Star, PenLine, Folder, Trash2, X } from 'lucide-react';
import Modal from './Modal';

export default function Sidebar({ isOpen, toggleSidebar, chats, currentChatId, setCurrentChatId, createNewChat, onOpenSearch, onOpenSettings, deleteChat, renameChat, toggleStar, addChatToProject, activeView, setActiveView, projects = [], selectedProjectId, setSelectedProjectId, userProfile, setUserProfile }) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedChatForProject, setSelectedChatForProject] = useState(null);
  const [editName, setEditName] = useState(userProfile.name);

  useEffect(() => {
    setEditName(userProfile.name);
  }, [userProfile]);

  const handleViewChange = (view) => {
    setActiveView(view);
    if(window.innerWidth < 768) toggleSidebar();
  };

  const handleSelectRecent = (id) => {
    setCurrentChatId(id);
    setActiveView('chat');
    if(window.innerWidth < 768 && isOpen) toggleSidebar();
  };

  if (!isOpen) return null;

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(null);
    deleteChat(id);
  };

  const handleRename = (e, id, currentTitle) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const newName = window.prompt("Enter a new name for this chat:", currentTitle);
    if (newName && newName.trim()) renameChat(id, newName.trim());
  };

  const handleToggleStar = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(null);
    toggleStar(id);
  };

  const handleOpenProjectModal = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setSelectedChatForProject(id);
    setIsProjectModalOpen(true);
  };

  const handleAssignToProject = (projectId) => {
    if (selectedChatForProject) {
      addChatToProject(selectedChatForProject, projectId);
      setIsProjectModalOpen(false);
      setSelectedChatForProject(null);
      alert('Successfully assigned chat to workspace!');
    }
  };

  const handleProfileSave = () => {
    setUserProfile({ ...userProfile, name: editName });
    setIsProfileModalOpen(false);
  };

  const avatarInitial = (userProfile.name || 'S').charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', marginBottom: '16px' }}>
          <span style={{ fontFamily: '"Georgia", serif', fontSize: '20px', fontWeight: '400', letterSpacing: '0.5px', color: '#ececec' }}>OmniMind</span>
          <button className="brand-collapse-btn" onClick={toggleSidebar}>
            <PanelLeftClose size={18} />
          </button>
        </div>

        <button className="sidebar-menu-btn" onClick={() => { createNewChat(); setActiveView('chat'); }}>
          <Plus size={16} />
          New chat
        </button>
        <button className="sidebar-menu-btn search" onClick={onOpenSearch}>
          <Search size={16} />
          Search
        </button>
        <button className="sidebar-menu-btn search" style={{ marginBottom: 0 }} onClick={onOpenSettings}>
          <Settings size={16} />
          Customize
        </button>
      </div>

      <div className="sidebar-section">
        <div
          className={`sidebar-item ${activeView === 'chat' && !selectedProjectId ? 'active' : ''}`}
          onClick={() => { handleViewChange('chat'); setSelectedProjectId(null); }}
        >
          <FileText size={16} /> All Chats
        </div>
        <div className={`sidebar-item ${activeView === 'projects' ? 'active' : ''}`} onClick={() => handleViewChange('projects')}>
          <LayoutTemplate size={16} /> Workspace Gallery
        </div>
        <div className={`sidebar-item ${activeView === 'artifacts' ? 'active' : ''}`} onClick={() => handleViewChange('artifacts')}>
          <Sparkles size={16} /> Artifacts
        </div>
        <div className={`sidebar-item ${activeView === 'code' ? 'active' : ''}`} onClick={() => handleViewChange('code')}>
          <CodeXml size={16} /> OmniMind Code
        </div>
      </div>

      <div className="sidebar-scroll-area">
        {selectedProjectId && (
          <div className="sidebar-filter-pill">
            <Folder size={12} />
            <span>{projects.find(p => p.id === selectedProjectId)?.name}</span>
            <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedProjectId(null)} />
          </div>
        )}

        <div className="sidebar-title">Recents</div>

        {chats.length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '0 12px' }}>No recent chats.</div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`history-item-wrapper ${chat.id === currentChatId && activeView === 'chat' ? 'active' : ''}`}
              onClick={() => handleSelectRecent(chat.id)}
            >
              <div className="history-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {chat.isStarred && <Star size={12} fill="#fbbf24" color="#fbbf24" />}
                <span>{chat.title}</span>
              </div>

              <button className="item-menu-btn" onClick={(e) => handleMenuClick(e, chat.id)}>
                <MoreHorizontal size={14} />
              </button>

              {activeMenuId === chat.id && (
                <div className="context-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="context-item" onClick={(e) => handleToggleStar(e, chat.id)}>
                    <Star size={14} /> {chat.isStarred ? 'Unstar' : 'Star'}
                  </div>
                  <div className="context-item" onClick={(e) => handleRename(e, chat.id, chat.title)}>
                    <PenLine size={14} /> Rename
                  </div>
                  <div className="context-item border-bottom" onClick={(e) => handleOpenProjectModal(e, chat.id)}>
                    <Folder size={14} /> Add to project
                  </div>
                  <div className="context-item text-danger" onClick={(e) => handleDelete(e, chat.id)}>
                    <Trash2 size={14} /> Delete
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {projects.length > 0 && (
          <>
            <div className="sidebar-title" style={{ marginTop: '24px' }}>Workspaces</div>
            {projects.map(proj => (
              <div
                key={proj.id}
                className={`history-item-wrapper ${selectedProjectId === proj.id ? 'active' : ''}`}
                onClick={() => { setSelectedProjectId(proj.id); setActiveView('chat'); }}
              >
                <div className="history-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Folder size={14} style={{ color: '#60a5fa' }} />
                  <span>{proj.name}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile interactive" onClick={() => setIsProfileModalOpen(true)}>
          <div className="user-avatar">{avatarInitial}</div>
          <div className="user-info">
            <span className="user-name">{userProfile.name}</span>
          </div>
        </div>
      </div>

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Assign to Project">
        {projects.length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '16px' }}>You haven't created any Projects yet. Go to the Projects tab to create one first.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Select Workspace:</label>
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => handleAssignToProject(p.id)}
                style={{
                  padding: '12px', background: 'var(--bg-hover)', borderRadius: '6px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)'
                }}
              >
                <Folder size={16} style={{ color: '#60a5fa' }} /> {p.name}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* PROFILE MODAL */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Account Settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '24px' }}>{avatarInitial}</div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{userProfile.name}</h3>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Display Name</label>
            <input
              type="text"
              className="modal-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <button className="send-btn" style={{ width: '100%' }} onClick={handleProfileSave}>
            Save Changes
          </button>
        </div>
      </Modal>
    </aside>
  );
}

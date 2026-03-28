import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Modal from './components/Modal';
import Toast from './components/Toast';
import ArtifactsView from './components/views/ArtifactsView';
import ProjectsView from './components/views/ProjectsView';
import CodeView from './components/views/CodeView';
import HomePage from './components/HomePage';
import { MODELS } from './constants';
import './App.css';

function App() {
  // Page routing: 'home' | 'chat' based on current URL
  const [page, setPage] = useState(() => {
    if (window.location.pathname.startsWith('/chat')) return 'chat';
    return 'home';
  });
  const [chatVisible, setChatVisible] = useState(() => window.location.pathname.startsWith('/chat'));

  const handleEnterApp = () => {
    setPage('chat');
    setTimeout(() => setChatVisible(true), 10);
  };

  const [selectedModel, setSelectedModel] = useState(MODELS.length > 0 ? MODELS[0] : null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Real-time Chat Local Storage
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('omnimind_chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/chat/')) {
      return path.split('/chat/')[1];
    }
    return null;
  });

  // Native SPA Router Syncing
  useEffect(() => {
    const path = window.location.pathname;
    if (page === 'home') {
      if (path !== '/') window.history.pushState(null, '', '/');
    } else if (page === 'chat') {
      const newPath = currentChatId ? `/chat/${currentChatId}` : '/chat';
      if (path !== newPath) window.history.pushState(null, '', newPath);
    }
  }, [page, currentChatId]);

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setPage('home');
      } else if (path.startsWith('/chat/')) {
        setPage('chat');
        setChatVisible(true);
        setCurrentChatId(path.split('/chat/')[1]);
      } else if (path === '/chat') {
        setPage('chat');
        setChatVisible(true);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Router State
  const [activeView, setActiveView] = useState('chat'); // 'chat' | 'projects' | 'artifacts' | 'code'

  // Modals States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are OmniMind, a professional AI assistant.'); // Mock settings

  // Artifacts State
  const [showArtifacts, setShowArtifacts] = useState(false);

  // Projects State Shared
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('omnimind_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('omnimind_user');
    return saved ? JSON.parse(saved) : { name: 'Admin' };
  });

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'error') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    try {
      localStorage.setItem('omnimind_chats', JSON.stringify(chats));
    } catch (e) {
      console.warn("Storage warning: Could not persist all chats, likely due to image size exceeding 5MB.", e);
    }
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('omnimind_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('omnimind_user', JSON.stringify(userProfile));
  }, [userProfile]);

  const createNewChat = () => {
    // Generate a professional UUID (e.g. 27a04ccb-0a74-4ec3-bc22-3ca4d2895fec)
    const newChatId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
      });

    const newChat = { id: newChatId, title: "New Chat", messages: [], updatedAt: Date.now() };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (!currentChatId && chats.length > 0) setCurrentChatId(chats[0].id);
    else if (chats.length === 0) createNewChat();
  }, [chats, currentChatId]);

  const handleUpdateMessages = (chatId, newMessages) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, messages: newMessages, updatedAt: Date.now() };
      }
      return chat;
    }).sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const deleteChat = (chatId) => {
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== chatId);
      if (currentChatId === chatId) {
        // Automatically switch to the first available chat or make a new one
        if (remaining.length > 0) setCurrentChatId(remaining[0].id);
        else setCurrentChatId(null);
      }
      return remaining;
    });
  };

  const renameChat = (chatId, newTitle) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, title: newTitle, updatedAt: Date.now() } : chat
    ).sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const toggleStar = (chatId) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isStarred: !chat.isStarred } : chat
    ));
  };

  const addChatToProject = (chatId, projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId && !p.chatIds.includes(chatId)) {
        return { ...p, chatIds: [...p.chatIds, chatId] };
      }
      return p;
    }));
  };

  const createNewProject = (name) => {
    const newProj = {
      id: Date.now().toString(),
      name: name,
      chatIds: [],
      createdAt: Date.now()
    };
    setProjects([newProj, ...projects]);
  };

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) setSelectedProjectId(null);
  };

  const activeChat = chats.find(c => c.id === currentChatId);

  // Project Filtering Logic
  const projectFilteredChats = selectedProjectId
    ? chats.filter(c => projects.find(p => p.id === selectedProjectId)?.chatIds.includes(c.id))
    : chats;

  // Search Logic (Global)
  const filteredSearchChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(m => m.content?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSearchSelect = (id) => {
    setCurrentChatId(id);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  if (page === 'home') {
    return <HomePage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className={`app-container ${chatVisible ? 'chat-enter' : ''}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={projectFilteredChats}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        createNewChat={createNewChat}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        deleteChat={deleteChat}
        renameChat={renameChat}
        toggleStar={toggleStar}
        addChatToProject={addChatToProject}
        activeView={activeView}
        setActiveView={setActiveView}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      <div className="main-wrapper">
        {activeView === 'chat' && (
          <ChatWindow
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            activeChat={activeChat}
            updateChatMessages={handleUpdateMessages}
            renameChat={renameChat}
            addToast={addToast}
          />
        )}

        {activeView === 'artifacts' && <ArtifactsView chats={chats} />}
        {activeView === 'projects' && (
          <ProjectsView
            projects={projects}
            createProject={createNewProject}
            deleteProject={deleteProject}
            onSelectProject={(id) => { setSelectedProjectId(id); setActiveView('chat'); }}
          />
        )}
        {activeView === 'code' && <CodeView />}

        {showArtifacts && (
          <div className="artifacts-panel">
            <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
              Artifacts Preview Pane Ready
            </div>
          </div>
        )}
      </div>

      {/* SEARCH MODAL */}
      <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} title="Search Conversations">
        <input
          type="text"
          className="modal-input"
          placeholder="Search topics, messages, code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        <div style={{ marginTop: '16px', maxHeight: '300px', overflowY: 'auto' }}>
          {searchQuery && filteredSearchChats.length === 0 && (
            <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No matches found.</div>
          )}
          {filteredSearchChats.map(chat => (
            <div
              key={chat.id}
              className="history-item"
              style={{ padding: '12px', marginBottom: '4px', background: 'var(--bg-hover)' }}
              onClick={() => handleSearchSelect(chat.id)}
            >
              <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{chat.title}</div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
                {chat.messages.length} messages • {new Date(chat.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="OmniMind Customize">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>System Prompt</label>
          <textarea
            className="modal-input"
            style={{ height: '100px', resize: 'vertical' }}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Give OmniMind specific behavior instructions. <i>Note: requires API to support System Role.</i></div>
        </div>
        <button className="send-btn" style={{ width: '100%' }} onClick={() => setIsSettingsOpen(false)}>
          Save Configuration
        </button>
      </Modal>

      {/* TOAST LIST */}
      <div className="toast-list">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

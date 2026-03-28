import React, { useState, useRef, useEffect } from 'react';
import { PanelLeft, ChevronDown, Plus, ArrowUp, X, Share } from 'lucide-react';
import logoIcon from '../assets/logo_icon.svg';
import Message from './Message';
import { API_BASE_URL, MODELS, getApiConfigForModel } from '../constants';

export default function ChatWindow({ selectedModel, setSelectedModel, toggleSidebar, isSidebarOpen, activeChat, updateChatMessages, renameChat, addToast }) {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null); // { url, type }
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareText, setShareText] = useState('Share');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const messages = activeChat?.messages || [];  
  const chatId = activeChat?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, attachment, chatId]);

  useEffect(() => {
    setInput('');
    setAttachment(null);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  }, [chatId]);

  useEffect(() => {
    const handleClickOutside = () => setIsModelDropdownOpen(false);
    if (isModelDropdownOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isModelDropdownOpen]);

  const handleShare = () => {
    if (messages.length === 0) return;
    
    let textOut = `# ${activeChat?.title || 'OmniMind Chat Transcript'}\n\n`;
    messages.forEach(m => {
       const rawText = m.role === 'user' ? (m.uiDisplay?.text || m.content) : m.content;
       textOut += `**${m.role === 'user' ? 'Me' : 'OmniMind'}**:\n${rawText}\n\n---\n\n`;
    });
    
    navigator.clipboard.writeText(textOut);
    setShareText('Copied!');
    setTimeout(() => setShareText('Share'), 2000);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 250)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }

    setIsUploadingAttachment(true);
    setAttachment({ url: null, type: 'image', isUploading: true, name: file.name });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 1200; 
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(async (blob) => {
          try {
            const formData = new FormData();
            formData.append('file', blob, file.name || 'upload.jpg');

            const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
              method: 'POST',
              body: formData
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const uploadData = await uploadRes.json();
            const rawUrl = uploadData.data.url;
            const directUrl = rawUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');

            setAttachment({ url: directUrl, type: 'image', isUploading: false, name: file.name });
            addToast("Image uploaded successfully", "success");
          } catch (err) {
            console.error("Upload Error:", err);
            addToast("Cloud upload failed. Using local preview.", "info");
            setAttachment({ url: canvas.toDataURL('image/jpeg', 0.8), type: 'image', isUploading: false, name: file.name });
          } finally {
            setIsUploadingAttachment(false);
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const generateTitle = async (chatIdTarget, userMessage, assistantMessage) => {
    try {
      const prompt = `Generate a very short, catchy title (max 5 words) for a chat that starts with this user message: "${userMessage}" and AI response: "${assistantMessage.slice(0, 100)}...". Do not use quotes or punctuation at the end. Best language for the title is the same as the user's message.`;
      
      const titleConfig = getApiConfigForModel("gpt-4o-mini");
      const response = await fetch(`${titleConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${titleConfig.apiKey}` },
        body: JSON.stringify({ 
          model: "gpt-4o-mini", // Use a fast model for title generation
          messages: [{ role: "user", content: prompt }] 
        })
      });

      if (response.ok) {
        const data = await response.json();
        let aiTitle = data?.choices?.[0]?.message?.content?.trim();
        if (aiTitle) {
          // Remove wrapping quotes if AI included them
          aiTitle = aiTitle.replace(/^["']|["']$/g, '');
          renameChat(chatIdTarget, aiTitle);
        }
      }
    } catch (error) {
      console.error("Failed to generate title:", error);
      // Silent fail for title generation is fine, we keep "New Chat"
    }
  };

  const runInference = async (chatIdTarget, updatedMessagesArray) => {
    setIsLoading(true);
    setInput('');
    setAttachment(null);
    if (inputRef.current) inputRef.current.style.height = 'auto'; 

    const conversationForAPI = updatedMessagesArray.map(m => ({ role: m.role, content: m.content }));

    if (!selectedModel) {
      addToast("No AI model selected. Please add an API Key to your .env file.", "error");
      setIsLoading(false);
      return;
    }

    try {
      const { apiKey: currentApiKey, baseUrl: currentBaseUrl } = getApiConfigForModel(selectedModel);
      const response = await fetch(`${currentBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentApiKey}` },
        body: JSON.stringify({ model: selectedModel, messages: conversationForAPI })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const aiReply = data?.choices?.[0]?.message?.content || "No response output from this model.";
      
      const newMessages = [...updatedMessagesArray, { role: 'assistant', content: aiReply }];
      updateChatMessages(chatIdTarget, newMessages);

      if (activeChat?.title === "New Chat" && updatedMessagesArray.length === 1) {
        const firstUserMsg = updatedMessagesArray[0].uiDisplay?.text || (typeof updatedMessagesArray[0].content === 'string' ? updatedMessagesArray[0].content : "New Image Chat");
        generateTitle(chatIdTarget, firstUserMsg, aiReply);
      }
    } catch (error) {
      // Diagnostic messages based on error type/status
      let errorTitle = "Network Error";
      let errorDetail = "Please check your internet connection.";
      
      if (error.message.includes('401')) {
        errorTitle = "Authentication Failed";
        errorDetail = "Invalid API Key. Please update your settings.";
      } else if (error.message.includes('402')) {
        errorTitle = "Quota Reached";
        errorDetail = "The API service requires payment or has reached its credit limit.";
      } else if (error.message.includes('429')) {
        errorTitle = "Rate Limit Reached";
        errorDetail = "Too many requests. Please wait a few seconds.";
      } else if (error.message.includes('500') || error.message.includes('503')) {
        errorTitle = "Model Server Busy";
        errorDetail = "The AI model is temporarily unavailable.";
      }

      addToast(`${errorTitle}: ${errorDetail}`, "error");
      
      // We don't add the generic "Unable to reach AI server" message to the chat anymore
      // instead we just stop loading and let the user retry.
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleEditMessage = (index, newText) => {
    if (!chatId || isLoading) return;
    // Keep everything up to (but not including) the edited user message
    const slicedMessages = messages.slice(0, index);
    
    // Create new message block
    const editedMsg = { 
      role: 'user', 
      content: newText,
      uiDisplay: { text: newText, imageUrl: messages[index].uiDisplay?.imageUrl || null } // retain older images if they existed
    };
    
    const newConversation = [...slicedMessages, editedMsg];
    updateChatMessages(chatId, newConversation);
    runInference(chatId, newConversation);
  };

  const handleRetryMessage = (index) => {
    if (!chatId || isLoading) return;
    // The index is the assistant message. Delete this assistant message (and technically any after it)
    const slicedMessages = messages.slice(0, index);
    updateChatMessages(chatId, slicedMessages);
    // Rerun inference on the exact state before this assistant reply
    runInference(chatId, slicedMessages);
  };

  const handleSubmit = async () => {
    if ((!input.trim() && !attachment) || isLoading || (attachment && attachment.isUploading) || !chatId || !selectedModel) return;

    let contentPayload;
    if (attachment && attachment.url) {
      contentPayload = [
        { type: "text", text: input.trim() || "Analyze this image." },
        { type: "image_url", image_url: { url: attachment.url } }
      ];
    } else {
      contentPayload = input.trim();
    }

    const userMsg = { 
      role: 'user', 
      content: contentPayload,
      uiDisplay: { text: input.trim(), imageUrl: attachment ? attachment.url : null }
    };

    const updatedMessagesWithUser = [...messages, userMsg];
    updateChatMessages(chatId, updatedMessagesWithUser);

    runInference(chatId, updatedMessagesWithUser);
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', flex: 1, minHeight: 0 }}>
      <header className="top-header">
        <div className="header-left">
          {!isSidebarOpen && (
            <button className="open-sidebar-btn" onClick={toggleSidebar} title="Open sidebar">
               <PanelLeft size={18} />
            </button>
          )}
          
          <div className="chat-title-btn">
             {activeChat?.title || "New Chat"} <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </div>
        <div>
           <button className="share-btn" onClick={handleShare}>{shareText}</button>
        </div>
      </header>

      <div className="chat-scroll-area">
        <div className="chat-container-inner">
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-secondary)'}}>
              <h2 style={{ fontSize: '24px', fontWeight: '500', color: 'var(--text-primary)'}}>Good afternoon</h2>
            </div>
          ) : (
             messages.map((msg, index) => {
               let textContent = msg.uiDisplay ? msg.uiDisplay.text : msg.content;
               let imgContent = msg.uiDisplay ? msg.uiDisplay.imageUrl : null;
               
               if (Array.isArray(textContent)) {
                 const textObj = textContent.find(c => c.type === 'text');
                 const imgObj = textContent.find(c => c.type === 'image_url');
                 textContent = textObj ? textObj.text : '';
                 imgContent = imgObj ? imgObj.image_url.url : null;
               }

               return (
                 <Message 
                   key={`${chatId}-${index}`} 
                   index={index}
                   role={msg.role} 
                   content={typeof textContent === 'string' ? textContent : ''} 
                   imageUrl={imgContent} 
                   onEdit={handleEditMessage}
                   onRetry={handleRetryMessage}
                 />
               );
             })
          )}
          {isLoading && (
            <div className="message-row assistant">
               <div className="assistant-avatar-wrapper pulsing">
                  <img src={logoIcon} alt="OmniMind" className="assistant-logo" />
               </div>
               <div className="assistant-content" style={{ color: 'var(--text-tertiary)', paddingTop: '10px'}}>Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} style={{ height: '40px' }} />
        </div>
      </div>

      <div className="input-island-container">
        <div className="input-island">
          {attachment && (
            <div className={`attachment-chip ${attachment.isUploading ? 'uploading' : ''}`}>
              {attachment.isUploading ? (
                <div className="attachment-loader">Linking...</div>
              ) : (
                <img src={attachment.url} alt="Preview" className="attachment-thumb" />
              )}
              <button className="attachment-remove-btn" onClick={() => setAttachment(null)}>
                <X size={14} />
              </button>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
             <textarea
               ref={inputRef}
               className="claude-textarea"
               value={input}
               onChange={handleInputChange}
               onKeyDown={handleKeyDown}
               placeholder="Reply..."
               rows={1}
               disabled={isLoading || !chatId}
             />
             
             {(input.trim() || attachment) && (
               <button className="send-btn" onClick={handleSubmit} disabled={isLoading || (attachment && attachment.isUploading) || !chatId}>
                  <ArrowUp size={16} strokeWidth={3} />
               </button>
             )}
          </div>
          
          <div className="input-bottom-row">
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
            <button className="attach-btn" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isUploadingAttachment || !chatId}>
              <Plus size={18} />
            </button>
            
            <div className="input-right-actions">
              <div style={{ position: 'relative' }}>
                <button 
                  className="model-dropdown-btn" 
                  onClick={(e) => { e.stopPropagation(); setIsModelDropdownOpen(!isModelDropdownOpen); }}
                  disabled={isLoading || !chatId || MODELS.length === 0}
                  style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {selectedModel || "No Key Found"} <ChevronDown size={14} />
                </button>
                
                {isModelDropdownOpen && MODELS.length > 0 && (
                  <div className="custom-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    {MODELS.map(m => (
                      <div 
                        key={m} 
                        className={`custom-dropdown-item ${selectedModel === m ? 'active' : ''}`}
                        onClick={() => { setSelectedModel(m); setIsModelDropdownOpen(false); }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="footer-text">OmniMind is AI and can make mistakes. Please double-check responses.</div>
      </div>
    </section>
  );
}

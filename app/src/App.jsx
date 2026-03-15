import { useState, useRef, useEffect } from 'react';
import './App.css';

const api_key = import.meta.env.VITE_OPENAI_API_KEY

const systemMessage = {
  role: "system",
  content: "Explain all concepts like a professional software engineer."
}

function App() {
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "Hello! I'm ChatGPT. Ask me anything — I'll explain it like a professional software engineer.",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleInput = (e) => {
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    setInputValue(ta.value);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || typing) return;

    const message = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const newMessage = { message, sender: "user", direction: "outgoing" };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    await processWithChatGPT(newMessages);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  async function processWithChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((msg) => ({
      role: msg.sender === "ChatGPT" ? "assistant" : "user",
      content: msg.message
    }));

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + api_key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [systemMessage, ...apiMessages]
        })
      });
      const data = await response.json();
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT",
        direction: "incoming"
      }]);
    } catch (err) {
      console.error(err);
    }

    setTyping(false);
  }

  return (
    <div className="app">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="chat-shell">
        {/* Header */}
        <header className="chat-header">
          <div className="header-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="10" fill="url(#iconGrad)" />
                <path d="M10 16h12M16 10v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="iconGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="brand-name">ChatGPT</div>
              <div className="brand-model">GPT-3.5 Turbo</div>
            </div>
          </div>
          <div className="online-badge">
            <span className="online-dot" />
            Online
          </div>
        </header>

        {/* Messages */}
        <div className="message-list">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.direction}`}>
              {msg.direction === 'incoming' && (
                <div className="avatar ai">
                  <svg viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="10" fill="url(#avGrad)" />
                    <path d="M10 16h12M16 10v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="avGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#8b5cf6" />
                        <stop offset="1" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
              <div className={`bubble ${msg.direction}`}>
                <p>{msg.message}</p>
              </div>
              {msg.direction === 'outgoing' && (
                <div className="avatar user">U</div>
              )}
            </div>
          ))}

          {typing && (
            <div className="msg-row incoming">
              <div className="avatar ai">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="10" fill="url(#typGrad)" />
                  <path d="M10 16h12M16 10v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="typGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#8b5cf6" />
                      <stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="bubble incoming typing-bubble">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              className="input-field"
              placeholder="Message ChatGPT..."
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className={`send-btn ${inputValue.trim() && !typing ? 'ready' : ''}`}
              onClick={handleSend}
              disabled={!inputValue.trim() || typing}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className="hint">Enter to send &nbsp;·&nbsp; Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}

export default App;

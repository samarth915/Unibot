import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    // Clear input immediately
    setInput("");
    
    const newMessage = { text: userMessage, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    
    // Set loading state to true
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      // Set loading state to false
      setIsLoading(false);
      
      setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (error) {
      // Set loading state to false
      setIsLoading(false);
      
      setMessages((prev) => [
        ...prev,
        { text: "Oops! Something went wrong.", sender: "bot" },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <h1>
        <span role="img" aria-label="graduation cap">🎓</span> 
        Unibot Assistant
      </h1>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.length === 0 ? (
          <div className="empty-chat-message">
            Ask me anything about the university...
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <span>{msg.text}</span>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="message bot loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      <div className="input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about the university..."
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button onClick={sendMessage} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
}

export default App;
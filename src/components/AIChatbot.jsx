import React, { useState, useRef, useEffect } from 'react';
import { askGemini } from '../services/gemini';
import './AIChatbot.css';

const AIChatbot = ({ currentQuestion, isVisible }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset messages when question changes
    useEffect(() => {
        if (currentQuestion) {
            setMessages([]);
            setError(null);
        }
    }, [currentQuestion?.id]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || !currentQuestion || isLoading) return;

        const userMessage = userInput.trim();
        setUserInput('');
        setError(null);

        // Add user message to chat
        const newUserMessage = {
            id: Date.now(),
            type: 'user',
            content: userMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            // Prepare question context for Gemini
            const questionContext = {
                question: currentQuestion.question,
                options: currentQuestion.options || [],
                correctAnswer: currentQuestion.answer,
                explanation: currentQuestion.explanation,
                userQuestion: userMessage
            };

            const response = await askGemini(questionContext);

            // Add AI response to chat
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Failed to get AI response:', error);
            setError('Sorry, I couldn\'t process your question right now. Please try again.');

            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Sorry, I couldn\'t process your question right now. Please try again.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setError(null);
    };

    if (!isVisible || !currentQuestion) {
        return null;
    }

    return (
        <div className="ai-chatbot">
            {/* Chat Toggle Button */}
            <button
                className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
                onClick={toggleChat}
                title="Ask AI Coach for help"
            >
                <div className="chat-icon">
                    {isOpen ? '✕' : '🤖'}
                </div>
                {!isOpen && <div className="chat-label">AI Coach</div>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-title">
                            <span className="chat-icon">🤖</span>
                            AI Caregiver Coach
                        </div>
                        <button
                            className="chat-close-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="welcome-message">
                                <div className="ai-message">
                                    <div className="message-content">
                                        Hi! I'm your AI caregiver training coach. I can help explain the concepts in this question and provide guidance on best practices. What would you like to know?
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div key={message.id} className={`message ${message.type}-message`}>
                                <div className="message-content">
                                    {message.content}
                                </div>
                                <div className="message-time">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message ai-message">
                                <div className="message-content loading">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    AI Coach is thinking...
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input">
                        <div className="input-container">
                            <textarea
                                ref={inputRef}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about this question or caregiver concepts..."
                                disabled={isLoading}
                                rows="2"
                            />
                            <button
                                className="send-btn"
                                onClick={handleSendMessage}
                                disabled={!userInput.trim() || isLoading}
                            >
                                📤
                            </button>
                        </div>
                    </div>

                    <div className="chat-context">
                        <small>
                            💡 I know the context of your current question and can explain concepts,
                            reasoning, and safety practices.
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChatbot;
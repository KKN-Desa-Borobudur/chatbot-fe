import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import axios from 'axios';

interface Message {
    id: string;
    text: string;
    timestamp: Date;
    isOwn: boolean;
}

const AnonymousChat: React.FC = () => {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Selamat datang di Borobudur! Say hello buat chattingan sama gweh, Borobuguide',
            timestamp: new Date(),
            isOwn: false
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            const message: Message = {
                id: Date.now().toString(),
                text: newMessage,
                timestamp: new Date(),
                isOwn: true
            };
            setMessages(prev => [...prev, message]);
            setNewMessage('');

            let token = localStorage.getItem('chatToken');
            if (token === null) {
                const newToken = await axios.post('http://ceritaborobudur.my.id/api/chat/session')
                localStorage.setItem('chatToken', newToken.data.token);
            }
            token = localStorage.getItem('chatToken');
            
            const response = await axios.post('http://ceritaborobudur.my.id/api/chat/chat', 
                {
                    "message": newMessage,
                    "token": token
                }
            )

            const reply: Message = {
                id: (Date.now() + 1).toString(),
                text: response.data.response,
                timestamp: new Date(),
                isOwn: false
            };
            setMessages(prev => [...prev, reply]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col max-w-2xl mx-auto">
            {/* Header */}
            <div className="bg-[#5354A6] text-white p-4 shadow-lg">
                <div className="text-center">
                    <h1 className="text-xl font-bold">BorobuGuide</h1>
                    <p className="text-[#5354A6]/80 text-sm">Percakapan sekali pakai • Tidak ada data yang disimpan</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${message.isOwn
                                    ? 'bg-[#5354A6] text-white rounded-br-md'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                                }`}>
                                <p className="text-sm leading-relaxed">{message.text}</p>
                                <p className={`text-xs mt-2 ${message.isOwn ? 'text-white/70' : 'text-gray-500'
                                    }`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex items-end space-x-3">
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#5354A6] focus:border-transparent min-h-[48px] max-h-32"
                            rows={1}
                        />
                    </div>

                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className={`p-3 rounded-full transition-all duration-200 ${newMessage.trim()
                                ? 'bg-[#5354A6] hover:bg-[#4A4B96] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center mt-3">
                    Pesan bersifat anonim. Pesan tidak disimpan atau dilacak.
                </p>
            </div>
        </div>
    );
};

export default AnonymousChat;
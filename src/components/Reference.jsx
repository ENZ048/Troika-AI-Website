import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Settings, X, Save, Upload, Sparkles, Zap, MessageCircle, ChevronDown, Moon, Sun, FileText, Video, Award, Flame } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';

const MultilingualAIAgent = ({ user, tenant }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [typingAnimation, setTypingAnimation] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('basic');
  const [sessionId] = useState(uuidv4());
  const [businessKnowledge, setBusinessKnowledge] = useState({
    companyName: 'TechCorp Solutions',
    industry: 'B2B SaaS',
    tagline: 'Simplifying Enterprise Workflows with AI',
    foundedYear: '2020',
    companySize: '50-200 employees',
    headquarters: 'San Francisco, CA',
    website: 'www.techcorp.com',
    contactEmail: 'contact@techcorp.com',
    phone: '+1 (555) 123-4567',
    supportEmail: 'support@techcorp.com',
    socialMedia: {
      linkedin: 'linkedin.com/company/techcorp',
      twitter: '@techcorp',
      facebook: 'facebook.com/techcorp'
    },
    products: [
      { 
        name: 'AI Workflow Automation', 
        description: 'Streamline operations with intelligent automation',
        price: 'Starting at $299/month',
        features: ['Auto-routing', 'Smart scheduling', 'Custom workflows', '99.9% uptime'],
        targetAudience: 'Mid to large enterprises'
      },
      { 
        name: 'Custom AI Agents', 
        description: 'Deploy specialized AI agents for your business needs',
        price: 'Starting at $499/month',
        features: ['Multilingual support', 'Voice enabled', 'Custom training', 'Priority support'],
        targetAudience: 'B2B companies with customer service needs'
      }
    ],
    services: [
      {
        name: 'AI Implementation Consulting',
        description: 'Expert guidance for AI adoption',
        duration: '4-12 weeks',
        deliverables: ['Strategy roadmap', 'Technical architecture', 'Training sessions']
      }
    ],
    pricingPlans: [
      {
        name: 'Starter',
        price: '$299/month',
        features: ['1 AI Agent', '1,000 conversations/month', 'Email support', 'Basic analytics'],
        bestFor: 'Small businesses'
      },
      {
        name: 'Growth',
        price: '$799/month',
        features: ['3 AI Agents', '5,000 conversations/month', 'Priority support', 'Advanced analytics', 'Custom branding'],
        bestFor: 'Growing companies'
      }
    ],
    faqs: [
      {
        question: 'How quickly can we get started?',
        answer: 'Most clients are up and running within 24-48 hours. Enterprise implementations typically take 1-2 weeks.'
      },
      {
        question: 'What languages do you support?',
        answer: 'Our AI agents support 100+ languages including English, Spanish, French, German, Mandarin, Hindi, Arabic, and more.'
      },
      {
        question: 'Can we integrate with our existing tools?',
        answer: 'Yes! We integrate with 500+ platforms including Salesforce, HubSpot, Slack, Teams, and most CRM/helpdesk systems.'
      }
    ],
    mission: 'To empower businesses with AI technology that drives efficiency and growth',
    values: ['Innovation', 'Customer Success', 'Transparency', 'Reliability'],
    certifications: ['SOC 2 Type II', 'GDPR Compliant', 'ISO 27001', 'HIPAA Ready'],
    businessHours: 'Monday-Friday: 9 AM - 6 PM PST',
    currentPromotions: [
      {
        title: 'New Customer Discount',
        description: '20% off first 3 months',
        code: 'WELCOME20',
        validUntil: '2025-12-31'
      }
    ]
  });

  const quickQuestions = [
    { icon: '💰', text: 'What are your pricing plans?', gradient: 'from-green-400 to-emerald-500' },
    { icon: '🚀', text: 'How do I get started?', gradient: 'from-blue-400 to-cyan-500' },
    { icon: '🌍', text: 'What languages do you support?', gradient: 'from-purple-400 to-pink-500' },
    { icon: '📞', text: 'Book a demo call', gradient: 'from-orange-400 to-red-500', action: 'demo' }
  ];

  const avatarEmojis = {
    en: '🤖', es: '🤖🇪🇸', fr: '🤖🇫🇷', de: '🤖🇩🇪', 
    zh: '🤖🇨🇳', ja: '🤖🇯🇵', hi: '🤖🇮🇳', ar: '🤖🇸🇦'
  };

  const achievementsList = [
    { id: 'first_message', icon: '🎉', title: 'First Chat', description: 'Sent your first message!' },
    { id: 'five_messages', icon: '💬', title: 'Conversationalist', description: 'Had 5 exchanges' },
    { id: 'demo_booked', icon: '📅', title: 'Meeting Scheduled', description: 'Booked a demo!' },
    { id: 'file_shared', icon: '📎', title: 'File Sender', description: 'Shared a file' },
    { id: 'voice_user', icon: '🎤', title: 'Voice Pro', description: 'Used voice input' }
  ];
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const playSound = (type) => {
    if (!soundEnabled) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === 'send') {
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } else if (type === 'receive') {
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
      }
    } catch (error) {
      console.log('Sound playback not available:', error);
    }
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const unlockAchievement = (achievementId) => {
    if (achievements.includes(achievementId)) return;
    
    setAchievements(prev => [...prev, achievementId]);
    const achievement = achievementsList.find(a => a.id === achievementId);
    if (!achievement) return;
    
    setTimeout(() => {
      const notifDiv = document.createElement('div');
      notifDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        gap: 12px;
        align-items: center;
        animation: slideIn 0.5s ease-out;
      `;
      notifDiv.innerHTML = `
        <span style="font-size: 32px;">${achievement.icon}</span>
        <div>
          <div style="font-weight: bold; color: #1f2937;">${achievement.title}</div>
          <div style="font-size: 14px; color: #6b7280;">${achievement.description}</div>
        </div>
      `;
      document.body.appendChild(notifDiv);
      setTimeout(() => notifDiv.remove(), 3000);
    }, 100);
  };

  const detectLanguage = (text) => {
    const langPatterns = {
      es: /^(hola|buenos|gracias|por favor|qué)/i,
      fr: /^(bonjour|merci|comment|oui|non)/i,
      de: /^(hallo|danke|bitte|wie|guten)/i,
      hi: /[\u0900-\u097F]/,
      ar: /[\u0600-\u06FF]/,
      zh: /[\u4e00-\u9fa5]/,
      ja: /[\u3040-\u309F\u30A0-\u30FF]/
    };

    for (const [lang, pattern] of Object.entries(langPatterns)) {
      if (pattern.test(text)) return lang;
    }
    return 'en';
  };

  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          unlockAchievement('voice_user');
        };
        
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    } catch (error) {
      console.log('Speech recognition not available:', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showWelcome) {
      const text = `Hi! I'm your AI assistant 👋`;
      let index = 0;
      const timer = setInterval(() => {
        setTypingAnimation(text.slice(0, index));
        index++;
        if (index > text.length) clearInterval(timer);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [showWelcome]);

  const generateSuggestedReplies = (botMessage) => {
    const suggestions = [];
    const lowerMsg = botMessage.toLowerCase();
    
    if (lowerMsg.includes('pricing') || lowerMsg.includes('plan')) {
      suggestions.push('Tell me more about features', 'Can I get a discount?', 'Book a demo');
    } else if (lowerMsg.includes('demo') || lowerMsg.includes('call')) {
      suggestions.push('Schedule now', 'What time works?', 'Send me details');
    } else if (lowerMsg.includes('started') || lowerMsg.includes('begin')) {
      suggestions.push('Yes, let\'s start!', 'What do I need?', 'How long does setup take?');
    } else {
      suggestions.push('Tell me more', 'That sounds great!', 'What else can you do?');
    }
    
    setSuggestedReplies(suggestions.slice(0, 3));
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const createBusinessContext = () => {
    return `You are an AI assistant for ${businessKnowledge.companyName}, a ${businessKnowledge.industry} company.

COMPANY OVERVIEW:
- Tagline: ${businessKnowledge.tagline}
- Mission: ${businessKnowledge.mission}

PRODUCTS:
${businessKnowledge.products.map(p => `
- ${p.name}
  - Description: ${p.description}
  - Pricing: ${p.price}
  - Key Features: ${p.features.join(', ')}
  - Target: ${p.targetAudience}
`).join('\n')}

SERVICES:
${businessKnowledge.services.map(s => `
- ${s.name}
  - ${s.description}
  - Duration: ${s.duration}
  - Deliverables: ${s.deliverables.join(', ')}
`).join('\n')}

PRICING PLANS:
${businessKnowledge.pricingPlans.map(plan => `
- ${plan.name} - ${plan.price}
  Best for: ${plan.bestFor}
  Includes: ${plan.features.join(', ')}
`).join('\n')}

FREQUENTLY ASKED QUESTIONS:
${businessKnowledge.faqs.map(faq => `
Q: ${faq.question}
A: ${faq.answer}
`).join('\n')}

CONTACT INFORMATION:
- Website: ${businessKnowledge.website}
- Email: ${businessKnowledge.contactEmail}
- Phone: ${businessKnowledge.phone}
- Hours: ${businessKnowledge.businessHours}

CURRENT PROMOTIONS:
${businessKnowledge.currentPromotions.map(promo => `
- ${promo.title}: ${promo.description}
  Code: ${promo.code} (Valid until ${promo.validUntil})
`).join('\n')}

CERTIFICATIONS: ${businessKnowledge.certifications.join(', ')}

IMPORTANT INSTRUCTIONS:
1. Detect the language of the user's message and respond in the SAME language
2. Be helpful, professional, and knowledgeable about all offerings
3. When discussing products/services, mention relevant features, pricing, and benefits
4. If asked about pricing, provide clear information and mention current promotions
5. Keep responses concise but comprehensive (2-5 sentences unless more detail requested)
6. Use a friendly, consultative tone with emojis naturally
7. Guide users to take action (book demo, start trial, contact sales)

User's message: `;
  };

  const handleSendMessage = async (messageText = inputText) => {
    if (!messageText.trim()) return;

    playSound('send');
    setShowWelcome(false);
    
    const detectedLang = detectLanguage(messageText);
    setUserLanguage(detectedLang);
    
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);
    setSuggestedReplies([]);
    
    setStreak(prev => prev + 1);
    
    if (messages.length === 0) unlockAchievement('first_message');
    if (messages.length === 4) unlockAchievement('five_messages');

    try {
      // Use backend API instead of direct Anthropic call
      const response = await apiService.sendMessage(
        messageText,
        sessionId,
        userLanguage,
        false // voiceInput flag
      );

      const botResponse = response.message;

      setTimeout(() => {
        setIsTyping(false);
        playSound('receive');
        
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        generateSuggestedReplies(botResponse);
        
        if (messageText.toLowerCase().includes('demo') || messageText.toLowerCase().includes('book')) {
          unlockAchievement('demo_booked');
          triggerConfetti();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting. Please try again! 😊",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputText(question);
    handleSendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      setUploadedFiles(prev => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type
      }]);
    });
    if (files.length > 0) {
      unlockAchievement('file_shared');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    files.forEach(file => {
      setUploadedFiles(prev => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type
      }]);
    });
    if (files.length > 0) {
      unlockAchievement('file_shared');
    }
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const initiateVideoCall = () => {
    triggerConfetti();
    alert('🎥 Video call feature would connect to Zoom, Google Meet, or your preferred platform!');
  };

  const addProduct = () => {
    setBusinessKnowledge({
      ...businessKnowledge,
      products: [...businessKnowledge.products, {
        name: '',
        description: '',
        price: '',
        features: [],
        targetAudience: ''
      }]
    });
  };

  const updateProduct = (index, field, value) => {
    const updated = [...businessKnowledge.products];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessKnowledge({ ...businessKnowledge, products: updated });
  };

  const removeProduct = (index) => {
    const updated = businessKnowledge.products.filter((_, i) => i !== index);
    setBusinessKnowledge({ ...businessKnowledge, products: updated });
  };

  const addFAQ = () => {
    setBusinessKnowledge({
      ...businessKnowledge,
      faqs: [...businessKnowledge.faqs, { question: '', answer: '' }]
    });
  };

  const updateFAQ = (index, field, value) => {
    const updated = [...businessKnowledge.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessKnowledge({ ...businessKnowledge, faqs: updated });
  };

  const removeFAQ = (index) => {
    const updated = businessKnowledge.faqs.filter((_, i) => i !== index);
    setBusinessKnowledge({ ...businessKnowledge, faqs: updated });
  };

  const theme = isDarkMode ? {
    bg: 'from-gray-900 via-purple-900 to-gray-900',
    cardBg: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
    inputBg: 'bg-gray-700',
    userBubble: 'bg-gradient-to-r from-blue-600 to-purple-700',
    botBubble: 'bg-gray-800 border-gray-700'
  } : {
    bg: 'from-indigo-50 via-purple-50 to-pink-50',
    cardBg: 'bg-white',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    inputBg: 'bg-white',
    userBubble: 'bg-gradient-to-r from-blue-500 to-purple-600',
    botBubble: 'bg-white border-gray-100'
  };

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br ${theme.bg} relative overflow-hidden transition-all duration-500`}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB'][i % 5]
              }}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 shadow-2xl z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform hover:scale-110 transition-transform">
                {avatarEmojis[userLanguage] || '🤖'}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-bold text-2xl flex items-center gap-2">
                {businessKnowledge.companyName}
                <Sparkles size={20} className="text-yellow-300" />
              </h1>
              <p className="text-sm text-purple-100 font-medium">
                🌟 Online • Avg response: 2s
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Flame className="text-orange-300" size={20} />
              <span className="font-bold">{streak}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Award className="text-yellow-300" size={20} />
              <span className="font-bold">{achievements.length}/{achievementsList.length}</span>
            </div>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <MicOff size={20} />}
            </button>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 hover:bg-white/20 rounded-xl transition-all"
              title="Settings"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="absolute top-24 right-4 bg-white rounded-2xl shadow-2xl z-50 max-w-3xl w-full max-h-[80vh] overflow-hidden border border-purple-100">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="font-bold text-xl text-gray-800">Business Knowledge Base</h3>
            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex border-b bg-gray-50">
            {['basic', 'products', 'pricing', 'faq'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSettingsTab(tab)}
                className={`px-6 py-3 font-medium transition-all ${
                  activeSettingsTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeSettingsTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Company Name</label>
                    <input
                      type="text"
                      value={businessKnowledge.companyName}
                      onChange={(e) => setBusinessKnowledge({...businessKnowledge, companyName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Industry</label>
                    <input
                      type="text"
                      value={businessKnowledge.industry}
                      onChange={(e) => setBusinessKnowledge({...businessKnowledge, industry: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Tagline</label>
                  <input
                    type="text"
                    value={businessKnowledge.tagline}
                    onChange={(e) => setBusinessKnowledge({...businessKnowledge, tagline: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Website</label>
                    <input
                      type="text"
                      value={businessKnowledge.website}
                      onChange={(e) => setBusinessKnowledge({...businessKnowledge, website: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Phone</label>
                    <input
                      type="text"
                      value={businessKnowledge.phone}
                      onChange={(e) => setBusinessKnowledge({...businessKnowledge, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'products' && (
              <div className="space-y-6">
                {businessKnowledge.products.map((product, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">Product {index + 1}</h4>
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Product Name</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={product.description}
                          onChange={(e) => updateProduct(index, 'description', e.target.value)}
                          className="w-full p-2 border rounded"
                          rows="2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Pricing</label>
                          <input
                            type="text"
                            value={product.price}
                            onChange={(e) => updateProduct(index, 'price', e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Target Audience</label>
                          <input
                            type="text"
                            value={product.targetAudience}
                            onChange={(e) => updateProduct(index, 'targetAudience', e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addProduct}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Add Product
                </button>
              </div>
            )}

            {activeSettingsTab === 'pricing' && (
              <div className="space-y-4">
                {businessKnowledge.pricingPlans.map((plan, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const updated = [...businessKnowledge.pricingPlans];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setBusinessKnowledge({ ...businessKnowledge, pricingPlans: updated });
                          }}
                          className="w-full p-2 border rounded font-medium"
                          placeholder="Plan name"
                        />
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = [...businessKnowledge.pricingPlans];
                            updated[index] = { ...updated[index], price: e.target.value };
                            setBusinessKnowledge({ ...businessKnowledge, pricingPlans: updated });
                          }}
                          className="w-full p-2 border rounded"
                          placeholder="Price"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSettingsTab === 'faq' && (
              <div className="space-y-6">
                {businessKnowledge.faqs.map((faq, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">FAQ {index + 1}</h4>
                      <button
                        onClick={() => removeFAQ(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Question</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Answer</label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                          className="w-full p-2 border rounded"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addFAQ}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Add FAQ
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50 flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 font-medium shadow-lg"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto p-6 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/20 border-4 border-dashed border-blue-500 rounded-3xl flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="text-center">
              <Upload size={64} className="mx-auto text-blue-600 mb-4" />
              <p className="text-2xl font-bold text-blue-600">Drop files here to share</p>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-6">
          {showWelcome && messages.length === 0 && (
            <div className="text-center space-y-8 py-12 animate-fade-in">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center text-6xl shadow-2xl transform hover:scale-110 transition-transform animate-bounce-slow">
                  {avatarEmojis[userLanguage] || '🤖'}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white animate-pulse"></div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {typingAnimation}
                </h2>
                <p className={`text-xl ${theme.textSecondary} font-medium`}>
                  I can help you with {businessKnowledge.companyName} in any language! 🌍
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q.text)}
                    className={`group relative p-5 ${theme.cardBg} rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border ${theme.border} overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${q.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative flex items-center gap-4">
                      <div className="text-4xl">{q.icon}</div>
                      <div className="text-left flex-1">
                        <p className={`font-semibold ${theme.text} group-hover:text-purple-600 transition-colors`}>
                          {q.text}
                        </p>
                      </div>
                      <ChevronDown className="text-gray-400 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <div className={`flex items-center gap-2 ${theme.cardBg} px-5 py-3 rounded-full shadow-md`}>
                  <MessageCircle className="text-blue-500" size={20} />
                  <span className={`font-medium ${theme.text}`}>100+ Languages</span>
                </div>
                <div className={`flex items-center gap-2 ${theme.cardBg} px-5 py-3 rounded-full shadow-md`}>
                  <Zap className="text-yellow-500" size={20} />
                  <span className={`font-medium ${theme.text}`}>Instant Responses</span>
                </div>
                <div className={`flex items-center gap-2 ${theme.cardBg} px-5 py-3 rounded-full shadow-md`}>
                  <Sparkles className="text-purple-500" size={20} />
                  <span className={`font-medium ${theme.text}`}>AI-Powered</span>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {message.sender === 'bot' && (
                  <div className="flex items-center gap-2 mb-2 ml-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-lg shadow-md">
                      {avatarEmojis[userLanguage] || '🤖'}
                    </div>
                    <span className={`text-sm font-semibold ${theme.textSecondary}`}>AI Assistant</span>
                  </div>
                )}
                <div
                  className={`rounded-3xl p-5 shadow-xl transform hover:scale-[1.02] transition-all ${
                    message.sender === 'user'
                      ? `${theme.userBubble} text-white rounded-br-lg`
                      : `${theme.botBubble} ${theme.text} rounded-bl-lg border`
                  }`}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-3 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'bot' && (
                  <button
                    onClick={() => speakText(message.text)}
                    className="mt-2 ml-2 p-2 hover:bg-purple-100 rounded-full transition-colors group"
                    title="Listen to response"
                  >
                    <Volume2 size={16} className="text-gray-500 group-hover:text-purple-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-slide-up">
              <div className={`${theme.botBubble} rounded-3xl rounded-bl-lg p-5 shadow-xl border`}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className={`text-sm ${theme.textSecondary} font-medium`}>AI is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          {suggestedReplies.length > 0 && !isTyping && (
            <div className="flex gap-2 justify-center flex-wrap animate-slide-up">
              {suggestedReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(reply)}
                  className={`px-4 py-2 ${theme.cardBg} ${theme.text} rounded-full border ${theme.border} hover:bg-purple-100 hover:border-purple-300 transition-all transform hover:scale-105 shadow-md text-sm font-medium`}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="px-6 pb-2">
          <div className="max-w-4xl mx-auto flex gap-2 flex-wrap">
            {uploadedFiles.map(file => (
              <div key={file.id} className={`flex items-center gap-2 ${theme.cardBg} px-3 py-2 rounded-lg border ${theme.border} shadow-sm`}>
                <FileText size={16} className="text-blue-500" />
                <span className={`text-sm ${theme.text}`}>{file.name}</span>
                <span className="text-xs text-gray-400">({file.size})</span>
                <button onClick={() => removeFile(file.id)} className="ml-2 text-red-500 hover:text-red-700">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`relative ${theme.inputBg} border-t ${theme.border} p-6 shadow-2xl z-10`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl transition-all transform hover:scale-110 shadow-lg bg-gradient-to-r from-blue-100 to-purple-100 text-purple-600 hover:from-blue-200 hover:to-purple-200"
              title="Upload files"
            >
              <Upload size={24} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
            
            <button
              onClick={toggleVoiceInput}
              className={`p-4 rounded-2xl transition-all transform hover:scale-110 shadow-lg ${
                isListening
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse scale-110'
                  : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 hover:from-purple-200 hover:to-pink-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... 💬"
                className={`w-full p-4 pr-12 border-2 ${theme.border} rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all shadow-lg text-base ${theme.inputBg} ${theme.text}`}
                rows="1"
                style={{ maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={initiateVideoCall}
              className="p-4 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 hover:from-green-200 hover:to-emerald-200 transition-all transform hover:scale-110 shadow-lg"
              title="Start video call"
            >
              <Video size={24} />
            </button>
            
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className={`p-4 rounded-2xl transition-all transform shadow-lg ${
                inputText.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-110 shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send size={24} />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className={`flex items-center gap-2 ${theme.textSecondary}`}>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Powered by AI</span>
            </div>
            <div className="text-gray-400">•</div>
            <div className={`${theme.textSecondary} font-medium`}>🌍 100+ Languages</div>
            <div className="text-gray-400">•</div>
            <div className={`${theme.textSecondary} font-medium`}>⚡ Lightning Fast</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fall {
          to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fall { animation: fall 3s linear forwards; }
        
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MultilingualAIAgent;
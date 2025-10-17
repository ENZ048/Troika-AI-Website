import SupaChatbot from "./components/SupaChatbot"
import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

// Constants for chatbot configuration
const CHATBOT_ID = "68da398a0f936d435d7aa19d"
// const API_BASE = "https://api.0804.in/api"
const API_BASE = "http://localhost:5000/api"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '2px solid red', margin: '20px', backgroundColor: 'lightcoral' }}>
          <h2>Error in SupaChatbot Component</h2>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <p><strong>Stack:</strong> {this.state.error?.stack}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log("App component is rendering!");

  return (
    <BrowserRouter>
      <ErrorBoundary>
            <Routes>
              <Route path="/" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/new-chat" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/home" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-websites" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-calling" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-whatsapp" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-telegram" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/industry-use-cases" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/social-media" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/pricing" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/sales" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/marketing" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/about" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/features" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/roi" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
            </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;
  max-width: 960px;
  margin: 0 auto;

  @media (max-width: 720px) {
    gap: 16px;
    padding: 16px 14px 24px;
  }
`;

const Title = styled.h2`
  margin: 0 0 4px 0;
  color: ${p => p.$isDarkMode ? '#f9fafb' : '#111827'};
  text-align: center;
  @media (max-width: 720px) {
    font-size: 1.1rem;
  }
`;

const Subtitle = styled.p`
  margin: 0 0 12px 0;
  color: ${p => p.$isDarkMode ? '#94a3b8' : '#6b7280'};
  text-align: center;
  font-size: 0.95rem;
  @media (max-width: 720px) {
    font-size: 0.9rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 18px;
  width: 100%;
  max-width: 760px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    max-width: 420px;
    gap: 12px;
  }
`;

const Card = styled.button`
  border: 2px solid ${p => p.$active ? '#8b5cf6' : (p.$isDarkMode ? '#374151' : '#e5e7eb')};
  background: ${p => p.$isDarkMode ? '#1f2937' : '#ffffff'};
  color: inherit;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 96px;
  @media (max-width: 720px) {
    min-height: unset;
  }
`;

const Desc = styled.p`
  margin: 6px 0 0 0;
  line-height: 1.45;
  color: ${p => p.$isDarkMode ? '#cbd5e1' : '#4b5563'};
  @media (max-width: 720px) {
    margin-top: 4px;
    font-size: 0.92rem;
  }
`;

const SendBtn = styled.button`
  align-self: center;
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  opacity: ${p => p.disabled ? 0.6 : 1};
  min-width: 170px;
  @media (max-width: 720px) {
    width: 100%;
    max-width: 420px;
  }
`;

const ServiceSelection = ({ onSendProposal, phoneNumber }) => {
  const { isDarkMode } = useTheme();
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);

  const services = [
    { id: 'ai-agent', name: 'AI Supa Agent', desc: '24x7 AI website agent', long: 'Capture leads, answer FAQs instantly and guide visitors in multiple languages directly on your website.' },
    { id: 'ai-calling', name: 'AI Calling Agent', desc: 'AI that calls and answers', long: 'Make outbound follow‑ups, route calls intelligently with IVR and auto‑generate concise call summaries.' },
    { id: 'rcs', name: 'RCS Messaging', desc: 'Rich messaging for Android', long: 'Send verified, media‑rich messages with images, carousels and quick‑action buttons for higher engagement.' },
    { id: 'whatsapp', name: 'WhatsApp Marketing', desc: 'Campaigns and automations', long: 'Launch approved templates, schedule broadcasts and build automation flows that convert at scale.' },
  ];

  const handleSend = async () => {
    if (!selected || !onSendProposal) return;
    setSending(true);
    try {
      await onSendProposal(selected, phoneNumber);
    } finally {
      setSending(false);
    }
  };

  return (
    <Container>
      <Title $isDarkMode={isDarkMode}>Select a service to receive proposal</Title>
      <Subtitle $isDarkMode={isDarkMode}>Pick what you need and we’ll send a tailored proposal to your WhatsApp.</Subtitle>
      <Grid>
        {services.map(s => (
          <Card
            key={s.id}
            onClick={() => setSelected(s)}
            $active={selected?.id === s.id}
            $isDarkMode={isDarkMode}
          >
            <div style={{fontWeight:700, marginBottom:6}}>{s.name}</div>
            <div style={{opacity:0.8}}>{s.desc}</div>
            <Desc $isDarkMode={isDarkMode}>{s.long}</Desc>
          </Card>
        ))}
      </Grid>
      <SendBtn disabled={!selected || sending} onClick={handleSend}>
        {sending ? 'Sending…' : 'Send Proposal'}
      </SendBtn>
    </Container>
  );
};

export default ServiceSelection;



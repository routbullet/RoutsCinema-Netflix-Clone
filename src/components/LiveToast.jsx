import { useEffect } from 'react';
import styled from 'styled-components';
import { tokens } from '../styles/tokens';

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  z-index: 120;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  color: ${tokens.color.text};
  padding: 0.75rem 1.25rem;
  border-radius: ${tokens.radius.pill};
  box-shadow: ${tokens.shadow.card};
  font-weight: 600;
`;

export default function LiveToast({ notice, onDone }) {
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => onDone?.(), 2200);
    return () => clearTimeout(t);
  }, [notice, onDone]);

  if (!notice) return null;
  return (
    <Toast role="status" aria-live="polite">
      {notice.message}
    </Toast>
  );
}

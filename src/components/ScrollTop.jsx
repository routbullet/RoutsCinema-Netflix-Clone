import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '../styles/tokens';

const Btn = styled.button`
  position: fixed;
  right: 1rem;
  bottom: 1.5rem;
  z-index: 60;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid ${tokens.color.border};
  background: rgba(11, 10, 24, 0.85);
  color: ${tokens.color.text};
  font-size: 1.3rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  &:hover {
    background: ${tokens.color.surfaceHover};
  }
`;

export default function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const goTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <Btn onClick={goTop} aria-label="Scroll back to top">
      ↑
    </Btn>
  );
}

import styled from 'styled-components';
import { tokens } from '../styles/tokens';

const Foot = styled.footer`
  border-top: 1px solid ${tokens.color.border};
  margin-top: 3rem;
  padding: 2rem 1rem 3rem;
  color: ${tokens.color.muted};
`;

const Inner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
`;

export default function Footer() {
  return (
    <Foot>
      <Inner>
        <p style={{ margin: 0 }}>
          <strong style={{ color: '#F5F5F7' }}>Crafted with care</strong> — A Netflix-style
          browser powered by TMDB. This product uses the TMDB API but not endorsed or
          certified by TMDB.
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>
          Data: themoviedb.org • Images: image.tmdb.org • Built with Vite + React + axios
        </p>
      </Inner>
    </Foot>
  );
}

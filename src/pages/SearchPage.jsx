import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useDebouncedValue, useSearchMulti } from '../hooks/useTmdb';
import TitleCard from '../components/TitleCard';
import DetailsModal from '../components/DetailsModal';
import { Seo } from '../components/Seo';
import { tokens, media } from '../styles/tokens';

const Main = styled.main`
  max-width: 1600px;
  margin: 0 auto;
  padding: 6rem 1rem 2rem;
  ${media.md} {
    padding: 7rem 2rem 3rem;
  }
`;

const Field = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  flex: 1;
  background: ${tokens.color.surface};
  border: 1px solid ${tokens.color.border};
  color: ${tokens.color.text};
  border-radius: ${tokens.radius.md};
  padding: 0.8rem 1.1rem;
  font-size: 1rem;
  min-height: 48px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  ${media.md} {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
`;

export default function SearchPage({ onToggleList, isSaved }) {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const debounced = useDebouncedValue(q, 300);
  const { data, status, error } = useSearchMulti(debounced);
  const [selected, setSelected] = useState(null);

  const onChange = (v) => {
    setQ(v);
    setParams(v ? { q: v } : {}, { replace: true });
  };

  return (
    <Main id="main-content">
      <Seo
        title={q ? `Search results for "${q}" | RoutsCinema` : 'Search Movies & TV Shows | RoutsCinema'}
        description="Search trending movies and TV shows by title, view ratings, trailers and add to My List. Powered by TMDB multi-search."
        path={`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`}
      />
      <h1 style={{ fontFamily: tokens.font.display, letterSpacing: 2 }}>Search</h1>
      <Field>
        <label htmlFor="search-q" className="visually-hidden">
          Search movies and TV shows
        </label>
        <Input
          id="search-q"
          type="search"
          placeholder="Search titles… (e.g. Dune, Breaking Bad)"
          value={q}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
      </Field>

      {status === 'idle' && <p style={{ color: tokens.color.muted }}>Type at least 2 characters. Try “Trending” picks on Home.</p>}
      {status === 'loading' && <p role="status">Searching TMDB…</p>}
      {status === 'error' && <p role="alert">{error}</p>}
      {status === 'success' && data.length === 0 && (
        <p>No results for “{debounced}”. Try another title or browse Trending Now.</p>
      )}
      {status === 'success' && data.length > 0 && (
        <Grid>
          {data.map((item) => (
            <TitleCard
              key={`${item.media_type}-${item.id}`}
              item={item}
              onSelect={setSelected}
              onToggleList={onToggleList}
              isSaved={isSaved?.(item.id)}
            />
          ))}
        </Grid>
      )}
      {selected && (
        <DetailsModal
          item={selected}
          onClose={() => setSelected(null)}
          onToggleList={onToggleList}
          isSaved={isSaved?.(selected.id)}
        />
      )}
    </Main>
  );
}

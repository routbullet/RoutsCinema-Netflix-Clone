import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTmdbList } from '../hooks/useTmdb';
import { RAILS } from '../lib/requests';
import { backdropSrc } from '../lib/image';
import Hero from '../components/Hero';
import Row from '../components/Row';
import DetailsModal from '../components/DetailsModal';
import { Seo } from '../components/Seo';
import { tokens, media } from '../styles/tokens';

const Main = styled.main`
  display: block;
`;

const Rails = styled.div`
  margin-top: -4rem;
  position: relative;
  z-index: 2;
  ${media.md} {
    margin-top: -5rem;
  }
`;

const HeroState = styled.div`
  min-height: min(92svh, 760px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.color.muted};
  padding: 6rem 1rem;
`;

// Above-the-fold rails fetch immediately; the rest mount (and fetch) only when
// scrolled near. Without this, Home fires ~15 concurrent proxied requests
// (x2 under StrictMode) and TMDB resets the burst with ECONNRESET.
const EAGER_RAILS = 5;

const RailPlaceholder = styled.div`
  min-height: 260px;
`;

function LazyRail({ eager, children }) {
  const [visible, setVisible] = useState(eager);
  const ref = useRef(null);

  useEffect(() => {
    if (eager || visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, visible]);

  if (!visible) return <RailPlaceholder ref={ref} aria-hidden="true" />;
  return children;
}

export default function Home({ onToggleList, isSaved }) {
  const trending = useTmdbList(RAILS[0].endpoint, RAILS[0].params);
  const [selected, setSelected] = useState(null);
  const [heroId, setHeroId] = useState(null);

  // Random spotlight per page load: pick once when trending data arrives and
  // keep it stable for the session (silent retries must not reshuffle it).
  // A tab refresh remounts everything, so the next visit spotlights a new title.
  useEffect(() => {
    const list = trending.data || [];
    if (!list.length || heroId !== null) return;
    const withBackdrop = list.filter((i) => i.backdrop_path);
    const pool = withBackdrop.length ? withBackdrop : list;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setHeroId(pick.id);
  }, [trending.data, heroId]);

  const heroItem = useMemo(() => {
    const list = trending.data || [];
    if (!list.length) return null;
    return list.find((i) => i.id === heroId) || null;
  }, [trending.data, heroId]);

  const heroImage = heroItem ? backdropSrc(heroItem.backdrop_path, 'w780') : undefined;

  return (
    <Main id="main-content">
      <Seo
        title="RoutsCinema — Trending Movies & TV Shows | Netflix-style TMDB Browser"
        description="Browse trending movies, top-rated films and Netflix TV shows with trailers, ratings and My List. A cinematic TMDB discovery experience."
        path="/"
        image={heroImage}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Trending on RoutsCinema',
          itemListElement: (trending.data || []).slice(0, 10).map((m, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://routscinema.example.com/title/movie/${m.id}`,
            name: m.title || m.name,
          })),
        }}
      />
      {trending.status === 'loading' && <HeroState role="status">Loading featured title…</HeroState>}
      {trending.status === 'error' && (
        <HeroState role="alert">
          {trending.error} <button onClick={trending.retry} style={{ marginLeft: 12 }}>Retry</button>
        </HeroState>
      )}
      {(trending.status === 'success' || heroItem) && heroItem && (
        <Hero item={heroItem} onToggleList={onToggleList} isSaved={isSaved?.(heroItem.id)} />
      )}
      <Rails>
        {RAILS.map((rail, i) => (
          <LazyRail key={rail.key} eager={i < EAGER_RAILS}>
            <Row
              title={rail.title}
              endpoint={rail.endpoint}
              params={rail.params}
              onSelect={setSelected}
              onToggleList={onToggleList}
              isSaved={isSaved}
            />
          </LazyRail>
        ))}
      </Rails>
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

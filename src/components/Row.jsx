import { memo, useRef } from 'react';
import styled from 'styled-components';
import { useTmdbList } from '../hooks/useTmdb';
import TitleCard from './TitleCard';
import { tokens, media } from '../styles/tokens';

const Wrap = styled.section`
  position: relative;
  margin: 1.5rem 0;
  ${media.md} {
    margin: 2rem 0;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0 1rem;
  max-width: 1600px;
  margin: 0 auto 0.75rem;
  ${media.md} {
    padding: 0 2rem;
  }
`;

const Title = styled.h2`
  font-family: ${tokens.font.display};
  font-size: 1.6rem;
  letter-spacing: 1.5px;
  margin: 0;
  ${media.md} {
    font-size: 1.9rem;
  }
`;

const Scroller = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0.5rem 1rem 1rem;
  max-width: 1600px;
  margin: 0 auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  > * {
    scroll-snap-align: start;
  }
  ${media.md} {
    padding: 0.5rem 2rem 1rem;
    gap: 1rem;
  }
  &:focus-visible {
    outline-offset: -3px;
  }
`;

const Arrow = styled.button`
  display: none;
  ${media.lg} {
    display: inline-flex;
  }
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 44px;
  height: 72px;
  border-radius: ${tokens.radius.md};
  border: 1px solid ${tokens.color.border};
  background: rgba(11, 10, 24, 0.8);
  color: ${tokens.color.text};
  font-size: 1.4rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  &:hover {
    background: rgba(28, 26, 46, 0.95);
  }
  &.left {
    left: 0.5rem;
  }
  &.right {
    right: 0.5rem;
  }
`;

const State = styled.div`
  padding: 1rem 2rem;
  max-width: 1600px;
  margin: 0 auto;
  color: ${tokens.color.muted};
`;

const Retry = styled.button`
  margin-left: 0.75rem;
  min-height: 44px;
  padding: 0.5rem 1.2rem;
  border-radius: ${tokens.radius.md};
  border: 1px solid ${tokens.color.border};
  background: ${tokens.color.surface};
  color: ${tokens.color.text};
  cursor: pointer;
  font-weight: 600;
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.5rem 2rem 1rem;
  max-width: 1600px;
  margin: 0 auto;
  overflow: hidden;
`;

const SkeletonCard = styled.div`
  flex: 0 0 auto;
  width: 180px;
  aspect-ratio: 2 / 3;
  border-radius: ${tokens.radius.lg};
  background: linear-gradient(100deg, #1c1a2e 40%, #252238 50%, #1c1a2e 60%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  @keyframes shimmer {
    to {
      background-position: -200% 0;
    }
  }
  ${media.reducedMotion} {
    animation: none;
  }
`;

function Row({ title, endpoint, params, onSelect, onToggleList, isSaved }) {
  const { data, status, error, retry } = useTmdbList(endpoint, params);
  const scrollerRef = useRef(null);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollBy(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollBy(-1);
    }
  };

  return (
    <Wrap role="region" aria-label={`${title} carousel`} aria-busy={status === 'loading'}>
      <Head>
        <Title>{title}</Title>
      </Head>

      {status === 'loading' && (
        <SkeletonRow role="status" aria-label={`Loading ${title}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} aria-hidden="true" />
          ))}
        </SkeletonRow>
      )}

      {status === 'error' && (
        <State role="alert">
          {error || `Couldn't load ${title}.`}
          <Retry onClick={retry}>Retry</Retry>
        </State>
      )}

      {status === 'success' && data.length === 0 && (
        <State>No titles found in {title} right now.</State>
      )}

      {status === 'success' && data.length > 0 && (
        <>
          <Arrow className="left" onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} left`}>
            ‹
          </Arrow>
          <Scroller ref={scrollerRef} tabIndex={0} onKeyDown={onKeyDown} aria-label={`${title} titles — use arrow keys to scroll`}>
            {data.map((item) => (
              <TitleCard
                key={item.id}
                item={item}
                onSelect={onSelect}
                onToggleList={onToggleList}
                isSaved={isSaved?.(item.id)}
              />
            ))}
          </Scroller>
          <Arrow className="right" onClick={() => scrollBy(1)} aria-label={`Scroll ${title} right`}>
            ›
          </Arrow>
        </>
      )}
    </Wrap>
  );
}

export default memo(Row);

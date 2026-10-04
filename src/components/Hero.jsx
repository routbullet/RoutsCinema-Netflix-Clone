import { memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { backdropSrc, titleOf, yearOf, mediaTypeOf } from '../lib/image';
import { tokens, media } from '../styles/tokens';

const Section = styled.section`
  position: relative;
  min-height: min(92svh, 760px);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  isolation: isolate;
`;

const Backdrop = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  z-index: -2;
`;

const Gradient = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgba(11, 10, 24, 0.55) 0%, rgba(11, 10, 24, 0.15) 35%, rgba(11, 10, 24, 0.92) 100%),
    linear-gradient(90deg, rgba(11, 10, 24, 0.85) 0%, rgba(11, 10, 24, 0.25) 55%, transparent 100%);
`;

const Content = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 6rem 1rem 3rem;
  ${media.md} {
    padding: 8rem 2rem 4rem;
  }
`;

const Eyebrow = styled.p`
  color: ${tokens.color.text};
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin: 0 0 0.5rem;
  opacity: 0.9;
`;

const Title = styled.h1`
  font-family: ${tokens.font.display};
  font-size: clamp(2.6rem, 6vw, 5rem);
  letter-spacing: 2px;
  line-height: 0.95;
  margin: 0 0 0.75rem;
  max-width: 16ch;
  text-wrap: balance;
`;

const Meta = styled.p`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.9rem;
  align-items: center;
  margin: 0 0 1rem;
  color: ${tokens.color.text};
  font-size: 0.95rem;
  font-weight: 600;
`;

const Rating = styled.span`
  color: #ffd166;
`;

const Overview = styled.p`
  max-width: 58ch;
  color: rgba(245, 245, 247, 0.88);
  line-height: 1.6;
  margin: 0 0 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Btn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.7rem 1.6rem;
  border-radius: ${tokens.radius.md};
  font-weight: 700;
  text-decoration: none;
  font-size: 1rem;
  &.primary {
    background: ${tokens.color.text};
    color: #0b0a18;
  }
  &.ghost {
    background: rgba(255, 255, 255, 0.16);
    color: ${tokens.color.text};
    backdrop-filter: blur(6px);
  }
  &:hover {
    filter: brightness(1.08);
  }
`;

const ListBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  min-width: 44px;
  padding: 0.7rem 1.1rem;
  border-radius: ${tokens.radius.md};
  border: 1px solid ${tokens.color.border};
  background: transparent;
  color: ${tokens.color.text};
  font-weight: 600;
  cursor: pointer;
  &[aria-pressed='true'] {
    background: rgba(229, 9, 20, 0.2);
    border-color: ${tokens.color.accent};
  }
`;

function Hero({ item, onToggleList, isSaved }) {
  if (!item) return null;
  const title = titleOf(item);
  const year = yearOf(item);
  const type = mediaTypeOf(item);
  const backdrop = backdropSrc(item.backdrop_path, 'w1280') || backdropSrc(item.poster_path, 'w780');
  const rating = typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : '—';

  return (
    <Section aria-label={`Featured: ${title}`}>
      {backdrop && (
        <Backdrop
          src={backdrop}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
        />
      )}
      <Gradient aria-hidden="true" />
      <Content>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Eyebrow>#1 Trending Now</Eyebrow>
          <Title>{title}</Title>
          <Meta>
            <span>{year}</span>
            <span aria-hidden="true">•</span>
            <Rating aria-label={`Rated ${rating} out of 10`}>★ {rating}/10</Rating>
            <span aria-hidden="true">•</span>
            <span>{type === 'tv' ? 'TV Series' : 'Movie'}</span>
            <span aria-hidden="true">•</span>
            <span>{item.original_language?.toUpperCase()}</span>
          </Meta>
          <Overview>{item.overview}</Overview>
          <Actions>
            <Btn className="primary" to={`/title/${type}/${item.id}`} aria-label={`Play ${title}`}>
              ▶ Play
            </Btn>
            <Btn className="ghost" to={`/title/${type}/${item.id}`}>
              More Info
            </Btn>
            <ListBtn
              onClick={() => onToggleList?.(item)}
              aria-pressed={isSaved ? 'true' : 'false'}
              aria-label={isSaved ? `Remove ${title} from My List` : `Add ${title} to My List`}
            >
              {isSaved ? '✓ In My List' : '+ My List'}
            </ListBtn>
          </Actions>
        </motion.div>
      </Content>
    </Section>
  );
}

export default memo(Hero);

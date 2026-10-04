import { memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { posterSrc, posterSrcSet, titleOf, yearOf, mediaTypeOf } from '../lib/image';
import { tokens, media } from '../styles/tokens';

const Card = styled.article`
  position: relative;
  flex: 0 0 auto;
  width: clamp(120px, 34vw, 180px);
  ${media.md} {
    width: 180px;
  }
  border-radius: ${tokens.radius.lg};
  overflow: hidden;
  background: ${tokens.color.surface};
  box-shadow: ${tokens.shadow.card};
  transition: transform 0.25s ease;
  ${media.hover} {
    &:hover, &:focus-within {
      transform: scale(1.04) translateY(-4px);
    }
  }
  ${media.reducedMotion} {
    transition: none;
    &:hover, &:focus-within {
      transform: none;
    }
  }
`;

const PosterLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const ImgBox = styled.div`
  aspect-ratio: 2 / 3;
  background: linear-gradient(135deg, #252238, #14121f);
  overflow: hidden;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: ${tokens.color.surface};
`;

const Body = styled.div`
  padding: 0.6rem 0.7rem 0.75rem;
`;

const Title = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.2em;
`;

const Sub = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: ${tokens.color.muted};
`;

const SaveBtn = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid ${tokens.color.border};
  background: rgba(11, 10, 24, 0.75);
  color: ${tokens.color.text};
  font-size: 1.2rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  &[aria-pressed='true'] {
    background: ${tokens.color.accent};
    border-color: ${tokens.color.accent};
  }
`;

function TitleCard({ item, onSelect, onToggleList, isSaved }) {
  const title = titleOf(item);
  const year = yearOf(item);
  const type = mediaTypeOf(item);
  const src = posterSrc(item.poster_path);
  const rating = typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : '—';

  const inner = (
    <>
      <ImgBox>
        {src ? (
          <Img
            src={src}
            srcSet={posterSrcSet(item.poster_path)}
            sizes="(max-width: 768px) 34vw, 180px"
            alt={`${title} (${year}) poster`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div role="img" aria-label={`${title} poster unavailable`} style={{ padding: '1rem', color: '#A7A7B8' }}>
            {title}
          </div>
        )}
      </ImgBox>
      <Body>
        <Title>{title}</Title>
        <Sub>
          {year} • ★ {rating}/10
        </Sub>
      </Body>
    </>
  );

  return (
    <Card>
      {onSelect ? (
        <PosterLink
          to={`/title/${type}/${item.id}`}
          onClick={(e) => {
            if (onSelect) {
              e.preventDefault();
              onSelect(item);
            }
          }}
          aria-label={`${title} (${year}), rated ${rating} out of 10 — view details`}
        >
          {inner}
        </PosterLink>
      ) : (
        <PosterLink to={`/title/${type}/${item.id}`} aria-label={`${title} (${year}), rated ${rating} out of 10 — view details`}>
          {inner}
        </PosterLink>
      )}
      {onToggleList && (
        <SaveBtn
          onClick={() => onToggleList(item)}
          aria-pressed={isSaved ? 'true' : 'false'}
          aria-label={isSaved ? `Remove ${title} from My List` : `Add ${title} to My List`}
          title={isSaved ? 'Remove from My List' : 'Add to My List'}
        >
          {isSaved ? '✓' : '+'}
        </SaveBtn>
      )}
    </Card>
  );
}

export default memo(TitleCard);

import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTmdbDetails } from '../hooks/useTmdb';
import { backdropSrc, titleOf, yearOf } from '../lib/image';
import { tokens } from '../styles/tokens';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Dialog = styled.div`
  background: ${tokens.color.bgElevated};
  border: 1px solid ${tokens.color.border};
  border-radius: ${tokens.radius.xl};
  max-width: 720px;
  width: 100%;
  max-height: 90svh;
  overflow: auto;
  box-shadow: ${tokens.shadow.hero};
`;

const HeroImg = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  background: ${tokens.color.surface};
  border-radius: ${tokens.radius.xl} ${tokens.radius.xl} 0 0;
`;

const Body = styled.div`
  padding: 1.25rem 1.25rem 1.5rem;
`;

const Title = styled.h2`
  font-family: ${tokens.font.display};
  letter-spacing: 1.5px;
  font-size: 2rem;
  margin: 0 0 0.5rem;
`;

const Meta = styled.p`
  color: ${tokens.color.muted};
  margin: 0 0 1rem;
  font-size: 0.95rem;
`;

const Overview = styled.p`
  line-height: 1.65;
  color: rgba(245, 245, 247, 0.9);
  margin: 0 0 1rem;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Btn = styled.button`
  min-height: 44px;
  padding: 0.65rem 1.4rem;
  border-radius: ${tokens.radius.md};
  font-weight: 700;
  cursor: pointer;
  border: 1px solid ${tokens.color.border};
  background: ${tokens.color.surface};
  color: ${tokens.color.text};
  &.primary {
    background: ${tokens.color.text};
    color: #0b0a18;
    border-color: transparent;
  }
  &.danger {
    background: transparent;
  }
`;

const Trailer = styled.div`
  aspect-ratio: 16 / 9;
  margin: 0 0 1rem;
  border-radius: ${tokens.radius.md};
  overflow: hidden;
  background: #000;
  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export default function DetailsModal({ item, onClose, onToggleList, isSaved }) {
  const type = item?.media_type || (item?.first_air_date ? 'tv' : 'movie');
  const { data, status, error } = useTmdbDetails(type, item?.id);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    prevFocus.current = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll('button, a[href], iframe');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus.current?.focus?.();
    };
  }, [onClose]);

  if (!item) return null;
  const title = titleOf(data || item);
  const year = yearOf(data || item);
  const backdrop = backdropSrc((data || item).backdrop_path, 'w780');
  const trailer = data?.videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const cast = data?.credits?.cast?.slice(0, 5) || [];
  const rating = (data || item).vote_average;

  return (
    <Overlay onClick={onClose} aria-hidden={false}>
      <Dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        onClick={(e) => e.stopPropagation()}
      >
        {backdrop && <HeroImg src={backdrop} alt="" aria-hidden="true" loading="lazy" decoding="async" />}
        <Body>
          <Title id="details-title">
            {title} ({year})
          </Title>
          <Meta>
            {year} • ★ {typeof rating === 'number' ? rating.toFixed(1) : '—'}/10
            {data?.runtime ? ` • ${data.runtime}m` : ''}
            {data?.genres?.length ? ` • ${data.genres.map((g) => g.name).join(', ')}` : ''}
          </Meta>
          {status === 'loading' && <p role="status">Loading details…</p>}
          {status === 'error' && <p role="alert">{error}</p>}
          {(data || item).overview && <Overview>{(data || item).overview}</Overview>}
          {trailer && (
            <Trailer>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
                title={`${title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </Trailer>
          )}
          {cast.length > 0 && (
            <Meta as="p">Starring: {cast.map((c) => c.name).join(', ')}</Meta>
          )}
          <Row>
            <Btn ref={closeRef} className="primary" onClick={onClose}>
              Close
            </Btn>
            {onToggleList && (
              <Btn
                onClick={() => onToggleList(item)}
                aria-pressed={isSaved ? 'true' : 'false'}
              >
                {isSaved ? '✓ In My List' : '+ My List'}
              </Btn>
            )}
          </Row>
        </Body>
      </Dialog>
    </Overlay>
  );
}

import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTmdbDetails } from '../hooks/useTmdb';
import { backdropSrc, titleOf, yearOf } from '../lib/image';
import { Seo } from '../components/Seo';
import { tokens, media } from '../styles/tokens';

const Main = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 6rem 1rem 3rem;
  ${media.md} {
    padding: 7rem 2rem 4rem;
  }
`;

const Backdrop = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: ${tokens.radius.xl};
  background: ${tokens.color.surface};
  display: block;
`;

const Trailer = styled.div`
  aspect-ratio: 16 / 9;
  margin-top: 1.5rem;
  border-radius: ${tokens.radius.lg};
  overflow: hidden;
  background: #000;
  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export default function DetailsPage({ onToggleList, isSaved }) {
  const { type = 'movie', id } = useParams();
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const { data, status, error } = useTmdbDetails(mediaType, id);

  const title = data ? titleOf(data) : 'Loading…';
  const year = data ? yearOf(data) : '';
  const image = data?.backdrop_path ? backdropSrc(data.backdrop_path, 'w780') : undefined;
  const trailer = data?.videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  return (
    <Main id="main-content">
      <Seo
        title={data ? `${title} (${year}) — Trailer, Cast & Rating | RoutsCinema` : 'Title details | RoutsCinema'}
        description={
          data?.overview
            ? data.overview.slice(0, 155)
            : 'View trailer, cast, rating and overview for this trending movie or TV show on RoutsCinema.'
        }
        path={`/title/${mediaType}/${id}`}
        image={image}
        jsonLd={
          data
            ? {
                '@context': 'https://schema.org',
                '@type': mediaType === 'tv' ? 'TVSeries' : 'Movie',
                name: title,
                datePublished: data.release_date || data.first_air_date,
                aggregateRating: data.vote_average
                  ? { '@type': 'AggregateRating', ratingValue: data.vote_average, bestRating: 10 }
                  : undefined,
                image,
                description: data.overview,
                trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
              }
            : undefined
        }
      />
      <p>
        <Link to="/">← Back to browse</Link>
      </p>
      {status === 'loading' && <p role="status">Loading details…</p>}
      {status === 'error' && <p role="alert">{error}</p>}
      {data && (
        <article>
          {image && <Backdrop src={image} alt={`${title} backdrop`} loading="eager" decoding="async" fetchPriority="high" />}
          <h1 style={{ fontFamily: tokens.font.display, letterSpacing: 2, fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
            {title} ({year})
          </h1>
          <p style={{ color: tokens.color.muted }}>
            ★ {data.vote_average?.toFixed(1)}/10
            {data.runtime ? ` • ${data.runtime}m` : ''}
            {data.genres?.length ? ` • ${data.genres.map((g) => g.name).join(', ')}` : ''}
          </p>
          <p style={{ lineHeight: 1.7 }}>{data.overview}</p>
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
          {onToggleList && (
            <button
              onClick={() => onToggleList({ id: data.id, media_type: mediaType, ...data, title })}
              aria-pressed={isSaved?.(data.id) ? 'true' : 'false'}
              style={{
                minHeight: 44,
                padding: '0.7rem 1.4rem',
                borderRadius: 8,
                marginTop: '1rem',
                cursor: 'pointer',
              }}
            >
              {isSaved?.(data.id) ? '✓ In My List' : '+ My List'}
            </button>
          )}
        </article>
      )}
    </Main>
  );
}

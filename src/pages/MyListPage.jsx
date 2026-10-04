import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  ${media.md} {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
`;

export default function MyListPage({ list, onToggleList, isSaved }) {
  const [selected, setSelected] = useState(null);
  return (
    <Main id="main-content">
      <Seo
        title="My List — Saved Movies & Shows | RoutsCinema"
        description="Your saved movies and TV shows on RoutsCinema. Add titles from any rail to build your personal watchlist."
        path="/mylist"
      />
      <h1 style={{ fontFamily: tokens.font.display, letterSpacing: 2 }}>My List</h1>
      {(!list || list.length === 0) && (
        <p>
          Nothing saved yet. Browse <Link to="/">Trending Now</Link> and press + My List.
        </p>
      )}
      {list?.length > 0 && (
        <Grid>
          {list.map((entry) => (
            <TitleCard
              key={entry.id}
              item={{
                id: entry.id,
                media_type: entry.media_type || 'movie',
                title: entry.title,
                name: entry.title,
                poster_path: entry.poster_path,
                backdrop_path: entry.backdrop_path,
                vote_average: entry.vote_average,
                release_date: entry.release_date,
                first_air_date: entry.first_air_date,
                overview: entry.overview,
              }}
              onSelect={setSelected}
              onToggleList={onToggleList}
              isSaved={isSaved?.(entry.id)}
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

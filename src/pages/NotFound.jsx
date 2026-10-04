import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../components/Seo';

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 8rem 1rem 4rem;
  text-align: center;
`;

export default function NotFound() {
  return (
    <Main id="main-content">
      <Seo
        title="Page not found | RoutsCinema"
        description="The page you requested could not be found. Browse trending movies and TV shows on RoutsCinema instead."
        path="/404"
      />
      <h1>404 — Lost in the catalog?</h1>
      <p>
        That page doesn’t exist. <Link to="/">Back to Home</Link>
      </p>
    </Main>
  );
}

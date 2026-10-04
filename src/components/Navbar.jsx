import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { tokens, media } from '../styles/tokens';

const Header = styled.header`
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  background: transparent;
  &.scrolled {
    background: rgba(11, 10, 24, 0.92);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
  }
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing.md};
  padding: 0.9rem 1rem;
  max-width: 1600px;
  margin: 0 auto;
  ${media.md} {
    padding: 1rem 2rem;
  }
`;

const Logo = styled(Link)`
  font-family: ${tokens.font.display};
  font-size: 1.8rem;
  letter-spacing: 2px;
  color: ${tokens.color.accent};
  text-decoration: none;
  line-height: 1;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
`;

const Nav = styled.nav`
  display: none;
  gap: 0.25rem;
  ${media.md} {
    display: flex;
  }
`;

const NavItem = styled(NavLink)`
  color: ${tokens.color.muted};
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.6rem 0.85rem;
  border-radius: ${tokens.radius.md};
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  &:hover {
    color: ${tokens.color.text};
    background: rgba(255, 255, 255, 0.06);
  }
  &.active {
    color: ${tokens.color.text};
  }
`;

const SearchWrap = styled.form`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid ${tokens.color.border};
  color: ${tokens.color.text};
  border-radius: ${tokens.radius.pill};
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  width: 130px;
  min-height: 44px;
  &::placeholder {
    color: ${tokens.color.muted};
  }
  &:focus {
    width: 200px;
    background: rgba(255, 255, 255, 0.12);
    outline: none;
    border-color: ${tokens.color.focus};
  }
  ${media.md} {
    width: 180px;
    &:focus {
      width: 260px;
    }
  }
`;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };

  return (
    <Header className={scrolled ? 'scrolled' : ''}>
      <Bar>
        <Logo to="/" aria-label="RoutsCinema home">
          ROUTS<span style={{ color: '#F5F5F7' }}>CINEMA</span>
        </Logo>
        <Nav aria-label="Primary">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/search">Search</NavItem>
          <NavItem to="/mylist">My List</NavItem>
        </Nav>
        <SearchWrap role="search" onSubmit={submit}>
          <label htmlFor="site-search" className="visually-hidden">
            Search movies and TV shows
          </label>
          <SearchInput
            id="site-search"
            type="search"
            placeholder="Search titles…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </SearchWrap>
      </Bar>
    </Header>
  );
}

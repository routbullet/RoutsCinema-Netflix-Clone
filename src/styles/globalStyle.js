import { createGlobalStyle } from 'styled-components';
import { tokens } from './tokens';

export const GlobalStyles = createGlobalStyle`
  *, *::after, *::before {
    box-sizing: border-box;
  }
  html {
    scroll-behavior: smooth;
  }
  html, body {
    margin: 0;
    padding: 0;
  }
  body {
    background: ${tokens.color.bg};
    color: ${tokens.color.text};
    font-family: ${tokens.font.body};
    min-height: 100vh;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  img {
    max-width: 100%;
  }
  a {
    color: inherit;
  }
  :focus-visible {
    outline: 3px solid ${tokens.color.focus};
    outline-offset: 2px;
    border-radius: 4px;
  }
  .skip-link {
    position: absolute;
    left: 1rem;
    top: -100px;
    z-index: 2000;
    background: ${tokens.color.text};
    color: #000;
    padding: 0.75rem 1.25rem;
    border-radius: ${tokens.radius.md};
    font-weight: 700;
    text-decoration: none;
    transition: top 0.2s ease;
  }
  .skip-link:focus {
    top: 1rem;
  }
  .visually-hidden {
    position: absolute !important;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

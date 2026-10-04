import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GlobalStyles } from './styles/globalStyle';
import { useMyList } from './hooks/useMyList';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollTop from './components/ScrollTop';
import LiveToast from './components/LiveToast';
import Home from './pages/Home';

const SearchPage = lazy(() => import('./pages/SearchPage'));
const MyListPage = lazy(() => import('./pages/MyListPage'));
const DetailsPage = lazy(() => import('./pages/DetailsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function Fallback() {
  return (
    <div role="status" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      Loading…
    </div>
  );
}

export default function App() {
  const { list, toggle, isSaved, notice, clearNotice } = useMyList();

  return (
    <HelmetProvider>
      <BrowserRouter>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <GlobalStyles />
        <Navbar />
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<Home onToggleList={toggle} isSaved={isSaved} />} />
            <Route
              path="/search"
              element={<SearchPage onToggleList={toggle} isSaved={isSaved} />}
            />
            <Route
              path="/mylist"
              element={<MyListPage list={list} onToggleList={toggle} isSaved={isSaved} />}
            />
            <Route
              path="/title/:type/:id"
              element={<DetailsPage onToggleList={toggle} isSaved={isSaved} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
        <ScrollTop />
        <LiveToast notice={notice} onDone={clearNotice} />
      </BrowserRouter>
    </HelmetProvider>
  );
}

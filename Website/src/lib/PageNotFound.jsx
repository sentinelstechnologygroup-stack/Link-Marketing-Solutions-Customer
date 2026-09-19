import { Link, useLocation } from 'react-router-dom';
import { Container } from '@/components/site/ui';

export default function PageNotFound() {
  const location = useLocation();

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-[#071b1e] pt-28 text-white">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <Container className="relative py-24 text-center">
        <p className="editorial-kicker">Error 404</p>
        <h1 className="mt-5 text-5xl md:text-7xl">This page is not part of the conversation.</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/65">
          We could not find <span className="text-white">{location.pathname}</span>. Return home or review how Link turns leads into qualified opportunities.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-md bg-[#d4af37] px-7 py-3.5 text-sm font-semibold text-[#04181a]">Return home</Link>
          <Link to="/how-it-works" className="rounded-md border border-white/25 px-7 py-3.5 text-sm font-semibold text-white">See how it works</Link>
        </div>
      </Container>
    </section>
  );
}

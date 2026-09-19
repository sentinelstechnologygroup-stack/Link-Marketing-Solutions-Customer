import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SEO from './SEO';
import MarketingRuntime from './MarketingRuntime';
import ConsentBanner from './ConsentBanner';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f1ea]">
      <SEO />
      <MarketingRuntime />
      <Header />
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>
      <Footer />
      <ConsentBanner />
    </div>
  );
}

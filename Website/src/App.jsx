import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/site/Layout';
import Home from '@/pages/Home';
const Services = lazy(() => import('@/pages/Services'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const Industries = lazy(() => import('@/pages/Industries'));
const IndustryDetail = lazy(() => import('@/pages/IndustryDetail'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const About = lazy(() => import('@/pages/About'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const GetStarted = lazy(() => import('@/pages/GetStarted'));
const Legal = lazy(() => import('@/pages/Legal'));
const PageNotFound = lazy(() => import('./lib/PageNotFound'));

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-[#071b1e]" aria-label="Loading page" />}>
        <Routes>
          <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/industries/:industry" element={<IndustryDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/privacy" element={<Legal doc="privacy" />} />
          <Route path="/terms" element={<Legal doc="terms" />} />
          <Route path="/communications-policy" element={<Legal doc="communications" />} />
          <Route path="/accessibility" element={<Legal doc="accessibility" />} />
          <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;

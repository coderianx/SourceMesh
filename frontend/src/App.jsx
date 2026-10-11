import { useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import FinalCta from './components/Closing.jsx';
import Features from './components/Features.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import OpenSource from './components/OpenSource.jsx';
import Footer from './components/Footer.jsx';
import { t } from './lib/i18n.js';

function App() {
  useEffect(() => {
    document.title = t('SourceMesh — The Open Social Network for Developers');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        t(
          'SourceMesh — an open source social network for developers. Create your profile, share a meshflow, join the community.',
        ),
      );
  }, []);

  return (
    <>
      <a href="#icerik" className="skip-link">
        İçeriğe atla
      </a>
      <Navbar />
      <main id="icerik">
        <Hero />
        <Features />
        <HowItWorks />
        <OpenSource />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

export default App;

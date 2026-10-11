import './App.css';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import FinalCta from './components/Closing.jsx';
import Features from './components/Features.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Showcase from './components/Showcase.jsx';
import OpenSource from './components/OpenSource.jsx';
import Voices from './components/Voices.jsx';
import Footer from './components/Footer.jsx';

function App() {
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
        <Showcase />
        <OpenSource />
        <Voices />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

export default App;

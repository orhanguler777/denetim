import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { loadDemoData } from './db/demoData';

import Dashboard from './pages/Dashboard';
import Observations from './pages/Observations';
import Problems from './pages/Problems';
import Opportunities from './pages/Opportunities';
import NewObservation from './pages/NewObservation';
import EndOfDay from './pages/EndOfDay';

function App() {
  useEffect(() => {
    // Demo veriyi yükle
    loadDemoData().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/observations" element={<Observations />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/end-of-day" element={<EndOfDay />} />
          <Route path="/new/*" element={<NewObservation />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;

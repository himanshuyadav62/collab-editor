import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DocumentPage from './pages/DocumentPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doc/:docId" element={<DocumentPage />} />
      </Routes>
    </div>
  );
}

export default App;

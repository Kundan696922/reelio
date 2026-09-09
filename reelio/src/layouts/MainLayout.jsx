import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SwipeBubble from '../components/SwipeBubble';
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Outlet />
      </main>
      <SwipeBubble />
      <Footer />
    </div>
  );
}

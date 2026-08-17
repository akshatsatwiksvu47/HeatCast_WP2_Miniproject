import Navbar from "../Navbar/Navbar";

function MainLayout({ children }) {
  return (
    <div className="app">
      <Navbar />

      <main className="app-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
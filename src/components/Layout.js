import React, { useContext } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useUser } from "../pages/UserContext"; // Import the UserContext
import "../App.css";

const Layout = ({ children }) => {
  const { user, loading, handleLogOut } = useUser(); // Access user context

  // Show a loading message while the user data is being fetched
  if (loading) return <p>Loading...</p>;

  return (
    <div className="App">
      {/* Pass user and handleLogOut to Navbar */}
      <Navbar user={user} handleLogOut={handleLogOut} />
      <main
        className="main-content"
        style={{
          backgroundImage: "url('/img/wallpaper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

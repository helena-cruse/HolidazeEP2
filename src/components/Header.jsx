import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { load, remove } from "../utils/storage";
import logo from "../../public/assets/media/HolidazeLogo.png";

export default function Header() {
  const navigate = useNavigate();
  const user = load("user");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    remove("user");
    remove("apiKey");
    setMenuOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo-link" onClick={closeMenu}>
          <img src={logo} alt="Holidaze logo" className="site-logo-image" />
          <span className="site-logo-text">Holidaze</span>
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${menuOpen ? "site-nav-open" : ""}`}>
          <Link to="/" className="site-nav-link" onClick={closeMenu}>
            Explore
          </Link>

          {user?.venueManager && (
            <Link
              to="/create-venue"
              className="site-nav-link"
              onClick={closeMenu}
            >
              Create Venue
            </Link>
          )}

          {user ? (
            <>
              <Link
                to={`/profile/${user.name}`}
                className="site-nav-primary"
                onClick={closeMenu}
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="site-nav-button"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="site-nav-link" onClick={closeMenu}>
                Log in
              </Link>

              <Link
                to="/register"
                className="site-nav-primary"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

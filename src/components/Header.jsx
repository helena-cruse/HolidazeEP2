import { Link, useNavigate } from "react-router-dom";

import { load, remove } from "../utils/storage";
import logo from "../../public/assets/media/HolidazeLogo.png";

export default function Header() {
  const navigate = useNavigate();
  const user = load("user");

  function handleLogout() {
    remove("user");
    remove("apiKey");
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo-link">
          <img src={logo} alt="Holidaze logo" className="site-logo-image" />

          <span className="site-logo-text">Holidaze</span>
        </Link>

        <nav className="site-nav">
          <Link to="/" className="site-nav-link">
            Explore
          </Link>

          {user?.venueManager && (
            <Link to="/create-venue" className="site-nav-link">
              Create Venue
            </Link>
          )}

          {user ? (
            <>
              <Link to={`/profile/${user.name}`} className="site-nav-primary">
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
              <Link to="/login" className="site-nav-link">
                Log in
              </Link>

              <Link to="/register" className="site-nav-primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

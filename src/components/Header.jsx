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

  const navLink =
    "rounded-full px-5 py-2.5 text-sm font-medium tracking-wide text-[#6B5F58] transition hover:bg-[#F3E7DF] hover:text-[#B55332]";

  const primaryLink =
    "rounded-full bg-[#B55332] px-6 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_8px_22px_rgba(181,83,50,0.18)] transition hover:bg-[#944224]";

  return (
    <header className="border-b border-[#E4D8D0] bg-[#F8F2EE]/95 px-8 py-4 backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-4">
          <img
            src={logo}
            alt="Holidaze logo"
            className="h-16 w-auto object-contain"
          />

          <span className="font-serif text-3xl font-semibold tracking-wide text-[#B55332] md:text-4xl">
            Holidaze
          </span>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-[#E4D8D0] bg-white/70 px-2 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.04)] md:flex">
          <Link to="/" className={navLink}>
            Explore
          </Link>

          {user?.venueManager && (
            <Link to="/create-venue" className={navLink}>
              Create Venue
            </Link>
          )}

          {user ? (
            <>
              <Link to={`/profile/${user.name}`} className={primaryLink}>
                Profile
              </Link>

              <button type="button" onClick={handleLogout} className={navLink}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink}>
                Log in
              </Link>

              <Link to="/register" className={primaryLink}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

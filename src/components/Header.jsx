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
    <header className="flex items-center justify-between bg-[#F8F2EE] px-10 py-5 shadow-sm">
      <Link to="/" className="flex items-center gap-5">
        <img
          src={logo}
          alt="Holidaze logo"
          className="h-20 w-auto object-contain"
        />

        <span className="font-serif text-4xl font-semibold tracking-wide text-[#B55332]">
          Holidaze
        </span>
      </Link>

      <nav className="hidden items-center gap-4 md:flex">
        <Link
          to="/"
          className="rounded-full px-5 py-3 text-sm font-medium tracking-wide text-[#7C7069] transition hover:bg-[#F3E7DF] hover:text-[#B55332]"
        >
          Explore
        </Link>

        {user?.venueManager && (
          <Link
            to="/create-venue"
            className="rounded-full px-5 py-3 text-sm font-medium tracking-wide text-[#7C7069] transition hover:bg-[#F3E7DF] hover:text-[#B55332]"
          >
            Create Venue
          </Link>
        )}

        {user ? (
          <>
            <Link
              to={`/profile/${user.name}`}
              className="rounded-full bg-[#B55332] px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_10px_30px_rgba(181,83,50,0.25)] transition hover:scale-[1.02] hover:bg-[#944224]"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-full px-5 py-3 text-sm font-medium tracking-wide text-[#7C7069] transition hover:bg-[#F3E7DF] hover:text-[#B55332]"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-full px-5 py-3 text-sm font-medium tracking-wide text-[#7C7069] transition hover:bg-[#F3E7DF] hover:text-[#B55332]"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-[#B55332] px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_10px_30px_rgba(181,83,50,0.25)] transition hover:scale-[1.02] hover:bg-[#944224]"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

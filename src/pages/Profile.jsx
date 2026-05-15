import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProfileByName } from "../api/profiles";
import logo from "../../public/assets/media/HolidazeLogo.png";

export default function Profile() {
  const { name } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfileByName(name);
        setProfile(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [name]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5EFEB] p-10">Loading profile...</main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#F5EFEB] p-10">
        {error || "Profile not found"}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#E7DED7] text-[#2A211D]">
      <div className="mx-auto max-w-[1600px] bg-[#F5EFEB]">
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
          </nav>
        </header>

        <main className="px-8 py-14 md:px-20">
          <section className="overflow-hidden rounded-[36px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
            <div className="h-64 bg-[#B55332]">
              {profile.banner?.url && (
                <img
                  src={profile.banner.url}
                  alt={profile.banner.alt || `${profile.name} banner`}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="px-8 pb-10 md:px-12">
              <div className="-mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="flex items-end gap-6">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-[#F5EFEB]">
                    {profile.avatar?.url ? (
                      <img
                        src={profile.avatar.url}
                        alt={profile.avatar.alt || profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-serif text-5xl text-[#B55332]">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="pb-2">
                    <h1 className="font-serif text-5xl font-semibold">
                      {profile.name}
                    </h1>

                    <p className="mt-2 text-sm text-[#7C7069]">
                      {profile.email}
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-[#F5E6DF] px-6 py-3 text-sm font-medium text-[#B55332]">
                  {profile.venueManager ? "Venue Manager" : "Customer"}
                </span>
              </div>

              {profile.bio && (
                <p className="mt-8 max-w-3xl leading-relaxed text-[#6B5F58]">
                  {profile.bio}
                </p>
              )}
            </div>
          </section>

          <section className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <h2 className="font-serif text-3xl font-semibold">
                Upcoming bookings
              </h2>

              <p className="mt-4 text-sm text-[#7C7069]">
                Bookings will appear here when the user is logged in.
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <h2 className="font-serif text-3xl font-semibold">
                Managed venues
              </h2>

              <p className="mt-4 text-sm text-[#7C7069]">
                Venue manager listings will appear here.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

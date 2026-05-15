import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/Header.jsx";
import { createApiKey, loginUser } from "../api/auth";
import { save } from "../utils/storage";

import loginImage from "../../public/assets/media/login.png";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!formData.email.endsWith("@stud.noroff.no")) {
      setMessage("You must use a stud.noroff.no email address.");
      return;
    }

    try {
      setLoading(true);

      const user = await loginUser(formData);
      const apiKey = await createApiKey(user.accessToken);

      save("apiKey", apiKey);

      navigate(`/profile/${user.name}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E7DED7] text-[#2A211D]">
      <div className="mx-auto max-w-[1600px] bg-[#F5EFEB]">
        <Header />

        <main className="grid min-h-[780px] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative hidden overflow-hidden lg:block">
            <img
              src={loginImage}
              alt="Luxury coastal villa interior at sunset"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-[#2A211D]/35" />

            <div className="absolute bottom-20 left-16 max-w-lg text-white">
              <p className="text-sm uppercase tracking-[0.35em] text-white/80">
                Welcome back
              </p>

              <h1 className="mt-5 font-serif text-6xl font-semibold leading-tight">
                Discover the world's most beautiful places.
              </h1>

              <p className="mt-5 text-lg text-white/85">
                Sign in to manage your bookings, explore venues and plan your
                next stay.
              </p>
            </div>
          </section>

          <section className="flex items-center justify-center px-6 py-16 md:px-16">
            <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.07)] md:p-12">
              <p className="text-sm uppercase tracking-[0.3em] text-[#B55332]">
                Sign in
              </p>

              <h2 className="mt-3 font-serif text-5xl font-semibold">
                Welcome back
              </h2>

              <p className="mt-3 border-b border-[#E4D8D0] pb-6 text-sm text-[#7C7069]">
                Log in with your stud.noroff.no account to continue.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-medium text-[#6B5F58]">
                    Email address
                  </span>

                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@stud.noroff.no"
                    required
                    className="mt-2 w-full rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#6B5F58]">
                    Password
                  </span>

                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="mt-2 w-full rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
                  />
                </label>

                {message && (
                  <p className="rounded-2xl bg-[#F5E6DF] px-5 py-4 text-sm text-[#B55332]">
                    {message}
                  </p>
                )}

                <button
                  disabled={loading}
                  className="w-full rounded-full bg-[#B55332] px-8 py-5 text-sm font-semibold tracking-wide text-white shadow-[0_10px_30px_rgba(181,83,50,0.25)] transition hover:bg-[#944224] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>

                <p className="rounded-2xl bg-[#EEF3E8] px-5 py-4 text-center text-sm text-[#4F6B42]">
                  Requires a stud.noroff.no email address
                </p>

                <div className="flex items-center justify-center gap-3 border-t border-[#E4D8D0] pt-6 text-sm text-[#7C7069]">
                  <span>Don’t have an account?</span>

                  <Link
                    to="/register"
                    className="font-semibold text-[#B55332] hover:underline"
                  >
                    Create one
                  </Link>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

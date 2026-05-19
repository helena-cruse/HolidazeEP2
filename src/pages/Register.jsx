import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/Header.jsx";
import { createApiKey, loginUser, registerUser } from "../api/auth";
import { save } from "../utils/storage";

import registerImage from "../../public/assets/media/register.png";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "",
    venueManager: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();

    if (!cleanName) {
      setMessage("Please choose a username.");
      return;
    }

    if (!cleanEmail.endsWith("@stud.noroff.no")) {
      setMessage("You must use a stud.noroff.no email address.");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const userData = {
      name: cleanName,
      email: cleanEmail,
      password: formData.password,
      venueManager: formData.venueManager,
    };

    if (formData.avatarUrl.trim()) {
      userData.avatar = {
        url: formData.avatarUrl.trim(),
        alt: `${cleanName} profile image`,
      };
    }

    try {
      setLoading(true);

      await registerUser(userData);

      const loggedInUser = await loginUser({
        email: cleanEmail,
        password: formData.password,
      });

      const apiKey = await createApiKey(loggedInUser.accessToken);

      save("user", loggedInUser);
      save("apiKey", apiKey);

      navigate(`/profile/${loggedInUser.name}`);
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

        <main className="grid min-h-[780px] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden overflow-hidden lg:block">
            <img
              src={registerImage}
              alt="Luxury resort terrace at sunset"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-[#2A211D]/35" />

            <div className="absolute bottom-20 left-16 max-w-md text-white">
              <p className="text-sm uppercase tracking-[0.35em] text-white/80">
                Join Holidaze
              </p>

              <h1 className="mt-5 font-serif text-6xl font-semibold leading-tight">
                Your next adventure starts here.
              </h1>

              <p className="mt-5 text-lg text-white/85">
                Create your account and start discovering places worth
                remembering.
              </p>
            </div>
          </section>

          <section className="flex items-center justify-center px-6 py-16 md:px-16">
            <div className="w-full max-w-3xl rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.07)] md:p-12">
              <p className="text-sm uppercase tracking-[0.3em] text-[#B55332]">
                Create profile
              </p>

              <h2 className="mt-3 font-serif text-5xl font-semibold">
                Create an account
              </h2>

              <p className="mt-3 text-sm text-[#7C7069]">
                Use your stud.noroff.no email to register as a customer or venue
                manager.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-medium text-[#6B5F58]">
                    Username
                  </span>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="your_username"
                    required
                    className="mt-2 w-full rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
                  />
                </label>

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

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-[#6B5F58]">
                      Password
                    </span>

                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      required
                      className="mt-2 w-full rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-[#6B5F58]">
                      Confirm password
                    </span>

                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      required
                      className="mt-2 w-full rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-[#6B5F58]">
                    Profile picture URL optional
                  </span>

                  <input
                    name="avatarUrl"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-2 w-full rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#D8C8BF] bg-[#F8F2EE] p-5 transition hover:border-[#B55332]">
                  <span>
                    <span className="block font-serif text-xl font-semibold text-[#B55332]">
                      Register as a Venue Manager
                    </span>

                    <span className="mt-1 block text-sm text-[#7C7069]">
                      Create venues and manage bookings.
                    </span>
                  </span>

                  <input
                    name="venueManager"
                    type="checkbox"
                    checked={formData.venueManager}
                    onChange={handleChange}
                    className="h-5 w-5 accent-[#B55332]"
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
                  {loading ? "Creating account..." : "Create account"}
                </button>

                <p className="rounded-2xl bg-[#EEF3E8] px-5 py-4 text-center text-sm text-[#4F6B42]">
                  Free to join · No credit card required
                </p>

                <div className="flex items-center justify-center gap-3 border-t border-[#E4D8D0] pt-6 text-sm text-[#7C7069]">
                  <span>Already have an account?</span>

                  <Link
                    to="/login"
                    className="font-semibold text-[#B55332] hover:underline"
                  >
                    Log in
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

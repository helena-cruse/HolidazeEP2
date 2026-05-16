import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

import Header from "../components/Header.jsx";
import {
  getProfileByName,
  getProfileVenuesWithBookings,
  updateProfile,
} from "../api/profiles";
import { load } from "../utils/storage";

export default function Profile() {
  const { name } = useParams();
  const loggedInUser = load("user");

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: "",
    avatarUrl: "",
    avatarAlt: "",
    bannerUrl: "",
    bannerAlt: "",
    venueManager: false,
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isOwnProfile = loggedInUser?.name === name;

  const hostBookings = useMemo(() => {
    if (!profile?.venues?.length) return [];

    return profile.venues.flatMap((venue) =>
      (venue.bookings || []).map((booking) => ({
        ...booking,
        venueName: venue.name,
      }))
    );
  }, [profile]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfileByName(name);

        let venuesWithBookings = data.venues || [];

        if (data.venueManager) {
          venuesWithBookings = await getProfileVenuesWithBookings(name);
        }

        setProfile({
          ...data,
          venues: venuesWithBookings,
        });

        setFormData({
          bio: data.bio || "",
          avatarUrl: data.avatar?.url || "",
          avatarAlt: data.avatar?.alt || "",
          bannerUrl: data.banner?.url || "",
          bannerAlt: data.banner?.alt || "",
          venueManager: data.venueManager || false,
        });
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [name]);

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

    const profileData = {
      bio: formData.bio.trim(),
      venueManager: formData.venueManager,
    };

    if (formData.avatarUrl.trim()) {
      profileData.avatar = {
        url: formData.avatarUrl.trim(),
        alt: formData.avatarAlt.trim() || `${profile.name} avatar`,
      };
    }

    if (formData.bannerUrl.trim()) {
      profileData.banner = {
        url: formData.bannerUrl.trim(),
        alt: formData.bannerAlt.trim() || `${profile.name} banner`,
      };
    }

    try {
      setSaving(true);
      const updatedProfile = await updateProfile(name, profileData);

      setProfile((current) => ({
        ...current,
        ...updatedProfile,
      }));

      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EFEB]">
        <Header />
        <div className="flex items-center justify-center py-40">
          <p className="text-[#7C7069]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E7DED7] text-[#2A211D]">
      <div className="mx-auto max-w-[1600px] bg-[#F5EFEB]">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-12">
          <section className="overflow-hidden rounded-[36px] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
            <div className="relative h-[220px] overflow-hidden rounded-[28px] bg-[#DCC9BC] md:h-[260px]">
              {profile?.banner?.url ? (
                <img
                  src={profile.banner.url}
                  alt={profile.banner.alt || profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#EFE7E1] text-sm text-[#9B8B82]">
                  No banner image
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" />
            </div>

            <div className="px-4 pb-8 pt-8 md:px-8">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#F5EFEB] shadow-[0_12px_35px_rgba(0,0,0,0.14)]">
                    {profile?.avatar?.url ? (
                      <img
                        src={profile.avatar.url}
                        alt={profile.avatar.alt || profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-serif text-5xl text-[#B55332]">
                        {profile?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <h1 className="font-serif text-5xl font-semibold">
                      {profile?.name}
                    </h1>

                    <p className="mt-2 text-[#7C7069]">{profile?.email}</p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#EEF3E8] px-4 py-2 text-sm font-medium text-[#4F6B42]">
                      <Icon icon="ph:house-line-light" width="18" />
                      {profile?.venueManager ? "Venue Manager" : "Customer"}
                    </div>
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setEditing((current) => !current)}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-[#B55332] px-7 py-3 text-sm font-medium text-[#B55332] transition hover:bg-[#B55332] hover:text-white"
                  >
                    <Icon
                      icon={editing ? "ph:x-light" : "ph:pencil-simple-light"}
                      width="18"
                    />
                    {editing ? "Cancel edit" : "Edit profile"}
                  </button>
                )}
              </div>

              {message && (
                <p className="mt-8 flex items-center gap-3 rounded-2xl bg-[#F5E6DF] px-5 py-4 text-sm text-[#B55332]">
                  <Icon icon="ph:check-circle-light" width="20" />
                  {message}
                </p>
              )}

              {!editing && profile?.bio && (
                <p className="mt-10 max-w-3xl border-t border-[#E4D8D0] pt-8 text-lg leading-relaxed text-[#6B5F58]">
                  {profile.bio}
                </p>
              )}

              {editing && (
                <form
                  onSubmit={handleSubmit}
                  className="mt-10 rounded-[28px] border border-[#E4D8D0] bg-[#FCFAF8] p-8"
                >
                  <h2 className="font-serif text-3xl font-semibold">
                    Edit profile
                  </h2>

                  <div className="mt-6 grid gap-5">
                    <label>
                      <span className="text-sm font-medium text-[#6B5F58]">
                        Bio
                      </span>

                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        maxLength="160"
                        rows="4"
                        placeholder="Write a short profile bio..."
                        className="mt-2 w-full resize-none rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
                      />

                      <span className="mt-2 block text-xs text-[#9B8B82]">
                        {formData.bio.length}/160 characters
                      </span>
                    </label>

                    <div className="grid gap-5 md:grid-cols-2">
                      <Input
                        label="Avatar URL"
                        name="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/avatar.jpg"
                      />

                      <Input
                        label="Avatar alt text"
                        name="avatarAlt"
                        value={formData.avatarAlt}
                        onChange={handleChange}
                        placeholder="Profile image"
                      />

                      <Input
                        label="Banner URL"
                        name="bannerUrl"
                        value={formData.bannerUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/banner.jpg"
                      />

                      <Input
                        label="Banner alt text"
                        name="bannerAlt"
                        value={formData.bannerAlt}
                        onChange={handleChange}
                        placeholder="Profile banner"
                      />
                    </div>

                    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#D8C8BF] bg-white p-5">
                      <span>
                        <span className="block font-serif text-xl font-semibold text-[#B55332]">
                          Venue Manager
                        </span>

                        <span className="mt-1 block text-sm text-[#7C7069]">
                          Enable this to create and manage venues.
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
                  </div>

                  <button
                    disabled={saving}
                    className="mt-8 rounded-full bg-[#B55332] px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-[0_10px_30px_rgba(181,83,50,0.25)] transition hover:bg-[#944224] disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </form>
              )}

              <div className="mt-12 grid gap-8 border-t border-[#E4D8D0] pt-10 lg:grid-cols-3">
                <ProfileCard
                  title="Upcoming bookings"
                  label="Your stays"
                  icon="ph:calendar-blank-light"
                >
                  {profile?.bookings?.length > 0 ? (
                    profile.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-2xl border border-[#E4D8D0] bg-white p-5"
                      >
                        <p className="font-semibold">
                          {booking?.venue?.name || "Venue"}
                        </p>

                        <p className="mt-2 text-sm text-[#7C7069]">
                          {new Date(booking.dateFrom).toLocaleDateString()} →{" "}
                          {new Date(booking.dateTo).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No bookings yet."
                      text="When you book a stay, your upcoming bookings will appear here."
                      buttonText="Explore venues"
                      to="/"
                      variant="outline"
                    />
                  )}
                </ProfileCard>

                <ProfileCard
                  title="Venues"
                  label="Your listings"
                  icon="ph:house-line-light"
                >
                  {profile?.venues?.length > 0 ? (
                    profile.venues.map((venue) => (
                      <Link
                        key={venue.id}
                        to={`/venue/${venue.id}`}
                        className="block rounded-2xl border border-[#E4D8D0] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <p className="font-semibold">{venue.name}</p>

                        <p className="mt-1 text-sm text-[#7C7069]">
                          {venue.location?.city}, {venue.location?.country}
                        </p>

                        <p className="mt-2 text-sm text-[#B55332]">
                          {venue.price} NOK / night
                        </p>
                      </Link>
                    ))
                  ) : (
                    <EmptyState
                      title="No venues created yet."
                      text={
                        profile?.venueManager
                          ? "Create your first venue and start hosting on Holidaze."
                          : "Register as a venue manager to create listings."
                      }
                      buttonText={
                        profile?.venueManager ? "Create your first venue" : null
                      }
                      to="/create-venue"
                    />
                  )}
                </ProfileCard>

                {profile?.venueManager && (
                  <ProfileCard
                    title="Host bookings"
                    label="Venue reservations"
                    icon="ph:calendar-check-light"
                  >
                    {hostBookings.length > 0 ? (
                      hostBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-2xl border border-[#E4D8D0] bg-white p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold">
                                {booking.venueName}
                              </p>

                              <p className="mt-2 text-sm text-[#7C7069]">
                                Guest: {booking.customer?.name || "Customer"}
                              </p>

                              <p className="mt-2 text-sm text-[#7C7069]">
                                {new Date(
                                  booking.dateFrom
                                ).toLocaleDateString()}{" "}
                                →{" "}
                                {new Date(booking.dateTo).toLocaleDateString()}
                              </p>

                              <p className="mt-2 text-sm text-[#B55332]">
                                {booking.guests} guests
                              </p>
                            </div>

                            <div className="rounded-full bg-[#EEF3E8] px-4 py-2 text-xs font-medium text-[#4F6B42]">
                              Reserved
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No reservations yet."
                        text="Bookings made on your venues will appear here."
                      />
                    )}
                  </ProfileCard>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, placeholder }) {
  return (
    <label>
      <span className="text-sm font-medium text-[#6B5F58]">{label}</span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
      />
    </label>
  );
}

function ProfileCard({ title, label, icon, children }) {
  return (
    <div className="rounded-[28px] border border-[#E4D8D0] bg-[#FCFAF8] p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#B55332]">
            {title}
          </p>

          <h2 className="mt-3 font-serif text-3xl font-semibold">{label}</h2>
        </div>

        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5E6DF] text-[#B55332]">
          <Icon icon={icon} width="24" />
        </span>
      </div>

      <div className="mt-8 space-y-4">{children}</div>
    </div>
  );
}

function EmptyState({ title, text, buttonText, to, variant = "solid" }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#D8C8BF] bg-white p-8 text-center">
      <p className="font-serif text-2xl font-semibold">{title}</p>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#7C7069]">
        {text}
      </p>

      {buttonText && (
        <Link
          to={to}
          className={`mt-6 inline-flex rounded-full px-7 py-3 text-sm font-medium transition ${
            variant === "outline"
              ? "border border-[#B55332] text-[#B55332] hover:bg-[#B55332] hover:text-white"
              : "bg-[#B55332] text-white hover:bg-[#944224]"
          }`}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}

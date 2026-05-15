import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

import Header from "../components/Header.jsx";
import { getVenues } from "../api/venues";

import heroImage from "../../public/assets/media/hero.png";

const filters = [
  { label: "Wifi", icon: "ph:wifi-high-light", type: "meta", key: "wifi" },
  {
    label: "Parking",
    icon: "ph:car-profile-light",
    type: "meta",
    key: "parking",
  },
  {
    label: "Breakfast",
    icon: "ph:coffee-light",
    type: "meta",
    key: "breakfast",
  },
  {
    label: "Pets allowed",
    icon: "ph:paw-print-light",
    type: "meta",
    key: "pets",
  },
  { label: "Top rated", icon: "ph:star-light", type: "rating" },
];

function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function venueIsAvailable(venue, checkIn, checkOut) {
  if (!checkIn || !checkOut) return true;

  const selectedStart = new Date(checkIn);
  const selectedEnd = new Date(checkOut);

  if (selectedEnd <= selectedStart) return false;

  return !venue.bookings?.some((booking) => {
    const bookedStart = new Date(booking.dateFrom);
    const bookedEnd = new Date(booking.dateTo);

    return datesOverlap(selectedStart, selectedEnd, bookedStart, bookedEnd);
  });
}

export default function Home() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const searchText =
        `${venue.name} ${venue.description} ${venue.location?.city} ${venue.location?.country}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesGuests = guests
        ? Number(venue.maxGuests) >= Number(guests)
        : true;

      const matchesDates = venueIsAvailable(venue, checkIn, checkOut);

      const matchesFilters = activeFilters.every((activeFilter) => {
        const selectedFilter = filters.find(
          (filter) => filter.label === activeFilter
        );

        if (selectedFilter?.type === "meta") {
          return venue.meta?.[selectedFilter.key] === true;
        }

        if (selectedFilter?.type === "rating") {
          return Number(venue.rating) >= 4;
        }

        return true;
      });

      return matchesSearch && matchesGuests && matchesDates && matchesFilters;
    });
  }, [venues, search, checkIn, checkOut, guests, activeFilters]);

  const visibleVenues = filteredVenues.slice(0, visibleCount);
  const hasMoreVenues = visibleCount < filteredVenues.length;

  useEffect(() => {
    async function loadVenues() {
      try {
        const data = await getVenues();
        setVenues(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadVenues();
  }, []);

  useEffect(() => {
    setVisibleCount(8);
  }, [search, checkIn, checkOut, guests, activeFilters]);

  function handleSubmit(event) {
    event.preventDefault();
    document.getElementById("venues")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleLoadMore() {
    setVisibleCount((currentCount) => currentCount + 3);
  }

  function handleFilterClick(label) {
    setActiveFilters((currentFilters) =>
      currentFilters.includes(label)
        ? currentFilters.filter((filter) => filter !== label)
        : [...currentFilters, label]
    );
  }

  function clearSearch() {
    setSearch("");
    setCheckIn("");
    setCheckOut("");
    setGuests("");
    setActiveFilters([]);
  }

  return (
    <div className="min-h-screen bg-[#E7DED7] text-[#2A211D]">
      <div className="mx-auto max-w-[1600px] bg-[#F5EFEB]">
        <Header />

        <section
          className="relative flex h-[720px] items-center justify-center bg-cover bg-center px-6 text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/20" />

          <div className="relative z-10 max-w-5xl">
            <div className="mx-auto w-fit rounded-full bg-white/20 px-8 py-2 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.4em] text-white">
                Luxury stays worldwide
              </p>
            </div>

            <h1 className="mt-8 font-serif text-6xl font-semibold leading-tight text-white md:text-7xl">
              Find your perfect stay
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
              Discover handpicked destinations, boutique villas and
              unforgettable escapes.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-16 grid overflow-hidden rounded-[32px] bg-white shadow-2xl md:grid-cols-[1.4fr_1fr_1fr_0.8fr_160px]"
            >
              <input
                type="text"
                placeholder="Where are you going?"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="border-b border-[#E8DED7] px-7 py-6 text-sm outline-none md:border-b-0 md:border-r"
              />

              <input
                type="date"
                aria-label="Check in date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => setCheckIn(event.target.value)}
                className="border-b border-[#E8DED7] px-7 py-6 text-sm text-[#6B5F58] outline-none md:border-b-0 md:border-r"
              />

              <input
                type="date"
                aria-label="Check out date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split("T")[0]}
                onChange={(event) => setCheckOut(event.target.value)}
                className="border-b border-[#E8DED7] px-7 py-6 text-sm text-[#6B5F58] outline-none md:border-b-0 md:border-r"
              />

              <select
                aria-label="Number of guests"
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                className="border-b border-[#E8DED7] bg-white px-7 py-6 text-sm text-[#6B5F58] outline-none md:border-b-0 md:border-r"
              >
                <option value="">Guests</option>
                <option value="1">1 guest</option>
                <option value="2">2 guests</option>
                <option value="3">3 guests</option>
                <option value="4">4 guests</option>
                <option value="5">5+ guests</option>
              </select>

              <button className="bg-[#B55332] px-8 py-6 text-sm font-semibold tracking-wide text-white transition hover:bg-[#944224]">
                Search
              </button>
            </form>
          </div>
        </section>

        <section id="venues" className="bg-[#F5EFEB] px-8 py-24 md:px-20">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#B55332]">
                Discover
              </p>

              <h2 className="mt-3 font-serif text-5xl font-semibold">
                Explore Top Destinations
              </h2>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-[#7C7069]">
              {loading
                ? "Finding beautiful stays for you..."
                : `${filteredVenues.length} stays found`}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {filters.map((filter) => {
              const isActive = activeFilters.includes(filter.label);

              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => handleFilterClick(filter.label)}
                  className={`flex items-center gap-3 rounded-full border px-6 py-3 text-sm shadow-sm transition ${
                    isActive
                      ? "border-[#B55332] bg-[#B55332] text-white"
                      : "border-[#D8C8BF] bg-white text-[#7B675D] hover:border-[#B55332] hover:text-[#B55332]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#F5E6DF] text-[#B55332]"
                    }`}
                  >
                    <Icon icon={filter.icon} width="18" height="18" />
                  </span>

                  {filter.label}
                </button>
              );
            })}
          </div>

          {(search ||
            checkIn ||
            checkOut ||
            guests ||
            activeFilters.length > 0) && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-8 text-sm font-medium text-[#B55332] underline-offset-4 hover:underline"
            >
              Clear search and filters
            </button>
          )}

          {error && (
            <p className="mt-10 rounded-2xl border border-[#B55332] bg-white px-6 py-4 text-sm text-[#B55332]">
              {error}
            </p>
          )}

          {loading && (
            <p className="mt-14 text-sm text-[#7C7069]">Loading venues...</p>
          )}

          {!loading && !error && filteredVenues.length === 0 && (
            <p className="mt-14 text-sm text-[#7C7069]">
              No stays found. Try another search or filter.
            </p>
          )}

          <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {visibleVenues.map((venue) => {
              const imageUrl = venue.media?.[0]?.url || heroImage;
              const imageAlt = venue.media?.[0]?.alt || venue.name;

              return (
                <Link
                  key={venue.id}
                  to={`/venue/${venue.id}`}
                  className="group overflow-hidden rounded-[28px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-2"
                >
                  <div className="h-[270px] overflow-hidden bg-[#D9D9D9]">
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-7">
                    <h3 className="font-serif text-2xl font-semibold">
                      {venue.name}
                    </h3>

                    <p className="mt-2 text-sm text-[#7C7069]">
                      {venue.location?.city || "Unknown city"},{" "}
                      {venue.location?.country || "Unknown country"}
                    </p>

                    <div className="mt-6 border-t border-[#ECE3DD] pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium">
                          From {venue.price} NOK / night
                        </p>

                        <p className="text-xs text-[#7C7069]">
                          {venue.maxGuests} guests
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {venue.meta?.wifi && (
                          <span className="rounded-full bg-[#F5E6DF] px-4 py-1 text-xs text-[#B55332]">
                            Wifi
                          </span>
                        )}

                        {venue.meta?.parking && (
                          <span className="rounded-full bg-[#F5E6DF] px-4 py-1 text-xs text-[#B55332]">
                            Parking
                          </span>
                        )}

                        {venue.meta?.breakfast && (
                          <span className="rounded-full bg-[#F5E6DF] px-4 py-1 text-xs text-[#B55332]">
                            Breakfast
                          </span>
                        )}

                        {venue.meta?.pets && (
                          <span className="rounded-full bg-[#F5E6DF] px-4 py-1 text-xs text-[#B55332]">
                            Pets
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasMoreVenues && (
            <div className="mt-20 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                className="rounded-full border border-[#B55332] px-12 py-5 text-sm font-medium text-[#B55332] transition hover:bg-[#B55332] hover:text-white"
              >
                Explore more stays
              </button>
            </div>
          )}
        </section>

        <footer className="border-t border-[#E4D8D0] bg-[#F8F2EE] px-10 py-10">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
            <p className="text-sm text-[#7C7069]">
              Crafted for modern travelers seeking calm, comfort and
              unforgettable places.
            </p>

            <div className="flex gap-8 text-sm font-medium text-[#A0482A]">
              <a href="#venues">Explore</a>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

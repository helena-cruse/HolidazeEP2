import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  subMonths,
} from "date-fns";

import Header from "../components/Header.jsx";
import { getVenueById } from "../api/venues";
import { createBooking } from "../api/bookings";
import { load } from "../utils/storage";

import logo from "../../public/assets/media/HolidazeLogo.png";

function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function isDateBooked(date, bookings = []) {
  return bookings.some((booking) =>
    isWithinInterval(date, {
      start: new Date(booking.dateFrom),
      end: new Date(booking.dateTo),
    })
  );
}

function isDateRangeAvailable(bookings, checkIn, checkOut) {
  if (!checkIn || !checkOut) return true;

  const selectedStart = new Date(checkIn);
  const selectedEnd = new Date(checkOut);

  if (selectedEnd <= selectedStart) return false;

  return !bookings?.some((booking) => {
    const bookedStart = new Date(booking.dateFrom);
    const bookedEnd = new Date(booking.dateTo);

    return datesOverlap(selectedStart, selectedEnd, bookedStart, bookedEnd);
  });
}

export default function VenueDetails() {
  const { id } = useParams();

  const [venue, setVenue] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);

  const user = load("user");
  const apiKey = load("apiKey");

  useEffect(() => {
    async function loadVenue() {
      try {
        const data = await getVenueById(id);
        setVenue(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadVenue();
  }, [id]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const amount = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );

    return amount > 0 ? amount : 0;
  }, [checkIn, checkOut]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5EFEB] p-10">Loading venue...</main>
    );
  }

  if (error || !venue) {
    return (
      <main className="min-h-screen bg-[#F5EFEB] p-10">
        {error || "Venue not found"}
      </main>
    );
  }

  const images = venue.media?.filter((image) => image.url) || [];
  const mainImage = images[0];
  const totalPrice = nights * venue.price;
  const cleaningFee = nights > 0 ? 600 : 0;
  const serviceFee = nights > 0 ? 200 : 0;
  const total = totalPrice + cleaningFee + serviceFee;
  const isAvailable = isDateRangeAvailable(venue.bookings, checkIn, checkOut);

  async function handleBooking(event) {
    event.preventDefault();
    setBookingMessage("");

    if (!user?.accessToken || !apiKey) {
      setBookingMessage("Please log in before booking this stay.");
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingMessage("Please choose check-in and check-out dates.");
      return;
    }

    if (!isAvailable) {
      setBookingMessage("This venue is not available for the selected dates.");
      return;
    }

    try {
      setBookingLoading(true);

      await createBooking(
        {
          dateFrom: new Date(checkIn).toISOString(),
          dateTo: new Date(checkOut).toISOString(),
          guests: Number(guests),
          venueId: venue.id,
        },
        user.accessToken,
        apiKey
      );

      setBookingMessage("Booking created successfully.");
    } catch (error) {
      setBookingMessage(error.message);
    } finally {
      setBookingLoading(false);
    }
  }

  function handleCalendarDateClick(date) {
    if (date < new Date().setHours(0, 0, 0, 0)) return;
    if (isDateBooked(date, venue.bookings)) return;

    const dateValue = format(date, "yyyy-MM-dd");

    if (!checkIn || checkOut) {
      setCheckIn(dateValue);
      setCheckOut("");
      return;
    }

    if (new Date(dateValue) <= new Date(checkIn)) {
      setCheckIn(dateValue);
      return;
    }

    setCheckOut(dateValue);
  }

  return (
    <div className="min-h-screen bg-[#E7DED7] text-[#2A211D]">
      <div className="mx-auto max-w-[1600px] bg-[#F5EFEB]">
        <Header />

        <main className="px-8 py-10 md:px-20">
          <div className="mb-8 text-sm text-[#7C7069]">
            <Link to="/" className="hover:text-[#B55332]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>{venue.name}</span>
          </div>

          <section className="relative grid gap-4 lg:grid-cols-[2fr_1fr]">
            <ImageBox image={mainImage} title={venue.name} large />

            <div className="grid gap-4">
              <ImageBox image={images[1]} title={venue.name} />
              <ImageBox image={images[2]} title={venue.name} />
            </div>

            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="absolute bottom-6 right-6 rounded-full bg-white px-7 py-3 text-sm font-medium text-[#2A211D] shadow-lg transition hover:bg-[#F5E6DF]"
              >
                View all photos ({images.length})
              </button>
            )}
          </section>

          <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_430px]">
            <div>
              <div className="border-b border-[#E4D8D0] pb-8">
                <h1 className="font-serif text-6xl font-semibold">
                  {venue.name}
                </h1>

                <p className="mt-4 text-[#7C7069]">
                  {venue.location?.city || "Unknown city"},{" "}
                  {venue.location?.country || "Unknown country"} · Up to{" "}
                  {venue.maxGuests} guests
                </p>

                <p className="mt-4 flex items-center gap-2 text-[#B55332]">
                  <Icon icon="ph:star-fill" />
                  {venue.rating || "No rating"} rating
                </p>
              </div>

              <div className="border-b border-[#E4D8D0] py-8">
                <h2 className="font-serif text-3xl font-semibold">
                  What this place offers
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {venue.meta?.wifi && (
                    <Amenity icon="ph:wifi-high-light" label="Wifi included" />
                  )}
                  {venue.meta?.parking && (
                    <Amenity icon="ph:car-profile-light" label="Parking" />
                  )}
                  {venue.meta?.breakfast && (
                    <Amenity icon="ph:coffee-light" label="Breakfast" />
                  )}
                  {venue.meta?.pets && (
                    <Amenity icon="ph:paw-print-light" label="Pets welcome" />
                  )}
                </div>
              </div>

              <div className="border-b border-[#E4D8D0] py-8">
                <h2 className="font-serif text-3xl font-semibold">
                  About this place
                </h2>
                <p className="mt-4 max-w-4xl leading-relaxed text-[#6B5F58]">
                  {venue.description}
                </p>
              </div>

              <div className="border-b border-[#E4D8D0] py-8">
                <h2 className="font-serif text-3xl font-semibold">
                  Availability
                </h2>

                <Calendar
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  bookings={venue.bookings}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onDateClick={handleCalendarDateClick}
                />
              </div>

              <div className="py-8">
                <h2 className="font-serif text-3xl font-semibold">Host</h2>

                <div className="mt-5 flex items-center justify-between rounded-[24px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div>
                    <p className="font-serif text-2xl font-semibold">
                      {venue.owner?.name || "Holidaze host"}
                    </p>
                    <p className="mt-1 text-sm text-[#7C7069]">Venue manager</p>
                  </div>

                  {venue.owner?.name && (
                    <Link
                      to={`/profile/${venue.owner.name}`}
                      className="rounded-full border border-[#B55332] px-6 py-3 text-sm text-[#B55332] transition hover:bg-[#B55332] hover:text-white"
                    >
                      View profile
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-[28px] bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] lg:sticky lg:top-8">
              <p className="font-serif text-4xl font-semibold">
                {venue.price} NOK
                <span className="ml-2 text-base font-normal text-[#7C7069]">
                  / night
                </span>
              </p>

              <form onSubmit={handleBooking} className="mt-6">
                <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#E4D8D0]">
                  <label className="border-r border-[#E4D8D0] p-4">
                    <span className="text-xs font-semibold text-[#B55332]">
                      Check in
                    </span>
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(event) => setCheckIn(event.target.value)}
                      className="mt-2 w-full bg-transparent text-sm outline-none"
                    />
                  </label>

                  <label className="p-4">
                    <span className="text-xs font-semibold text-[#B55332]">
                      Check out
                    </span>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      onChange={(event) => setCheckOut(event.target.value)}
                      className="mt-2 w-full bg-transparent text-sm outline-none"
                    />
                  </label>
                </div>

                <label className="mt-4 block rounded-2xl border border-[#E4D8D0] p-4">
                  <span className="text-xs font-semibold text-[#B55332]">
                    Guests
                  </span>
                  <select
                    value={guests}
                    onChange={(event) => setGuests(event.target.value)}
                    className="mt-2 w-full bg-transparent text-sm outline-none"
                  >
                    {Array.from({ length: venue.maxGuests }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1} guest{index + 1 > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {!isAvailable && (
                  <p className="mt-4 rounded-2xl bg-[#F5E6DF] px-4 py-3 text-sm text-[#B55332]">
                    This venue is not available for the selected dates.
                  </p>
                )}

                <div className="mt-6 space-y-3 text-sm">
                  <PriceLine
                    label={`${venue.price} NOK x ${nights || 0} nights`}
                    value={`${totalPrice} NOK`}
                  />
                  <PriceLine
                    label="Cleaning fee"
                    value={`${cleaningFee} NOK`}
                  />
                  <PriceLine label="Service fee" value={`${serviceFee} NOK`} />
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#E4D8D0] pt-5 font-semibold">
                  <span>Total</span>
                  <span className="text-[#B55332]">{total} NOK</span>
                </div>

                <button
                  disabled={bookingLoading || !isAvailable}
                  className="mt-6 w-full rounded-full bg-[#B55332] px-8 py-5 text-sm font-semibold tracking-wide text-white transition hover:bg-[#944224] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bookingLoading ? "Booking..." : "Reserve now"}
                </button>

                {bookingMessage && (
                  <p className="mt-4 rounded-2xl bg-[#F5E6DF] px-4 py-3 text-sm text-[#B55332]">
                    {bookingMessage}
                  </p>
                )}
              </form>
            </aside>
          </section>
        </main>

        {galleryOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2A211D]/90 px-6 py-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-serif text-4xl text-white">All photos</h2>

                <button
                  onClick={() => setGalleryOpen(false)}
                  className="rounded-full bg-white px-6 py-3 text-sm text-[#2A211D]"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {images.map((image, index) => (
                  <img
                    key={`${image.url}-${index}`}
                    src={image.url}
                    alt={image.alt || `${venue.name} image ${index + 1}`}
                    className="h-[420px] w-full rounded-[28px] object-cover"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageBox({ image, title, large = false }) {
  if (!image?.url) {
    return (
      <div
        className={`flex items-center justify-center rounded-[28px] border border-[#E4D8D0] bg-[#EFE7E1] text-sm text-[#9B8B82] ${
          large ? "h-[540px]" : "h-[260px]"
        }`}
      >
        No image available
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px]">
      <img
        src={image.url}
        alt={image.alt || title}
        className={`${large ? "h-[540px]" : "h-[260px]"} w-full object-cover`}
      />
    </div>
  );
}

function Calendar({
  currentMonth,
  setCurrentMonth,
  bookings,
  checkIn,
  checkOut,
  onDateClick,
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = (getDay(monthStart) + 6) % 7;

  return (
    <div className="mt-5 rounded-[24px] border border-[#E4D8D0] bg-white p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-full border border-[#E4D8D0] px-4 py-2 text-sm text-[#B55332]"
        >
          Previous
        </button>

        <h3 className="font-serif text-2xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>

        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-full border border-[#E4D8D0] px-4 py-2 text-sm text-[#B55332]"
        >
          Next
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs text-[#7C7069]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: startPadding }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {days.map((day) => {
          const booked = isDateBooked(day, bookings);
          const selected =
            (checkIn && isSameDay(day, new Date(checkIn))) ||
            (checkOut && isSameDay(day, new Date(checkOut)));

          const inSelectedRange =
            checkIn &&
            checkOut &&
            isWithinInterval(day, {
              start: new Date(checkIn),
              end: new Date(checkOut),
            });

          const past = day < new Date().setHours(0, 0, 0, 0);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={booked || past}
              onClick={() => onDateClick(day)}
              className={`rounded-xl px-2 py-3 text-sm transition ${
                booked
                  ? "bg-[#F5E6DF] text-[#B55332] line-through"
                  : selected
                  ? "bg-[#B55332] text-white"
                  : inSelectedRange
                  ? "bg-[#E9F0E2] text-[#4F6B42]"
                  : past
                  ? "bg-[#F2ECE8] text-[#C2B6AF]"
                  : "bg-[#EEF3E8] text-[#4F6B42] hover:bg-[#DCE8D4]"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#7C7069]">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#EEF3E8]" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#F5E6DF]" />
          Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#B55332]" />
          Selected
        </span>
      </div>
    </div>
  );
}

function Amenity({ icon, label }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#F5E6DF] px-5 py-4 text-sm text-[#6B5F58]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#B55332]">
        <Icon icon={icon} width="18" height="18" />
      </span>
      {label}
    </div>
  );
}

function PriceLine({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[#6B5F58]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

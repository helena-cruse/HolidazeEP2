import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Header from "../components/Header.jsx";
import { getVenueById, updateVenue } from "../api/venues";
import { load } from "../utils/storage";

export default function EditVenue() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = load("user");
  const apiKey = load("apiKey");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    maxGuests: "",
    image1: "",
    image2: "",
    image3: "",
    address: "",
    city: "",
    zip: "",
    country: "",
    continent: "",
    wifi: false,
    parking: false,
    breakfast: false,
    pets: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadVenue() {
      try {
        const venue = await getVenueById(id);

        if (venue.owner?.name !== user?.name) {
          setMessage("You can only edit venues you manage.");
          return;
        }

        setFormData({
          name: venue.name || "",
          description: venue.description || "",
          price: venue.price || "",
          maxGuests: venue.maxGuests || "",
          image1: venue.media?.[0]?.url || "",
          image2: venue.media?.[1]?.url || "",
          image3: venue.media?.[2]?.url || "",
          address: venue.location?.address || "",
          city: venue.location?.city || "",
          zip: venue.location?.zip || "",
          country: venue.location?.country || "",
          continent: venue.location?.continent || "",
          wifi: venue.meta?.wifi || false,
          parking: venue.meta?.parking || false,
          breakfast: venue.meta?.breakfast || false,
          pets: venue.meta?.pets || false,
        });
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadVenue();
  }, [id, user?.name]);

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

    if (!user?.accessToken || !apiKey) {
      setMessage("You need to log in to edit this venue.");
      return;
    }

    const media = [formData.image1, formData.image2, formData.image3]
      .filter((url) => url.trim())
      .map((url, index) => ({
        url: url.trim(),
        alt: `${formData.name} image ${index + 1}`,
      }));

    const venueData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      media,
      price: Number(formData.price),
      maxGuests: Number(formData.maxGuests),
      meta: {
        wifi: formData.wifi,
        parking: formData.parking,
        breakfast: formData.breakfast,
        pets: formData.pets,
      },
      location: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        zip: formData.zip.trim(),
        country: formData.country.trim(),
        continent: formData.continent.trim(),
        lat: 0,
        lng: 0,
      },
    };

    try {
      setSaving(true);
      const updatedVenue = await updateVenue(
        id,
        venueData,
        user.accessToken,
        apiKey
      );

      navigate(`/venue/${updatedVenue.id}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const previewImage = formData.image1.trim();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EFEB]">
        <Header />
        <main className="px-8 py-20 md:px-20">
          <p className="text-[#7C7069]">Loading venue...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E7DED7] text-[#2A211D]">
      <div className="mx-auto max-w-[1600px] bg-[#F5EFEB]">
        <Header />

        <main className="px-8 py-14 md:px-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-sm text-[#7C7069]">
              <Link to="/" className="hover:text-[#B55332]">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link to={`/venue/${id}`} className="hover:text-[#B55332]">
                Venue
              </Link>
              <span className="mx-2">/</span>
              <span>Edit</span>
            </div>

            <p className="text-sm uppercase tracking-[0.3em] text-[#B55332]">
              Host dashboard
            </p>

            <h1 className="mt-3 font-serif text-6xl font-semibold">
              Edit venue
            </h1>

            <p className="mt-3 max-w-2xl text-[#7C7069]">
              Update your listing details, images, amenities and location.
            </p>

            {message && (
              <p className="mt-8 rounded-2xl bg-[#F5E6DF] px-5 py-4 text-sm text-[#B55332]">
                {message}
              </p>
            )}

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
              <form
                onSubmit={handleSubmit}
                className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.07)] md:p-10"
              >
                <SectionTitle title="Basic information" />

                <div className="mt-6 space-y-5">
                  <Input
                    label="Venue name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <label className="block">
                    <span className="text-sm font-medium text-[#6B5F58]">
                      Description
                    </span>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="mt-2 w-full resize-none rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
                    />
                  </label>
                </div>

                <SectionTitle title="Images" className="mt-9" />

                <div className="mt-6 space-y-4">
                  <Input
                    label="Image URL 1"
                    name="image1"
                    type="url"
                    value={formData.image1}
                    onChange={handleChange}
                  />

                  <Input
                    label="Image URL 2"
                    name="image2"
                    type="url"
                    value={formData.image2}
                    onChange={handleChange}
                  />

                  <Input
                    label="Image URL 3"
                    name="image3"
                    type="url"
                    value={formData.image3}
                    onChange={handleChange}
                  />
                </div>

                <SectionTitle title="Pricing and capacity" className="mt-9" />

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <Input
                    label="Price per night NOK"
                    name="price"
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Max guests"
                    name="maxGuests"
                    type="number"
                    min="1"
                    value={formData.maxGuests}
                    onChange={handleChange}
                    required
                  />
                </div>

                <SectionTitle title="Location" className="mt-9" />

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />

                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />

                  <Input
                    label="Zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                  />

                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />

                  <Input
                    label="Continent"
                    name="continent"
                    value={formData.continent}
                    onChange={handleChange}
                  />
                </div>

                <SectionTitle title="Amenities" className="mt-9" />

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Checkbox
                    label="Wifi"
                    name="wifi"
                    checked={formData.wifi}
                    onChange={handleChange}
                  />

                  <Checkbox
                    label="Parking"
                    name="parking"
                    checked={formData.parking}
                    onChange={handleChange}
                  />

                  <Checkbox
                    label="Breakfast"
                    name="breakfast"
                    checked={formData.breakfast}
                    onChange={handleChange}
                  />

                  <Checkbox
                    label="Pets allowed"
                    name="pets"
                    checked={formData.pets}
                    onChange={handleChange}
                  />
                </div>

                <button
                  disabled={
                    saving || message === "You can only edit venues you manage."
                  }
                  className="mt-10 w-full rounded-full bg-[#B55332] px-8 py-5 text-sm font-semibold tracking-wide text-white shadow-[0_10px_30px_rgba(181,83,50,0.25)] transition hover:bg-[#944224] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving changes..." : "Save changes"}
                </button>
              </form>

              <aside className="h-fit rounded-[32px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.07)] lg:sticky lg:top-8">
                <p className="text-sm uppercase tracking-[0.3em] text-[#B55332]">
                  Preview
                </p>

                <div className="mt-5 overflow-hidden rounded-[24px] bg-[#EFE7E1]">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Venue preview"
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-sm text-[#9B8B82]">
                      Image preview
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h2 className="font-serif text-3xl font-semibold">
                    {formData.name || "Venue name"}
                  </h2>

                  <p className="mt-2 text-sm text-[#7C7069]">
                    {formData.city || "City"}, {formData.country || "Country"}
                  </p>

                  <div className="mt-5 border-t border-[#E4D8D0] pt-5">
                    <p className="text-sm font-medium">
                      {formData.price || "—"} NOK / night
                    </p>

                    <p className="mt-2 text-sm text-[#7C7069]">
                      Up to {formData.maxGuests || "—"} guests
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {formData.wifi && <Badge label="Wifi" />}
                    {formData.parking && <Badge label="Parking" />}
                    {formData.breakfast && <Badge label="Breakfast" />}
                    {formData.pets && <Badge label="Pets" />}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionTitle({ title, className = "" }) {
  return (
    <div className={`border-b border-[#E4D8D0] pb-3 ${className}`}>
      <h2 className="font-serif text-2xl font-semibold text-[#B55332]">
        {title}
      </h2>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#6B5F58]">{label}</span>

      <input
        name={name}
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-[#D8C8BF] px-5 py-4 text-sm outline-none transition focus:border-[#B55332]"
      />
    </label>
  );
}

function Checkbox({ label, name, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#D8C8BF] bg-[#F8F2EE] p-5 text-sm text-[#6B5F58] transition hover:border-[#B55332]">
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-[#B55332]"
      />

      {label}
    </label>
  );
}

function Badge({ label }) {
  return (
    <span className="rounded-full bg-[#F5E6DF] px-4 py-1 text-xs text-[#B55332]">
      {label}
    </span>
  );
}

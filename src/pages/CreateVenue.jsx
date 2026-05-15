import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header.jsx";
import { createVenue } from "../api/venues";
import { load } from "../utils/storage";

export default function CreateVenue() {
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

    if (!user?.accessToken || !apiKey) {
      setMessage("You need to log in as a venue manager to create a venue.");
      return;
    }

    if (!user?.venueManager) {
      setMessage("Only venue managers can create venues.");
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
      setLoading(true);
      const newVenue = await createVenue(venueData, user.accessToken, apiKey);
      navigate(`/venue/${newVenue.id}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const previewImage = formData.image1.trim();

  return (
    <div className="min-h-screen bg-[#E7DED7] text-[#2A211D]">
      <div className="mx-auto max-w-[1600px] bg-[#F5EFEB]">
        <Header />

        <main className="px-8 py-14 md:px-20">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#B55332]">
              Host dashboard
            </p>

            <h1 className="mt-3 font-serif text-6xl font-semibold">
              Create a new venue
            </h1>

            <p className="mt-3 max-w-2xl text-[#7C7069]">
              Add your venue details, images, amenities and location. Your
              listing will appear immediately after publishing.
            </p>

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
                    placeholder="Beachfront Villa Tulum"
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
                      placeholder="Describe your venue in detail..."
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
                    placeholder="https://example.com/image-1.jpg"
                  />

                  <Input
                    label="Image URL 2"
                    name="image2"
                    type="url"
                    value={formData.image2}
                    onChange={handleChange}
                    placeholder="https://example.com/image-2.jpg"
                  />

                  <Input
                    label="Image URL 3"
                    name="image3"
                    type="url"
                    value={formData.image3}
                    onChange={handleChange}
                    placeholder="https://example.com/image-3.jpg"
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
                    placeholder="1500"
                    required
                  />

                  <Input
                    label="Max guests"
                    name="maxGuests"
                    type="number"
                    min="1"
                    value={formData.maxGuests}
                    onChange={handleChange}
                    placeholder="6"
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
                    placeholder="Ocean Road 12"
                  />

                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Tulum"
                  />

                  <Input
                    label="Zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="77760"
                  />

                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Mexico"
                  />

                  <Input
                    label="Continent"
                    name="continent"
                    value={formData.continent}
                    onChange={handleChange}
                    placeholder="North America"
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

                {message && (
                  <p className="mt-8 rounded-2xl bg-[#F5E6DF] px-5 py-4 text-sm text-[#B55332]">
                    {message}
                  </p>
                )}

                <button
                  disabled={loading}
                  className="mt-10 w-full rounded-full bg-[#B55332] px-8 py-5 text-sm font-semibold tracking-wide text-white shadow-[0_10px_30px_rgba(181,83,50,0.25)] transition hover:bg-[#944224] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating venue..." : "Create venue"}
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

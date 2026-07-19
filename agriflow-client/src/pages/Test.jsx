import { useEffect, useState } from "react";



function useDebounce(value, delay = 500) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(value);

    }, delay)
    return () => clearTimeout(timer);
  }, [value, delay])

  return debounceValue;

}

function useFetch(url) {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(url, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error("failed to fetch");
      }
      const result = await res.json();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    fetchData();
    return () => controller.abort();

  }, [url])
  return { data, loading, error };

}


export default function BookingList() {
  const [search, setSearch] = useState("");



  const debounceValue = useDebounce(search, 1000);
  const { data, loading, error } = useFetch(`/api/bookings?search=${ debounceValue }`)
  const bookings = data;


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <input
        type="text"
        value={search}
        placeholder="Search customer"
        onChange={(e) => setSearch(e.target.value)}
      />

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id}>
            <h3>{booking.customer}</h3>
            <p>{booking.destination}</p>
          </div>
        ))
      )}
    </>
  );
}
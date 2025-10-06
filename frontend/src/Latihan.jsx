import { useState, useEffect } from "react";
import axios from "axios";

export default function Latihan() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/users")
      .then((response) => setData(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleFilter = () => {
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setResult(filtered);
  };

  return (
    <div>
      <h3>Data User : </h3>
      {data.map((item) => (
        <ul key={item.id}>
          <li>
            {item.name} - {item.email}
          </li>
        </ul>
      ))}

      <p>
        Cari User :{" "}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </p>
      <button onClick={handleFilter}>Cari</button>
      <h3>Hasil Pencarian : </h3>
      {result.length > 0 ? (
        result.map((item) => (
          <ul key={item.id}>
            <li>
              {item.name} - {item.email}
            </li>
          </ul>
        ))
      ) : (
        <li>Data tidak ada</li>
      )}
    </div>
  );
}

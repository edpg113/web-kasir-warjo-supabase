import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  return (
    <div>
      <h2>Latihan State</h2>
      <Users />
    </div>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h2>Counter : {count}</h2>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

function Form() {
  const [nama, setNama] = useState("");

  return (
    <div>
      <input
        type="text"
        placeholder="Nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
      />
      <p>Halo, {nama || "..."}</p>
    </div>
  );
}

function Toggle() {
  const [nyala, setNyala] = useState(false);

  return (
    <div>
      <h2>{nyala ? "Lampu Menyala" : "Lampu Mati"}</h2>
      <button onClick={() => setNyala(!nyala)}>
        {nyala ? "Matikan" : "Nyalakan"}
      </button>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/users")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return (
    <div>
      <h3>MAP</h3>
      <h2>Users List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>

      <h3>FILTER</h3>
      <p>User dengan ID {"<"} 5</p>
      <ul>
        {users
          .filter((user) => user.id <= 10)
          .map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
      </ul>

      <h3>FIND</h3>
      <p>User dengan ID = 5</p>
      <p>{users.find((user) => user.id === 1)?.name || "Tidak ditemukan"}</p>

      <h3>SOME</h3>
      <p>Cek User</p>
      <p>
        {users.some((u) => u.name === "Leanne Graham")
          ? "Ada user dengan nama Leanne Graham"
          : "Leanne tidak ad"}
      </p>

      <h3>REDUCE</h3>
      <p>Total ID User</p>
      <p>
        {users.reduce((total, user) => total + user.email.length, 0)} karakter
      </p>

    </div>
  );
}

export default App;

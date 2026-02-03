import { useState } from "react";
import API, { setToken } from "../../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post("/auth/login", form);
    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
    alert("login successfull")
  } catch (err) {
    console.error(err);
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} />
      <button type="submit">Login</button>
    </form>
  );
}

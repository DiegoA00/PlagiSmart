import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PasswordForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, confirmPassword } = form;

    if (!email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);

      if (err.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white rounded-lg w-full"
    >
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#003595] mb-1">
          Ingresa Nueva Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Ingresa tu contraseña"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[#003595] rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-[#003595]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-[#003595] cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#003595] mb-1">
          Repite Nueva Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Repite tu contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[#003595] rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-[#003595]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-[#003595] cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="bg-[#003595] text-white px-6 py-2 rounded-full hover:bg-[#002060] transition-colors w-full sm:w-auto cursor-pointer"
        >
          Enviar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md border border-red-300 flex items-center gap-2 text-sm">
          <span>⚠️</span> {error}
        </div>
      )}
    </form>
  );
};

export default PasswordForm;

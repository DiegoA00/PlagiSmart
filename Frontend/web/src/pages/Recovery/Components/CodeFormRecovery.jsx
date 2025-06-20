import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CodeFormRecovery = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [code, setCode] = useState(new Array(6).fill(""));

  const [error, setError] = useState("");

  const inputsRef = useRef([]);

  const [form, setForm] = useState({
    email: "",
  });

  const nextPage = () => {
    navigate('/login/passwordrecovery')
  }

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (/^[0-9]?$/.test(val)) {  // solo números y máximo 1 carácter
      const newCode = [...code];
      newCode[index] = val;
      setCode(newCode);

      // Mover foco al siguiente input si no es el último y valor no vacío
      if (val !== "" && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && code[index] === "") {
      // Si backspace y input vacío, mover foco al anterior
      if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const codeStr = code.join("");
    if (codeStr.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setError("");

    try {
      const token = await login(email, password);

      localStorage.setItem("token", token);
      console.log("Successfully logged in. Token saved:", token);
      setError("");

      navigate("/dashboard");
      console.log("Código enviado:", codeStr);

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
        <label className="block text-sm font-medium text-[#003595] mb-1">
          Ingresa el código
        </label>

        <div className="pt-2 flex flex-row gap-4 justify-center">
          {code.map((num, idx) => (
            <input
              key={idx}
              type="text"
              name={`code-${idx}`}
              maxLength={1}
              value={num}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => (inputsRef.current[idx] = el)}
              className="w-9 h-14 text-center text-2xl border border-[#003595] rounded-[30px] focus:outline-none focus:ring-2 focus:ring-[#003595] text-[#003595]"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={nextPage}
          type="submit"
          className="bg-[#003595] text-white px-15 py-2 rounded-full hover:bg-[#002060] transition-colors w-full sm:w-auto cursor-pointer"
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

export default CodeFormRecovery;

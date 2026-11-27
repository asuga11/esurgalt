import { useState } from "react";
import { Link } from "react-router-dom";

export default function AccountAction({ label, type, autoComplete, inputMode, submitLabel, onSubmit }) {
  const [pending, setPending] = useState(false);

  return (
    <div className="app-container pt-7 pb-20 sm:py-12">
        <form aria-labelledby="page-title" aria-busy={pending} className="app-panel mx-auto w-full max-w-md space-y-5 p-5 sm:p-7" onSubmit={async (event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("value");
          setPending(true);
          try {
            await onSubmit(type === "password" ? value : value.trim());
          } finally {
            setPending(false);
          }
        }}>
          <div>
            <label htmlFor="account-value" className="mb-2 block text-sm font-bold">{label}</label>
            <input id="account-value" name="value" type={type} autoComplete={autoComplete} inputMode={inputMode} className="app-field" readOnly={pending} required />
          </div>
          <button type="submit" disabled={pending} className="app-button-primary w-full">{pending ? "Илгээж байна…" : submitLabel}</button>
          <Link to="/login" className="app-button-secondary w-full">Нэвтрэх хэсэг</Link>
        </form>
    </div>
  );
}

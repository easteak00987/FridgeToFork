import { useEffect, useId, useState } from "react";

const initialLogin = { email: "", password: "" };
const initialSignup = {
  name: "",
  username: "",
  email: "",
  password: "",
  password_confirmation: "",
};

function GoogleButton({ onGoogleLogin, setError, mode }) {
  const containerId = useId().replace(/:/g, "");

  useEffect(() => {
    const scriptId = "google-identity-script";

    function renderButton() {
      if (!window.google?.accounts?.id || !import.meta.env.VITE_GOOGLE_CLIENT_ID) return;
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await onGoogleLogin(response.credential);
          } catch (error) {
            setError(error.message);
          }
        },
      });
      window.google.accounts.id.renderButton(
        container,
        { theme: "outline", size: "large", text: mode === "signup" ? "signup_with" : "continue_with", width: 320 }
      );
    }

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.addEventListener("load", renderButton, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => setError("Google Sign-In could not be loaded.");
    document.body.appendChild(script);
  }, [containerId, mode, onGoogleLogin, setError]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <p className="muted auth-note">
        Add `VITE_GOOGLE_CLIENT_ID` in your environment to enable Google authentication.
      </p>
    );
  }

  return <div id={containerId} className="google-button-slot" />;
}

export default function AuthModal({
  mode,
  onClose,
  onSwitchMode,
  onLogin,
  onRegister,
  onGoogleLogin,
}) {
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        await onLogin(loginForm);
      } else {
        await onRegister(signupForm);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-panel auth-modal auth-modal--${mode}`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button">
          x
        </button>
        <p className="eyebrow">{mode === "login" ? "Welcome back" : "Join the community"}</p>
        <h2>{mode === "login" ? "Sign in to FridgeToFork" : "Create your account"}</h2>
        <p className="section-copy">
          Share recipes, earn points, and help other cooks with ratings and reviews.
        </p>

        <form className="stack-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <input
                placeholder="Full name"
                value={signupForm.name}
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
              <input
                placeholder="Username"
                value={signupForm.username}
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, username: event.target.value }))
                }
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={mode === "login" ? loginForm.email : signupForm.email}
            onChange={(event) =>
              mode === "login"
                ? setLoginForm((current) => ({ ...current, email: event.target.value }))
                : setSignupForm((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={mode === "login" ? loginForm.password : signupForm.password}
            onChange={(event) =>
              mode === "login"
                ? setLoginForm((current) => ({ ...current, password: event.target.value }))
                : setSignupForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm password"
              value={signupForm.password_confirmation}
              onChange={(event) =>
                setSignupForm((current) => ({
                  ...current,
                  password_confirmation: event.target.value,
                }))
              }
              required
            />
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="button" disabled={submitting} type="submit">
            {submitting ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider"><span>or continue with Google</span></div>
        <GoogleButton mode={mode} onGoogleLogin={onGoogleLogin} setError={setError} />

        <p className="auth-switch">
          {mode === "login" ? "Need an account?" : "Already a member?"}{" "}
          <button
            className="link-button"
            onClick={() => onSwitchMode(mode === "login" ? "signup" : "login")}
            type="button"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Apply stored theme immediately — before React mounts — to avoid flash
(function applyStoredTheme() {
  try {
    const stored =
      localStorage.getItem("rap-studio-theme") ||
      localStorage.getItem("rap-theme");
    const theme = stored === "light" ? "light" : "dark";
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);
    html.setAttribute("data-theme", theme);
  } catch {
    document.documentElement.classList.add("dark");
  }
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce retries globally — faster failure detection
      retry: 2,
      retryDelay: (attempt) => Math.min(2000 * (attempt + 1), 8000),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);

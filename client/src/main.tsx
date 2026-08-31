import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import { ApiError } from "./lib/api";
import "./index.css";

// Dynamically initialize Umami analytics if configured and active
const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const analyticsWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
if (analyticsEndpoint && analyticsEndpoint !== "/analytics-disabled" && analyticsWebsiteId && analyticsWebsiteId !== "disabled") {
  const script = document.createElement("script");
  script.src = `${analyticsEndpoint}/umami`;
  script.defer = true;
  script.setAttribute("data-website-id", analyticsWebsiteId);
  document.head.appendChild(script);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retrying a 4xx just delays the toast — a 403 used to cost ~7s of backoff.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Diagnostics only. Redirecting on an expired session is handled in the fetch
// layer (lib/api/http.ts), which knows the real status code — this used to
// string-match the tRPC "Please login (10001)" message.
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Query Error]", event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AdminApp />
  </QueryClientProvider>
);

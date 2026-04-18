import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Reference from "./pages/Reference";
import { App } from "./app/App";
import "./index.css";

function Router() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const route = hash.replace(/^#/, "");
  if (route.startsWith("/app")) return <App />;
  return <ReferenceWithAppLink />;
}

function ReferenceWithAppLink() {
  return (
    <>
      <div className="fixed bottom-5 right-5 z-20">
        <a
          href="#/app"
          className="inline-flex items-center gap-2 rounded-[6px] px-3.5 h-8 bg-accent text-[#fff] text-ui hover:bg-accent-hover transition-colors shadow-[0_8px_24px_-8px_rgba(94,106,210,0.5)]"
        >
          Open app →
        </a>
      </div>
      <Reference />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);

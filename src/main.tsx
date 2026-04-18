import React from "react";
import ReactDOM from "react-dom/client";
import Reference from "./pages/Reference";
import "./index.css";

function ReferenceWithPrototypeLink() {
  return (
    <>
      <div className="fixed bottom-5 right-5 z-20">
        <a
          href="https://yimjason01-blip.github.io/meridian-prototype/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[6px] px-3.5 h-8 bg-accent text-text text-ui hover:bg-accent-hover transition-colors shadow-[0_8px_24px_-8px_rgba(94,106,210,0.5)]"
        >
          Open prototype →
        </a>
      </div>
      <Reference />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReferenceWithPrototypeLink />
  </React.StrictMode>
);

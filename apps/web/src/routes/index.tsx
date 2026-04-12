import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <main className="flex-1">
      {/* Hero content goes here — simulation is visible as full background */}
    </main>
  );
}

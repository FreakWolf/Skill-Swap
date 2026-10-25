// Re-mounts on every navigation inside the app, so each page eases in
// (a short fade + 4px rise; off under reduced motion). Not a route.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}

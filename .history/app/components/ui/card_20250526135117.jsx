// components/ui/card.jsx
export function Card({ children }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 10,
        padding: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>
  );
}

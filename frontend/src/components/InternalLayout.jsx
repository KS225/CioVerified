import InternalSidebar from "./InternalSidebar";

export default function InternalLayout({ children }) {
  return (
    <div
      style={{
        marginTop: "60px",
        padding: "25px",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
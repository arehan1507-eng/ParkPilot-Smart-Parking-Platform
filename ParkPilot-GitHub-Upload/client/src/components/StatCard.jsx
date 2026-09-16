export const StatCard = ({ label, value, caption, accent = false }) => (
  <article className={`stat-card ${accent ? "accent" : ""}`}>
    <p>{label}</p>
    <h3>{value}</h3>
    <span>{caption}</span>
  </article>
);

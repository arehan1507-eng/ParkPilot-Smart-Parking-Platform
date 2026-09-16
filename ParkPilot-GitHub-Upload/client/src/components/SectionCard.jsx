export const SectionCard = ({ title, action, children }) => (
  <section className="section-card">
    <div className="section-header">
      <div>
        <p className="eyebrow">Workspace</p>
        <h3>{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </section>
);

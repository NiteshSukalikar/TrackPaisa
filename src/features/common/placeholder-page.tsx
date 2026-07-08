interface PlaceholderPageProps {
  description: string;
  title: string;
}

export function PlaceholderPage({ description, title }: PlaceholderPageProps) {
  return (
    <section className="section-card">
      <p className="eyebrow">Coming in the roadmap</p>
      <h2 className="heading-lg">{title}</h2>
      <p className="copy">{description}</p>
    </section>
  );
}

interface HeroProps {
  onCta: () => void
}

export function Hero({ onCta }: HeroProps) {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="font-display text-7xl md:text-9xl font-bold tracking-tight">
        <span className="text-text">B</span><span className="text-gold">B</span>
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-faint">
        Better Body Academy
      </p>
      <h1 className="font-display text-4xl md:text-6xl font-bold max-w-3xl uppercase leading-tight">
        The world's number one transformation academy.
      </h1>
      <p className="text-muted-fg text-lg max-w-2xl">
        Your week. Real food. No BS plans here.
      </p>
      <button
        onClick={onCta}
        className="bg-gold hover:bg-gold-hover text-bg font-display font-bold uppercase tracking-wide px-10 py-5 text-lg rounded-md transition-colors"
      >
        Generate Your Week
      </button>
    </section>
  )
}

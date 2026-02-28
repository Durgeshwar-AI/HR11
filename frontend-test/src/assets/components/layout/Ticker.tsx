export function Ticker({ items }: any) {
  const all = [...items, ...items];
  return (
    <div className="bg-secondary overflow-hidden py-[9px] whitespace-nowrap border-y border-secondary">
      <div className="inline-flex animate-marquee">
        {all.map((item: string, i: number) => (
          <span
            key={i}
            className="font-display font-black text-[13px] text-white tracking-[0.15em] uppercase mr-12"
          >
            {item}
            <span className="text-primary ml-12">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

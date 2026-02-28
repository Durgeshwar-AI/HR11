export function Avatar({ initials, size = 40, bg, rank, style = {} }: any) {
  return (
    <div className="relative shrink-0" style={style}>
      <div
        className="flex items-center justify-center font-display font-black tracking-wide text-white shrink-0"
        style={{
          width: size,
          height: size,
          background: bg || "#E8521A",
          fontSize: size * 0.35,
        }}
      >
        {initials}
      </div>
      {rank && (
        <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-primary flex items-center justify-center font-display font-black text-[9px] text-white">
          {rank}
        </div>
      )}
    </div>
  );
}

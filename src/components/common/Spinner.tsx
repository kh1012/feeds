export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className={`
            block w-2 h-2 rounded-full bg-[#656d76]
            animate-[apple-pulse_1s_ease-in-out_infinite]
          `}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        ></span>
      ))}
    </div>
  );
}

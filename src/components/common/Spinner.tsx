export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="block w-1.5 h-6 rounded-sm bg-neutral-500 animate-[figma-pulse_1s_ease-in-out_infinite]"
          style={{
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

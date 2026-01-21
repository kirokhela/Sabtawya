
import clsx from "clsx";

export default function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur p-4",
        className
      )}
    >
      <div className="bg-white/95 rounded-2xl p-5">
        {children}
      </div>
    </div>
  );
}
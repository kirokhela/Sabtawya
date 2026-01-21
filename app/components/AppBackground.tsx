export default function AppBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-20 scale-110 blur-sm"
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/30" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
    </>
  );
}

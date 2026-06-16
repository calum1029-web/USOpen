const BANNER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Shinnecock_Hills_Golf_Club_-_panoramio.jpg/1280px-Shinnecock_Hills_Golf_Club_-_panoramio.jpg';

export default function Header() {
  return (
    <header className="relative overflow-hidden" style={{ minHeight: '220px' }}>
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${BANNER_IMAGE}')`,
          backgroundPosition: 'center 40%',
        }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-usopen-dark/70 via-usopen-dark/50 to-usopen-dark/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-usopen-gold/70 text-xs tracking-[0.3em] uppercase mb-2 font-semibold">
          Shinnecock Hills &bull; 2026
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white drop-shadow-lg mb-2">
          U.S. Open
        </h1>
        <p className="text-usopen-silver/80 text-sm tracking-widest uppercase">
          Golf Pool
        </p>
      </div>
    </header>
  );
}

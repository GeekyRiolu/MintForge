export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Left content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
            Own your
            <br />
            NFT{" "}
            <span className="text-primary italic">identity</span>
          </h1>

          {/* Floating NFT cards */}
          <div className="relative mt-[-80px] ml-[140px] sm:ml-[200px] mb-4">
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-primary rounded-xl shadow-lg transform rotate-[-15deg] absolute -top-4 -left-4 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-3xl">🐵</span>
              </div>
            </div>
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-primary rounded-xl shadow-lg transform rotate-[10deg] absolute top-2 left-8 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-pink-300 to-pink-100 flex items-center justify-center">
                <span className="text-3xl">🐻</span>
              </div>
            </div>
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-primary rounded-xl shadow-lg transform rotate-[-5deg] absolute top-8 left-[-20px] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center">
                <span className="text-3xl">🐶</span>
              </div>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mt-28 sm:mt-32 mb-8 max-w-md">
            Build your brand with an NFT that is uniquely you
          </p>

          <button className="px-8 py-4 bg-foreground text-background font-semibold text-sm uppercase tracking-wider rounded-full hover:bg-foreground/90 transition-colors">
            Create a Profile
          </button>
        </div>

        {/* Right visual - NFT collage with video overlay */}
        <div className="relative hidden lg:block">
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-primary">
            {/* Grid of NFT thumbnails */}
            <div className="grid grid-cols-3 gap-2 p-4 h-full">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden bg-primary/80"
                  style={{
                    transform: `rotate(${15 + Math.random() * 5}deg) scale(1.2)`,
                  }}
                >
                  <div className="w-full h-full aspect-square bg-gradient-to-br from-primary/40 to-primary/80 flex items-center justify-center">
                    <span className="text-4xl">
                      {["🦊", "🐸", "🤖", "👾", "🎭", "🦁", "🐲", "🦄", "🐙"][i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Video overlay badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-foreground/90 text-background px-8 py-4 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl font-light">NFT.COM/</span>
              <span className="text-2xl font-bold">VIDEOS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

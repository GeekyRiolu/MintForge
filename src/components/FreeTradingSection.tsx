export function FreeTradingSection() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left text */}
        <div>
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground">
            <span className="text-primary italic">Free</span> trading
          </h2>
          <p className="text-lg text-muted-foreground mt-6 max-w-sm">
            Buy and sell NFTs without any fees through the NFT.com Marketplace
          </p>
          <button className="mt-8 px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider rounded-full hover:bg-primary/90 transition-colors">
            Create Profile
          </button>
        </div>

        {/* Right - Phone mockup with crypto icons */}
        <div className="relative flex justify-center">
          {/* Floating crypto icons */}
          <div className="absolute -top-4 left-[10%] w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
            <span className="text-2xl">🌊</span>
          </div>
          <div className="absolute top-[30%] left-[5%] w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
            <span className="text-xl">◆</span>
          </div>
          <div className="absolute top-[50%] left-[8%] w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
            <span className="text-xl font-bold">R</span>
          </div>
          <div className="absolute top-[20%] right-[5%] w-14 h-14 rounded-full bg-orange-400 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '3.2s' }}>
            <span className="text-2xl">🦊</span>
          </div>
          <div className="absolute bottom-[20%] right-[8%] w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '3.8s' }}>
            <span className="text-xl">👁</span>
          </div>

          {/* Phone */}
          <div className="relative w-64 sm:w-72 bg-foreground rounded-[3rem] p-3 shadow-2xl">
            <div className="bg-background rounded-[2.5rem] overflow-hidden">
              {/* Status bar */}
              <div className="h-8 bg-background flex items-center justify-center">
                <div className="w-20 h-5 bg-foreground rounded-full" />
              </div>

              {/* App content */}
              <div className="p-4 space-y-3">
                {/* NFT image area */}
                <div className="w-full aspect-video bg-gradient-to-br from-green-400 via-blue-300 to-orange-300 rounded-xl flex items-center justify-center">
                  <span className="text-4xl">🏔️</span>
                </div>

                {/* Collection info */}
                <div>
                  <p className="text-xs text-muted-foreground">Foundation</p>
                  <h3 className="text-sm font-bold text-foreground">Into The Wild</h3>
                </div>

                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-muted-foreground">Creator</p>
                    <p className="font-mono text-foreground">0x3B3e...5405</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-mono text-foreground">0x6B4E...6k3F</p>
                  </div>
                </div>

                {/* Price */}
                <div className="border border-border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Fixed Price</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-foreground">◆ 0.215</span>
                    <span className="text-xs text-muted-foreground">ETH</span>
                  </div>

                  {/* Countdown */}
                  <div className="flex gap-2 mt-2 text-xs">
                    <div className="text-center">
                      <span className="font-bold text-foreground">146</span>
                      <span className="text-muted-foreground">d</span>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-foreground">10</span>
                      <span className="text-muted-foreground">h</span>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-foreground">34</span>
                      <span className="text-muted-foreground">m</span>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-foreground">24</span>
                      <span className="text-muted-foreground">s</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart button */}
                <button className="w-full py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

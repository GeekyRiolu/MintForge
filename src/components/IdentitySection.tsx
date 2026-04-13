export function IdentitySection() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left - Profile screenshot mockup */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
            {/* Browser chrome */}
            <div className="bg-muted px-4 py-2 flex items-center gap-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 rounded bg-foreground flex items-center justify-center">
                  <span className="text-background text-[8px] font-bold">N</span>
                </div>
                <span className="text-[10px] font-semibold text-foreground">NFT</span>
              </div>
              <div className="flex gap-4 text-[9px] text-muted-foreground">
                <span>Discover</span>
                <span>Gallery</span>
                <span>Learn ▾</span>
                <span>Staking</span>
              </div>
              <div className="ml-auto flex items-center gap-2 text-[9px]">
                <span className="text-muted-foreground">🔍 Search</span>
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[8px]">ian_smith ▾</span>
              </div>
            </div>

            {/* Profile banner */}
            <div className="h-32 sm:h-40 bg-gradient-to-r from-pink-200 via-orange-100 to-yellow-100" />

            {/* Profile info */}
            <div className="px-4 pb-4">
              <div className="flex items-end gap-3 -mt-6">
                <div className="w-12 h-12 rounded-full bg-primary border-2 border-card flex items-center justify-center text-lg">
                  🐵
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">/ABC_5699</span>
                <span className="text-xs text-muted-foreground">♥ 291</span>
                <button className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">View 2 comments</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right text */}
        <div>
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
            Build{" "}
            <span className="text-primary italic">Your</span>
            <br />
            <span className="text-primary italic">Identity</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-6 max-w-md">
            Set up your NFT Profile to build your digital identity and showcase your collection
          </p>
          <button className="mt-8 px-8 py-4 bg-foreground text-background font-semibold text-sm uppercase tracking-wider rounded-full hover:bg-foreground/90 transition-colors">
            Create Profile
          </button>
        </div>
      </div>
    </section>
  );
}

import 'aos/dist/aos.css';

import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import React, { useEffect } from 'react';

import HomeLayout from 'components/layouts/HomeLayout';

import AOS from 'aos';

const AIGeneratorChat = dynamic(
  () =>
    import('components/modules/AIGenerator/AIGeneratorChat').then(
      (mod) => mod.AIGeneratorChat,
    ),
  { ssr: false },
);

export default function GenerateWithAI() {
  useEffect(() => {
    AOS.init({ duration: 700 });
  }, []);

  return (
    <>
      <NextSeo
        title="Create NFT with AI | AI NFT Generator"
        description="Generate unique NFT art using AI. Describe your vision and let our AI create 3 different designs instantly."
        openGraph={{
          title: 'Create NFT with AI',
          description:
            'Generate unique NFT art using AI. Describe your vision and let our AI create 3 different designs instantly.',
          type: 'website',
          url: 'https://nft.com/generate-with-ai',
        }}
      />

      <main className="bg-white pb-16 pt-28 text-black minlg:pt-36">
        <section className="px-4 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-32" data-aos="fade-up">
              <p className="mb-4 inline-flex rounded-full border border-black/10 bg-[#fff3c2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                Landing Page AI
              </p>

              <h1 className="max-w-xl text-[2.8rem] leading-[1.05] tracking-tight sm:text-[4.2rem] lg:text-[5.35rem]">
                Keep the
                <span className="textColorGradient"> Mintly feel</span>
                <br />
                while chatting with AI.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-black/65 sm:text-lg">
                This experience now uses the Vercel AI Chat SDK for the
                conversation layer, but it still calls the same NFT generation
                API you already wired up.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: 'Same backend',
                    description:
                      'Your existing image generation route is still the source of truth.',
                  },
                  {
                    title: 'Chat-native UI',
                    description:
                      'The thread, streaming state, and assistant replies now run through Vercel AI chat.',
                  },
                  {
                    title: 'Landing palette',
                    description:
                      'The screen now follows the homepage tone instead of the older neon AI styling.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.75rem] border border-black/10 bg-[#faf5e8] p-5"
                    data-aos="fade-up"
                  >
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/90">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-black/60">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="100">
              <div className="rounded-[2.25rem] bg-[#f9d54c] p-2 shadow-[0_30px_120px_rgba(0,0,0,0.12)]">
                <div className="h-[760px] rounded-[2rem]">
                  <AIGeneratorChat />
                </div>
              </div>
            </div>
          </div>

          <div
            className="mx-auto mt-10 max-w-7xl rounded-[2rem] border border-black/10 bg-[#111111] px-6 py-6 text-white"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                'Use detailed subject nouns before style words for stronger generations.',
                'Mention camera angle or framing if you want more consistent compositions.',
                'Switch to Mystic Mode when realism matters more than response time.',
                'The assistant reply streams through Vercel AI while the art still comes from your API.',
              ].map((tip) => (
                <div
                  key={tip}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/75"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

GenerateWithAI.getLayout = function getLayout(page: React.ReactNode) {
  return <HomeLayout>{page}</HomeLayout>;
};

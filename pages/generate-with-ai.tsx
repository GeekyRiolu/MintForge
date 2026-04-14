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
          <div className="mx-auto max-w-5xl" data-aos="fade-up">
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

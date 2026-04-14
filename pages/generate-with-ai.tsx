import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import AOS from 'aos';
import 'aos/dist/aos.css';
import DefaultLayout from 'components/layouts/DefaultLayout';

const AIGeneratorChat = dynamic(
  () =>
    import('components/modules/AIGenerator/AIGeneratorChat').then(
      (mod) => mod.AIGeneratorChat
    ),
  { ssr: false }
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

      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pt-24 pb-12">
        {/* Main Chat Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="mb-8 text-center" data-aos="fade-up">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create NFT with AI
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Describe your vision in words. Our AI will generate 3 unique NFT designs instantly.
            </p>
          </div>

          {/* Chat Interface */}
          <div className="mb-12" data-aos="fade-up" data-aos-delay="100">
            <div className="h-[700px] rounded-2xl overflow-hidden">
              <AIGeneratorChat
                onGenerateImages={(prompt) => {
                  console.log('Generated NFT for prompt:', prompt);
                }}
              />
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-12" data-aos="fade-up" data-aos-delay="200">
            {[
              {
                icon: '✨',
                title: 'AI-Powered',
                description: 'Powered by Stable Diffusion for high-quality generations',
              },
              {
                icon: '🎨',
                title: '3 Variations',
                description: 'Get 3 unique designs with every prompt',
              },
              {
                icon: '⚡',
                title: 'Instant',
                description: 'Generate beautiful NFT art in seconds',
              },
            ].map((info, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:bg-gray-800/60"
              >
                <div className="text-3xl mb-2">{info.icon}</div>
                <h3 className="font-semibold text-white mb-1">{info.title}</h3>
                <p className="text-sm text-gray-400">{info.description}</p>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20" data-aos="fade-up" data-aos-delay="300">
            <h2 className="text-lg font-semibold text-white mb-4">💡 Tips for Better Results</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                '🎭 Be specific about art style (cyberpunk, watercolor, oil painting)',
                '🌈 Describe colors and mood (vibrant, dark, ethereal)',
                '🔍 Mention composition (close-up, panoramic, centered)',
                '✨ Add lighting details (neon, sunset, dramatic shadows)',
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="flex-shrink-0">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

GenerateWithAI.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      {page}
    </DefaultLayout>
  );
};

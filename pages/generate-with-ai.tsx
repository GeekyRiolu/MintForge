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

      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Hero Section */}
        <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl" />

          <div
            className="relative max-w-4xl mx-auto text-center mb-12"
            data-aos="fade-up"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create NFT with AI
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Turn your imagination into NFT art. Simply describe what you want,
              and our AI will generate 3 unique designs instantly.
            </p>
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              <div className="px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-sm text-gray-300">
                ✨ AI-Powered
              </div>
              <div className="px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-sm text-gray-300">
                🎨 3 Unique Designs
              </div>
              <div className="px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-sm text-gray-300">
                ⚡ Instant Generation
              </div>
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="relative max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-gray-700/50 backdrop-blur-xl">
              <AIGeneratorChat
                onGenerateImages={(prompt) => {
                  console.log('Generated NFT for prompt:', prompt);
                }}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl" />

          <div className="relative max-w-5xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-12"
              data-aos="fade-up"
            >
              <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '💭',
                  title: 'Describe Your Vision',
                  description:
                    'Write a detailed description of the NFT you want to create. Be creative with colors, style, and elements.',
                },
                {
                  icon: '🤖',
                  title: 'AI Generates Designs',
                  description:
                    'Our AI art generator creates 3 unique variations based on your description in seconds.',
                },
                {
                  icon: '⬇️',
                  title: 'Download & Mint',
                  description:
                    'Download your favorite design and mint it as an NFT on any blockchain.',
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
                  data-aos="fade-up"
                  data-aos-delay={`${(idx + 1) * 100}`}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-5xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-12"
              data-aos="fade-up"
            >
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tips for Better NFTs
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Be specific about colors and styles (e.g., cyberpunk, watercolor, oil painting)',
                'Include emotions and mood (e.g., dark, ethereal, vibrant, mysterious)',
                'Mention artistic styles (e.g., abstract, surreal, photorealistic)',
                'Add details about composition (e.g., close-up, panoramic, centered)',
                'Reference inspirations (e.g., inspired by cosmic art, nature)',
                'Include lighting preferences (e.g., neon, sunset, dramatic shadows)',
              ].map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 border-l-4 border-l-indigo-500"
                  data-aos="fade-right"
                  data-aos-delay={`${(idx + 1) * 50}`}
                >
                  <p className="text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="relative max-w-4xl mx-auto text-center" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Create Your First AI NFT?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Scroll up and start generating unique NFT designs powered by AI.
            </p>
            <div className="text-sm text-gray-500">
              💡 Unlimited generations • No credit card required • Instant downloads
            </div>
          </div>
        </section>
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

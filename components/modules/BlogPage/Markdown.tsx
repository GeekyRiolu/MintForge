import ImageWithZoom from 'components/modules/BlogPage/ImageWithZoom';

import YouTubeEmbed from './YoutubeEmbed';

import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';

const theme = {
  p: (props: any) => {
    const { children } = props;
    return (
      <div className="font-noi-grotesk mb-8 minlg:text-xll minmd:text-lg text-base text-blog-text-reskin">
        {children}
      </div>
    );
  },
  h1: (props: any) => {
    const { children } = props;
    return (
      <h1 className="font-noi-grotesk font-bold mb-4 minlg:text-4xl minmd:text-2xl text-md">
        {children}
      </h1>
    );
  },
  h2: (props: any) => {
    const { children } = props;
    return (
      <h2 className="font-noi-grotesk font-bold mb-4 minlg:text-3xll minmd:text-xl text-base">
        {children}
      </h2>
    );
  },
  h3: (props: any) => {
    const { children } = props;
    return (
      <h3 className="font-noi-grotesk mb-4 minlg:text-2xl minmd:text-lg text-base font-bold">
        {children}
      </h3>
    );
  },
  img: (props: any) => {
    const { src, alt } = props;
    return (
      <ImageWithZoom src={src} alt={alt} />
    );
  },
  a: (props: any) => {
    const { children } = props;
    const isYouTube = props?.href.match(/https:\/\/(www\.)?youtube.com\/watch\?v=([a-zA-Z0-9_-]+)/) || props?.href.match(/https:\/\/(www\.)?youtu.be\/([a-zA-Z0-9_-]+)/);
    if (isYouTube) {
      return <YouTubeEmbed embedId={isYouTube[2]} />;
    }
    return (
      <a
        className="font-noi-grotesk minlg:text-xll minmd:text-lg text-base underline text-blog-text-reskin"
        href={props.href}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  },
  li: (props: any) => {
    const { children } = props;
    return (
      <li className="font-noi-grotesk minlg:text-xll minmd:text-lg text-base text-blog-text-reskin">
        {children}
      </li>
    );
  },
  ul: (props: any) => {
    const { children } = props;
    return <ul className="mb-8 pl-4">{children}</ul>;
  },
  ol: (props: any) => {
    const { children } = props;
    return <ol className="mb-8 pl-4">{children}</ol>;
  },
  hr: () => {
    return <hr className="mb-8 border-share-icon" />;
  },
  table: (props: any) => {
    const { children } = props;
    return <table className='mx-auto mb-8 text-xs'>{children}</table>;
  },
};

const Markdown = ({ content }: any) => {
  return (
    <ReactMarkdown components={theme} skipHtml linkTarget="_blank" remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;

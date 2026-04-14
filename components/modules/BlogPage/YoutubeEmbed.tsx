
export default function YouTubeEmbed({ embedId }) {
  return (
    <div className='relative pb-[56.25%] pt-6 h-0'>
      <iframe
        width='100%'
        src={`https://www.youtube.com/embed/${embedId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded YouTube Video"
        className='block absolute top-0 left-0 w-full h-full'
      />
    </div>
  );
}

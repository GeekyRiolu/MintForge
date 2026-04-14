export function useCheckFileType(src: string) {
  const badFileTypes = ['webp', 'svg', 'gif', 'mp4'];

  if(src?.includes('base64')){
    return src;
  }
  if(src?.includes('?width=600')){
    const url = src.split('?')[0];
    const ext = url?.split('.').pop();

    if(badFileTypes.indexOf(ext) >= 0){
      return url;
    } else {
      return src;
    }
  } else {
    const ext = src?.split('.').pop();
    if(badFileTypes.indexOf(ext) >= 0){
      return src;
    } else {
      return src + '?width=600';
    }
  }
}
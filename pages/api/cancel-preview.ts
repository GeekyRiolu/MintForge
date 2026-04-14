export default async function cancelPreview(_, res) {
  res.clearPreviewData();
  res.writeHead(307, { Location: '/' });
  res.end();
}

/**
 * Takes in an array and splits it into chunks of the given size.
 * @param {T[]} items - the array to split
 * @param {number} maxChunkSize - the maximum size of each chunk
 * @returns {T[][]} - the array of chunks
 */
export default function chunkArray<T>(items: T[], maxChunkSize: number): T[][] {
  if (maxChunkSize < 1) throw new Error('maxChunkSize must be gte 1');
  if (items.length <= maxChunkSize) return [items];

  const numChunks: number = Math.ceil(items.length / maxChunkSize);
  const chunkSize = Math.ceil(items.length / numChunks);

  return [...Array(numChunks).keys()].map(ix =>
    items.slice(ix * chunkSize, ix * chunkSize + chunkSize)
  );
}

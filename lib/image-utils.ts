const WIKIMEDIA_FILE_PATH_PREFIX = "https://commons.wikimedia.org/wiki/Special:FilePath/";

export function getDisplayImageSrc(src: string, width: number) {
  if (!src.startsWith(WIKIMEDIA_FILE_PATH_PREFIX)) {
    return src;
  }

  const filename = decodeURIComponent(src.slice(WIKIMEDIA_FILE_PATH_PREFIX.length));

  if (!filename) {
    return src;
  }

  return `https://commons.wikimedia.org/w/thumb.php?f=${encodeURIComponent(filename)}&w=${width}`;
}

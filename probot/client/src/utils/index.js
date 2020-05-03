export const addBreaks = filename => {
  return filename.replace(/\//g, '/\u200B');
}

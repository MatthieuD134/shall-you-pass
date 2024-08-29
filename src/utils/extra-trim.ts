export default function extraTrim(str: string) {
  return str.replace(/\s\s+/g, ' ').trim();
}

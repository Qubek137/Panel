export default function imageLoader({ src, width, quality }) {
  // For static export, return the src as-is with relative path
  if (src.startsWith("/")) {
    return `.${src}`
  }
  return src
}

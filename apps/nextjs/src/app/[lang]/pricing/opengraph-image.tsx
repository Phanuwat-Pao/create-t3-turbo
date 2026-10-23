// This page sets its own openGraph in generateMetadata. Next replaces the
// whole openGraph object per segment, image from [lang]/opengraph-image
// included, so the page's folder serves the same card itself.
export { alt, contentType, default, size } from "../opengraph-image";

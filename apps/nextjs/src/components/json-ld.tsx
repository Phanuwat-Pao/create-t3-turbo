interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Emits a schema.org JSON-LD block. `<` is escaped so a value can never
 * close the script tag early; the object is app-authored, not user input.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

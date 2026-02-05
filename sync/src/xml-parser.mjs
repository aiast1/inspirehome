import { XMLParser } from 'fast-xml-parser';

/**
 * Parse the Liberta B2B XML feed into an array of raw product objects.
 */
export function parseXmlFeed(xmlText) {
  const parser = new XMLParser({
    ignoreAttributes: true,
    isArray: (name) => name === 'item' || name === 'product',
    trimValues: true,
  });

  const parsed = parser.parse(xmlText);

  if (!parsed.products || !parsed.products.product) {
    throw new Error('Invalid XML structure: missing <products><product> elements');
  }

  return parsed.products.product;
}

/* global WebImporter */
export default function parse(element, { document }) {
  // 1. Extract the background image (reference the <img> element)
  const img = element.querySelector('img');
  const imageCell = img ? img : '';

  // 2. Extract the hero content (headline, description, CTA)
  let contentCell = '';
  const copy = element.querySelector('.hero-image__copy');
  if (copy) {
    // Reference the actual copy element (do not clone)
    contentCell = copy;
  } else {
    // Fallback: collect all headings, paragraphs, and links
    const frag = document.createElement('div');
    const candidates = element.querySelectorAll('h1, h2, h3, p, a');
    candidates.forEach((el) => frag.appendChild(el));
    contentCell = frag.childNodes.length ? frag : '';
  }

  // 3. Compose the table rows
  const headerRow = ['Hero (hero2)'];
  const imageRow = [imageCell];
  const contentRow = [contentCell];

  // 4. Create the table with correct block name and structure
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    imageRow,
    contentRow,
  ], document);

  // 5. Replace the element with the new table
  element.replaceWith(table);
}

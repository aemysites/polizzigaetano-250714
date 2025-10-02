/* global WebImporter */
export default function parse(element, { document }) {
  // Header row: always use the block name as per requirements
  const headerRow = ['Hero (hero19)'];

  // --- Row 2: Background Image (optional) ---
  // Find the first <img> inside the element (background image)
  const img = element.querySelector('img');
  const bgImageCell = img ? [img] : [''];

  // --- Row 3: Content (title, subheading, description, CTA) ---
  // Find the text content container
  let contentCell = [];
  // The content is inside .hero-image__copy
  const copy = element.querySelector('.hero-image__copy');
  if (copy) {
    // We'll collect the heading and description
    // Heading
    const h1 = copy.querySelector('h1');
    if (h1) contentCell.push(h1);
    // Description (may be split across multiple divs)
    const desc = copy.querySelector('.hero-image__desc');
    if (desc) {
      // Flatten all direct children into the cell
      Array.from(desc.children).forEach((child) => {
        if (child.textContent.trim()) contentCell.push(child);
      });
    }
  }
  if (contentCell.length === 0) contentCell = [''];

  // Compose the table rows
  const rows = [
    headerRow,
    [bgImageCell],
    [contentCell],
  ];

  // Create the block table
  const table = WebImporter.DOMUtils.createTable(rows, document);
  // Replace the original element
  element.replaceWith(table);
}

/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the block name as header
  const headerRow = ['Cards (cards13)'];
  const rows = [headerRow];

  // Extract all text content from the element (including descendants)
  const allText = element.textContent.trim();
  if (allText) {
    // Only one column for no images variant
    rows.push([allText]);
  }

  // Replace original element with the block table
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}

/* global WebImporter */
export default function parse(element, { document }) {
  // Extract all text content from the grid cell or its descendants
  const cell = element.querySelector('.grid__cell');
  let content = '';
  if (cell && typeof cell.innerText === 'string') {
    // Collect all text from descendants (not just direct children)
    content = cell.innerText.trim();
  }

  // Table structure: 1 column, 3 rows
  const headerRow = ['Hero (hero18)'];
  const imageRow = ['']; // No image in source HTML
  const contentRow = [content];

  const cells = [
    headerRow,
    imageRow,
    contentRow
  ];

  const block = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(block);
}

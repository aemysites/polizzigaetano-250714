/* global WebImporter */
export default function parse(element, { document }) {
  // Header row as required
  const headerRow = ['Columns (columns14)'];

  // Defensive: Find the grid container (2 columns)
  const grid = element.querySelector('.grid');
  let columnsRow = [];

  if (grid) {
    // Get all grid__cell children (each is a column)
    const cells = Array.from(grid.querySelectorAll(':scope > .grid__cell'));
    columnsRow = cells.map(cell => {
      // We'll collect all top-level children of the cell for the column content
      // (excluding any style-only wrappers)
      // This will include image-gallery, headings, paragraphs, links, etc.
      return Array.from(cell.childNodes).filter(node => {
        // Only include element nodes and non-empty text nodes
        return (node.nodeType === 1) || (node.nodeType === 3 && node.textContent.trim());
      });
    });
  }

  // Only build the table if we have columns
  if (columnsRow.length > 0) {
    const table = WebImporter.DOMUtils.createTable([
      headerRow,
      columnsRow
    ], document);
    element.replaceWith(table);
  }
}

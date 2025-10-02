/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the required block name as the header row
  const headerRow = ['Columns (columns15)'];

  // Get all immediate child grid__cell elements (columns)
  const columns = Array.from(element.querySelectorAll(':scope > .grid__cell'));

  // Defensive: if no columns found, fallback to all direct children
  const cells = columns.length > 0 ? columns : Array.from(element.children);

  // For each cell, collect its children as an array (to preserve structure and buttons)
  const contentRow = cells.map(cell => {
    // If the cell has more than one child, return all as an array
    const children = Array.from(cell.childNodes).filter(n => {
      // Filter out empty text nodes
      return !(n.nodeType === Node.TEXT_NODE && !n.textContent.trim());
    });
    if (children.length === 1) {
      return children[0];
    }
    return children;
  });

  // Build the table
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    contentRow
  ], document);

  // Replace the original element
  element.replaceWith(table);
}

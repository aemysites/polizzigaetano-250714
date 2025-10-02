/* global WebImporter */
export default function parse(element, { document }) {
  // Find the grid containing columns
  const grid = element.querySelector('.grid');
  let columns = [];
  if (grid) {
    columns = Array.from(grid.children).filter((child) => child.classList.contains('grid__cell'));
  }

  // Fallback: If no grid/cells found, try layout__column
  if (columns.length === 0) {
    const layoutColumn = element.querySelector('.layout__column');
    if (layoutColumn) {
      columns = Array.from(layoutColumn.children);
    }
  }

  // Fallback: If still nothing, use direct children
  if (columns.length === 0) {
    columns = Array.from(element.children);
  }

  // Build table: header row must match block name exactly
  const headerRow = ['Columns (columns10)'];
  // Each cell is the referenced DOM node for that column
  const columnsRow = columns.map((col) => col);

  // Create the table
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    columnsRow,
  ], document);

  // Replace the element with the table
  element.replaceWith(table);
}

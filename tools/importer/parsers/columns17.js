/* global WebImporter */
export default function parse(element, { document }) {
  // Helper: get direct children of a given element by selector
  function getDirectChildren(parent, selector) {
    return Array.from(parent.querySelectorAll(':scope > ' + selector));
  }

  // Find the two main columns
  // The structure is: .row > .layout-container > .layout > .layout__column > .grid > .grid__cell (x2)
  // Defensive: find the first .grid inside the block
  const grid = element.querySelector('.grid');
  if (!grid) return;
  const cells = getDirectChildren(grid, 'div.grid__cell');
  if (cells.length < 2) return;

  // HEADER ROW
  const headerRow = ['Columns (columns17)'];

  // COLUMN ROW
  // Left column: everything in firstCell
  // Right column: everything in secondCell
  const columnRow = [cells[0], cells[1]];

  // Build table
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    columnRow
  ], document);

  // Replace original element
  element.replaceWith(table);
}

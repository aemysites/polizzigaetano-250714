/* global WebImporter */
export default function parse(element, { document }) {
  // Header row for the block
  const headerRow = ['Columns (columns11)'];

  // Get immediate children (columns)
  const columns = Array.from(element.querySelectorAll(':scope > div'));

  // Defensive: Only proceed if there are at least two columns
  if (columns.length < 2) return;

  // Prepare the second row: each cell is a column's content
  // For resilience, grab the entire column content for each cell
  const secondRow = columns.map((col) => {
    // If the column only has one child, use it directly
    if (col.children.length === 1) {
      return col.firstElementChild;
    }
    // Otherwise, collect all children into a fragment
    const frag = document.createDocumentFragment();
    Array.from(col.childNodes).forEach((node) => {
      frag.appendChild(node);
    });
    return frag;
  });

  // Build the table rows
  const cells = [headerRow, secondRow];

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(cells, document);

  // Replace the original element
  element.replaceWith(block);
}

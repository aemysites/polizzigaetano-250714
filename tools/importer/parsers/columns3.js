/* global WebImporter */
export default function parse(element, { document }) {
  // Header row as specified
  const headerRow = ['Columns (columns3)'];

  // Get all direct grid__cell children (columns)
  const cells = Array.from(element.querySelectorAll(':scope > .grid__cell'));

  // Defensive: if no grid__cell found, fallback to all direct children
  const columnEls = cells.length ? cells : Array.from(element.children);

  // For each column, collect its full content as a cell
  const contentRow = columnEls.map((col) => {
    // For resilience, collect all children (images, text, buttons, etc.)
    // Remove data-hlx-imp-color attributes for cleanliness
    col.querySelectorAll('[data-hlx-imp-color]').forEach((el) => {
      el.removeAttribute('data-hlx-imp-color');
    });
    // Remove unnecessary <center> wrappers but keep their content
    const centers = col.querySelectorAll('center');
    centers.forEach(center => {
      while (center.firstChild) {
        center.parentNode.insertBefore(center.firstChild, center);
      }
      center.remove();
    });
    // Return all children as an array (so createTable appends them)
    return Array.from(col.childNodes).filter(node => {
      // Remove empty text nodes
      return !(node.nodeType === Node.TEXT_NODE && !node.textContent.trim());
    });
  });

  // Build the table
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    contentRow,
  ], document);

  // Replace the original element
  element.replaceWith(table);
}

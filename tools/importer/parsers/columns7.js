/* global WebImporter */
export default function parse(element, { document }) {
  // Defensive: get all immediate children (should be span and form)
  const children = Array.from(element.children);

  // Find heading (span) and form
  let heading = null;
  let form = null;
  children.forEach((child) => {
    if (child.classList.contains('location-finder__heading')) {
      heading = child;
    } else if (child.tagName === 'FORM') {
      form = child;
    }
  });

  // Column 1: heading
  // Column 2: form
  // This matches the visual layout: left = heading, right = form
  const headerRow = ['Columns (columns7)'];
  const columnsRow = [heading, form];

  // Build table
  const cells = [headerRow, columnsRow];
  const block = WebImporter.DOMUtils.createTable(cells, document);

  // Replace element with block
  element.replaceWith(block);
}

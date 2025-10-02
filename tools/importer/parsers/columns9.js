/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the required header row
  const headerRow = ['Columns (columns9)'];

  // Get all immediate grid__cell children (the columns)
  const cells = Array.from(element.querySelectorAll(':scope > .grid__cell'));

  // Defensive: if no columns found, do nothing
  if (!cells.length) return;

  // For each cell, extract its main content (image + text)
  const contentCells = cells.map(cell => {
    // We'll collect the image (if any) and the main text (centered)
    const parts = [];

    // Find the image (inside .image-gallery__hero img)
    const img = cell.querySelector('.image-gallery__hero img');
    if (img) parts.push(img);

    // Find the main text (usually inside a <center> or .cms-textAlign-center)
    let textBlock = cell.querySelector('center');
    if (!textBlock) {
      // Sometimes inside a div.cms-textAlign-center > center
      const centerDiv = cell.querySelector('.cms-textAlign-center center');
      if (centerDiv) textBlock = centerDiv;
    }
    if (textBlock) {
      parts.push(textBlock);
    }

    // Defensive: If nothing found, fallback to all text content
    if (!parts.length) {
      // Try to grab all text nodes
      const fallback = document.createElement('div');
      fallback.innerHTML = cell.innerHTML;
      parts.push(fallback);
    }

    // Return as a single cell (array of elements)
    return parts;
  });

  // Build the table rows: header, then one row with all columns
  const tableRows = [
    headerRow,
    contentCells
  ];

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(tableRows, document);

  // Replace the original element with the new block
  element.replaceWith(block);
}

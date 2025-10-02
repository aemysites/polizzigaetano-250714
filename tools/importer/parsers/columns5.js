/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the block name as the header row
  const headerRow = ['Columns (columns5)'];

  // Get both columns (form and phone)
  const columns = [
    element.querySelector('.contact-us__intro-form'),
    element.querySelector('.contact-us__intro-phone'),
  ];

  // Defensive: if either column is missing, use empty cell
  const contentRow = columns.map((col) => col || document.createElement('div'));

  // Build the table rows
  const rows = [headerRow, contentRow];

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element with the block table
  element.replaceWith(block);
}

/* global WebImporter */
export default function parse(element, { document }) {
  // Header row as per block requirements
  const headerRow = ['Hero (hero8)'];

  // --- Row 2: Background Image (optional) ---
  // Try to find an <img> inside the hero-image div
  let bgImg = element.querySelector('img');
  let bgImgCell = '';
  if (bgImg) {
    bgImgCell = bgImg;
  }

  // --- Row 3: Content (title, subheading, CTA, etc.) ---
  // Find the copy container
  let contentContainer = element.querySelector('.hero-image__copy');
  let contentCell = '';
  if (contentContainer) {
    // Collect main heading (h1)
    const h1 = contentContainer.querySelector('h1');

    // Collect description (div.hero-image__desc)
    const desc = contentContainer.querySelector('.hero-image__desc');

    // Collect primary CTA (button link)
    let cta = desc ? desc.querySelector('a.button') : null;
    // Remove the CTA from desc if present so it's not duplicated
    if (cta && cta.parentNode === desc) {
      desc.removeChild(cta);
    }

    // Collect secondary CTA (Enquire now)
    let secondaryCTA = element.querySelector('.hero-image__button a.button');

    // Build an array of content
    let contentArr = [];
    if (h1) contentArr.push(h1);
    if (desc) contentArr.push(desc);
    if (cta) contentArr.push(cta);
    if (secondaryCTA) contentArr.push(secondaryCTA);

    contentCell = contentArr;
  }

  // Build the table rows
  const rows = [
    headerRow,
    [bgImgCell],
    [contentCell],
  ];

  // Create the block table
  const table = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element
  element.replaceWith(table);
}

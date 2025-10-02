/* global WebImporter */
export default function parse(element, { document }) {
  // Table header as required
  const headerRow = ['Cards (cardsNoImages20)'];
  const rows = [headerRow];

  // Get all direct card links (each card is an <a> tag)
  const cardLinks = element.querySelectorAll(':scope > .promo-tiles__inner > a.promo-tiles__tile');

  cardLinks.forEach((card) => {
    // Defensive: get inner container
    const inner = card.querySelector('.promo-tiles__tile-inner') || card;
    
    // Heading (optional)
    const heading = inner.querySelector('.promo-tiles__heading');
    // Description (optional)
    const intro = inner.querySelector('.promo-tiles__intro');
    // CTA (optional)
    const cta = inner.querySelector('.promo-tiles__link');

    // Build card cell content
    const cellContent = [];
    if (heading) cellContent.push(heading);
    if (intro) cellContent.push(intro);
    if (cta) {
      // Wrap CTA in a link with the card's href
      const ctaLink = document.createElement('a');
      ctaLink.href = card.href;
      ctaLink.innerHTML = cta.innerHTML;
      cellContent.push(ctaLink);
    }
    rows.push([cellContent]);
  });

  // Create table and replace original element
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}

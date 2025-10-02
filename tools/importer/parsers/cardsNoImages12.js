/* global WebImporter */
export default function parse(element, { document }) {
  // Header row as per block requirements
  const headerRow = ['Cards (cardsNoImages12)'];
  const rows = [headerRow];

  // Find the card group (grid)
  const cardGroup = element.querySelector('.card-group, .grid');
  if (!cardGroup) {
    // Defensive: if not found, do nothing
    return;
  }

  // Get all cards
  const cardCells = cardGroup.querySelectorAll('.grid__cell');
  cardCells.forEach(cell => {
    const card = cell.querySelector('.card');
    if (!card) return;
    const link = card.querySelector('a.card__link');
    let heading = null;
    let description = null;
    let cta = null;
    if (link) {
      // Heading (optional)
      const h3 = link.querySelector('.card__heading');
      if (h3) {
        // Remove icon if present
        const icon = h3.querySelector('.card__icon');
        if (icon) icon.remove();
        heading = document.createElement('strong');
        heading.textContent = h3.textContent.trim();
      }
      // Description (optional)
      const desc = link.querySelector('.card__description');
      if (desc) {
        // Use the paragraph(s) as is
        description = Array.from(desc.childNodes).filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())).map(n => n.cloneNode(true));
      }
      // CTA (optional): if the card link is not wrapping the whole card, but here it is, so no separate CTA
      // But for semantic, if the link is the card, we can add a CTA at the bottom with the heading text
      if (link.href && h3) {
        cta = document.createElement('a');
        cta.href = link.href;
        cta.textContent = h3.textContent.trim();
      }
    }
    // Compose cell content
    const cellContent = [];
    if (heading) cellContent.push(heading);
    if (description && description.length) {
      cellContent.push(document.createElement('br'));
      cellContent.push(...description);
    }
    if (cta) {
      cellContent.push(document.createElement('br'));
      cellContent.push(cta);
    }
    rows.push([cellContent]);
  });

  // Create the table and replace the original element
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}

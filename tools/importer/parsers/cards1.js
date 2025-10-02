/* global WebImporter */
export default function parse(element, { document }) {
  // Helper to extract card info from a promo-tiles__tile element
  function extractCard(tile) {
    // Find image (if present)
    const img = tile.querySelector('img');
    // Find heading
    const heading = tile.querySelector('.promo-tiles__heading');
    // Find description (if present)
    let description = tile.querySelector('.promo-tiles__intro');
    // Some tiles don't have .promo-tiles__intro, so fallback to null
    // Find link text (call-to-action)
    const linkText = tile.querySelector('.promo-tiles__link');
    // The tile itself is a link
    const href = tile.getAttribute('href');
    // Compose text cell
    const textCell = document.createElement('div');
    if (heading) {
      const h = document.createElement('strong');
      h.textContent = heading.textContent;
      textCell.appendChild(h);
    }
    if (description && description.textContent.trim()) {
      const p = document.createElement('div');
      p.textContent = description.textContent.trim();
      textCell.appendChild(p);
    }
    // If no description, use nothing
    // Add CTA as link at bottom if present
    if (linkText && href) {
      const cta = document.createElement('a');
      cta.href = href;
      cta.textContent = linkText.textContent;
      textCell.appendChild(document.createElement('br'));
      textCell.appendChild(cta);
    }
    return [img || '', textCell];
  }

  // Get all card tiles
  const inner = element.querySelector('.promo-tiles__inner');
  if (!inner) return;
  const tiles = Array.from(inner.querySelectorAll('.promo-tiles__tile'));
  // Compose table rows
  const rows = [];
  // Header row
  rows.push(['Cards (cards1)']);
  // Card rows
  tiles.forEach(tile => {
    rows.push(extractCard(tile));
  });
  // Create block table
  const block = WebImporter.DOMUtils.createTable(rows, document);
  // Replace element
  element.replaceWith(block);
}

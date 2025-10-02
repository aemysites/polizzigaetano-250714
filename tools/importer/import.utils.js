/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */

function isHidden(el, window) {
  if (!el || !window) {
    return false;
  }
  return /none/i.test(window.getComputedStyle(el)?.display.trim() || '')
    || /hidden/i.test(window.getComputedStyle(el)?.visibility.trim() || '');
}

/**
 * Wrapper function to extract and validate window object
 * @param {Object} params - Parameters object containing window parameter
 * @returns {Object|null} Object with window and other parameters, or null if window is invalid
 */
function withWindow({ window: windowObj, ...rest }) {
  // Use provided window object or fall back to global window (browser environment)
  const globalWindow = windowObj || (typeof window !== 'undefined' ? window : null);
  if (!globalWindow) {
    console.warn('Window object is required to process element markers');
    return null;
  }
  return { window: globalWindow, ...rest };
}

/**
 * Mark hidden elements
 */
export function addHiddenMarkers(params) {
  const { window: globalWindow, body } = withWindow(params);
  if (!globalWindow || !body) {
    return;
  }
  body.querySelectorAll('*').forEach((el) => {
    if (isHidden(el, globalWindow)) {
      el.setAttribute('data-hlx-imp-hidden-div', '');
    }
  });
}

/**
 * Add bounding client rect, background image, and color data to all "visible" divs
 */
export function addStyleMarkers(params) {
  const { window: globalWindow, body } = withWindow(params);
  if (!globalWindow || !body) {
    return;
  }
  body.querySelectorAll('div').forEach((div) => {
    try {
      if (div && !isHidden(div, globalWindow)) {
        let domRect = div.getBoundingClientRect();
        domRect = 'toJSON' in domRect ? domRect.toJSON() : domRect;
        if (Math.round(domRect.width) > 0 && Math.round(domRect.height) > 0) {
          div.setAttribute('data-hlx-imp-rect', JSON.stringify(domRect));
        }
        const bgImage = globalWindow.getComputedStyle(div)?.getPropertyValue('background-image');
        if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
          div.setAttribute('data-hlx-background-image', bgImage);
        }
        const bgColor = globalWindow.getComputedStyle(div)?.getPropertyValue('background-color');
        if (bgColor && bgColor !== 'rgb(0, 0, 0)' && bgColor !== 'rgba(0, 0, 0, 0)') {
          div.setAttribute('data-hlx-imp-bgcolor', bgColor);
        }
        const color = globalWindow.getComputedStyle(div)?.getPropertyValue('color');
        if (color && color !== 'rgb(0, 0, 0)') {
          div.setAttribute('data-hlx-imp-color', color);
        }
      }
    } catch (error) {
      console.error('[Import] error adding style markers to div', error);
    }
  });
}

export async function handleOnLoad({ document }) {
  // send 'esc' keydown event to close the dialog
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      altKey: false,
      code: 'Escape',
      ctrlKey: false,
      isComposing: false,
      key: 'Escape',
      location: 0,
      metaKey: false,
      repeat: false,
      shiftKey: false,
      which: 27,
      charCode: 0,
      keyCode: 27,
    }),
  );
  document.elementFromPoint(0, 0)?.click();

  const body = document.body || document.documentElement;

  // add element markers
  addHiddenMarkers({ body });
  addStyleMarkers({ body });

  // add body width
  const bodyWidth = body.getBoundingClientRect()?.width;
  body.setAttribute('data-hlx-imp-body-width', bodyWidth);
}

/**
 * Generate document path
 * @param {string} url
 * @returns {string}
*/
export function generateDocumentPath({ params: { originalURL } }, inventory) {
  let p;
  const urlEntry = inventory.urls?.find(({ url }) => url === originalURL);
  if (urlEntry?.targetPath) {
    p = urlEntry.targetPath === '/' ? '/index' : urlEntry.targetPath;
  } else {
    // fallback to original URL pathname
    p = new URL(originalURL).pathname;
    if (p.endsWith('/')) {
      p = `${p}index`;
    }
    p = decodeURIComponent(p)
      .toLowerCase()
      .replace(/\.html$/, '')
      .replace(/[^a-z0-9/]/gm, '-');
  }
  return WebImporter.FileUtils.sanitizePath(p);
}

function reduceInstances(instances = []) {
  return instances.map(({
    urlHash,
    xpath,
    uuid,
    section,
  }) => ({
    urlHash,
    xpath,
    uuid,
    section,
  }));
}

/**
 * Merges site-urls into inventory with an optimized format
 * @param {Object} siteUrls - The contents of site-urls.json
 * @param {Object} inventory - The contents of inventory.json
 * @param {string} publishUrl - The publish URL to use if targetUrl is not provided
 * @returns {Object} The merged inventory data in the new format
 */
export function mergeInventory(siteUrls, inventory, publishUrl) {
  // Extract originUrl and targetUrl from siteUrls
  const { originUrl, targetUrl } = siteUrls;

  // Transform URLs array to filter out excluded URLs and remove source property
  const urls = siteUrls.urls
    .filter(({ status }) => status !== 'EXCLUDED')
    .map(({ url, targetPath, id }) => ({
      url,
      targetPath,
      id,
    }));

  // Transform fragments to use simplified instance format
  const fragments = inventory.fragments.map((fragment) => ({
    ...fragment,
    instances: reduceInstances(fragment.instances),
  }));

  // Transform blocks to use simplified instance format
  const blocks = inventory.blocks.map((block) => ({
    ...block,
    instances: reduceInstances(block.instances),
  }));

  // Transform outliers to use simplified instance format
  const outliers = reduceInstances(inventory.outliers);

  return {
    originUrl,
    targetUrl: targetUrl || publishUrl,
    urls,
    fragments,
    sections: inventory.sections,
    blocks,
    outliers,
  };
}

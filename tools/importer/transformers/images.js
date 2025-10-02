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

import { TransformHook } from './transform.js';

function extractUrlFromBackgroundImage(backgroundImage) {
  if (!backgroundImage || backgroundImage.toLowerCase() === 'none') {
    return null;
  }

  // Handle both inline styles and computed styles
  const urlMatch = backgroundImage.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  return urlMatch ? urlMatch[1] : null;
}

function createImageFromUrl(src, document) {
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  return img;
}

function processElementWithBackgroundImage(element, document, backgroundImage) {
  const src = extractUrlFromBackgroundImage(backgroundImage);
  if (!src) return false;

  const img = createImageFromUrl(src, document);
  if (img) {
    element.prepend(img);
    element.style.backgroundImage = 'none';
    return true;
  }
  return false;
}

// Unified function to get background image from any source
function getBackgroundImageFromElement(element) {
  // First check inline styles
  const inlineStyle = element.getAttribute('style');
  if (inlineStyle) {
    const styleParts = inlineStyle.split(';');
    for (const style of styleParts) {
      const [prop, ...valueParts] = style.split(':');
      if (prop?.trim() === 'background-image') {
        const value = valueParts.join(':').trim();
        return value;
      }
    }
  }

  // Fall back to data-hlx-background-image attribute
  return element.getAttribute('data-hlx-background-image');
}

/**
 * Extracts the image URL from a picture element sources
 * @param {HTMLElement} pictureElement - The picture element
 * @returns {string|null} The URL for the largest viewport image, or null if not found
 */
function extractPictureSource(pictureElement) {
  const sources = pictureElement.querySelectorAll('source');

  if (sources.length === 0) {
    return null;
  }

  // Find the source with the largest max-width
  let largestSource = null;
  let largestMaxWidth = -1;

  for (const source of sources) {
    const mediaQuery = source.getAttribute('media');
    if (!mediaQuery) {
      // No media query means it's the largest
      largestSource = source;
      break;
    }

    const match = mediaQuery.match(/max-width:\s*(\d+)px/);
    if (match) {
      const maxWidth = parseInt(match[1], 10);
      if (maxWidth > largestMaxWidth) {
        largestMaxWidth = maxWidth;
        largestSource = source;
      }
    }
  }

  // If no source with max-width found, use the last source
  if (!largestSource) {
    largestSource = sources[sources.length - 1];
  }

  // Extract the first URL from the srcset
  if (largestSource) {
    const srcset = largestSource.getAttribute('srcset');
    if (srcset) {
      const firstUrl = srcset.split(',')[0].trim().split(/\s+/)[0];
      if (firstUrl) {
        return firstUrl;
      }
    }
  }
  return null;
}

function transformBackgroundImages(main, document) {
  // Process all elements that might have background images
  const inlineElements = main.querySelectorAll('[style*="background-image: url"], [data-hlx-background-image]');
  inlineElements.forEach((element) => {
    const backgroundImage = getBackgroundImageFromElement(element);
    if (backgroundImage) {
      processElementWithBackgroundImage(element, document, backgroundImage);
    }
  });
}

/**
 * Ensure every picture element has an img element with a src attribute
 */
function adjustPictureImages(main) {
  const pictures = main.querySelectorAll('picture');
  pictures.forEach((picture) => {
    const img = picture.querySelector('img');
    if (!img || !img.src) {
      const newImg = picture.ownerDocument.createElement('img');
      newImg.src = extractPictureSource(picture);
      if (img) {
        img.replaceWith(newImg);
      } else {
        picture.appendChild(newImg);
      }
    }
  });
}

/**
 * Adjust the src attribute of all img elements to be relative to the original URL
 */
function adjustImageUrls(main, url, current) {
  [...main.querySelectorAll('img')].forEach((img) => {
    let src = img.getAttribute('src');
    // fix image with only srcset attribute (not supported in helix-importer)
    const srcset = img.getAttribute('srcset')?.split(' ')[0];
    if (!src && srcset) {
      img.setAttribute('src', srcset);
    }
    src = img.getAttribute('src');
    if (src) {
      // handle relative URLs that are not starting with ./ or / or ../
      try {
        /* eslint-disable no-new */
        new URL(src);
      } catch (e) {
        if (!src.startsWith('/')) {
          // enforce transform image url to relative url
          src = `./${src}`;
        }
      }

      try {
        if (url && (src.startsWith('./') || src.startsWith('/') || src.startsWith('../'))) {
          // transform relative URLs to absolute URLs
          const targetUrl = new URL(src, url);
          // eslint-disable-next-line no-param-reassign
          img.src = targetUrl.toString();
        } else if (current) {
          // also transform absolute URLs to current host
          const currentSrc = new URL(src);
          const currentUrl = new URL(current);
          if (currentSrc.host === currentUrl.host) {
            // if current host is same than src host, switch src host with url host
            // this is the case for absolutes URLs pointing to the same host
            const targetUrl = new URL(url);
            const newSrc = new URL(`${currentSrc.pathname}${currentSrc.search}${currentSrc.hash}`, `${targetUrl.protocol}//${targetUrl.host}`);
            // eslint-disable-next-line no-param-reassign
            img.src = newSrc.toString();
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(`Unable to adjust image URL ${img.src} - removing image`);
        img.remove();
      }
    }
  });
}

function transformSvgsToPng(main) {
  const svgs = main.querySelectorAll('svg');
  svgs.forEach((svg) => {
    // Manually construct SVG string to ensure valid XML output
    let svgString = '<svg';

    // Add all attributes
    for (const attr of svg.attributes) {
      svgString += ` ${attr.name}="${attr.value}"`;
    }
    svgString += '>';

    // Add inner content
    svgString += svg.innerHTML;
    svgString += '</svg>';

    // Create data URL with proper UTF-8 encoding
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    const img = svg.ownerDocument.createElement('img');
    img.src = svgDataUrl;
    svg.replaceWith(img);
  });
}

export default function transform(hookName, element, { document, url, originalURL }) {
  if (hookName === TransformHook.beforeTransform) {
    // adjust background images
    transformBackgroundImages(element, document);
    // adjust picture images
    adjustPictureImages(element);
    // adjust image urls
    adjustImageUrls(element, url, originalURL);
    // transform svgs to pngs
    transformSvgsToPng(element);
  }
}

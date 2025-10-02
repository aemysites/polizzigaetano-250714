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

/**
 * Transformation hooks are executed during an import lifecycle.
 * Transformation functions can be used to perform additional transformations to the page.
 *
 * Function Signature:
 *
 * (hookName, element, payload) => {
 *   // transform the element
 * }
 */
export const TransformHook = Object.freeze({
  // Before import transformation begins (be careful to not break block xpaths when using this hook)
  beforeTransform: 'beforeTransform',
  // Before page transformation begins and after xpaths are evaluated
  beforePageTransform: 'beforePageTransform',
  // Before each block parsing begins
  beforeParse: 'beforeParse',
  // After each block parsing completes
  afterParse: 'afterParse',
  // After import transformation completes
  afterTransform: 'afterTransform',
});

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

             
                 
                  
                     
                           
                      
                       
                             
                                            

import {enableFloat} from 'shared/ReactFeatureFlags';

import {
  emitHint,
  getHints,
  resolveRequest,
} from 'react-server/src/ReactFlightServer';

export const ReactDOMFlightServerDispatcher                 = {
  prefetchDNS,
  preconnect,
  preload,
  preloadModule,
  preinitStyle,
  preinitScript,
  preinitModuleScript,
};

function prefetchDNS(href        ) {
  if (enableFloat) {
    if (typeof href === 'string' && href) {
      const request = resolveRequest();
      if (request) {
        const hints = getHints(request);
        const key = 'D|' + href;
        if (hints.has(key)) {
          // duplicate hint
          return;
        }
        hints.add(key);
        emitHint(request, 'D', href);
      }
    }
  }
}

function preconnect(href        , crossOrigin                   ) {
  if (enableFloat) {
    if (typeof href === 'string') {
      const request = resolveRequest();
      if (request) {
        const hints = getHints(request);

        const key = `C|${crossOrigin == null ? 'null' : crossOrigin}|${href}`;
        if (hints.has(key)) {
          // duplicate hint
          return;
        }
        hints.add(key);
        if (typeof crossOrigin === 'string') {
          emitHint(request, 'C', [href, crossOrigin]);
        } else {
          emitHint(request, 'C', href);
        }
      }
    }
  }
}

function preload(href        , as        , options                      ) {
  if (enableFloat) {
    if (typeof href === 'string') {
      const request = resolveRequest();
      if (request) {
        const hints = getHints(request);
        let key = 'L';
        if (as === 'image' && options) {
          key += getImagePreloadKey(
            href,
            options.imageSrcSet,
            options.imageSizes,
          );
        } else {
          key += `[${as}]${href}`;
        }
        if (hints.has(key)) {
          // duplicate hint
          return;
        }
        hints.add(key);

        const trimmed = trimOptions(options);
        if (trimmed) {
          emitHint(request, 'L', [href, as, trimmed]);
        } else {
          emitHint(request, 'L', [href, as]);
        }
      }
    }
  }
}

function preloadModule(href        , options                            ) {
  if (enableFloat) {
    if (typeof href === 'string') {
      const request = resolveRequest();
      if (request) {
        const hints = getHints(request);
        const key = 'm|' + href;
        if (hints.has(key)) {
          // duplicate hint
          return;
        }
        hints.add(key);

        const trimmed = trimOptions(options);
        if (trimmed) {
          return emitHint(request, 'm', [href, trimmed]);
        } else {
          return emitHint(request, 'm', href);
        }
      }
    }
  }
}

function preinitStyle(
  href        ,
  precedence         ,
  options                       ,
) {
  if (enableFloat) {
    if (typeof href === 'string') {
      const request = resolveRequest();
      if (request) {
        const hints = getHints(request);
        const key = 'S|' + href;
        if (hints.has(key)) {
          // duplicate hint
          return;
        }
        hints.add(key);

        const trimmed = trimOptions(options);
        if (trimmed) {
          return emitHint(request, 'S', [
            href,
            typeof precedence === 'string' ? precedence : 0,
            trimmed,
          ]);
        } else if (typeof precedence === 'string') {
          return emitHint(request, 'S', [href, precedence]);
        } else {
          return emitHint(request, 'S', href);
        }
      }
    }
  }
}

function preinitScript(href        , options                        ) {
  if (enableFloat) {
    if (typeof href === 'string') {
      const request = resolveRequest();
      if (request) {
        const hints = getHints(request);
        const key = 'X|' + href;
        if (hints.has(key)) {
          // duplicate hint
          return;
        }
        hints.add(key);

        const trimmed = trimOptions(options);
        if (trimmed) {
          return emitHint(request, 'X', [href, trimmed]);
        } else {
          return emitHint(request, 'X', href);
        }
      }
    }
  }
}

function preinitModuleScript(
  href        ,
  options                              ,
) {
  if (enableFloat) {
    if (typeof href === 'string') {
      const request = resolveRequest();
      if (request) {
        const hints = getHints(request);
        const key = 'M|' + href;
        if (hints.has(key)) {
          // duplicate hint
          return;
        }
        hints.add(key);

        const trimmed = trimOptions(options);
        if (trimmed) {
          return emitHint(request, 'M', [href, trimmed]);
        } else {
          return emitHint(request, 'M', href);
        }
      }
    }
  }
}

// Flight normally encodes undefined as a special character however for directive option
// arguments we don't want to send unnecessary keys and bloat the payload so we create a
// trimmed object which omits any keys with null or undefined values.
// This is only typesafe because these option objects have entirely optional fields where
// null and undefined represent the same thing as no property.
function trimOptions 
    
                        
                              
                         
                          
                                 
 (options    )     {
  if (options == null) return null;
  let hasProperties = false;
  const trimmed    = ({}     );
  for (const key in options) {
    if (options[key] != null) {
      hasProperties = true;
      (trimmed     )[key] = options[key];
    }
  }
  return hasProperties ? trimmed : null;
}

function getImagePreloadKey(
  href        ,
  imageSrcSet         ,
  imageSizes         ,
) {
  let uniquePart = '';
  if (typeof imageSrcSet === 'string' && imageSrcSet !== '') {
    uniquePart += '[' + imageSrcSet + ']';
    if (typeof imageSizes === 'string') {
      uniquePart += '[' + imageSizes + ']';
    }
  } else {
    uniquePart += '[][]' + href;
  }
  return `[image]${uniquePart}`;
}

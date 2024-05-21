/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                                   

                                                                 

             
               
                
                                                  

                    
                          
                               
  

                                     

import {
  createResponse,
  getRoot,
  reportGlobalError,
  processBinaryChunk,
  close,
} from 'react-client/src/ReactFlightClient';

import {createServerReference as createServerReferenceImpl} from 'react-client/src/ReactFlightReplyClient';

function noServerCall() {
  throw new Error(
    'Server Functions cannot be called during initial render. ' +
      'This would create a fetch waterfall. Try to use a Server Component ' +
      'to pass data to Client Components instead.',
  );
}
                       
                 
  

export function createServerReference                     (
  id     ,
  callServer     ,
)                       {
  return createServerReferenceImpl(id, noServerCall);
}

function createFromNodeStream   (
  stream          ,
  ssrManifest             ,
  options          ,
)              {
  const response           = createResponse(
    ssrManifest.moduleMap,
    ssrManifest.moduleLoading,
    noServerCall,
    options && typeof options.nonce === 'string' ? options.nonce : undefined,
  );
  stream.on('data', chunk => {
    processBinaryChunk(response, chunk);
  });
  stream.on('error', error => {
    reportGlobalError(response, error);
  });
  stream.on('end', () => close(response));
  return getRoot(response);
}

export {createFromNodeStream};

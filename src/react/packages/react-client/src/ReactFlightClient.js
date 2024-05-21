/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                                
                                                       

             
                  
                          
               
                
                
                                   

             
           
            
                                                  

                                                                 

                                                      

import {enableBinaryFlight, enablePostpone} from 'shared/ReactFeatureFlags';

import {
  resolveClientReference,
  preloadModule,
  requireModule,
  dispatchHint,
  readPartialStringChunk,
  readFinalStringChunk,
  createStringDecoder,
  prepareDestinationForModule,
} from './ReactFlightClientConfig';

import {registerServerReference} from './ReactFlightReplyClient';

import {
  REACT_LAZY_TYPE,
  REACT_ELEMENT_TYPE,
  REACT_POSTPONE_TYPE,
} from 'shared/ReactSymbols';

import {getOrCreateServerContext} from 'shared/ReactServerContextRegistry';

                                 

                                 

                       
          
        
           
          
                               
                              

const ROW_ID = 0;
const ROW_TAG = 1;
const ROW_LENGTH = 2;
const ROW_CHUNK_BY_NEWLINE = 3;
const ROW_CHUNK_BY_LENGTH = 4;

                                        

const PENDING = 'pending';
const BLOCKED = 'blocked';
const CYCLIC = 'cyclic';
const RESOLVED_MODEL = 'resolved_model';
const RESOLVED_MODULE = 'resolved_module';
const INITIALIZED = 'fulfilled';
const ERRORED = 'rejected';

                        
                    
                                    
                                         
                      
                                                              
  
                        
                    
                                    
                                         
                      
                                                              
  
                       
                   
                                    
                                         
                      
                                                              
  
                              
                           
                            
               
                      
                                                              
  
                               
                            
                            
               
                      
                                                              
  
                            
                      
           
               
                      
                                                              
  
                        
                     
              
                
                      
                                                              
  
                   
                   
                   
                  
                         
                          
                       
                    

// $FlowFixMe[missing-this-annot]
function Chunk(status     , value     , reason     , response          ) {
  this.status = status;
  this.value = value;
  this.reason = reason;
  this._response = response;
}
// We subclass Promise.prototype so that we get other methods like .catch
Chunk.prototype = (Object.create(Promise.prototype)     );
// TODO: This doesn't return a new Promise chain unlike the real .then
Chunk.prototype.then = function <T>(
                         resolve: (value: T) => mixed,
  reject: (reason: mixed) => mixed,
) {
  const chunk: SomeChunk<T> = this;
  // If we have resolved content, we try to initialize it first which
  // might put us back into one of the other states.
  switch (chunk.status) {
    case RESOLVED_MODEL:
      initializeModelChunk(chunk);
      break;
    case RESOLVED_MODULE:
      initializeModuleChunk(chunk);
      break;
  }
  // The status might have changed after initialization.
  switch (chunk.status) {
    case INITIALIZED:
      resolve(chunk.value);
      break;
    case PENDING:
    case BLOCKED:
    case CYCLIC:
      if (resolve) {
        if (chunk.value === null) {
          chunk.value = ([]: Array<(T) => mixed>);
        }
        chunk.value.push(resolve);
      }
      if (reject) {
        if (chunk.reason === null) {
          chunk.reason = ([]: Array<(mixed) => mixed>);
        }
        chunk.reason.push(reject);
      }
      break;
    default:
      reject(chunk.reason);
      break;
  }
};

                        
                               
                                
                                  
                  
                                       
                                                    
                                
                            
                                                    
                                                                         
                                                                                                  
                                                                           
  

function readChunk   (chunk              )    {
  // If we have resolved content, we try to initialize it first which
  // might put us back into one of the other states.
  switch (chunk.status) {
    case RESOLVED_MODEL:
      initializeModelChunk(chunk);
      break;
    case RESOLVED_MODULE:
      initializeModuleChunk(chunk);
      break;
  }
  // The status might have changed after initialization.
  switch (chunk.status) {
    case INITIALIZED:
      return chunk.value;
    case PENDING:
    case BLOCKED:
    case CYCLIC:
      // eslint-disable-next-line no-throw-literal
      throw ((chunk     )             );
    default:
      throw chunk.reason;
  }
}

export function getRoot   (response          )              {
  const chunk = getChunk(response, 0);
  return (chunk     );
}

function createPendingChunk   (response          )                  {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(PENDING, null, null, response);
}

function createBlockedChunk   (response          )                  {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(BLOCKED, null, null, response);
}

function createErrorChunk   (
  response          ,
  error                  ,
)                  {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(ERRORED, null, error, response);
}

function wakeChunk   (listeners                     , value   )       {
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    listener(value);
  }
}

function wakeChunkIfInitialized   (
  chunk              ,
  resolveListeners                     ,
  rejectListeners                                ,
)       {
  switch (chunk.status) {
    case INITIALIZED:
      wakeChunk(resolveListeners, chunk.value);
      break;
    case PENDING:
    case BLOCKED:
    case CYCLIC:
      chunk.value = resolveListeners;
      chunk.reason = rejectListeners;
      break;
    case ERRORED:
      if (rejectListeners) {
        wakeChunk(rejectListeners, chunk.reason);
      }
      break;
  }
}

function triggerErrorOnChunk   (chunk              , error       )       {
  if (chunk.status !== PENDING && chunk.status !== BLOCKED) {
    // We already resolved. We didn't expect to see this.
    return;
  }
  const listeners = chunk.reason;
  const erroredChunk                  = (chunk     );
  erroredChunk.status = ERRORED;
  erroredChunk.reason = error;
  if (listeners !== null) {
    wakeChunk(listeners, error);
  }
}

function createResolvedModelChunk   (
  response          ,
  value                    ,
)                        {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(RESOLVED_MODEL, value, null, response);
}

function createResolvedModuleChunk   (
  response          ,
  value                    ,
)                         {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(RESOLVED_MODULE, value, null, response);
}

function createInitializedTextChunk(
  response          ,
  value        ,
)                           {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(INITIALIZED, value, null, response);
}

function createInitializedBufferChunk(
  response          ,
  value                                ,
)                               {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(INITIALIZED, value, null, response);
}

function resolveModelChunk   (
  chunk              ,
  value                    ,
)       {
  if (chunk.status !== PENDING) {
    // We already resolved. We didn't expect to see this.
    return;
  }
  const resolveListeners = chunk.value;
  const rejectListeners = chunk.reason;
  const resolvedChunk                        = (chunk     );
  resolvedChunk.status = RESOLVED_MODEL;
  resolvedChunk.value = value;
  if (resolveListeners !== null) {
    // This is unfortunate that we're reading this eagerly if
    // we already have listeners attached since they might no
    // longer be rendered or might not be the highest pri.
    initializeModelChunk(resolvedChunk);
    // The status might have changed after initialization.
    wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners);
  }
}

function resolveModuleChunk   (
  chunk              ,
  value                    ,
)       {
  if (chunk.status !== PENDING && chunk.status !== BLOCKED) {
    // We already resolved. We didn't expect to see this.
    return;
  }
  const resolveListeners = chunk.value;
  const rejectListeners = chunk.reason;
  const resolvedChunk                         = (chunk     );
  resolvedChunk.status = RESOLVED_MODULE;
  resolvedChunk.value = value;
  if (resolveListeners !== null) {
    initializeModuleChunk(resolvedChunk);
    wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners);
  }
}

let initializingChunk                          = (null     );
let initializingChunkBlockedModel                                    = null;
function initializeModelChunk   (chunk                       )       {
  const prevChunk = initializingChunk;
  const prevBlocked = initializingChunkBlockedModel;
  initializingChunk = chunk;
  initializingChunkBlockedModel = null;

  const resolvedModel = chunk.value;

  // We go to the CYCLIC state until we've fully resolved this.
  // We do this before parsing in case we try to initialize the same chunk
  // while parsing the model. Such as in a cyclic reference.
  const cyclicChunk                 = (chunk     );
  cyclicChunk.status = CYCLIC;
  cyclicChunk.value = null;
  cyclicChunk.reason = null;

  try {
    const value    = parseModel(chunk._response, resolvedModel);
    if (
      initializingChunkBlockedModel !== null &&
      initializingChunkBlockedModel.deps > 0
    ) {
      initializingChunkBlockedModel.value = value;
      // We discovered new dependencies on modules that are not yet resolved.
      // We have to go the BLOCKED state until they're resolved.
      const blockedChunk                  = (chunk     );
      blockedChunk.status = BLOCKED;
      blockedChunk.value = null;
      blockedChunk.reason = null;
    } else {
      const resolveListeners = cyclicChunk.value;
      const initializedChunk                      = (chunk     );
      initializedChunk.status = INITIALIZED;
      initializedChunk.value = value;
      if (resolveListeners !== null) {
        wakeChunk(resolveListeners, value);
      }
    }
  } catch (error) {
    const erroredChunk                  = (chunk     );
    erroredChunk.status = ERRORED;
    erroredChunk.reason = error;
  } finally {
    initializingChunk = prevChunk;
    initializingChunkBlockedModel = prevBlocked;
  }
}

function initializeModuleChunk   (chunk                        )       {
  try {
    const value    = requireModule(chunk.value);
    const initializedChunk                      = (chunk     );
    initializedChunk.status = INITIALIZED;
    initializedChunk.value = value;
  } catch (error) {
    const erroredChunk                  = (chunk     );
    erroredChunk.status = ERRORED;
    erroredChunk.reason = error;
  }
}

// Report that any missing chunks in the model is now going to throw this
// error upon read. Also notify any pending promises.
export function reportGlobalError(response          , error       )       {
  response._chunks.forEach(chunk => {
    // If this chunk was already resolved or errored, it won't
    // trigger an error but if it wasn't then we need to
    // because we won't be getting any new data to resolve it.
    if (chunk.status === PENDING) {
      triggerErrorOnChunk(chunk, error);
    }
  });
}

function createElement(
  type       ,
  key       ,
  props       ,
)                     {
  const element      = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: null,
    props: props,

    // Record the component responsible for creating this element.
    _owner: null,
  };
  if (__DEV__) {
    // We don't really need to add any of these but keeping them for good measure.
    // Unfortunately, _store is enumerable in jest matchers so for equality to
    // work, I need to keep it or make _store non-enumerable in the other file.
    element._store = ({}   
                          
     );
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: true, // This element has already been validated on the server.
    });
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: null,
    });
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: null,
    });
  }
  return element;
}

function createLazyChunkWrapper   (
  chunk              ,
)                                 {
  const lazyType                                 = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: chunk,
    _init: readChunk,
  };
  return lazyType;
}

function getChunk(response          , id        )                 {
  const chunks = response._chunks;
  let chunk = chunks.get(id);
  if (!chunk) {
    chunk = createPendingChunk(response);
    chunks.set(id, chunk);
  }
  return chunk;
}

function createModelResolver   (
  chunk              ,
  parentObject        ,
  key        ,
  cyclic         ,
)                       {
  let blocked;
  if (initializingChunkBlockedModel) {
    blocked = initializingChunkBlockedModel;
    if (!cyclic) {
      blocked.deps++;
    }
  } else {
    blocked = initializingChunkBlockedModel = {
      deps: cyclic ? 0 : 1,
      value: (null     ),
    };
  }
  return value => {
    parentObject[key] = value;
    blocked.deps--;
    if (blocked.deps === 0) {
      if (chunk.status !== BLOCKED) {
        return;
      }
      const resolveListeners = chunk.value;
      const initializedChunk                      = (chunk     );
      initializedChunk.status = INITIALIZED;
      initializedChunk.value = blocked.value;
      if (resolveListeners !== null) {
        wakeChunk(resolveListeners, blocked.value);
      }
    }
  };
}

function createModelReject   (chunk              )                         {
  return (error       ) => triggerErrorOnChunk(chunk, error);
}

function createServerReferenceProxy                     (
  response          ,
  metaData                                               ,
)                       {
  const callServer = response._callServer;
  const proxy = function ()             {
    // $FlowFixMe[method-unbinding]
    const args = Array.prototype.slice.call(arguments);
    const p = metaData.bound;
    if (!p) {
      return callServer(metaData.id, args);
    }
    if (p.status === INITIALIZED) {
      const bound = p.value;
      return callServer(metaData.id, bound.concat(args));
    }
    // Since this is a fake Promise whose .then doesn't chain, we have to wrap it.
    // TODO: Remove the wrapper once that's fixed.
    return ((Promise.resolve(p)     )                     ).then(function (
      bound,
    ) {
      return callServer(metaData.id, bound.concat(args));
    });
  };
  registerServerReference(proxy, metaData);
  return proxy;
}

function getOutlinedModel(response          , id        )      {
  const chunk = getChunk(response, id);
  switch (chunk.status) {
    case RESOLVED_MODEL:
      initializeModelChunk(chunk);
      break;
  }
  // The status might have changed after initialization.
  switch (chunk.status) {
    case INITIALIZED: {
      return chunk.value;
    }
    // We always encode it first in the stream so it won't be pending.
    default:
      throw chunk.reason;
  }
}

function parseModelString(
  response          ,
  parentObject        ,
  key        ,
  value        ,
)      {
  if (value[0] === '$') {
    if (value === '$') {
      // A very common symbol.
      return REACT_ELEMENT_TYPE;
    }
    switch (value[1]) {
      case '$': {
        // This was an escaped string value.
        return value.slice(1);
      }
      case 'L': {
        // Lazy node
        const id = parseInt(value.slice(2), 16);
        const chunk = getChunk(response, id);
        // We create a React.lazy wrapper around any lazy values.
        // When passed into React, we'll know how to suspend on this.
        return createLazyChunkWrapper(chunk);
      }
      case '@': {
        // Promise
        const id = parseInt(value.slice(2), 16);
        const chunk = getChunk(response, id);
        return chunk;
      }
      case 'S': {
        // Symbol
        return Symbol.for(value.slice(2));
      }
      case 'P': {
        // Server Context Provider
        return getOrCreateServerContext(value.slice(2)).Provider;
      }
      case 'F': {
        // Server Reference
        const id = parseInt(value.slice(2), 16);
        const metadata = getOutlinedModel(response, id);
        return createServerReferenceProxy(response, metadata);
      }
      case 'Q': {
        // Map
        const id = parseInt(value.slice(2), 16);
        const data = getOutlinedModel(response, id);
        return new Map(data);
      }
      case 'W': {
        // Set
        const id = parseInt(value.slice(2), 16);
        const data = getOutlinedModel(response, id);
        return new Set(data);
      }
      case 'I': {
        // $Infinity
        return Infinity;
      }
      case '-': {
        // $-0 or $-Infinity
        if (value === '$-0') {
          return -0;
        } else {
          return -Infinity;
        }
      }
      case 'N': {
        // $NaN
        return NaN;
      }
      case 'u': {
        // matches "$undefined"
        // Special encoding for `undefined` which can't be serialized as JSON otherwise.
        return undefined;
      }
      case 'D': {
        // Date
        return new Date(Date.parse(value.slice(2)));
      }
      case 'n': {
        // BigInt
        return BigInt(value.slice(2));
      }
      default: {
        // We assume that anything else is a reference ID.
        const id = parseInt(value.slice(1), 16);
        const chunk = getChunk(response, id);
        switch (chunk.status) {
          case RESOLVED_MODEL:
            initializeModelChunk(chunk);
            break;
          case RESOLVED_MODULE:
            initializeModuleChunk(chunk);
            break;
        }
        // The status might have changed after initialization.
        switch (chunk.status) {
          case INITIALIZED:
            return chunk.value;
          case PENDING:
          case BLOCKED:
          case CYCLIC:
            const parentChunk = initializingChunk;
            chunk.then(
              createModelResolver(
                parentChunk,
                parentObject,
                key,
                chunk.status === CYCLIC,
              ),
              createModelReject(parentChunk),
            );
            return null;
          default:
            throw chunk.reason;
        }
      }
    }
  }
  return value;
}

function parseModelTuple(
  response          ,
  value                                                         ,
)      {
  const tuple                               = (value     );

  if (tuple[0] === REACT_ELEMENT_TYPE) {
    // TODO: Consider having React just directly accept these arrays as elements.
    // Or even change the ReactElement type to be an array.
    return createElement(tuple[1], tuple[2], tuple[3]);
  }
  return value;
}

function missingCall() {
  throw new Error(
    'Trying to call a function from "use server" but the callServer option ' +
      'was not implemented in your router runtime.',
  );
}

export function createResponse(
  bundlerConfig              ,
  moduleLoading               ,
  callServer                           ,
  nonce               ,
)           {
  const chunks                              = new Map();
  const response           = {
    _bundlerConfig: bundlerConfig,
    _moduleLoading: moduleLoading,
    _callServer: callServer !== undefined ? callServer : missingCall,
    _nonce: nonce,
    _chunks: chunks,
    _stringDecoder: createStringDecoder(),
    _fromJSON: (null     ),
    _rowState: 0,
    _rowID: 0,
    _rowTag: 0,
    _rowLength: 0,
    _buffer: [],
  };
  // Don't inline this call because it causes closure to outline the call above.
  response._fromJSON = createFromJSONCallback(response);
  return response;
}

function resolveModel(
  response          ,
  id        ,
  model                    ,
)       {
  const chunks = response._chunks;
  const chunk = chunks.get(id);
  if (!chunk) {
    chunks.set(id, createResolvedModelChunk(response, model));
  } else {
    resolveModelChunk(chunk, model);
  }
}

function resolveText(response          , id        , text        )       {
  const chunks = response._chunks;
  // We assume that we always reference large strings after they've been
  // emitted.
  chunks.set(id, createInitializedTextChunk(response, text));
}

function resolveBuffer(
  response          ,
  id        ,
  buffer                                ,
)       {
  const chunks = response._chunks;
  // We assume that we always reference buffers after they've been emitted.
  chunks.set(id, createInitializedBufferChunk(response, buffer));
}

function resolveModule(
  response          ,
  id        ,
  model                    ,
)       {
  const chunks = response._chunks;
  const chunk = chunks.get(id);
  const clientReferenceMetadata                          = parseModel(
    response,
    model,
  );
  const clientReference = resolveClientReference            (
    response._bundlerConfig,
    clientReferenceMetadata,
  );

  prepareDestinationForModule(
    response._moduleLoading,
    response._nonce,
    clientReferenceMetadata,
  );

  // TODO: Add an option to encode modules that are lazy loaded.
  // For now we preload all modules as early as possible since it's likely
  // that we'll need them.
  const promise = preloadModule(clientReference);
  if (promise) {
    let blockedChunk                   ;
    if (!chunk) {
      // Technically, we should just treat promise as the chunk in this
      // case. Because it'll just behave as any other promise.
      blockedChunk = createBlockedChunk(response);
      chunks.set(id, blockedChunk);
    } else {
      // This can't actually happen because we don't have any forward
      // references to modules.
      blockedChunk = (chunk     );
      blockedChunk.status = BLOCKED;
    }
    promise.then(
      () => resolveModuleChunk(blockedChunk, clientReference),
      error => triggerErrorOnChunk(blockedChunk, error),
    );
  } else {
    if (!chunk) {
      chunks.set(id, createResolvedModuleChunk(response, clientReference));
    } else {
      // This can't actually happen because we don't have any forward
      // references to modules.
      resolveModuleChunk(chunk, clientReference);
    }
  }
}

                                                 
function resolveErrorProd(
  response          ,
  id        ,
  digest        ,
)       {
  if (__DEV__) {
    // These errors should never make it into a build so we don't need to encode them in codes.json
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error(
      'resolveErrorProd should never be called in development mode. Use resolveErrorDev instead. This is a bug in React.',
    );
  }
  const error = new Error(
    'An error occurred in the Server Components render. The specific message is omitted in production' +
      ' builds to avoid leaking sensitive details. A digest property is included on this error instance which' +
      ' may provide additional details about the nature of the error.',
  );
  error.stack = 'Error: ' + error.message;
  (error     ).digest = digest;
  const errorWithDigest                  = (error     );
  const chunks = response._chunks;
  const chunk = chunks.get(id);
  if (!chunk) {
    chunks.set(id, createErrorChunk(response, errorWithDigest));
  } else {
    triggerErrorOnChunk(chunk, errorWithDigest);
  }
}

function resolveErrorDev(
  response          ,
  id        ,
  digest        ,
  message        ,
  stack        ,
)       {
  if (!__DEV__) {
    // These errors should never make it into a build so we don't need to encode them in codes.json
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error(
      'resolveErrorDev should never be called in production mode. Use resolveErrorProd instead. This is a bug in React.',
    );
  }
  // eslint-disable-next-line react-internal/prod-error-codes
  const error = new Error(
    message ||
      'An error occurred in the Server Components render but no message was provided',
  );
  error.stack = stack;
  (error     ).digest = digest;
  const errorWithDigest                  = (error     );
  const chunks = response._chunks;
  const chunk = chunks.get(id);
  if (!chunk) {
    chunks.set(id, createErrorChunk(response, errorWithDigest));
  } else {
    triggerErrorOnChunk(chunk, errorWithDigest);
  }
}

function resolvePostponeProd(response          , id        )       {
  if (__DEV__) {
    // These errors should never make it into a build so we don't need to encode them in codes.json
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error(
      'resolvePostponeProd should never be called in development mode. Use resolvePostponeDev instead. This is a bug in React.',
    );
  }
  const error = new Error(
    'A Server Component was postponed. The reason is omitted in production' +
      ' builds to avoid leaking sensitive details.',
  );
  const postponeInstance           = (error     );
  postponeInstance.$$typeof = REACT_POSTPONE_TYPE;
  postponeInstance.stack = 'Error: ' + error.message;
  const chunks = response._chunks;
  const chunk = chunks.get(id);
  if (!chunk) {
    chunks.set(id, createErrorChunk(response, postponeInstance));
  } else {
    triggerErrorOnChunk(chunk, postponeInstance);
  }
}

function resolvePostponeDev(
  response          ,
  id        ,
  reason        ,
  stack        ,
)       {
  if (!__DEV__) {
    // These errors should never make it into a build so we don't need to encode them in codes.json
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error(
      'resolvePostponeDev should never be called in production mode. Use resolvePostponeProd instead. This is a bug in React.',
    );
  }
  // eslint-disable-next-line react-internal/prod-error-codes
  const error = new Error(reason || '');
  const postponeInstance           = (error     );
  postponeInstance.$$typeof = REACT_POSTPONE_TYPE;
  postponeInstance.stack = stack;
  const chunks = response._chunks;
  const chunk = chunks.get(id);
  if (!chunk) {
    chunks.set(id, createErrorChunk(response, postponeInstance));
  } else {
    triggerErrorOnChunk(chunk, postponeInstance);
  }
}

function resolveHint                (
  response          ,
  code      ,
  model                    ,
)       {
  const hintModel                  = parseModel(response, model);
  dispatchHint(code, hintModel);
}

function mergeBuffer(
  buffer                   ,
  lastChunk            ,
)             {
  const l = buffer.length;
  // Count the bytes we'll need
  let byteLength = lastChunk.length;
  for (let i = 0; i < l; i++) {
    byteLength += buffer[i].byteLength;
  }
  // Allocate enough contiguous space
  const result = new Uint8Array(byteLength);
  let offset = 0;
  // Copy all the buffers into it.
  for (let i = 0; i < l; i++) {
    const chunk = buffer[i];
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  result.set(lastChunk, offset);
  return result;
}

function resolveTypedArray(
  response          ,
  id        ,
  buffer                   ,
  lastChunk            ,
  constructor     ,
  bytesPerElement        ,
)       {
  // If the view fits into one original buffer, we just reuse that buffer instead of
  // copying it out to a separate copy. This means that it's not always possible to
  // transfer these values to other threads without copying first since they may
  // share array buffer. For this to work, it must also have bytes aligned to a
  // multiple of a size of the type.
  const chunk =
    buffer.length === 0 && lastChunk.byteOffset % bytesPerElement === 0
      ? lastChunk
      : mergeBuffer(buffer, lastChunk);
  // TODO: The transfer protocol of RSC is little-endian. If the client isn't little-endian
  // we should convert it instead. In practice big endian isn't really Web compatible so it's
  // somewhat safe to assume that browsers aren't going to run it, but maybe there's some SSR
  // server that's affected.
  const view                   = new constructor(
    chunk.buffer,
    chunk.byteOffset,
    chunk.byteLength / bytesPerElement,
  );
  resolveBuffer(response, id, view);
}

function processFullRow(
  response          ,
  id        ,
  tag        ,
  buffer                   ,
  chunk            ,
)       {
  if (enableBinaryFlight) {
    switch (tag) {
      case 65 /* "A" */:
        // We must always clone to extract it into a separate buffer instead of just a view.
        resolveBuffer(response, id, mergeBuffer(buffer, chunk).buffer);
        return;
      case 67 /* "C" */:
        resolveTypedArray(response, id, buffer, chunk, Int8Array, 1);
        return;
      case 99 /* "c" */:
        resolveBuffer(
          response,
          id,
          buffer.length === 0 ? chunk : mergeBuffer(buffer, chunk),
        );
        return;
      case 85 /* "U" */:
        resolveTypedArray(response, id, buffer, chunk, Uint8ClampedArray, 1);
        return;
      case 83 /* "S" */:
        resolveTypedArray(response, id, buffer, chunk, Int16Array, 2);
        return;
      case 115 /* "s" */:
        resolveTypedArray(response, id, buffer, chunk, Uint16Array, 2);
        return;
      case 76 /* "L" */:
        resolveTypedArray(response, id, buffer, chunk, Int32Array, 4);
        return;
      case 108 /* "l" */:
        resolveTypedArray(response, id, buffer, chunk, Uint32Array, 4);
        return;
      case 70 /* "F" */:
        resolveTypedArray(response, id, buffer, chunk, Float32Array, 4);
        return;
      case 68 /* "D" */:
        resolveTypedArray(response, id, buffer, chunk, Float64Array, 8);
        return;
      case 78 /* "N" */:
        resolveTypedArray(response, id, buffer, chunk, BigInt64Array, 8);
        return;
      case 109 /* "m" */:
        resolveTypedArray(response, id, buffer, chunk, BigUint64Array, 8);
        return;
      case 86 /* "V" */:
        resolveTypedArray(response, id, buffer, chunk, DataView, 1);
        return;
    }
  }

  const stringDecoder = response._stringDecoder;
  let row = '';
  for (let i = 0; i < buffer.length; i++) {
    row += readPartialStringChunk(stringDecoder, buffer[i]);
  }
  row += readFinalStringChunk(stringDecoder, chunk);
  switch (tag) {
    case 73 /* "I" */: {
      resolveModule(response, id, row);
      return;
    }
    case 72 /* "H" */: {
      const code           = (row[0]     );
      resolveHint(response, code, row.slice(1));
      return;
    }
    case 69 /* "E" */: {
      const errorInfo = JSON.parse(row);
      if (__DEV__) {
        resolveErrorDev(
          response,
          id,
          errorInfo.digest,
          errorInfo.message,
          errorInfo.stack,
        );
      } else {
        resolveErrorProd(response, id, errorInfo.digest);
      }
      return;
    }
    case 84 /* "T" */: {
      resolveText(response, id, row);
      return;
    }
    case 80 /* "P" */: {
      if (enablePostpone) {
        if (__DEV__) {
          const postponeInfo = JSON.parse(row);
          resolvePostponeDev(
            response,
            id,
            postponeInfo.reason,
            postponeInfo.stack,
          );
        } else {
          resolvePostponeProd(response, id);
        }
        return;
      }
    }
    // Fallthrough
    default: /* """ "{" "[" "t" "f" "n" "0" - "9" */ {
      // We assume anything else is JSON.
      resolveModel(response, id, row);
      return;
    }
  }
}

export function processBinaryChunk(
  response          ,
  chunk            ,
)       {
  let i = 0;
  let rowState = response._rowState;
  let rowID = response._rowID;
  let rowTag = response._rowTag;
  let rowLength = response._rowLength;
  const buffer = response._buffer;
  const chunkLength = chunk.length;
  while (i < chunkLength) {
    let lastIdx = -1;
    switch (rowState) {
      case ROW_ID: {
        const byte = chunk[i++];
        if (byte === 58 /* ":" */) {
          // Finished the rowID, next we'll parse the tag.
          rowState = ROW_TAG;
        } else {
          rowID = (rowID << 4) | (byte > 96 ? byte - 87 : byte - 48);
        }
        continue;
      }
      case ROW_TAG: {
        const resolvedRowTag = chunk[i];
        if (
          resolvedRowTag === 84 /* "T" */ ||
          (enableBinaryFlight &&
            (resolvedRowTag === 65 /* "A" */ ||
              resolvedRowTag === 67 /* "C" */ ||
              resolvedRowTag === 99 /* "c" */ ||
              resolvedRowTag === 85 /* "U" */ ||
              resolvedRowTag === 83 /* "S" */ ||
              resolvedRowTag === 115 /* "s" */ ||
              resolvedRowTag === 76 /* "L" */ ||
              resolvedRowTag === 108 /* "l" */ ||
              resolvedRowTag === 70 /* "F" */ ||
              resolvedRowTag === 68 /* "D" */ ||
              resolvedRowTag === 78 /* "N" */ ||
              resolvedRowTag === 109 /* "m" */ ||
              resolvedRowTag === 86)) /* "V" */
        ) {
          rowTag = resolvedRowTag;
          rowState = ROW_LENGTH;
          i++;
        } else if (resolvedRowTag > 64 && resolvedRowTag < 91 /* "A"-"Z" */) {
          rowTag = resolvedRowTag;
          rowState = ROW_CHUNK_BY_NEWLINE;
          i++;
        } else {
          rowTag = 0;
          rowState = ROW_CHUNK_BY_NEWLINE;
          // This was an unknown tag so it was probably part of the data.
        }
        continue;
      }
      case ROW_LENGTH: {
        const byte = chunk[i++];
        if (byte === 44 /* "," */) {
          // Finished the rowLength, next we'll buffer up to that length.
          rowState = ROW_CHUNK_BY_LENGTH;
        } else {
          rowLength = (rowLength << 4) | (byte > 96 ? byte - 87 : byte - 48);
        }
        continue;
      }
      case ROW_CHUNK_BY_NEWLINE: {
        // We're looking for a newline
        lastIdx = chunk.indexOf(10 /* "\n" */, i);
        break;
      }
      case ROW_CHUNK_BY_LENGTH: {
        // We're looking for the remaining byte length
        lastIdx = i + rowLength;
        if (lastIdx > chunk.length) {
          lastIdx = -1;
        }
        break;
      }
    }
    const offset = chunk.byteOffset + i;
    if (lastIdx > -1) {
      // We found the last chunk of the row
      const length = lastIdx - i;
      const lastChunk = new Uint8Array(chunk.buffer, offset, length);
      processFullRow(response, rowID, rowTag, buffer, lastChunk);
      // Reset state machine for a new row
      i = lastIdx;
      if (rowState === ROW_CHUNK_BY_NEWLINE) {
        // If we're trailing by a newline we need to skip it.
        i++;
      }
      rowState = ROW_ID;
      rowTag = 0;
      rowID = 0;
      rowLength = 0;
      buffer.length = 0;
    } else {
      // The rest of this row is in a future chunk. We stash the rest of the
      // current chunk until we can process the full row.
      const length = chunk.byteLength - i;
      const remainingSlice = new Uint8Array(chunk.buffer, offset, length);
      buffer.push(remainingSlice);
      // Update how many bytes we're still waiting for. If we're looking for
      // a newline, this doesn't hurt since we'll just ignore it.
      rowLength -= remainingSlice.byteLength;
      break;
    }
  }
  response._rowState = rowState;
  response._rowID = rowID;
  response._rowTag = rowTag;
  response._rowLength = rowLength;
}

function parseModel   (response          , json                    )    {
  return JSON.parse(json, response._fromJSON);
}

function createFromJSONCallback(response          ) {
  // $FlowFixMe[missing-this-annot]
  return function (key        , value           ) {
    if (typeof value === 'string') {
      // We can't use .bind here because we need the "this" value.
      return parseModelString(response, this, key, value);
    }
    if (typeof value === 'object' && value !== null) {
      return parseModelTuple(response, value);
    }
    return value;
  };
}

export function close(response          )       {
  // In case there are any remaining unresolved chunks, they won't
  // be resolved now. So we need to issue an error to those.
  // Ideally we should be able to early bail out if we kept a
  // ref count of pending chunks.
  reportGlobalError(response, new Error('Connection closed.'));
}

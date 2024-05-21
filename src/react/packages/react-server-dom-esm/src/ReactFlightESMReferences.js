/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                                                         

                                                
                   
               
                                          
  

// eslint-disable-next-line no-unused-vars
                                  
                   
               
  

const CLIENT_REFERENCE_TAG = Symbol.for('react.client.reference');
const SERVER_REFERENCE_TAG = Symbol.for('react.server.reference');

export function isClientReference(reference        )          {
  return reference.$$typeof === CLIENT_REFERENCE_TAG;
}

export function isServerReference(reference        )          {
  return reference.$$typeof === SERVER_REFERENCE_TAG;
}

export function registerClientReference   (
  proxyImplementation     ,
  id        ,
  exportName        ,
)                     {
  return Object.defineProperties(proxyImplementation, {
    $$typeof: {value: CLIENT_REFERENCE_TAG},
    $$id: {value: id + '#' + exportName},
  });
}

// $FlowFixMe[method-unbinding]
const FunctionBind = Function.prototype.bind;
// $FlowFixMe[method-unbinding]
const ArraySlice = Array.prototype.slice;
function bind(                          ) {
  // $FlowFixMe[unsupported-syntax]
  const newFn = FunctionBind.apply(this, arguments);
  if (this.$$typeof === SERVER_REFERENCE_TAG) {
    // $FlowFixMe[method-unbinding]
    const args = ArraySlice.call(arguments, 1);
    newFn.$$typeof = SERVER_REFERENCE_TAG;
    newFn.$$id = this.$$id;
    newFn.$$bound = this.$$bound ? this.$$bound.concat(args) : args;
  }
  return newFn;
}

export function registerServerReference   (
  reference                    ,
  id        ,
  exportName        ,
)                     {
  return Object.defineProperties((reference     ), {
    $$typeof: {value: SERVER_REFERENCE_TAG},
    $$id: {value: id + '#' + exportName},
    $$bound: {value: null},
    bind: {value: bind},
  });
}

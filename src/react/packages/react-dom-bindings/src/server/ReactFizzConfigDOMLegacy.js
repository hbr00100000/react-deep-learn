/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

             
                 
                    
             
           
                              

import {
  createRenderState as createRenderStateImpl,
  pushTextInstance as pushTextInstanceImpl,
  pushSegmentFinale as pushSegmentFinaleImpl,
  writeStartCompletedSuspenseBoundary as writeStartCompletedSuspenseBoundaryImpl,
  writeStartClientRenderedSuspenseBoundary as writeStartClientRenderedSuspenseBoundaryImpl,
  writeEndCompletedSuspenseBoundary as writeEndCompletedSuspenseBoundaryImpl,
  writeEndClientRenderedSuspenseBoundary as writeEndClientRenderedSuspenseBoundaryImpl,
} from './ReactFizzConfigDOM';

             
              
        
                   
                                                  

                                                              

import {NotPending} from '../shared/ReactDOMFormActions';

export const isPrimaryRenderer = false;

                           
                                              
                                      
                                  
                                   
                                      
                                                     
                                                     
                                    
                                                   
                                                 
                                                    
                                                   
                                                 
                                                   
                             
                              
                                   
                                      
                                  
                                  
                         
                              
             
                                  
                                       
                                   
                                         
    
                                        
                         
                                                   
                                
  

export function createRenderState(
  resumableState                ,
  generateStaticMarkup         ,
)              {
  const renderState = createRenderStateImpl(
    resumableState,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  return {
    // Keep this in sync with ReactFizzConfigDOM
    placeholderPrefix: renderState.placeholderPrefix,
    segmentPrefix: renderState.segmentPrefix,
    boundaryPrefix: renderState.boundaryPrefix,
    startInlineScript: renderState.startInlineScript,
    htmlChunks: renderState.htmlChunks,
    headChunks: renderState.headChunks,
    externalRuntimeScript: renderState.externalRuntimeScript,
    bootstrapChunks: renderState.bootstrapChunks,
    charsetChunks: renderState.charsetChunks,
    preconnectChunks: renderState.preconnectChunks,
    importMapChunks: renderState.importMapChunks,
    preloadChunks: renderState.preloadChunks,
    hoistableChunks: renderState.hoistableChunks,
    preconnects: renderState.preconnects,
    fontPreloads: renderState.fontPreloads,
    highImagePreloads: renderState.highImagePreloads,
    // usedImagePreloads: renderState.usedImagePreloads,
    styles: renderState.styles,
    bootstrapScripts: renderState.bootstrapScripts,
    scripts: renderState.scripts,
    bulkPreloads: renderState.bulkPreloads,
    preloads: renderState.preloads,
    boundaryResources: renderState.boundaryResources,
    stylesToHoist: renderState.stylesToHoist,

    // This is an extra field for the legacy renderer
    generateStaticMarkup,
  };
}

import {
  stringToChunk,
  stringToPrecomputedChunk,
} from 'react-server/src/ReactServerStreamConfig';

// this chunk is empty on purpose because we do not want to emit the DOCTYPE in legacy mode
export const doctypeChunk                   = stringToPrecomputedChunk('');

             
                 
                    
                
                              

export {
  getChildFormatContext,
  makeId,
  pushStartInstance,
  pushEndInstance,
  pushStartCompletedSuspenseBoundary,
  pushEndCompletedSuspenseBoundary,
  pushFormStateMarkerIsMatching,
  pushFormStateMarkerIsNotMatching,
  writeStartSegment,
  writeEndSegment,
  writeCompletedSegmentInstruction,
  writeCompletedBoundaryInstruction,
  writeClientRenderBoundaryInstruction,
  writeStartPendingSuspenseBoundary,
  writeEndPendingSuspenseBoundary,
  writeResourcesForBoundary,
  writePlaceholder,
  writeCompletedRoot,
  createRootFormatContext,
  createResumableState,
  createBoundaryResources,
  writePreamble,
  writeHoistables,
  writePostamble,
  hoistResources,
  setCurrentlyRenderingBoundaryResourcesTarget,
  prepareHostDispatcher,
} from './ReactFizzConfigDOM';

import escapeTextForBrowser from './escapeTextForBrowser';

export function pushTextInstance(
  target                                 ,
  text        ,
  renderState             ,
  textEmbedded         ,
)          {
  if (renderState.generateStaticMarkup) {
    target.push(stringToChunk(escapeTextForBrowser(text)));
    return false;
  } else {
    return pushTextInstanceImpl(target, text, renderState, textEmbedded);
  }
}

export function pushSegmentFinale(
  target                                 ,
  renderState             ,
  lastPushedText         ,
  textEmbedded         ,
)       {
  if (renderState.generateStaticMarkup) {
    return;
  } else {
    return pushSegmentFinaleImpl(
      target,
      renderState,
      lastPushedText,
      textEmbedded,
    );
  }
}

export function writeStartCompletedSuspenseBoundary(
  destination             ,
  renderState             ,
)          {
  if (renderState.generateStaticMarkup) {
    // A completed boundary is done and doesn't need a representation in the HTML
    // if we're not going to be hydrating it.
    return true;
  }
  return writeStartCompletedSuspenseBoundaryImpl(destination, renderState);
}
export function writeStartClientRenderedSuspenseBoundary(
  destination             ,
  renderState             ,
  // flushing these error arguments are not currently supported in this legacy streaming format.
  errorDigest         ,
  errorMessage         ,
  errorComponentStack         ,
)          {
  if (renderState.generateStaticMarkup) {
    // A client rendered boundary is done and doesn't need a representation in the HTML
    // since we'll never hydrate it. This is arguably an error in static generation.
    return true;
  }
  return writeStartClientRenderedSuspenseBoundaryImpl(
    destination,
    renderState,
    errorDigest,
    errorMessage,
    errorComponentStack,
  );
}
export function writeEndCompletedSuspenseBoundary(
  destination             ,
  renderState             ,
)          {
  if (renderState.generateStaticMarkup) {
    return true;
  }
  return writeEndCompletedSuspenseBoundaryImpl(destination, renderState);
}
export function writeEndClientRenderedSuspenseBoundary(
  destination             ,
  renderState             ,
)          {
  if (renderState.generateStaticMarkup) {
    return true;
  }
  return writeEndClientRenderedSuspenseBoundaryImpl(destination, renderState);
}

                                          
export const NotPendingTransition                   = NotPending;

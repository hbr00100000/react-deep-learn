/**
 * Copyright (c) Meta Platforms, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *      
 */

                                                                                  
import {writeConsolePatchSettingsToWindow} from 'react-devtools-shared/src/backend/console';
import {castBool, castBrowserTheme} from 'react-devtools-shared/src/utils';

// Note: all keys should be optional in this type, because users can use newer
// versions of React DevTools with older versions of React Native, and the object
// provided by React Native may not include all of this type's fields.
                                       
                                         
                                                  
  

export function initializeUsingCachedSettings(
  devToolsSettingsManager                         ,
) {
  initializeConsolePatchSettings(devToolsSettingsManager);
}

function initializeConsolePatchSettings(
  devToolsSettingsManager                         ,
) {
  if (devToolsSettingsManager.getConsolePatchSettings == null) {
    return;
  }
  const consolePatchSettingsString =
    devToolsSettingsManager.getConsolePatchSettings();
  if (consolePatchSettingsString == null) {
    return;
  }
  const parsedConsolePatchSettings = parseConsolePatchSettings(
    consolePatchSettingsString,
  );
  if (parsedConsolePatchSettings == null) {
    return;
  }
  writeConsolePatchSettingsToWindow(parsedConsolePatchSettings);
}

function parseConsolePatchSettings(
  consolePatchSettingsString        ,
)                        {
  const parsedValue = JSON.parse(consolePatchSettingsString ?? '{}');
  const {
    appendComponentStack,
    breakOnConsoleErrors,
    showInlineWarningsAndErrors,
    hideConsoleLogsInStrictMode,
    browserTheme,
  } = parsedValue;
  return {
    appendComponentStack: castBool(appendComponentStack) ?? true,
    breakOnConsoleErrors: castBool(breakOnConsoleErrors) ?? false,
    showInlineWarningsAndErrors: castBool(showInlineWarningsAndErrors) ?? true,
    hideConsoleLogsInStrictMode: castBool(hideConsoleLogsInStrictMode) ?? false,
    browserTheme: castBrowserTheme(browserTheme) ?? 'dark',
  };
}

export function cacheConsolePatchSettings(
  devToolsSettingsManager                         ,
  value                      ,
)       {
  if (devToolsSettingsManager.setConsolePatchSettings == null) {
    return;
  }
  devToolsSettingsManager.setConsolePatchSettings(JSON.stringify(value));
}

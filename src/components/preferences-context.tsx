import { createContext, useContext, useState } from 'react';
import * as React from 'react';

type Preferences = {
  friendlyName: boolean;
}

type PrefsContextInterface = [Preferences, React.Dispatch<React.SetStateAction<Preferences>>];

const defaultPrefs: Preferences = {
  friendlyName: true,
}

const PrefsContext = createContext<PrefsContextInterface>({} as PrefsContextInterface);

function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(defaultPrefs);

  return (
    <PrefsContext.Provider value={[prefs, setPrefs]}>
      {children}
    </PrefsContext.Provider>
  )
}

const usePrefs = () => useContext(PrefsContext);

export {
  Preferences as PrefsInterface,
  PrefsContext,
  PrefsProvider,
  usePrefs,
}
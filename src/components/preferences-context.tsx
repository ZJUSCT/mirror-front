import { createContext, useContext, useState } from 'react';
import * as React from 'react';

type Preferences = {
  friendlyName: boolean;
};

type PrefsContextInterface = [
  Preferences,
  React.Dispatch<React.SetStateAction<Preferences>>
];

const defaultPrefs: Preferences = {
  friendlyName: true,
};

const PrefsContext = createContext<PrefsContextInterface>(
  {} as PrefsContextInterface
);

const PrefsProvider = ({ children }: { children: React.ReactNode }) => {
  const [prefs, setPrefs] = useState(defaultPrefs);
  const value = React.useMemo(
    () => [prefs, setPrefs] as PrefsContextInterface,
    [prefs]
  );
  return (
    <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
  );
};

const usePrefs = () => useContext(PrefsContext);

export { Preferences as PrefsInterface, PrefsContext, PrefsProvider, usePrefs };

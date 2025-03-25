// Config Generator v2
// Author: Azuk
//
// Generate a config in code block, with dropdown menus and switches.

import React, { useMemo, useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormGroup,
} from '@mui/material';
import { Language } from 'prism-react-renderer';
import CodeBlock from './code-block';

type GeneratorSwitch = {
  type: 'switch';
  friendlyName: string;
  defaultValue: boolean;
  value?: boolean;
};
type GeneratorSelect<T extends readonly string[]> = {
  type: 'select';
  promptBeforeSelect?: string;
  promptOnSelect?: string;
  options: T;
  friendlyNames: { [key in T[number]]: string };
  defaultValue: T[number];
  value?: T[number];
};
type GeneratorConfValue<T extends readonly string[]> =
  | GeneratorSwitch
  | GeneratorSelect<T>;
type GeneratorConfiguration = Record<
  string,
  GeneratorConfValue<readonly string[]>
>;
type ConfigContent = {
  language?: Language;
  content: string;
};
type ConfigGenerator = (
  conf: GeneratorConfiguration
) => ConfigContent | React.ReactNode[];

export default ({
  config: initConfig,
  generatorFunc,
}: {
  config: GeneratorConfiguration;
  generatorFunc: ConfigGenerator;
}) => {
  const initedConfig = useMemo(() => {
    const newConfig = { ...initConfig };
    Object.keys(newConfig).forEach(key => {
      const value = newConfig[key];
      if (value.type === 'switch') {
        value.value = value.defaultValue;
      } else {
        value.value = value.defaultValue;
      }
    });
    return newConfig;
  }, [initConfig]);
  const [config, setConfig] = useState<GeneratorConfiguration>(initedConfig);
  const generated = useMemo(
    () => generatorFunc(config),
    [config, generatorFunc]
  );

  return (
    <Box display="flex" flexDirection="column">
      <FormGroup>
        {Object.entries(config).map(([key, conf]) => {
          if (conf.type === 'switch') {
            return (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={conf.value}
                    onChange={event => {
                      setConfig({
                        ...config,
                        [key]: { ...conf, value: event.target.checked },
                      });
                    }}
                  />
                }
                label={conf.friendlyName}
              />
            );
          }
          if (conf.type === 'select') {
            return (
              <Box
                key={key}
                display="flex"
                flexDirection="row"
                alignItems="baseline"
              >
                <Typography component="p">{conf.promptBeforeSelect}</Typography>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel>{conf.promptOnSelect}</InputLabel>
                  <Select
                    onChange={event => {
                      setConfig({
                        ...config,
                        [key]: { ...conf, value: event.target.value as string },
                      });
                    }}
                    value={conf.value}
                  >
                    {conf.options.map(option => (
                      <MenuItem key={option} value={option}>
                        {conf.friendlyNames[option]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            );
          }
          return <div key={key} />;
        })}
      </FormGroup>
      {generated instanceof Array ? (
        generated
      ) : (
        <CodeBlock language={generated?.language ?? 'plaintext'}>
          {generated.content}
        </CodeBlock>
      )}
    </Box>
  );
};
export type {
  GeneratorSwitch,
  GeneratorSelect,
  GeneratorConfValue,
  GeneratorConfiguration,
  ConfigContent,
  ConfigGenerator,
};

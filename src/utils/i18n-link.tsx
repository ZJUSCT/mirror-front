import * as React from 'react';
import { useI18next } from 'gatsby-plugin-react-i18next';
import { LANGUAGE_KEY } from 'gatsby-plugin-react-i18next/dist/types';
import { LinkProps } from '@mui/material';
import { LinkLink as MuiLink } from '~/components/link-mui-components';

export function linkWithI18n<
  P extends { to: string; onClick?: React.MouseEventHandler }
> (Component: React.ComponentType<P>) {
  return ({ to, language, onClick, ...rest }: P & { language?: string }) => {
    const i18n = useI18next();
    const urlLanguage = language || i18n.language;
    const getLanguagePath = (language: string) => {
      return i18n.generateDefaultLanguagePage ||
        language !== i18n.defaultLanguage
        ? `/${language}`
        : '';
    };
    const link = `${getLanguagePath(urlLanguage)}${to}`;

    // @ts-ignore
    return (
      <Component
        to={link}
        onClick={e => {
          if (language) {
            localStorage.setItem(LANGUAGE_KEY, language);
          }
          if (onClick) {
            onClick(e);
          }
        }}
        {...rest}
      />
    );
  };
}

export const Link = linkWithI18n<LinkProps & { to: string }>(MuiLink);

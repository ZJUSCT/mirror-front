import * as React from 'react';
import { useI18next } from 'gatsby-plugin-react-i18next';
import { LANGUAGE_KEY } from 'gatsby-plugin-react-i18next/dist/types';
import { LinkLink as MuiLink } from '~/components/link-mui-components';

type LinkableProps = {
  to: string;
  language?: string;
  onClick?: React.MouseEventHandler;
};

export function i18nLinkify<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T & LinkableProps> {
  return (props: T & LinkableProps) => {
    const { to, language, onClick, ...rest } = props;

    const i18n = useI18next();
    const urlLanguage = language || i18n.language;
    const getLanguagePath = (lang: string) => {
      return i18n.generateDefaultLanguagePage || lang !== i18n.defaultLanguage
        ? `/${lang}`
        : '';
    };
    const link = `${getLanguagePath(urlLanguage)}${to}`;
    const newProps = {
      ...rest,
      to: link,
      onClick: e => {
        if (language) {
          localStorage.setItem(LANGUAGE_KEY, language);
        }
        if (onClick) {
          onClick(e);
        }
      },
    } as T & LinkableProps;

    return <Component {...newProps} />;
  };
}

export const Link = i18nLinkify(MuiLink);

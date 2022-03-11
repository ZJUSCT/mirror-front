const config = require('./config');

module.exports = {
  presets: ['babel-preset-gatsby'],
  plugins: [
    [
      'i18next-extract',
      {
        locales: config.locales,
        keySeparator: null,
        nsSeparator: null,
        keyAsDefaultValue: [config.defaultLanguage],
        useI18nextDefaultValue: [config.defaultLanguage],
        outputPath: 'locales/{{locale}}/{{ns}}.json',
        customTransComponents: [['gatsby-plugin-react-i18next', 'Trans']]
      }
    ]
  ],
  overrides: [
    {
      test: [`**/*.ts`, `**/*.tsx`],
      plugins: [[`@babel/plugin-transform-typescript`, { isTSX: true }]]
    }
  ]
};

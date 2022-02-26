module.exports = {
  documentSources: {
    mirrors: {
      folder: '/:lang/:segment+',
      path: '/:lang?/docs/:segment+',
      template: `./src/templates/mirror-doc.tsx`,
      getLanguageFromPath: true
    }
  },
  defaultLanguage: 'zh',
  locales: ['zh', 'en'],
  apiBaseUrl: 'https://mirrors.zju.edu.cn/api',
  siteUrl: 'https://mirrors.zju.edu.cn',
};

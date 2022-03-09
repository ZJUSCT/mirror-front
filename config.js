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
  apiBaseUrl: 'http://new.mirrors.zju.edu.cn/api',
  siteUrl: 'http://new.mirrors.zju.edu.cn',
};

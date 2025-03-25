import { Prism } from 'prism-react-renderer';

let languageLoaded = false;
let languageLoading = false;
const resolves = [];

const loadPrismLanguages = async () => {
  if (languageLoaded) {
    return false;
  }
  if (languageLoading) {
    return new Promise(resolve => {
      resolves.push(resolve);
    });
  }
  languageLoading = true;

  // load languages
  (typeof global !== 'undefined' ? global : window).Prism = Prism;
  await import('prismjs/components/prism-bash');
  languageLoaded = true;
  resolves.forEach(resolve => resolve(true));
  return true;
};
loadPrismLanguages();

export default loadPrismLanguages;

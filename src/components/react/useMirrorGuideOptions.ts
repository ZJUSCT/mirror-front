import { useCallback, useEffect, useState } from 'react';

import {
  CERNET_MIRROR_ORIGIN,
  MIRROR_GUIDE_OPTIONS_CHANGE_EVENT,
  MIRROR_GUIDE_OPTIONS_UPDATE_EVENT,
  type MirrorGuideOptionsChangeDetail,
  type MirrorGuideOptionsUpdateDetail,
  ZJU_MIRROR_ORIGIN,
} from '../../lib/mirror-endpoint';

const initialOptions: MirrorGuideOptionsChangeDetail = {
  federated: false,
  https: true,
  sudo: true,
};

function currentGuideOptions(
  fallback: MirrorGuideOptionsChangeDetail
): MirrorGuideOptionsChangeDetail {
  const root = document.documentElement;
  return {
    federated: root.dataset.mirrorService
      ? root.dataset.mirrorService === 'cernet'
      : fallback.federated,
    https: root.dataset.mirrorScheme
      ? root.dataset.mirrorScheme !== 'http'
      : fallback.https,
    sudo: root.dataset.mirrorSudo
      ? root.dataset.mirrorSudo !== 'false'
      : fallback.sudo,
  };
}

export function selectedMirrorOrigin({
  federated,
  https,
}: Pick<MirrorGuideOptionsChangeDetail, 'federated' | 'https'>) {
  const url = new URL(federated ? CERNET_MIRROR_ORIGIN : ZJU_MIRROR_ORIGIN);
  url.protocol = https ? 'https:' : 'http:';
  return url.origin;
}

export default function useMirrorGuideOptions(
  initial?: MirrorGuideOptionsUpdateDetail
) {
  const [options, setOptions] = useState<MirrorGuideOptionsChangeDetail>(
    () => ({
      ...initialOptions,
      ...initial,
    })
  );

  useEffect(() => {
    const updateFromPage = () =>
      setOptions((current) => currentGuideOptions(current));
    const handleChange = (event: Event) =>
      setOptions((event as CustomEvent<MirrorGuideOptionsChangeDetail>).detail);
    updateFromPage();
    window.addEventListener(MIRROR_GUIDE_OPTIONS_CHANGE_EVENT, handleChange);
    const observer = new MutationObserver(updateFromPage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        'data-mirror-service',
        'data-mirror-scheme',
        'data-mirror-sudo',
      ],
    });
    return () => {
      window.removeEventListener(
        MIRROR_GUIDE_OPTIONS_CHANGE_EVENT,
        handleChange
      );
      observer.disconnect();
    };
  }, []);

  const updateOptions = useCallback(
    (detail: MirrorGuideOptionsUpdateDetail) => {
      window.dispatchEvent(
        new CustomEvent<MirrorGuideOptionsUpdateDetail>(
          MIRROR_GUIDE_OPTIONS_UPDATE_EVENT,
          { detail }
        )
      );
    },
    []
  );

  return { ...options, updateOptions };
}

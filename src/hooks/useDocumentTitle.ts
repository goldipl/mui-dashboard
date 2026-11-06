import { useEffect } from 'react';

const APP_NAME = 'Newsroom Dashboard';

/** Sets the browser tab title to `<title> · Newsroom Dashboard`. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}

'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-white font-playfair text-2xl mb-3">Algo salió mal</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Ocurrió un error inesperado. Ya lo registramos automáticamente.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-white text-zinc-950 rounded-full text-sm font-semibold hover:bg-zinc-100 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}

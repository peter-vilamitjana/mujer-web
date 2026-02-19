'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTheme, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("APP_ERROR_BOUNDARY:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-xl border-red-200 dark:border-red-900/50">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <CardTitle className="text-xl text-red-700 dark:text-red-400">Algo salió mal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Ocurrió un error inesperado en la aplicación.
                    </p>
                    {/* Dev Only: Show error message */}
                    <div className="bg-muted p-3 rounded text-xs font-mono text-left overflow-auto max-h-32">
                        {error.message || "Error desconocido"}
                    </div>

                    <Button onClick={() => reset()} className="w-full gap-2">
                        <RefreshCcw className="h-4 w-4" /> Intentar de nuevo
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

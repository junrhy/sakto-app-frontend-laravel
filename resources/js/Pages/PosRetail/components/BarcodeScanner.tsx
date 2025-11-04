import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Scan, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClear?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export default function BarcodeScanner({
    onScan,
    onClear,
    placeholder = 'Scan or enter barcode...',
    autoFocus = true,
}: BarcodeScannerProps) {
    const [barcode, setBarcode] = useState<string>('');
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    // Auto-submit when barcode is entered (after a short delay to allow complete barcode entry)
    useEffect(() => {
        if (barcode.length > 0) {
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set new timeout - submit after 500ms of no typing
            timeoutRef.current = setTimeout(() => {
                if (barcode.trim().length > 0) {
                    handleScan();
                }
            }, 500);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [barcode]);

    const handleScan = () => {
        if (barcode.trim().length > 0) {
            onScan(barcode.trim());
            // Clear input after scanning
            setTimeout(() => {
                setBarcode('');
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleScan();
        }
    };

    const handleClear = () => {
        setBarcode('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
        if (onClear) {
            onClear();
        }
    };

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Barcode Scanner
            </Label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Scan className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                        ref={inputRef}
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        className="pl-10 pr-10 border-gray-300 dark:border-gray-600"
                        autoFocus={autoFocus}
                    />
                    {barcode && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter barcode and press Enter, or it will auto-submit after typing stops
            </p>
        </div>
    );
}


import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface ReceiptItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

interface ReceiptData {
    saleId?: number;
    items: ReceiptItem[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card';
    cashReceived?: number;
    change?: number;
    date: string;
    appCurrency: {
        symbol: string;
        decimal_separator?: string;
        thousands_separator?: string;
    };
    storeName?: string;
    userName?: string;
}

interface ReceiptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receiptData: ReceiptData | null;
}

export default function ReceiptDialog({
    open,
    onOpenChange,
    receiptData,
}: ReceiptDialogProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const formatAmount = (amount: number | string | undefined): string => {
        if (!receiptData) return '';
        const {
            symbol,
            decimal_separator = '.',
            thousands_separator = ',',
        } = receiptData.appCurrency;

        // Convert to number if it's a string or handle undefined
        const numAmount =
            typeof amount === 'string' ? parseFloat(amount) : amount || 0;

        if (isNaN(numAmount)) {
            return `${symbol}0.00`;
        }

        return `${symbol}${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, thousands_separator)}`;
    };

    const handlePrint = () => {
        if (!receiptRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            // Fallback if popup is blocked
            window.print();
            return;
        }

        const printContent = receiptRef.current.innerHTML;
        const printStyles = `
            <style>
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 10mm;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .receipt {
                        width: 100%;
                        max-width: 80mm;
                        margin: 0 auto;
                    }
                    .receipt-header {
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 10px;
                        margin-bottom: 10px;
                    }
                    .receipt-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .receipt-info {
                        font-size: 10px;
                        margin: 5px 0;
                    }
                    .receipt-items {
                        margin: 15px 0;
                    }
                    .receipt-item {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        padding-bottom: 5px;
                        border-bottom: 1px dotted #ccc;
                    }
                    .receipt-item-details {
                        flex: 1;
                    }
                    .receipt-item-name {
                        font-weight: 500;
                        margin-bottom: 2px;
                    }
                    .receipt-item-meta {
                        font-size: 10px;
                        color: #666;
                    }
                    .receipt-item-total {
                        font-weight: bold;
                        text-align: right;
                    }
                    .receipt-totals {
                        margin-top: 15px;
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                    }
                    .receipt-total-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                    }
                    .receipt-total-label {
                        font-weight: 500;
                    }
                    .receipt-total-amount {
                        font-weight: bold;
                    }
                    .receipt-grand-total {
                        font-size: 16px;
                        font-weight: bold;
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 2px solid #000;
                    }
                    .receipt-footer {
                        text-align: center;
                        margin-top: 20px;
                        padding-top: 10px;
                        border-top: 1px dashed #000;
                        font-size: 10px;
                    }
                }
            </style>
        `;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Receipt</title>
                    ${printStyles}
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    if (!receiptData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Receipt
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Receipt Content - Print Friendly */}
                    <div
                        ref={receiptRef}
                        className="receipt rounded-lg border bg-white p-6 text-black dark:bg-white dark:text-black"
                        style={{
                            fontFamily: "'Courier New', monospace",
                            maxWidth: '80mm',
                            margin: '0 auto',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="receipt-header"
                            style={{
                                textAlign: 'center',
                                borderBottom: '1px dashed #000',
                                paddingBottom: '10px',
                                marginBottom: '10px',
                            }}
                        >
                            <div
                                className="receipt-title"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                }}
                            >
                                {receiptData.userName || 'Retail Store'}
                            </div>
                            <div
                                className="receipt-info"
                                style={{
                                    fontSize: '10px',
                                    margin: '5px 0',
                                }}
                            >
                                {new Date(receiptData.date).toLocaleString()}
                            </div>
                            {receiptData.saleId && (
                                <div
                                    className="receipt-info"
                                    style={{
                                        fontSize: '10px',
                                        margin: '5px 0',
                                    }}
                                >
                                    Receipt #{receiptData.saleId}
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div
                            className="receipt-items"
                            style={{
                                margin: '15px 0',
                            }}
                        >
                            {receiptData.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="receipt-item"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '8px',
                                        paddingBottom: '5px',
                                        borderBottom: '1px dotted #ccc',
                                    }}
                                >
                                    <div
                                        className="receipt-item-details"
                                        style={{ flex: 1 }}
                                    >
                                        <div
                                            className="receipt-item-name"
                                            style={{
                                                fontWeight: 500,
                                                marginBottom: '2px',
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                        <div
                                            className="receipt-item-meta"
                                            style={{
                                                fontSize: '10px',
                                                color: '#666',
                                            }}
                                        >
                                            {item.quantity} x{' '}
                                            {formatAmount(item.price)}
                                        </div>
                                    </div>
                                    <div
                                        className="receipt-item-total"
                                        style={{
                                            fontWeight: 'bold',
                                            textAlign: 'right',
                                        }}
                                    >
                                        {formatAmount(
                                            item.price * item.quantity,
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div
                            className="receipt-totals"
                            style={{
                                marginTop: '15px',
                                borderTop: '1px dashed #000',
                                paddingTop: '10px',
                            }}
                        >
                            <div
                                className="receipt-total-row"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '5px',
                                }}
                            >
                                <span
                                    className="receipt-total-label"
                                    style={{ fontWeight: 500 }}
                                >
                                    Subtotal:
                                </span>
                                <span
                                    className="receipt-total-amount"
                                    style={{ fontWeight: 'bold' }}
                                >
                                    {formatAmount(receiptData.totalAmount)}
                                </span>
                            </div>
                            {receiptData.paymentMethod === 'cash' &&
                                receiptData.cashReceived && (
                                    <>
                                        <div
                                            className="receipt-total-row"
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '5px',
                                            }}
                                        >
                                            <span
                                                className="receipt-total-label"
                                                style={{ fontWeight: 500 }}
                                            >
                                                Cash Received:
                                            </span>
                                            <span
                                                className="receipt-total-amount"
                                                style={{ fontWeight: 'bold' }}
                                            >
                                                {formatAmount(
                                                    receiptData.cashReceived,
                                                )}
                                            </span>
                                        </div>
                                        {receiptData.change !== undefined &&
                                            receiptData.change > 0 && (
                                                <div
                                                    className="receipt-total-row"
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        marginBottom: '5px',
                                                    }}
                                                >
                                                    <span
                                                        className="receipt-total-label"
                                                        style={{
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Change:
                                                    </span>
                                                    <span
                                                        className="receipt-total-amount"
                                                        style={{
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {formatAmount(
                                                            receiptData.change,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                    </>
                                )}
                            <div
                                className="receipt-grand-total"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    marginTop: '10px',
                                    paddingTop: '10px',
                                    borderTop: '2px solid #000',
                                }}
                            >
                                <div
                                    className="receipt-total-row"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span>Total:</span>
                                    <span>
                                        {formatAmount(receiptData.totalAmount)}
                                    </span>
                                </div>
                            </div>
                            <div
                                className="receipt-total-row"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '5px',
                                }}
                            >
                                <span
                                    className="receipt-total-label"
                                    style={{ fontWeight: 500 }}
                                >
                                    Payment Method:
                                </span>
                                <span
                                    className="receipt-total-amount"
                                    style={{ fontWeight: 'bold' }}
                                >
                                    {receiptData.paymentMethod.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            className="receipt-footer"
                            style={{
                                textAlign: 'center',
                                marginTop: '20px',
                                paddingTop: '10px',
                                borderTop: '1px dashed #000',
                                fontSize: '10px',
                            }}
                        >
                            <div>Thank you for your purchase!</div>
                            <div style={{ marginTop: '8px' }}>
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="no-print flex justify-between gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Printer } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { Table } from '../../types';

interface QRCodeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTable: Table | null;
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
    isOpen,
    onClose,
    selectedTable,
}) => {
    const [customerName, setCustomerName] = useState("");
    const qrCodeRef = useRef<HTMLDivElement>(null);

    const printQRCode = () => {
        const printContent = qrCodeRef.current;
        if (printContent) {
            const winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
            if (winPrint) {
                winPrint.document.write(`
                <html>
                    <head>
                    <title>Print QR Code</title>
                    <style>
                        body { display: flex; justify-content: center; align-items: center; height: 100vh; }
                        .qr-container { text-align: center; }
                    </style>
                    </head>
                    <body>
                    <div class="qr-container">
                        <h2>QR Code for ${selectedTable?.name}</h2>
                        ${customerName ? `<p>Customer: ${customerName}</p>` : ''}
                        ${printContent.innerHTML}
                    </div>
                    </body>
                </html>
                `);
                winPrint.document.close();
                winPrint.focus();
                winPrint.print();
                winPrint.close();
            }
        }
    };

    const handleClose = () => {
        setCustomerName("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>QR Code for {selectedTable?.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="customerName">Customer Name (Optional)</Label>
                        <Input
                            id="customerName"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                        />
                    </div>
                    <div className="flex flex-col items-center" ref={qrCodeRef}>
                        {selectedTable && (
                            <QRCodeSVG
                                value={`https://sakto.app/fnb/menu?table=${selectedTable.id}${customerName ? `&customer=${encodeURIComponent(customerName)}` : ''}`}
                                size={200}
                            />
                        )}
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Scan to view menu for {selectedTable?.name}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={printQRCode} className="mr-2 bg-gray-700 hover:bg-gray-600 text-white">
                        <Printer className="mr-2 h-4 w-4" />
                        Print QR Code
                    </Button>
                    <Button onClick={handleClose} className="bg-gray-700 hover:bg-gray-600 text-white">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

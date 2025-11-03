import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import type { CbuFund, ReportEmailData } from '../types';

interface SendReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedFund: CbuFund | null;
    reportEmailData: ReportEmailData;
    onReportEmailDataChange: (data: Partial<ReportEmailData>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSending: boolean;
}

export function SendReportDialog({
    open,
    onOpenChange,
    selectedFund,
    reportEmailData,
    onReportEmailDataChange,
    onSubmit,
    isSending,
}: SendReportDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Send Fund Report</DialogTitle>
                    <DialogDescription>
                        Send a detailed report of {selectedFund?.name} to the
                        fund owner
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="report_email">
                                    Recipient Email
                                </Label>
                                <Input
                                    id="report_email"
                                    type="email"
                                    value={reportEmailData.email}
                                    onChange={(e) =>
                                        onReportEmailDataChange({
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="report_message">
                                    Message (Optional)
                                </Label>
                                <Textarea
                                    id="report_message"
                                    value={reportEmailData.message}
                                    onChange={(e) =>
                                        onReportEmailDataChange({
                                            message: e.target.value,
                                        })
                                    }
                                    placeholder="Add a personal message to the email..."
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSending}>
                            {isSending ? 'Sending...' : 'Send Report'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


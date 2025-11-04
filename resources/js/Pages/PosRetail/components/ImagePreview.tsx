import { Dialog, DialogContent } from '@/Components/ui/dialog';

interface ImagePreviewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageUrl: string | null;
}

export default function ImagePreview({
    open,
    onOpenChange,
    imageUrl,
}: ImagePreviewProps) {
    if (!imageUrl) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0">
                <img
                    src={imageUrl}
                    alt="Product preview"
                    className="h-auto w-full cursor-pointer"
                    onClick={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

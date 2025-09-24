declare module 'html2pdf.js' {
    export interface Html2PdfOptions {
        margin?: number | number[];
        filename?: string;
        image?: {
            type?: string;
            quality?: number;
        };
        html2canvas?: {
            scale?: number;
            useCORS?: boolean;
            letterRendering?: boolean;
            backgroundColor?: string;
            logging?: boolean;
            removeContainer?: boolean;
            foreignObjectRendering?: boolean;
        };
        jsPDF?: {
            unit?: string;
            format?: string;
            orientation?: 'portrait' | 'landscape';
            compress?: boolean;
        };
    }

    export interface Html2PdfInstance {
        set: (options: Html2PdfOptions) => Html2PdfInstance;
        from: (element: HTMLElement) => Html2PdfInstance;
        save: () => Promise<void>;
    }

    export default function html2pdf(): Html2PdfInstance;
}

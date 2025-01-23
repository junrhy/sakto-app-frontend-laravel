import React from 'react';
import html2pdf, { Html2PdfOptions } from 'html2pdf.js';

interface Props {
    contentId: string;
    fileName: string;
}

export default function DownloadPdfButton({ contentId, fileName }: Props) {
    const handleDownload = async () => {
        const element = document.getElementById(contentId);
        if (!element) return;

        // Clone the element and modify styles for PDF
        const clonedElement = element.cloneNode(true) as HTMLElement;
        
        // Get the title from the first h1 element and format it
        const originalTitle = (element.querySelector('h1')?.textContent || fileName)
            .replace(/sakto-?/i, '') // Remove 'sakto' or 'sakto-' (case insensitive)
            .replace(/-/g, ' ') // Replace hyphens with spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim(); // Remove leading/trailing spaces
        
        // Create clean filename without 'sakto'
        const cleanFileName = fileName.replace(/sakto-?/i, '');
        
        // Create PDF wrapper with centered title
        const wrapper = document.createElement('div');
        wrapper.id = `${contentId}-pdf`;
        
        // Add the title section
        const titleSection = document.createElement('div');
        titleSection.className = 'pdf-title';
        titleSection.innerHTML = `<h1>${originalTitle}</h1>`;
        wrapper.appendChild(titleSection);
        
        // Add the content
        wrapper.appendChild(clonedElement);
        
        // Force black text color and add page break rules
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            #${contentId}-pdf * {
                color: black !important;
                font-family: Arial, sans-serif !important;
            }
            #${contentId}-pdf .pdf-title {
                text-align: center !important;
                margin-bottom: 2em !important;
                padding-bottom: 1em !important;
                border-bottom: 2px solid black !important;
            }
            #${contentId}-pdf .pdf-title h1 {
                font-size: 24pt !important;
                font-weight: bold !important;
                margin: 0 !important;
                padding: 0 !important;
                text-transform: uppercase !important;
            }
            #${contentId}-pdf h1:not(.pdf-title h1), 
            #${contentId}-pdf h2, 
            #${contentId}-pdf h3 {
                font-weight: bold !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
            }
            #${contentId}-pdf section {
                page-break-inside: avoid !important;
                margin-bottom: 1em !important;
            }
            #${contentId}-pdf p {
                page-break-inside: avoid !important;
            }
            #${contentId}-pdf ul, #${contentId}-pdf ol {
                page-break-inside: avoid !important;
            }
            #${contentId}-pdf li {
                page-break-inside: avoid !important;
            }
        `;
        wrapper.prepend(styleSheet);

        const opt: Html2PdfOptions = {
            margin: [1, 1, 1, 1], // [top, right, bottom, left]
            filename: `${cleanFileName}.pdf`,
            html2canvas: { 
                scale: 2,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'in', 
                format: 'letter', 
                orientation: 'portrait',
                compress: true
            }
        };

        try {
            await html2pdf().set(opt).from(wrapper).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <button
            onClick={handleDownload}
            type="button"
            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
        >
            <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
            </svg>
            Download PDF
        </button>
    );
} 
import { useRef, useCallback } from 'react';

const usePrint = () => {
  const printRef = useRef(null);

  const handlePrint = useCallback(() => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=400,height=600');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: monospace;
              font-size: 13px;
              color: #111;
              background: white;
              padding: 24px;
              max-width: 320px;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .text-xl { font-size: 18px; }
            .font-bold { font-weight: bold; }
            .tracking-widest { letter-spacing: 0.2em; }
            .text-xs { font-size: 11px; }
            .text-base { font-size: 14px; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-500 { color: #6b7280; }
            .mb-4 { margin-bottom: 16px; }
            .mb-3 { margin-bottom: 12px; }
            .mt-2 { margin-top: 8px; }
            .my-3 { margin: 12px 0; }
            .pt-2 { padding-top: 8px; }
            .pl-2 { padding-left: 8px; }
            .pr-2 { padding-right: 8px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .flex-1 { flex: 1; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .border-t { border-top: 1px solid; }
            .border-dashed { border-style: dashed; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-200 { border-color: #e5e7eb; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, []);

  return { printRef, handlePrint };
};

export default usePrint;
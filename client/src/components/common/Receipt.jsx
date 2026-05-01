import { forwardRef } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

const Receipt = forwardRef(({ order, paymentMethod }, ref) => {
  const items = order?.items || [];
  const total = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  return (
    <div ref={ref} className="receipt-print bg-white p-8 max-w-sm mx-auto font-mono text-sm">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-print, .receipt-print * { visibility: visible; }
          .receipt-print { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; font-family: monospace; font-size: 13px; }
        }
      `}</style>

      <div className="text-center mb-4">
        <p className="text-xl font-bold tracking-widest">BREW & CHILL</p>
        <p className="text-xs text-gray-500 mt-1">Specialty Coffee & Chill</p>
        <p className="text-xs text-gray-400">123 Coffee Street, Bangkok</p>
        <p className="text-xs text-gray-400">Tel: 02-123-4567</p>
        <p className="text-xs text-gray-400">เปิดทุกวัน 08:00 – 20:00 น.</p>
        <div className="border-t border-dashed border-gray-300 my-3" />
      </div>

      <div className="space-y-1 mb-3 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Order #</span>
          <span className="font-bold">{order?.id?.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span>{formatDateTime(new Date())}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment</span>
          <span>{paymentMethod === 'qr' ? 'QR PromptPay' : 'Cash'}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-300 my-3" />

      <div className="space-y-2 mb-3">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs">
              <span className="flex-1 truncate pr-2">{item.name}</span>
              <span>{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
            </div>
            <div className="text-xs text-gray-400 pl-2">
              {item.quantity} x {formatCurrency(item.price)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-300 my-3" />

      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">VAT 7%</span>
          <span>{formatCurrency(total * 0.07)}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-200">
          <span>TOTAL</span>
          <span>{formatCurrency(total * 1.07)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-300 my-3" />

      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>☕ ขอบคุณที่มาอุดหนุนนะคะ</p>
        <p>Thank you for visiting Brew & Chill!</p>
        <p className="mt-2">Follow us: @brewandchill.cafe</p>
        <p>* กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน *</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;
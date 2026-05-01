import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Banknote, QrCode, CheckCircle2, ShoppingBag, Printer, X } from 'lucide-react';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import Modal from '../../components/common/Modal';
import Receipt from '../../components/common/Receipt';
import usePrint from '../../hooks/usePrint';

// PromptPay QR payload
const generatePromptPayPayload = (phoneNumber, amount) => {
  const phone = phoneNumber.replace(/-/g, '').replace(/^0/, '66');
  const amountStr = amount.toFixed(2);
  const payload = [
    '000201', '010212',
    `2937${String(phone.length + 18).padStart(2, '0')}0016A000000677010111${String(phone.length).padStart(2, '0')}${phone}`,
    '5303764',
    `54${String(amountStr.length).padStart(2, '0')}${amountStr}`,
    '5802TH', '6304',
  ].join('');
  const crc = crc16(payload);
  return payload + crc;
};

const crc16 = (str) => {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xFFFF) >>> 0).toString(16).toUpperCase().padStart(4, '0');
};

const PROMPTPAY_NUMBER = '0812345678';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, clearCart } = useCartStore();
  const total = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [qrConfirmed, setQrConfirmed] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const { register, handleSubmit } = useForm();
  const { printRef, handlePrint } = usePrint();

  const { data: reservationsData } = useQuery({
    queryKey: ['my-reservations-checkout'],
    queryFn: () =>
      api.get('/reservations/mine', { params: { status: 'confirmed', limit: 10 } })
        .then(r => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/orders', {
      reservationId: data.reservationId || undefined,
      notes: data.notes
        ? `[${paymentMethod === 'qr' ? 'QR Payment' : 'Cash'}] ${data.notes}`
        : `[${paymentMethod === 'qr' ? 'QR Payment' : 'Cash'}]`,
      items: items.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
    }),
    onSuccess: (res) => {
      // เก็บ order data + cart items สำหรับใบเสร็จ
      setPlacedOrder({
        id: res.data.data.id,
        items: items.map(i => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        paymentMethod,
        createdAt: new Date(),
      });
      setReceiptModal(true);
      clearCart();
      toast.success('Order placed successfully!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to place order'),
  });

  const onSubmit = (data) => {
    if (paymentMethod === 'qr' && !qrConfirmed) {
      toast.error('กรุณายืนยันการชำระเงินก่อน');
      return;
    }
    mutation.mutate(data);
  };

  const handleCloseReceipt = () => {
    setReceiptModal(false);
    navigate('/my-orders');
  };

  const qrPayload = generatePromptPayPayload(PROMPTPAY_NUMBER, total);

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">ตะกร้าว่าง</p>
        <Link to="/menu" className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600">
          ดูเมนู
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">{t('checkout.orderSummary')}</h3>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name}
                      className="w-8 h-8 rounded-lg object-cover" />
                  )}
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                </div>
                <span className="font-medium">{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-800">
            <span>{t('cart.total')}</span>
            <span className="text-amber-600 text-lg">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Link Reservation */}
        {reservationsData?.items?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3">{t('checkout.linkReservation')}</h3>
            <select {...register('reservationId')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
              <option value="">{t('checkout.noReservation')}</option>
              {reservationsData.items.map(r => (
                <option key={r.id} value={r.id}>
                  Table {r.table?.tableNumber} — {r.timeSlot} ({r.guestCount} guests)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">{t('checkout.notes')}</h3>
          <textarea {...register('notes')} rows={2}
            placeholder={t('checkout.notesPlaceholder')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">{t('checkout.paymentMethod')}</h3>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button type="button"
              onClick={() => { setPaymentMethod('cash'); setQrConfirmed(false); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'cash'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-200'
              }`}>
              <Banknote size={28} className={paymentMethod === 'cash' ? 'text-amber-600' : 'text-gray-400'} />
              <span className={`text-sm font-medium ${paymentMethod === 'cash' ? 'text-amber-700' : 'text-gray-500'}`}>
                {t('checkout.payByCash')}
              </span>
            </button>

            <button type="button"
              onClick={() => { setPaymentMethod('qr'); setQrConfirmed(false); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'qr'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-200'
              }`}>
              <QrCode size={28} className={paymentMethod === 'qr' ? 'text-amber-600' : 'text-gray-400'} />
              <span className={`text-sm font-medium ${paymentMethod === 'qr' ? 'text-amber-700' : 'text-gray-500'}`}>
                {t('checkout.payByQR')}
              </span>
            </button>
          </div>

          {/* QR Section */}
          {paymentMethod === 'qr' && (
            <div className="flex flex-col items-center gap-4 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">{t('checkout.qrInstruction')}</p>
              <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
                <QRCodeSVG value={qrPayload} size={200} level="M" includeMargin={true} />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">PromptPay · {PROMPTPAY_NUMBER}</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(total)}</p>
              </div>
              {!qrConfirmed ? (
                <button type="button" onClick={() => setQrConfirmed(true)}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm">
                  {t('checkout.qrNote')}
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <span className="text-green-700 font-semibold text-sm">{t('checkout.qrConfirmed')}</span>
                </div>
              )}
            </div>
          )}

          {/* Cash instruction */}
          {paymentMethod === 'cash' && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <Banknote size={20} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">ชำระเงินสดได้ที่เคาน์เตอร์หลังอาหารมาถึงโต๊ะ</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending || (paymentMethod === 'qr' && !qrConfirmed)}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending
            ? t('checkout.placing')
            : `${t('checkout.placeOrder')} — ${formatCurrency(total)}`}
        </button>
      </form>

      {/* ─── Receipt Modal ─────────────────────────────── */}
      <Modal
        isOpen={receiptModal}
        onClose={handleCloseReceipt}
        title="ใบเสร็จรับเงิน"
        size="sm"
      >
        <div className="space-y-4">
          {/* Receipt preview */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <Receipt
              ref={printRef}
              order={placedOrder}
              paymentMethod={paymentMethod}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-colors"
            >
              <Printer size={18} />
              พิมพ์ใบเสร็จ
            </button>
            <button
              onClick={handleCloseReceipt}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              <X size={18} />
              ปิด
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            ดูประวัติออเดอร์ได้ที่หน้า "คำสั่งซื้อของฉัน"
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
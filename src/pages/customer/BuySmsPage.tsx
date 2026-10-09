import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, Check, Star, CreditCard, Smartphone, Building, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/sms';
import type { Package, Payment } from '@/types';

export function BuySmsPage() {
  const { receipt } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('mpesa');
  const [processing, setProcessing] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  const { data: packages } = useQuery({ queryKey: ['packages'], queryFn: async () => { const res = await api.pricing.packages(); return res.data; } });
  const { data: balance } = useQuery({ queryKey: ['sms-balance'], queryFn: async () => { const res = await api.sms.balance(); return res.data; } });
  const { data: paymentData } = useQuery({
    queryKey: ['payment', receipt],
    queryFn: async () => { if (!receipt) return null; const res = await api.payments.get(receipt); return res.data; },
    enabled: !!receipt,
  });

  const handleBuy = (pkg: Package) => { setSelectedPkg(pkg); setPaymentMethod('mpesa'); };

  const handlePay = async () => {
    if (!selectedPkg) return;
    setProcessing(true);
    try {
      const res = await api.payments.create(selectedPkg.id, paymentMethod);
      if (res.success) {
        toast(res.message, 'success');
        setReceiptPayment(res.data);
        setSelectedPkg(null);
        queryClient.invalidateQueries({ queryKey: ['sms-balance'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        navigate(`/app/buy-sms/${res.data.id}`);
      } else toast(res.message, 'error');
    } catch { toast('Payment failed', 'error'); }
    setProcessing(false);
  };

  if (receipt && paymentData) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1></div>
        <Card className="max-w-2xl mx-auto">
          <div className="text-center pb-6 border-b border-gray-100">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3"><Check className="w-8 h-8 text-green-500" /></div>
            <h2 className="text-xl font-bold text-gray-900">Payment Successful</h2>
            <p className="text-sm text-gray-500">Your SMS credits have been added</p>
          </div>
          <div className="py-6 space-y-3">
            <Row label="Receipt Number" value={paymentData.receipt_number} />
            <Row label="Date" value={formatDateTime(paymentData.created_at)} />
            <Row label="Package" value={paymentData.package_name || '—'} />
            <Row label="SMS Credits" value={`${formatNumber(paymentData.sms_credits)} SMS`} />
            <Row label="Amount" value={formatCurrency(paymentData.amount)} />
            <Row label="Payment Method" value={paymentData.payment_method.toUpperCase()} />
            <Row label="Status" value={<Badge color="green">Completed</Badge>} />
          </div>
          <div className="flex gap-3 justify-center pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => window.print()}>Print Receipt</Button>
            <Button onClick={() => navigate('/app/transactions')}>View Transactions</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buy SMS Credits</h1>
        <p className="text-sm text-gray-500 mt-1">Purchase SMS credits with volume discounts</p>
      </div>

      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Wallet className="w-6 h-6" /></div>
        <div><p className="text-sm text-blue-600">Current Balance</p><p className="text-2xl font-bold text-blue-700">{formatNumber(balance?.balance || 0)} SMS</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(packages || []).map(pkg => (
          <Card key={pkg.id} className={`relative hover:shadow-lg transition-shadow ${pkg.featured ? 'border-blue-300 border-2' : ''}`}>
            {pkg.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge color="blue"><Star className="w-3 h-3" /> Best Value</Badge></div>}
            <div className="text-center pt-2">
              <p className="text-sm font-medium text-gray-500">{pkg.name}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(pkg.sms_quantity)}</p>
              <p className="text-sm text-gray-400">SMS Credits</p>
              {pkg.discount > 0 && <Badge color="green" className="mt-2">Save {pkg.discount}%</Badge>}
              <p className="text-2xl font-bold text-blue-600 mt-4">{formatCurrency(pkg.price)}</p>
              <p className="text-xs text-gray-400">{formatCurrency(pkg.price / pkg.sms_quantity)} per SMS</p>
              {pkg.description && <p className="text-xs text-gray-500 mt-3">{pkg.description}</p>}
              <Button className="w-full mt-4" onClick={() => handleBuy(pkg)}>Buy Now</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!selectedPkg}
        onClose={() => setSelectedPkg(null)}
        title="Complete Purchase"
        footer={<><Button variant="outline" onClick={() => setSelectedPkg(null)} disabled={processing}>Cancel</Button><Button onClick={handlePay} loading={processing}>Pay {selectedPkg ? formatCurrency(selectedPkg.price) : ''}</Button></>}
      >
        {selectedPkg && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <Row label="Package" value={selectedPkg.name} />
              <Row label="SMS Credits" value={`${formatNumber(selectedPkg.sms_quantity)} SMS`} />
              <Row label="Amount" value={<span className="font-bold text-blue-600">{formatCurrency(selectedPkg.price)}</span>} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Payment Method</p>
              <div className="space-y-2">
                {[{ id: 'mpesa', label: 'M-Pesa', icon: Smartphone }, { id: 'card', label: 'Card', icon: CreditCard }, { id: 'bank_transfer', label: 'Bank Transfer', icon: Building }].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${paymentMethod === m.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <m.icon className={`w-5 h-5 ${paymentMethod === m.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${paymentMethod === m.id ? 'text-blue-700' : 'text-gray-700'}`}>{m.label}</span>
                    {paymentMethod === m.id && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            {processing && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Processing payment...</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between text-sm"><span className="text-gray-500">{label}</span><span className="font-medium text-gray-900">{value}</span></div>;
}

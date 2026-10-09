import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Send, Users, MessageSquare, Info, DollarSign, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { calculateSmsParts, calculateTotalSms, formatCurrency, normalizePhoneNumber } from '@/lib/sms';

export function SendSmsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [senderId, setSenderId] = useState('');
  const [recipients, setRecipients] = useState('');
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [sending, setSending] = useState(false);

  const { data: senderIdsData } = useQuery({
    queryKey: ['sender-ids'],
    queryFn: async () => { const res = await api.senderIds.list(); return res.data; },
  });
  const approvedSenderIds = (senderIdsData || []).filter(s => s.status === 'APPROVED');

  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => { const res = await api.groups.list(); return res.data; },
  });
  const groups = groupsData || [];

  const { data: balanceData } = useQuery({
    queryKey: ['sms-balance'],
    queryFn: async () => { const res = await api.sms.balance(); return res.data; },
  });

  useEffect(() => {
    if (approvedSenderIds.length > 0 && !senderId) {
      setSenderId(approvedSenderIds[0].id);
    }
  }, [approvedSenderIds]);

  const phoneList = useMemo(() => {
    const phones = recipients.split(/[,\n\s]+/).map(p => p.trim()).filter(Boolean);
    return phones.map(normalizePhoneNumber);
  }, [recipients]);

  const totalRecipients = phoneList.length + groupIds.reduce((sum, gid) => {
    const g = groups.find(g => g.id === gid);
    return sum + (g?.contact_count || 0);
  }, 0);

  const { parts, isUnicode } = calculateSmsParts(message);
  const totalSms = calculateTotalSms(message, totalRecipients);
  const estimatedCost = totalSms * 0.45;
  const balance = balanceData?.balance || 0;
  const insufficientBalance = totalSms > 0 && balance < totalSms;

  const toggleGroup = (gid: string) => {
    setGroupIds(prev => prev.includes(gid) ? prev.filter(id => id !== gid) : [...prev, gid]);
  };

  const handleSend = async () => {
    if (!senderId) { toast('Please select a sender ID', 'error'); return; }
    if (totalRecipients === 0) { toast('Please add at least one recipient', 'error'); return; }
    if (!message) { toast('Please enter a message', 'error'); return; }
    if (insufficientBalance) {
      toast(`Insufficient SMS balance. You need ${totalSms} SMS but only have ${balance}.`, 'error');
      return;
    }
    if (schedule && (!scheduleDate || !scheduleTime)) { toast('Please select schedule date and time', 'error'); return; }

    setSending(true);
    try {
      const res = await api.sms.send({
        sender_id: senderId,
        recipients: phoneList,
        group_ids: groupIds.length > 0 ? groupIds : undefined,
        message,
        schedule_date: schedule ? scheduleDate : undefined,
        schedule_time: schedule ? scheduleTime : undefined,
        timezone: 'Africa/Nairobi',
      });
      if (res.success) {
        toast(res.message, 'success');
        queryClient.invalidateQueries({ queryKey: ['sms-balance'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        navigate(`/app/campaigns/${res.data.id}`);
      } else {
        toast(res.message, 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to send SMS', 'error');
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send SMS</h1>
        <p className="text-sm text-gray-500 mt-1">Compose and send SMS to your contacts</p>
      </div>

      {balance < (balanceData?.low_balance_threshold || 100) && balance > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">Your SMS balance is low. You have {balance} SMS remaining. <a href="/app/buy-sms" className="font-medium underline">Buy more SMS</a></p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Compose Message" icon={<MessageSquare className="w-5 h-5" />} />
            <div className="space-y-4">
              <Field label="Sender ID" required>
                <Select value={senderId} onChange={e => setSenderId(e.target.value)}>
                  <option value="">Select sender ID...</option>
                  {approvedSenderIds.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </Field>
              {approvedSenderIds.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">No approved sender IDs. Please request one from the Sender IDs page.</p>
              )}

              <Field label="Recipients" hint="Enter phone numbers separated by commas or new lines">
                <Textarea
                  value={recipients}
                  onChange={e => setRecipients(e.target.value)}
                  rows={3}
                  placeholder="0712345678, 0722333444, 0733444555"
                />
              </Field>

              {groups.length > 0 && (
                <Field label="Or select groups">
                  <div className="flex flex-wrap gap-2">
                    {groups.map(g => (
                      <button
                        key={g.id}
                        onClick={() => toggleGroup(g.id)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          groupIds.includes(g.id)
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {g.name} ({g.contact_count})
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              <Field label="Message" required>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Type your SMS message here..."
                  maxLength={918}
                />
              </Field>
              {isUnicode && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <Info className="w-3.5 h-3.5" /> Unicode message detected - uses 70 chars per SMS part
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="schedule"
                  checked={schedule}
                  onChange={e => setSchedule(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="schedule" className="text-sm text-gray-700">Schedule for later</label>
              </div>

              {schedule && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date" required>
                    <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
                  </Field>
                  <Field label="Time" required>
                    <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Message Summary" icon={<Info className="w-5 h-5" />} />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Characters</span>
                <span className="font-medium text-gray-900">{message.length} / 160</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SMS Parts</span>
                <span className="font-medium text-gray-900">{parts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Recipients</span>
                <span className="font-medium text-gray-900">{totalRecipients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total SMS</span>
                <span className="font-medium text-gray-900">{totalSms}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Estimated Cost</span>
                <span className="font-bold text-gray-900">{formatCurrency(estimatedCost)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Current Balance</span>
                <span className="font-medium text-blue-600">{balance} SMS</span>
              </div>
              {insufficientBalance && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Insufficient balance. You need {totalSms} SMS but have {balance}.
                </div>
              )}
            </div>
          </Card>

          <Button
            onClick={handleSend}
            loading={sending}
            disabled={insufficientBalance || totalRecipients === 0 || !message || !senderId}
            className="w-full"
            size="lg"
          >
            <Send className="w-4 h-4" />
            {schedule ? 'Schedule Campaign' : 'Send Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}

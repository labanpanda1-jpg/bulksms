import { Code, Server, Globe, Shield } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';

export function AdminApiPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">API Configuration</h1><p className="text-sm text-gray-500 mt-1">Platform API settings and provider configuration</p></div>

      <Card>
        <CardHeader title="API Settings" icon={<Code className="w-5 h-5" />} />
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-900">API Status</p><p className="text-xs text-gray-500 mt-0.5">Customer API access is enabled</p></div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Active</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">API Base URL</p>
            <code className="block mt-2 text-xs font-mono text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">https://api.abancool.com/api/v1</code>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">Rate Limits</p>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Per minute:</span> <span className="font-medium text-gray-900">60 requests</span></div>
              <div><span className="text-gray-500">Per day:</span> <span className="font-medium text-gray-900">10,000 requests</span></div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="SMS Provider" subtitle="Internal provider configuration - not visible to customers" icon={<Server className="w-5 h-5" />} />
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div><p className="text-sm font-medium text-amber-800">Provider credentials are managed server-side</p><p className="text-xs text-amber-700 mt-1">Provider details are never exposed to the frontend. Configuration is handled entirely by the backend.</p></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-900">Provider Status</p><p className="text-xs text-gray-500 mt-0.5">SMS provider is connected and operational</p></div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Connected</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Webhooks" icon={<Globe className="w-5 h-5" />} />
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">Delivery Callback URL</p>
            <code className="block mt-2 text-xs font-mono text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">https://api.abancool.com/api/v1/webhooks/delivery</code>
          </div>
        </div>
      </Card>
    </div>
  );
}

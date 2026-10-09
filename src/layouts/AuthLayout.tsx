import { type ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">ABANCOOL</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight">Bulk SMS for<br />growing businesses</h1>
            <p className="mt-4 text-lg text-teal-100 max-w-md">
              Reach thousands of customers instantly. Manage contacts, schedule campaigns, and track delivery in real-time.
            </p>
            <div className="mt-8 space-y-3">
              {['5 free SMS on registration', 'Real-time delivery reports', 'Contact management & groups', 'Affordable volume pricing'].map(feat => (
                <div key={feat} className="flex items-center gap-3 text-teal-50">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-teal-200">© 2026 ABANCOOL Bulk SMS. All rights reserved.</p>
        </div>
      </div>
      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">ABANCOOL</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

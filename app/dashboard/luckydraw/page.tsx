'use client';

import LuckyDrawView from '@/src/components/views/LuckyDrawView';
import { ProtectedRoute } from '@/src/components/auth';

export default function LuckyDrawPage() {
  return (
    <ProtectedRoute>
      <div className="py-8">
        <LuckyDrawView />
      </div>
    </ProtectedRoute>
  );
}

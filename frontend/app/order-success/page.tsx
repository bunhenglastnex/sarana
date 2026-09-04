'use client';

import React, { Suspense } from 'react';
import { OrderSuccessView } from '@/components/customer/OrderSuccessView';
import { Loader2 } from 'lucide-react';

function OrderSuccessFallback() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessFallback />}>
      <OrderSuccessView />
    </Suspense>
  );
}

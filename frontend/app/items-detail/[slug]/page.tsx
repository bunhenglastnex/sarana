'use client';

import React from 'react';
import { ItemDetailView } from '@/components/customer/ItemDetailView';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function ItemDetailPage({ params }: PageProps) {
  return <ItemDetailView slug={params.slug} />;
}

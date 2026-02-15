'use client';

import { useEffect } from 'react';
import { SELECTION_STORAGE_KEY } from '@/lib/storage';

/** トップページ表示時に sessionStorage の選択状態を削除する */
export default function ClearSelection() {
  useEffect(() => {
    sessionStorage.removeItem(SELECTION_STORAGE_KEY);
  }, []);

  return null;
}

'use client';

import { createContext, useContext } from 'react';
import { defaultBusiness, type BusinessContent } from '@/lib/site-content-schema';

const BusinessContext = createContext({ business: defaultBusiness, preview: false });
export function BusinessProvider({ business, preview = false, children }: {
    business: BusinessContent; preview?: boolean; children: React.ReactNode;
}) {
    return <BusinessContext.Provider value={{ business, preview }}>{children}</BusinessContext.Provider>;
}
export const useBusiness = () => useContext(BusinessContext);

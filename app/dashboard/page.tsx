"use client";

import { Suspense } from "react";
import { TradingDashboard } from "@/app/components/dashboard/TradingDashboard";
import { DashboardSkeleton } from "@/app/components/ui/skeletons/DashboardSkeleton";
import { ErrorBoundary } from "@/app/components/ui/ErrorBoundary";
import { WebSocketProvider } from "@/app/providers/WebSocketProvider";
import { NotificationPrompt } from "@/app/components/ui/NotificationPrompt";
import { SYMBOLS } from "@/app/lib/constants";

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <WebSocketProvider symbols={SYMBOLS}>
        <Suspense fallback={<DashboardSkeleton />}>
          <TradingDashboard />
          <NotificationPrompt />
        </Suspense>
      </WebSocketProvider>
    </ErrorBoundary>
  );
}

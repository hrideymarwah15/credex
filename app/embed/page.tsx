"use client";

import { useEffect } from "react";
import { AuditForm } from "@/components/AuditForm";
import { runAudit } from "@/lib/audit/engine";
import type { AuditInput } from "@/lib/audit/types";

export default function EmbedPage() {
  const handleAudit = async (input: AuditInput) => {
    const result = runAudit(input);

    // Send height update to parent for iframe resizing
    if (window.parent) {
      window.parent.postMessage({
        type: 'spendlens-resize',
        height: document.body.scrollHeight
      }, '*');
    }

    // For embed mode, show results inline (simplified version)
    console.log('Audit result:', result);
  };

  useEffect(() => {
    // Send initial height
    if (window.parent) {
      window.parent.postMessage({
        type: 'spendlens-resize',
        height: document.body.scrollHeight
      }, '*');
    }

    // Update height on window resize
    const resizeObserver = new ResizeObserver(() => {
      if (window.parent) {
        window.parent.postMessage({
          type: 'spendlens-resize',
          height: document.body.scrollHeight
        }, '*');
      }
    });

    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-heading mb-2">
            AI Spend Audit
          </h1>
          <p className="text-sm text-muted">
            Free 90-second audit powered by <a href="https://spendlens.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SpendLens</a>
          </p>
        </div>
        <AuditForm onSubmit={handleAudit} loading={false} />
      </div>
    </div>
  );
}

"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { saveTemplateResponse } from "@/app/actions/templates";
import TemplateRenderer from "@/components/templates/template-renderer";
import type { TemplateSchema, TemplateData } from "@/components/templates/types";

interface TemplateRendererWrapperProps {
  schema: TemplateSchema;
  initialData: TemplateData;
  templateId: string;
  templateName: string;
}

export default function TemplateRendererWrapper({
  schema,
  initialData,
  templateId,
  templateName,
}: TemplateRendererWrapperProps) {
  const handleSave = useCallback(
    async (data: TemplateData) => {
      const result = await saveTemplateResponse(templateId, data);
      if (result.error) {
        throw new Error(result.error);
      }
    },
    [templateId]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-[#0d0d1a]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/templates"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Templates
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <h1 className="font-[family-name:var(--font-oswald)] text-xl sm:text-2xl font-bold text-white">
            {templateName}
          </h1>
        </div>

        {/* Renderer */}
        <TemplateRenderer
          schema={schema}
          initialData={initialData}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

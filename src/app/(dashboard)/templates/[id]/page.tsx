import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import catalog from "@/data/templates/catalog.json";
import { loadTemplateResponse } from "@/app/actions/templates";
import TemplateEditorClient from "./template-editor-client";
import TemplateRendererWrapper from "./template-renderer-wrapper";
import type { TemplateSchema, TemplateData } from "@/components/templates/types";

interface TemplateField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
}

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  fields: TemplateField[];
}

interface OldTemplateData {
  id: string;
  name: string;
  number: number;
  category: string;
  description: string;
  instructions?: string;
  icon: string;
  tags: string[];
  estimatedTime: string;
  sections: TemplateSection[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// Auto-detect: check for schema file existence instead of hardcoded list

export default async function TemplateEditorPage({ params }: PageProps) {
  const { id } = await params;

  // Verify the template exists in the catalog
  const catalogEntry = catalog.templates.find((t) => t.id === id);
  if (!catalogEntry) {
    notFound();
  }

  // Load any previously saved responses
  const { data: savedResponses } = await loadTemplateResponse(id);

  // Check if this template has a schema file (new spreadsheet renderer)
  const schemaPath = path.join(process.cwd(), "src", "data", "templates", `schema_${id}.json`);
  let hasSchema = false;
  try {
    await fs.access(schemaPath);
    hasSchema = true;
  } catch { /* no schema file */ }

  if (hasSchema) {
    let schema: TemplateSchema & { defaultData?: TemplateData };
    try {
      const raw = await fs.readFile(schemaPath, "utf-8");
      schema = JSON.parse(raw) as TemplateSchema & { defaultData?: TemplateData };
    } catch {
      notFound();
    }

    // Merge default data with saved data
    const initialData: TemplateData = {};
    for (const sheet of schema.sheets) {
      if (
        savedResponses &&
        typeof savedResponses === "object" &&
        (savedResponses as Record<string, unknown>)[sheet.id]
      ) {
        initialData[sheet.id] = (savedResponses as Record<string, unknown>)[
          sheet.id
        ] as Record<string, unknown>[];
      } else if (schema.defaultData && schema.defaultData[sheet.id]) {
        initialData[sheet.id] = schema.defaultData[sheet.id];
      } else if (sheet.type === "form") {
        initialData[sheet.id] = [{}];
      } else {
        initialData[sheet.id] = [];
      }
    }

    return (
      <TemplateRendererWrapper
        schema={schema}
        initialData={initialData}
        templateId={id}
        templateName={catalogEntry.name}
      />
    );
  }

  // Legacy: Read the old template JSON file from disk
  let templateData: OldTemplateData;
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "templates",
      `${id}.json`
    );
    const raw = await fs.readFile(filePath, "utf-8");
    templateData = JSON.parse(raw) as OldTemplateData;
  } catch {
    notFound();
  }

  return (
    <TemplateEditorClient
      templateData={templateData}
      savedResponses={(savedResponses as Record<string, string>) ?? {}}
    />
  );
}

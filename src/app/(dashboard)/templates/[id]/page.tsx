import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import catalog from "@/data/templates/catalog.json";
import { loadTemplateResponse } from "@/app/actions/templates";
import TemplateEditorClient from "./template-editor-client";

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

interface TemplateData {
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

export default async function TemplateEditorPage({ params }: PageProps) {
  const { id } = await params;

  // Verify the template exists in the catalog
  const catalogEntry = catalog.templates.find((t) => t.id === id);
  if (!catalogEntry) {
    notFound();
  }

  // Read the template JSON file from disk
  let templateData: TemplateData;
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "templates",
      `${id}.json`
    );
    const raw = await fs.readFile(filePath, "utf-8");
    templateData = JSON.parse(raw) as TemplateData;
  } catch {
    notFound();
  }

  // Load any previously saved responses
  const { data: savedResponses } = await loadTemplateResponse(id);

  return (
    <TemplateEditorClient
      templateData={templateData}
      savedResponses={(savedResponses as Record<string, string>) ?? {}}
    />
  );
}

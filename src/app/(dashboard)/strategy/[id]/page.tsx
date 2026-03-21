import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StrategyIndexPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/strategy/${id}/result`);
}

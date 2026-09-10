import { db } from './db';

export async function searchKnowledgeBaseDetailed(query: string) {
  const qLower = query.toLowerCase();
  const queryWords = qLower.split(/[\s,?.!-]+/).filter((w) => w.length >= 2);

  // Search KnowledgeBaseItem table
  const kbItems = await db.knowledgeBaseItem.findMany();
  const matchedKb = kbItems.filter((item) => {
    const text = `${item.question} ${item.answer} ${item.keywords} ${item.category}`.toLowerCase();
    return queryWords.some((word) => text.includes(word));
  });

  // Search Service Categories & Items
  const services = await db.serviceItem.findMany({
    include: { category: true },
  });
  const matchedServices = services.filter((s) => {
    const text = `${s.name} ${s.description} ${s.category.name}`.toLowerCase();
    return queryWords.some((word) => text.includes(word));
  });

  return { matchedKb, matchedServices };
}

export async function searchKnowledgeBase(query: string): Promise<string> {
  const { matchedKb, matchedServices } = await searchKnowledgeBaseDetailed(query);

  let context = '### Grand Horizon Hotel Knowledge Base Context:\n';

  if (matchedKb.length > 0) {
    context += '\nRelevant Hotel FAQs:\n';
    matchedKb.forEach((kb) => {
      context += `- Q: ${kb.question}\n  A: ${kb.answer}\n`;
    });
  }

  if (matchedServices.length > 0) {
    context += '\nAvailable Services & Menu Items:\n';
    matchedServices.forEach((s) => {
      context += `- Item: ${s.name} (₹${s.price.toFixed(2)}) - ${s.description} (Dept: ${s.category.department}, ~${s.estimatedMinutes} mins)\n`;
    });
  }

  if (matchedKb.length === 0 && matchedServices.length === 0) {
    context += '\nNo specific FAQ matches found. Use general Grand Horizon Hotel policies (Breakfast: 6:30-10:30 AM Floor 1, Checkout: 11:00 AM, Wi-Fi: GrandHorizon-Guest / Horizon2026!).\n';
  }

  return context;
}

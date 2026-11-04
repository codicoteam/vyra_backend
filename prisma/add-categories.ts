import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Technology & Ethics', slug: 'technology-ethics' },
  { name: 'Environmental Science', slug: 'environmental-science' },
  { name: 'Healthcare & Medicine', slug: 'healthcare-medicine' },
  { name: 'Social Awareness', slug: 'social-awareness' },
  { name: 'Digital Privacy', slug: 'digital-privacy' },
];

async function main() {
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, sortOrder: i, isActive: true },
    });
  }
  console.log('Categories added');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

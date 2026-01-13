import { db } from '../../infra/db/client.js';
import { categories } from '../../../db/schema.js';
import { asc, eq } from 'drizzle-orm';

export const categoriesRepository = {
  async findAll() {
    return db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
      })
      .from(categories)
      .orderBy(asc(categories.id));
  },

  async findById(id: number) {
    const [row] = await db.select().from(categories).where(eq(categories.id, id));
    return row ?? null;
  },
};

import { db } from '../../infra/db/client.js';
import { categories } from '../../../db/schema.js';
import { asc } from 'drizzle-orm';

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
};

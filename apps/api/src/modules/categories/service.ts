import { categoriesRepository } from './repository.js';

export const listCategories = async () => {
  const rows = await categoriesRepository.findAll();
  return { data: rows };
};

import prisma from "../lib/prisma.js";

// Função que busca e retorna todas as categorias listadas no banco - GET
const listAllCategories = async (req, res) => {
  const allCategories = await prisma.category.findMany();
  res.json(allCategories);
};

// Recebe nome e userId no corpo da requisição, cria a categoria no banco - POST
const createCategory = async (req, res) => {
  const category = await prisma.category.create({
    data: {
      name: req.body.name,
      userId: req.body.userId,
    },
  });
  res.json(category);
};

//busca e retorna uma categoria pelo id dela - GET id
const getCategoryById = async (req, res) => {
  const category = await prisma.category.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json(category);
};

//Atualiza a categoria pelo id - PUT
const updateCategoryById = async (req, res) => {
  const category = await prisma.category.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      name: req.body.name,
    },
  });
  res.json(category);
};

//Deleta a categoria pelo id - DELETE
const deleteCategoryById = async (req, res) => {
  const category = await prisma.category.delete({
    where: {
      id: Number(req.params.id),
    }
  });
  res.json({
    message: "Categoria removida com sucesso",
    category
  });
}

export {
  listAllCategories,
  createCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById
};

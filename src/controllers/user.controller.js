import prisma from "../lib/prisma.js";

// Lê nome, email e password no corpo da requisição, cria a user no banco - POST
const createUser = async (req, res) => {
  const user = await prisma.user.create({
    //O que salva no banco
    data: {
      name: req.body.name,
      email: req.body.email,
      passwordHash: req.body.password,
    },

    //não devolve password. Por segurança não devemos trafegar senhas
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  res.json(user);
};

// Lista os usuários do banco - GET
const listAllUsers = async (req, res) => {
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  res.json(allUsers);
};

//busca user pelo id
const getUserById = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  res.json(user);
};

//atualiza user pelo id
const updateUserById = async (req, res) => {
  const user = await prisma.user.update({
    //Qual registro eu devo modificar
    where: {
      id: Number(req.params.id),
    },
    //Quais valores eu devo escrever nessa linha
    data: {
      name: req.body.name,
      email: req.body.email,
    },
    //O que eu devolvo pra você, depois de terminar
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  res.json(user);
};

//deleta user pelo id
const deleteUserById = async (req, res) => {
  const user = await prisma.user.delete({
    where: {
      id: Number(req.params.id),
    },
    // Não trazer o campo password na reposta do delete
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  res.json({
    message: "Usuário removido com sucesso",
    user,
  });
};

export {
  createUser,
  listAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};

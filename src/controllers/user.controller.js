import prisma from "../lib/prisma.js";
import { hash, compare } from "bcryptjs";

// Lê nome, email e password no corpo da requisição, cria a user no banco - POST
const createUser = async (req, res) => {
  //Variável para hashear a senha baseado no bcryptjs - parametros são a senha que vem no corpo e 12 é o salt
  const passwordHashed = await hash(req.body.password, 12);

  const user = await prisma.user.create({
    //O que salva no banco
    data: {
      name: req.body.name,
      email: req.body.email,
      passwordHash: passwordHashed,
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

//busca user pelo id - GET
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

//atualiza user pelo id - PUT
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

//deleta user pelo id - DELETE
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

//----- FUNÇÃO DO LOGIN ---------
const loginUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    //Qual campo buscar
    where: {
      email: req.body.email,
    },
    //Quais dados retornar
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
    },
  });
  //checar se password do user existe e é igual ao do banco
    // Busca usuário por email.
    // Se não achou → erro 401, para.
    // Se achou, compara senha.
    // Se senha errada → mesmo erro 401, para.
    // Se chegou até aqui (sem ter dado return) → login válido!
  if (user == null) {
    res.status(401).json({
      message: "email ou senha incorreto",
    });
    return;
  }
  const validPassword = await compare(req.body.password, user.passwordHash);
  if (validPassword == false) {
    res.status(401).json({
      message: "email ou senha incorreto",
    });
    return
  }
  res.json({
    message: "login efetuado"
  })
};

export {
  createUser,
  listAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  loginUser,
};

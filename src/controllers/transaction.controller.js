import prisma from "../lib/prisma.js";

//recebe valor, data da transação, categoria, divisão e id do usuário
const createTransaction = async (req, res) => {
  const transaction = await prisma.transaction.create({
    //O que salva no banco
    data: {
      value: req.body.value,
      transactionDate: req.body.transactionDate,
      categoryId: req.body.categoryId,
      divisionType: req.body.divisionType,
      userId: req.body.userId,
    },
  });
  res.json(transaction);
};

//listar todas as transações
const listAllTransactions = async (req, res) => {
  const allTransactions = await prisma.transaction.findMany();
  res.json(allTransactions);
};

//Buscar transações pelo id
const getTransactionById = async (req, res) => {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json(transaction);
};

//atualizar dados da transação pelo id
const updateTransactionById = async (req, res) => {
  const transaction = await prisma.transaction.update({
    //Qual registro eu devo modificar
    where: {
      id: Number(req.params.id),
    },
    //Quais valores eu devo escrever nessa linha
    data: {
      value: req.body.value,
      transactionDate: req.body.transactionDate,
      divisionType: req.body.divisionType,
      categoryId: req.body.categoryId,
    },
  });
  res.json(transaction);
};

//deletar transação pelo ID
const deleteTransactionById = async (req, res) => {
  const transaction = await prisma.transaction.delete({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json({
    message: "Transação removida com sucesso",
    transaction,
  });
};

export {
  createTransaction,
  listAllTransactions,
  getTransactionById,
  updateTransactionById,
  deleteTransactionById,
};

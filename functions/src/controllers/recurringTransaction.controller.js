import prisma from "../lib/prisma.js";

//Recebe {valor, categoria, dia do mês, dia que começa, usuário} e cria compra recorrente - POST
const createRecurringTransaction = async (req, res) => {
  const recurring = await prisma.recurringTransaction.create({
    //O que salva no banco
    data: {
      value: req.body.value,
      categoryId: req.body.categoryId,
      monthDay: req.body.monthDay,
      initialDay: req.body.initialDay,
      userId: req.body.userId,
    },
  });
  res.json(recurring);
};

//Lista todas as transações recorrentes - GET
const listAllRecurringTransactions = async (req, res) => {
  const allRecurring = await prisma.recurringTransaction.findMany();
  res.json(allRecurring);
};

//Buscar transação recorrente por id - GET
const getRecurringTransactionById = async (req, res) => {
  const recurring = await prisma.recurringTransaction.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json(recurring);
};

//Atualiza dados da transação recorrente pelo id - PUT
const updateRecurringTransactionById = async (req, res) => {
  const recurring = await prisma.recurringTransaction.update({
    //Qual registro eu devo modificar
    where: {
      id: Number(req.params.id),
    },
    //Quais valores eu devo escrever nessa linha
    data: {
      value: req.body.value,
      monthDay: req.body.monthDay,
      initialDay: req.body.initialDay,
      categoryId: req.body.categoryId,
      isActive: req.body.isActive,
    },
  });
  res.json(recurring);
};

//Deletar transação pelo id - DELETE
const deleteRecurringTransactionById = async (req, res) => {
  const recurring = await prisma.recurringTransaction.delete({
    where: {
      id: Number(req.params.id),
    },
  });
  res.json({
    message: "Transação recorrente removida com sucesso",
    recurring,
  });
};

export {
  createRecurringTransaction,
  listAllRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransactionById,
  deleteRecurringTransactionById,
};

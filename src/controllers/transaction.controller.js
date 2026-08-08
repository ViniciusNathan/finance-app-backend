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
    res.json(allTransactions)
};

export { createTransaction, listAllTransactions };

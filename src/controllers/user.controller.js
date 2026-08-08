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

export default createUser;

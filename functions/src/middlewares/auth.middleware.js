import jwt from "jsonwebtoken";

//Middleware é uma função que roda entre a requisição chegar e ela alcançar o controller final — uma espécie de "checkpoint" no meio do caminho.
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  //Verifica se mandou header
  if (authHeader == undefined) {
    res.status(401).json({
      message: "credenciais de acesso inválidas",
    });
    return;
  }

  const parts = authHeader.split(" ");
  const token = parts[1];

  //Verifica se o token está vazio
  if (token == null) {
    res.status(401).json({
      message: "credenciais de acesso inválidas",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id
    next()
  } catch (erro) {
    res.status(401).json({
      message: "token inválido",
    });
  }
};

export default authMiddleware
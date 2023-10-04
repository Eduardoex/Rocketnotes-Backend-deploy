const {hash, compare} = require("bcryptjs")
const AppError = require("../utils/AppError")
const sqliteConnection = require("../database/sqlite");

const UserRepository = require("../repositories/UserRepository");





class UsersController {
async create  (request, response) {
  const {name, email, password} = request.body;

  const userRepository = new UserRepository()

  
  const checkUserExists = await userRepository.findByEmail(email)

  if(checkUserExists) {
    throw new AppError("Este e-mail já está em uso.")
  }

  const hashedPassword = await hash(password, 8)

  
  await userRepository.create({name, email, password: hashedPassword})

  return response.status(201).json();

  }

  async update(request, response){
    const {name, email, password, old_password} = request.body;
    const user_id = request.user.id;

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);
  
  if(!user){
    throw new AppError("Usuário não encontrado");

    
  }
  
  const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
      throw new AppError("Este e-mail já está em uso.")
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if(password && !old_password){
      throw new AppError("você precisa informar a senha antiga para definir a nova senha")
    }

    if (password && old_password){
      const checkOldPassword = await compare (old_password, user.password);

      if(!checkOldPassword) {
        throw new AppError("A senha não confere.")
      }

      user.password = await hash(password, 8)
    }


    await database.run(`
    UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATETIME('now')
    WHERE id = ?`,
    [user.name, user.email, user.password, user_id]);

    return response.status(200).json();
  }
}

module.exports = UsersController;





/*
index - get para listar vários registros
show - get para exibir um registro 
create - post para criar um registro
update - put para atualizar um registro
delete - DELETE para remover um registro
*/
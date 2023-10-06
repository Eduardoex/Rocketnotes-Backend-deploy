const UserCreateService = require("./UserCreateService")
it("user should be create", () => {
  const user = {
    name: "User test",
    email: "User@test.com",
    password: "123"
  }
  const userCreateService = new UserCreateService()
   const usercreated =  userCreateService.execute(user)
  
})
import { dataSource } from '../db/config'
import { User } from '../db/entities/user'
import { Role } from '../db/entities/userEnum/role'
import { Job } from '../db/entities/userEnum/job'
import { Repository } from './protocol/repository'

class UserRepository implements Repository {
  private readonly userRepository
  constructor() {
    this.userRepository = dataSource.getRepository(User)
  }

  async findToAuthenticate(userInput: string): Promise<User> {
    const userPassword = await this.userRepository.find({
      where: [
        { username: userInput },
        { email: userInput },
        { cpf: userInput }
      ], // Encontrando o usuário pelo nome ou email ou cpf.
      select: [
        'password',
        'email',
        'name',
        'id',
        'role',
        'job',
        'cpf',
        'temporarypassword',
        'isDeleted'
      ] // Retornando somente o que está entre as chaves.
    })
    return userPassword[0]
  }

  async updateOne(userData: any): Promise<boolean> {
    // Verifique se o userId é definido antes de fazer a consulta
    if (userData === undefined) {
      return false
    }
    const updateUserData = Object.assign({}, userData)
    delete updateUserData.userId
    await this.userRepository.update(userData.userId, updateUserData)
    return true
  }

  async deleteOne(userId: string): Promise<void> {
    console.log('Deletou: ', userId)
    await this.userRepository.update(userId, {
      isDeleted: true,
      deletedAt: new Date()
    })
  }

  async findOne(userId: string): Promise<any> {
    // Verifique se o userId é definido antes de fazer a consulta
    if (userId === undefined) {
      return undefined
    }
    const user = await this.userRepository.findOneBy({
      id: userId,
      isDeleted: false
    })
    if (!user) {
      return null
    }
    return user
  }

  async findOneByEmail(email: string): Promise<any> {
    // Verifique se o email é definido antes de fazer a consulta
    if (email === undefined) {
      return undefined
    }
    const user = await this.userRepository.findOneBy({
      email,
      isDeleted: false
    })
    if (!user) {
      return undefined
    }
    return user
  }

  async findAll(): Promise<any> {
    const users = await this.userRepository.find({
      // where: { isDeleted: false }
    })
    return users
  }

  async findOneByUsername(username: string): Promise<any> {
    // Verifique se o username é definido antes de fazer a consulta
    if (username === undefined) {
      return undefined
    }
    // Consulta o usuário com o username fornecido e isDeleted: false
    const user = await this.userRepository.findOneBy({
      username,
      isDeleted: false
    })
    if (!user) {
      return undefined
    }
    return user
  }

  async findOneByCpf(cpf: string): Promise<User | undefined> {
    // Verifique se o username é definido antes de fazer a consulta
    if (cpf === undefined) {
      return undefined
    }
    const user = await this.userRepository.findOneBy({
      cpf,
      isDeleted: false
    })
    if (!user) {
      return undefined
    }
    return user
  }

  async createUser(params: {
    name: string
    email: string
    username: string
    cpf: string
    job: Job
    role: Role
    password: string
    temporaryPassword: boolean
  }): Promise<User | undefined> {
    const {
      name,
      email,
      password,
      username,
      cpf,
      job,
      role,
      temporaryPassword
    } = params
console.log(params);
    const user = this.userRepository.create({
      name,
      email: email !== '' ? email : undefined,
      password,
      username,
      cpf,
      job: job ?? Job.GENERICO,
      role: role ?? Role.BASICO,
      temporarypassword: temporaryPassword
    })
console.log(user);
    await this.userRepository.save(user)
    return user
  }
}

export default UserRepository

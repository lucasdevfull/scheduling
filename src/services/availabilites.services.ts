import { ConflictError, InternalServerError } from '@/common/errors.ts'
import { AvailabilitiesRepository } from '@/repositories/availabilities.repository.ts'
import { Service } from '@/types/availabilities.types.ts'

export class AvailabilitiesServices {
  private availabilitiesRepository: AvailabilitiesRepository

  constructor(availabilitiesRepository: AvailabilitiesRepository) {
    this.availabilitiesRepository = availabilitiesRepository
  }

  async findAllAvailabilities(limit: number, cursor: number) {
    return this.availabilitiesRepository.findAll(limit, cursor)
  }

  async createAvailiabilities(data: Service) {
    const [serviceExists] = await this.availabilitiesRepository.findByName(
      data.name
    )
    console.log(`s: ${serviceExists}`)
    if (serviceExists) {
      console.log({ teste: 'tentei' })
      throw new ConflictError('Serviço já cadastrado no sistema')
    }

    try {
      const result = await this.availabilitiesRepository.create(data)
      return result
    } catch (error) {
      throw new InternalServerError('Erro interno no servidor')
    }
  }
}

import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '@/common/errors.ts'
import { AvailabilitiesRepository } from '@/repositories/availabilities.repository.ts'
import { Service, UpdateService } from '@/types/availabilities.types.ts'

export class AvailabilitiesServices {
  private availabilitiesRepository: AvailabilitiesRepository

  constructor(availabilitiesRepository: AvailabilitiesRepository) {
    this.availabilitiesRepository = availabilitiesRepository
  }

  async findAllAvailabilities(limit: number, cursor: number) {
    return this.availabilitiesRepository.findAll(limit, cursor)
  }

  async createAvailiabilities(data: Service) {
    data.availabilities.forEach(({ startTime, endTime }) => {
      const [startH, startM] = startTime.split(':').map(Number)
      const [endH, endM] = endTime.split(':').map(Number)
      if (!(endH > startH || (endH === startH && endM > startM))) {
        throw new BadRequestError(
          'O tempo final deve ser maior do que a hora de início'
        )
      }
    })

    const serviceExists = await this.availabilitiesRepository.findByName(
      data.name
    )
    if (serviceExists) {
      throw new ConflictError('Serviço já cadastrado no sistema')
    }

    try {
      const result = await this.availabilitiesRepository.create(data)
      return result
    } catch (error) {
      throw new InternalServerError('Erro interno no servidor')
    }
  }

  async findServiceById(id: number) {
    const service = await this.availabilitiesRepository.findById(id)
    if (!service) {
      throw new NotFoundError('Serviço não encontrado')
    }
    return service
  }

  async findAvailabilitiesById(id: number, serviceId: number) {
    const service = await this.availabilitiesRepository.findAvailabilitiesById(
      id,
      serviceId
    )
    if (!service) {
      throw new NotFoundError('Disponibilidade não encontrado')
    }
    return service
  }

  async updateService(id: number, data: UpdateService) {
    const service = await this.availabilitiesRepository.findById(id)
    if (!service) {
      throw new NotFoundError('Serviço não encontrado')
    }

    data.availabilities.forEach(({ startTime, endTime }) => {
      const [startH, startM] = startTime.split(':').map(Number)
      const [endH, endM] = endTime.split(':').map(Number)
      if (!(endH > startH || (endH === startH && endM > startM))) {
        throw new BadRequestError(
          'O tempo final deve ser maior do que a hora de início'
        )
      }
    })

    const result = await this.availabilitiesRepository.update(id, data)

    return result
  }

  async deleteAvailibilities(id: number, serviceId: number) {
    const service = await this.availabilitiesRepository.findById(id)
    if (!service) {
      throw new NotFoundError('Serviço não encontrado')
    }

    try {
      await this.availabilitiesRepository.deleteAvailabilities(id, serviceId)
      return { message: 'Deletado com sucesso' }
    } catch (error) {
      throw new InternalServerError('Erro interno no servidor')
    }
  }

  async delete(serviceId: number) {
    const service = await this.availabilitiesRepository.findById(serviceId)
    if (!service) {
      throw new NotFoundError('Serviço não encontrado')
    }

    try {
      await this.availabilitiesRepository.delete(serviceId)
      return { message: 'Deletado com sucesso' }
    } catch (error) {
      throw new InternalServerError('Erro interno no servidor')
    }
  }
}

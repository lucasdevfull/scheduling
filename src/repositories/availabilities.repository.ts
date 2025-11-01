// import { db, prisma } from '@/db/index.ts'
// import { Service, UpdateService } from '@/types/availabilities.types.ts'
// import { srtToTime } from '@/utils/datetime.ts'
// import { v7 } from 'uuid'

// export class AvailabilitiesRepository {
//   async findAll(limit: number, cursor: number) {
//     const result = await prisma.service.findMany({
//       where: cursor ? { id: { gt: cursor } } : undefined,
//       take: limit + 1,
//       orderBy: { id: 'asc' },
//       include: {
//         availabilities: {
//           select: {
//             id: true,
//             dayId: true,
//             startTime: true,
//             endTime: true,
//           },
//         },
//       },
//     })

//     return {
//       result,
//       nextCursor: result.length !== 0 ? result[result.length - 1].id : null,
//       hasNextPage: result.length > limit,
//     }
//   }

//   async create({ name, availabilities }: Service) {
//     return prisma.$transaction(async tx => {
//       const service = await tx.service.create({
//         data: {
//           name,
//           availabilities: {
//             create: availabilities.map(a => ({
//               dayId: a.dayId,
//               startTime: srtToTime(a.startTime),
//               endTime: srtToTime(a.endTime),
//             })),
//           },
//         },
//         include: { availabilities: true }, // retorna service + availabilities
//       })
//       return service
//     })
//   }

//   async findById(id: number) {
//     const data = await prisma.service.findUnique({
//       where: { id },
//       include: {
//         availabilities: {
//           select: {
//             id: true,
//             dayId: true,
//             startTime: true,
//             endTime: true,
//           },
//         },
//       },
//     })
//     return data
//   }

//   async findAvailabilitiesById(id: number, serviceId: number) {
//     const data = await prisma.availability.findUnique({
//       where: { id, serviceId },
//     })
//     return data
//   }

//   async findByName(name: string) {
//     const data = await prisma.service.findFirst({
//       where: { name },
//       include: {
//         availabilities: {
//           select: {
//             id: true,
//             dayId: true,
//             startTime: true,
//             endTime: true,
//           },
//         },
//       },
//     })
//     return data
//   }
//   async update(id: number, data: UpdateService) {
//     return prisma.service.update({
//       where: { id },
//       data: {
//         name: data.name,
//         availabilities: {
//           // Itera sobre cada disponibilidade recebida
//           upsert: data.availabilities.map(a => ({
//             where: { id: a.id ?? 0 }, // se não tiver id, esse valor não vai achar nada
//             update: {
//               dayId: a.dayId,
//               startTime: srtToTime(a.startTime),
//               endTime: srtToTime(a.endTime),
//             },
//             create: {
//               dayId: a.dayId,
//               startTime: srtToTime(a.startTime),
//               endTime: srtToTime(a.endTime),
//             },
//           })),
//         },
//       },
//       include: {
//         availabilities: {
//           omit: {
//             serviceId: true,
//             createdAt: true,
//             updatedAt: true,
//           },
//         },
//       },
//       omit: {
//         createdAt: true,
//       },
//     })
//   }
//   async delete(id: number) {
//     return prisma.service.delete({
//       where: {
//         id,
//       },
//     })
//   }

//   async deleteAvailabilities(id: number, serviceId: number) {
//     return prisma.availability.delete({
//       where: {
//         serviceId,
//         id,
//       },
//     })
//   }
// }

import { HttpError } from '@/common/base/errors.ts'
import { db } from '@/db/index.ts'
import { Service, UpdateService } from '@/types/availabilities.types.ts'
import { srtToTime } from '@/utils/datetime.ts'
import { getNextId } from '@/utils/index.ts'

export class AvailabilitiesRepository {
  async findAll(limit: number, cursor?: number) {
    const serviceRef = db.collection('service')
    let queryRef: FirebaseFirestore.Query = serviceRef
      .orderBy('id', 'asc')
      .limit(limit + 1)

    if (cursor !== undefined) {
      queryRef = serviceRef
        .where('id', '>', cursor)
        .orderBy('id', 'asc')
        .limit(limit + 1)
    }

    const snapshot = await queryRef.get()

    const services = await Promise.all(
      snapshot.docs.map(async doc => {
        const data = doc.data()
        const serviceIdNum =
          typeof data.id === 'number' ? data.id : Number(data.id)

        const serviceData = {
          id: serviceIdNum,
          name: String(data.name) ?? '',
        }

        // busca availabilities que apontam para esse service pelo campo numeric serviceId
        const availSnap = await db
          .collection('availability')
          .where('serviceId', '==', serviceIdNum)
          .get()

        const availabilities = availSnap.docs.map(a => {
          const adata = a.data()
          const dayId =
            typeof adata.dayId === 'number'
              ? adata.dayId
              : adata.dayId
                ? Number(adata.dayId)
                : null
          // startTime/endTime were stored as strings (HH:mm:ss or similar)
          // convert to ISO for response if present, otherwise return as empty string
          const startTime = adata.startTime
            ? srtToTime(adata.startTime).toISOString()
            : ''
          const endTime = adata.endTime
            ? srtToTime(adata.endTime).toISOString()
            : ''

          return {
            id: typeof adata.id === 'number' ? adata.id : Number(adata.id),
            dayId: Number(adata.dayId), // eu alterei
            startTime,
            endTime,
          }
        })

        return {
          ...serviceData,
          availabilities,
        }
      })
    )

    const hasNextPage = snapshot.docs.length > limit
    const trimmed = hasNextPage ? services.slice(0, limit) : services
    const nextCursor = hasNextPage
      ? (trimmed[trimmed.length - 1]?.id ?? null)
      : null

    return {
      data: trimmed,
      nextCursor,
      hasNextPage,
    }
  }

  // --- CREATE: gera ids numéricos para service e availability (counters) ---
  async create({ name, availabilities }: Service) {
    const serviceCol = db.collection('service')
    const availCol = db.collection('availability')
    const dayCol = db.collection('day')
    // prefetch dos days: assume os docs day têm campo numeric `id`
    const daySnap = await dayCol.get()
    const dayById = new Map<number, { id: number }>()
    for (const d of daySnap.docs) {
      const dayData = d.data()
      const numeric =
        typeof dayData?.id === 'number' ? dayData.id : Number(dayData?.id)
      if (!Number.isNaN(numeric)) dayById.set(numeric, { id: numeric })
    }

    return db.runTransaction(async tx => {
      // next service id
      const nextServiceId = await getNextId(tx, 'service')
      // cria service com campo id numérico (opcional: definir doc id como string(nextServiceId))
      const newServiceRef = serviceCol.doc(String(nextServiceId))

      tx.set(newServiceRef, {
        id: nextServiceId,
        name,
        createdAt: new Date().toISOString(),
      })

      const createdAvailabilities = []

      for (const a of availabilities) {
        //console.log({ path: await tx.get(db.collection('counters').doc('availability'))})
        const nextAvailId = await getNextId(tx, 'availability')

        // dayId já é numérico no cliente (a.dayId). Verifica se existe no map (opcional).
        const dayIdNumeric =
          typeof a.dayId === 'number' ? a.dayId : Number(a.dayId)
        // se quiser validar existência do day, pode checar dayById.has(dayIdNumeric)

        const startTime = srtToTime(a.startTime)
        const endTime = srtToTime(a.endTime)

        const availDocRef = availCol.doc(String(nextAvailId))
        tx.set(availDocRef, {
          id: nextAvailId,
          serviceId: nextServiceId, // salvo como NUMBER (não DocumentReference)
          dayId: dayIdNumeric,
          startTime: startTime.toTimeString(),
          endTime: endTime.toTimeString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        createdAvailabilities.push({
          id: nextAvailId,
          dayId: dayIdNumeric,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
      }

      return {
        id: nextServiceId,
        name,
        availabilities: createdAvailabilities,
      }
    })
  }

  // --- FIND BY ID (service) ---
  async findById(id: number | string) {
    const numericId = typeof id === 'number' ? id : Number(id)
    const serviceSnaps = await db
      .collection('service')
      .doc(String(id))
      //.where('id', '==', numericId)
      //.limit(1)
      .get()

    let sdata: FirebaseFirestore.DocumentData | null = null
    if (!serviceSnaps.exists) {
      return sdata
    }

    sdata = serviceSnaps.data()!

    // busca availabilities vinculadas por campo numeric serviceId
    const availSnap = await db
      .collection('availability')
      .where('serviceId', '==', numericId)
      .get()

    const availabilities = availSnap.docs.map(a => {
      const ad = a.data()
      const dayId =
        typeof ad.dayId === 'number'
          ? ad.dayId
          : ad.dayId
            ? Number(ad.dayId)
            : null
      const startTime = ad.startTime ? srtToTime(ad.startTime) : null
      const endTime = ad.endTime ? srtToTime(ad.endTime) : null

      return {
        id: typeof ad.id === 'number' ? ad.id : Number(ad.id),
        dayId: dayId!, // eu alterei
        startTime: startTime?.toISOString()!,
        endTime: endTime?.toISOString()!,
      }
    })

    return {
      id: sdata.id ?? numericId,
      name: sdata.name ?? '',
      availabilities,
    }
  }

  // --- FIND AVAILABILITY BY ID (quer por field id e serviceId numeric) ---
  async findAvailabilitiesById(
    id: number | string,
    serviceId: number | string
  ) {
    const numericId = typeof id === 'number' ? id : Number(id)
    const numericServiceId =
      typeof serviceId === 'number' ? serviceId : Number(serviceId)

    const availSnap = await db
      .collection('availability')
      .where('id', '==', numericId)
      .where('serviceId', '==', numericServiceId)
      .limit(1)
      .get()

    if (availSnap.empty) return null
    const aDoc = availSnap.docs[0]
    const ad = aDoc.data()

    const dayId =
      typeof ad.dayId === 'number'
        ? ad.dayId
        : ad.dayId
          ? Number(ad.dayId)
          : null
    const startTime = ad.startTime
      ? new Date(`1970-01-01T${ad.startTime}Z`)
      : null
    const endTime = ad.endTime ? new Date(`1970-01-01T${ad.endTime}Z`) : null

    return {
      id: typeof ad.id === 'number' ? ad.id : Number(aDoc.id),
      dayId,
      startTime,
      endTime,
    }
  }

  // --- FIND BY NAME ---
  async findByName(name: string) {
    const serviceSnaps = await db
      .collection('service')
      .where('name', '==', name)
      .limit(1)
      .get()
    if (serviceSnaps.empty) return null
    const serviceDoc = serviceSnaps.docs[0]
    const sdata = serviceDoc.data()

    const numericId = typeof sdata.id === 'number' ? sdata.id : Number(sdata.id)

    const availSnap = await db
      .collection('availability')
      .where('serviceId', '==', numericId)
      .get()

    const availabilities = availSnap.docs.map(a => {
      const ad = a.data()
      const dayId =
        typeof ad.dayId === 'number'
          ? ad.dayId
          : ad.dayId
            ? Number(ad.dayId)
            : null
      const startTime = ad.startTime ? srtToTime(ad.startTime) : null
      const endTime = ad.endTime ? srtToTime(ad.endTime) : null

      return {
        id: typeof ad.id === 'number' ? ad.id : Number(ad.id),
        dayId: dayId,
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
      }
    })

    return {
      id: sdata.id ?? numericId,
      name: sdata.name ?? '',
      availabilities,
    }
  }

  // --- UPDATE: upsert availabilities, mantendo ids numéricos ---
  async update(id: number | string, data: UpdateService) {
    const numericId = typeof id === 'number' ? id : Number(id)
    const serviceSnaps = await db
      .collection('service')
      .where('id', '==', numericId)
      .limit(1)
      .get()
    if (serviceSnaps.empty) throw new HttpError(404, 'Service not found')
    const serviceDoc = serviceSnaps.docs[0]
    const serviceRef = serviceDoc.ref

    await db.runTransaction(async tx => {
      tx.update(serviceRef, { name: data.name })

      for (const a of data.availabilities) {
        if (a.id) {
          // tenta achar availability com id e serviceId == numericId
          const availQuerySnap = await db
            .collection('availability')
            .where('id', '==', a.id)
            .where('serviceId', '==', numericId)
            .limit(1)
            .get()

          if (!availQuerySnap.empty) {
            const availDocRef = availQuerySnap.docs[0].ref
            tx.update(availDocRef, {
              dayId: a.dayId,
              startTime: srtToTime(a.startTime).toTimeString(),
              endTime: srtToTime(a.endTime).toTimeString(),
            })
            continue
          }
        }

        // se não achou (ou não veio id), cria nova availability com id numérico
        const newAvailId = await getNextId(tx, 'availability')
        const newAvailRef = db
          .collection('availability')
          .doc(String(newAvailId))
        tx.set(newAvailRef, {
          id: newAvailId,
          serviceId: numericId,
          dayId: a.dayId,
          startTime: srtToTime(a.startTime).toTimeString(),
          endTime: srtToTime(a.endTime).toTimeString(),
        })
      }
    })

    return this.findById(numericId)
  }

  // --- DELETE SERVICE + AVAILABILITIES ---
  async delete(id: number | string) {
    const numericId = typeof id === 'number' ? id : Number(id)
    const serviceSnaps = await db.collection('service').doc(String(id)).get()
    if (!serviceSnaps.exists) throw new HttpError(404, 'Service not found')
    const serviceRef = serviceSnaps.ref

    await db.runTransaction(async tx => {
      const availSnap = await db
        .collection('availability')
        .where('serviceId', '==', numericId)
        .get()
      for (const a of availSnap.docs) {
        tx.delete(a.ref)
      }
      tx.delete(serviceRef)
    })
    return { id: numericId, deleted: true }
  }

  // --- DELETE AVAILABILITY ESPECÍFICA ---
  async deleteAvailabilities(id: number | string, serviceId: number | string) {
    const numericId = typeof id === 'number' ? id : Number(id)
    const numericServiceId =
      typeof serviceId === 'number' ? serviceId : Number(serviceId)

    const availSnap = await db
      .collection('availability')
      .where('id', '==', numericId)
      .where('serviceId', '==', numericServiceId)
      .limit(1)
      .get()

    if (availSnap.empty) throw new Error('Availability not found')
    await availSnap.docs[0].ref.delete()

    return { id: numericId, deleted: true }
  }
}

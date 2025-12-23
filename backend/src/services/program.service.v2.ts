import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();

// Get all programs with optional filters
export const getAllProgramsService = async (filters = {}) => {
  try {
    const programs = await prisma.program.findMany({
      where: filters,
      include: {
        place: true,
        registrations: {
          include: {
            beneficiary: {
              include: {
                user: true
              }
            }
          }
        },
        stallReservations: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Sanitize place fields: do not return suspiciously short name/address values to clients
    const sanitized = programs.map((p:any) => {
      if (p.place) {
        try {
          if (!p.place.name || typeof p.place.name !== 'string' || p.place.name.trim().length < 3) p.place.name = '';
          if (!p.place.address || typeof p.place.address !== 'string' || p.place.address.trim().length < 3) p.place.address = '';
        } catch (e) {
          p.place.name = p.place.name || '';
          p.place.address = p.place.address || '';
        }
      }
      return p;
    });

    return {
      success: true,
      data: sanitized,
      count: sanitized.length
    };
  } catch (error:any) {
    return {
      success: false,
      error: `Failed to fetch programs: ${error.message}`
    };
  }
};

// Get single program by ID
export const getProgramByIdService = async (id:any) => {
  try {
    if (!id || typeof id !== 'string') {
      return {
        success: false,
        error: 'Invalid program ID format'
      };
    }

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        place: true,
        registrations: {
          include: {
            beneficiary: {
              include: {
                user: true,
                address: true
              }
            }
          }
        },
        stallReservations: true
      }
    });

    if (!program) {
      return {
        success: false,
        error: `Program with ID ${id} not found`,
        code: 'NOT_FOUND'
      };
    }

    // Sanitize place fields to avoid returning tiny/invalid values
    if (program.place) {
      try {
        if (!program.place.name || typeof program.place.name !== 'string' || program.place.name.trim().length < 3) program.place.name = '';
        if (!program.place.address || typeof program.place.address !== 'string' || program.place.address.trim().length < 3) program.place.address = '';
      } catch (e) {
        program.place.name = program.place.name || '';
        program.place.address = program.place.address || '';
      }
    }

    return {
      success: true,
      data: program
    };
  } catch (error:any) {
    return {
      success: false,
      error: `Failed to fetch program: ${error.message}`
    };
  }
};

// Create new program
export const createProgramService = async (data:any) => {
  try {
    // Validate required fields
    if (!data.title || !data.title.trim()) {
      return {
        success: false,
        error: 'Program title is required',
        field: 'title'
      };
    }

    if (!data.description || !data.description.trim()) {
      return {
        success: false,
        error: 'Program description is required',
        field: 'description'
      };
    }

    if (!data.date) {
      return {
        success: false,
        error: 'Program date is required',
        field: 'date'
      };
    }

    // Allow maxParticipants to be 0 to indicate registration disabled
    if (data.maxParticipants === undefined || data.maxParticipants === null || isNaN(data.maxParticipants) || data.maxParticipants < 0) {
      return {
        success: false,
        error: 'Max participants must be a non-negative number',
        field: 'maxParticipants'
      };
    }

    if (data.stallCapacity !== undefined && (isNaN(data.stallCapacity) || data.stallCapacity < 0)) {
      return {
        success: false,
        error: 'Stall capacity must be a non-negative number',
        field: 'stallCapacity'
      };
    }

    if (!data.placeId || typeof data.placeId !== 'string') {
      return {
        success: false,
        error: 'Valid place ID is required',
        field: 'placeId'
      };
    }

    // Validate date is in the future
    const programDate = new Date(data.date);
    if (isNaN(programDate.getTime())) {
      return {
        success: false,
        error: 'Invalid date format. Use ISO 8601 format',
        field: 'date'
      };
    }

    // Validate date is at least 24 hours in the future
    const now = new Date();
    const minScheduleTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    if (programDate < minScheduleTime) {
      return {
        success: false,
        error: 'Program must be scheduled at least 24 hours in advance',
        field: 'date'
      };
    }

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { id: data.placeId }
    });

    if (!place) {
      return {
        success: false,
        error: `Place with ID ${data.placeId} does not exist`,
        field: 'placeId'
      };
    }

    // Create program
    const newProgram = await prisma.program.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        date: programDate,
        maxParticipants: parseInt(data.maxParticipants) || 0,
        placeId: data.placeId,
        stallCapacity: data.stallCapacity !== undefined ? parseInt(data.stallCapacity) : 0
        // status defaults to PENDING via schema
      },
      include: {
        place: true,
        registrations: true,
        stallReservations: true
      }
    });

    return {
      success: true,
      data: newProgram,
      message: 'Program created successfully'
    };
  } catch (error:any) {
    return {
      success: false,
      error: `Failed to create program: ${error.message}`
    };
  }
};

// Update program (can't update maxParticipants or date if already started)
export const updateProgramService = async (id:any, updateData:any) => {
  try {
    if (!id || typeof id !== 'string') {
      return {
        success: false,
        error: 'Invalid program ID format'
      };
    }

    // Get current program
    const currentProgram = await prisma.program.findUnique({
      where: { id }
    });

    if (!currentProgram) {
      return {
        success: false,
        error: `Program with ID ${id} not found`,
        code: 'NOT_FOUND'
      };
    }

    // Check if program has already started
    const now = new Date();
    const programStarted = currentProgram.date <= now;

    // Validate that we can't update maxParticipants if program started or scheduled
    if (updateData.maxParticipants !== undefined && updateData.maxParticipants !== null) {
      if (programStarted || currentProgram.status === 'APPROVED') {
        return {
          success: false,
          error: 'Cannot update maximum participants for scheduled or ongoing programs',
          field: 'maxParticipants'
        };
      }

      if (isNaN(updateData.maxParticipants) || updateData.maxParticipants < 0) {
        return {
          success: false,
          error: 'Max participants must be a non-negative number',
          field: 'maxParticipants'
        };
      }
    }

    // Validate stallCapacity updates
    if (updateData.stallCapacity !== undefined && updateData.stallCapacity !== null) {
      if (programStarted || currentProgram.status === 'APPROVED') {
        return {
          success: false,
          error: 'Cannot update stall capacity for scheduled or ongoing programs',
          field: 'stallCapacity'
        };
      }

      if (isNaN(updateData.stallCapacity) || updateData.stallCapacity < 0) {
        return {
          success: false,
          error: 'Stall capacity must be a non-negative number',
          field: 'stallCapacity'
        };
      }
    }

    // Validate that we can't update date if program started
    if (updateData.date !== undefined && updateData.date !== null) {
      if (currentProgram.status === 'APPROVED' || currentProgram.status === 'CLAIMED') {
        return {
          success: false,
          error: 'Cannot update date for scheduled or completed programs',
          field: 'date'
        };
      }

      const newDate = new Date(updateData.date);
      if (isNaN(newDate.getTime())) {
        return {
          success: false,
          error: 'Invalid date format. Use ISO 8601 format',
          field: 'date'
        };
      }

      if (newDate < new Date()) {
        return {
          success: false,
          error: 'Program date must be in the future',
          field: 'date'
        };
      }
    }

    // Validate status if provided
    if (updateData.status !== undefined && updateData.status !== null) {
      const validStatuses = ['PENDING', 'APPROVED', 'CLAIMED', 'CANCELED', 'REJECTED'];
      if (!validStatuses.includes(updateData.status)) {
        return {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          field: 'status'
        };
      }

      // Can't cancel or reject if already started
      if ((updateData.status === 'CANCELED' || updateData.status === 'REJECTED') && currentProgram.status === 'CLAIMED') {
        return {
          success: false,
          error: 'Cannot cancel or reject a program that has already been completed',
          field: 'status'
        };
      }
    }

    // Validate placeId if provided
    if (updateData.placeId !== undefined && updateData.placeId !== null) {
      const place = await prisma.place.findUnique({
        where: { id: updateData.placeId }
      });

      if (!place) {
        return {
          success: false,
          error: `Place with ID ${updateData.placeId} does not exist`,
          field: 'placeId'
        };
      }
    }

    // Build update data with only allowed fields
    const allowedFields = ['title', 'description', 'date', 'maxParticipants', 'status', 'placeId', 'stallCapacity'];
    const dataToUpdate = {};

    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        if (key === 'date') {
          dataToUpdate[key] = new Date(updateData[key]);
        } else if (key === 'maxParticipants') {
          dataToUpdate[key] = parseInt(updateData[key]);
        } else if (key === 'stallCapacity') {
          dataToUpdate[key] = parseInt(updateData[key]);
        } else if (key === 'title' || key === 'description') {
          dataToUpdate[key] = updateData[key].trim();
        } else {
          dataToUpdate[key] = updateData[key];
        }
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return {
        success: false,
        error: 'No valid fields provided for update'
      };
    }

    // Update program
    // If decreasing maxParticipants, remove excess registrations (latest registrations removed)
    if (dataToUpdate.maxParticipants !== undefined && dataToUpdate.maxParticipants < currentProgram.maxParticipants) {
      const newMax = dataToUpdate.maxParticipants;
      const regs = await prisma.programRegistration.findMany({ where: { programId: id }, orderBy: { registeredAt: 'asc' } });
      if (regs.length > newMax) {
        const toRemove = regs.slice(newMax); // keep earliest `newMax`, remove later ones
        for (const r of toRemove) {
          // Delete any program applications tied to this registration
          await prisma.programApplication.deleteMany({ where: { registrationId: r.id } });
          // Delete the registration
          await prisma.programRegistration.delete({ where: { id: r.id } });
        }
      }
    }

    // If decreasing stallCapacity, remove excess stall reservations (latest reserved removed)
    if (dataToUpdate.stallCapacity !== undefined && dataToUpdate.stallCapacity < (currentProgram.stallCapacity || 0)) {
      const newCapacity = dataToUpdate.stallCapacity;
      const stalls = await prisma.stallReservation.findMany({ where: { programId: id }, orderBy: { reservedAt: 'asc' } });
      if (stalls.length > newCapacity) {
        const toRemoveStalls = stalls.slice(newCapacity);
        for (const s of toRemoveStalls) {
          // Delete related stall application if exists
          await prisma.stallApplication.deleteMany({ where: { stallReservationId: s.id } });
          // Delete the reservation
          await prisma.stallReservation.delete({ where: { id: s.id } });
        }
      }
    }

    const updatedProgram = await prisma.program.update({
      where: { id },
      data: dataToUpdate,
      include: {
        place: true,
        registrations: {
          include: {
            beneficiary: {
              include: {
                user: true
              }
            }
          }
        },
        stallReservations: true
      }
    });

    return {
      success: true,
      data: updatedProgram,
      message: 'Program updated successfully'
    };
  } catch (error:any) {
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Program not found',
        code: 'NOT_FOUND'
      };
    }

    return {
      success: false,
      error: `Failed to update program: ${error.message}`
    };
  }
};

// Publish/approve program (make visible to public)
export const publishProgramService = async (id:any) => {
  try {
    const program = await prisma.program.findUnique({
      where: { id }
    });

    if (!program) {
      return {
        success: false,
        error: 'Program not found',
        code: 'NOT_FOUND'
      };
    }

    if (program.status !== 'PENDING') {
      return {
        success: false,
        error: `Cannot publish program with status '${program.status}'. Only PENDING programs can be published.`
      };
    }

    const updated = await prisma.program.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        place: true,
        registrations: true,
        donations: true
      }
    });

    return {
      success: true,
      data: updated,
      message: 'Program published successfully'
    };
  } catch (error:any) {
    return {
      success: false,
      error: `Failed to publish program: ${error.message}`
    };
  }
};

// Cancel program — delete program and related data
export const cancelProgramService = async (id:any, reason = '') => {
  try {
    const program = await prisma.program.findUnique({ where: { id } });

    if (!program) {
      return { success: false, error: 'Program not found', code: 'NOT_FOUND' };
    }

    if (program.status === 'CLAIMED') {
      return { success: false, error: 'Cannot delete a program that has already been completed' };
    }

    // Collect related registrations and stall reservations
    const registrations = await prisma.programRegistration.findMany({ where: { programId: id } });
    const registrationIds = registrations.map((r:any) => r.id);

    const stallReservations = await prisma.stallReservation.findMany({ where: { programId: id } });
    const stallIds = stallReservations.map((s:any) => s.id);

    // Perform deletions in a transaction for safety
    await prisma.$transaction([
      // delete program applications tied to registrations
      prisma.programApplication.deleteMany({ where: { registrationId: { in: registrationIds.length ? registrationIds : ['__none__'] } } }),
      // delete registrations
      prisma.programRegistration.deleteMany({ where: { id: { in: registrationIds.length ? registrationIds : ['__none__'] } } }),
      // delete stall applications tied to stall reservations
      prisma.stallApplication.deleteMany({ where: { stallReservationId: { in: stallIds.length ? stallIds : ['__none__'] } } }),
      // delete stall reservations
      prisma.stallReservation.deleteMany({ where: { id: { in: stallIds.length ? stallIds : ['__none__'] } } }),
      // finally delete the program itself
      prisma.program.delete({ where: { id } })
    ]);

    return {
      success: true,
      data: { id },
      message: `Program deleted successfully${reason ? ': ' + reason : ''}`
    };
  } catch (error:any) {
    return { success: false, error: `Failed to delete program: ${error.message}` };
  }
};

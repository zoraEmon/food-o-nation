import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();

async function logActivity(userId: string | undefined, action: string, details?: string) {
  if (!userId || !prisma.activityLog) return;
  try {
    await prisma.activityLog.create({ data: { userId, action, details } });
  } catch (err) {
    console.error('Failed to log activity', err);
  }
}

export class NewsletterService {
  async create(data: {
    headline: string;
    content: string;
    images?: string[];
    adminId: string;
    userId?: string;
  }) {
    const newsletter = await prisma.newsletter.create({
      data: {
        headline: data.headline,
        content: data.content,
        images: data.images || [],
        adminId: data.adminId,
      },
      include: {
        admin: {
          include: {
            user: {
              select: {
                email: true,
                id: true,
              },
            },
          },
        },
      },
    });

    await logActivity(
      data.userId,
      'NEWSLETTER_CREATED',
      `Newsletter created: ${newsletter.headline}`
    );

    return newsletter;
  }

  async update(
    id: string,
    data: {
      headline?: string;
      content?: string;
      images?: string[];
      userId?: string;
    }
  ) {
    const newsletter = await prisma.newsletter.update({
      where: { id },
      data: {
        headline: data.headline,
        content: data.content,
        images: data.images,
      },
      include: {
        admin: {
          include: {
            user: {
              select: {
                email: true,
                id: true,
              },
            },
          },
        },
      },
    });

    await logActivity(
      data.userId,
      'NEWSLETTER_UPDATED',
      `Newsletter updated: ${newsletter.headline}`
    );

    return newsletter;
  }

  async delete(id: string, userId?: string) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      throw new Error('Newsletter not found');
    }

    await prisma.newsletter.delete({
      where: { id },
    });

    await logActivity(
      userId,
      'NEWSLETTER_DELETED',
      `Newsletter deleted: ${newsletter.headline}`
    );

    return { message: 'Newsletter deleted successfully' };
  }

  async getById(id: string) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
      include: {
        admin: {
          include: {
            user: {
              select: {
                email: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!newsletter) {
      throw new Error('Newsletter not found');
    }

    return newsletter;
  }

  async getAll(params?: {
    page?: number;
    limit?: number;
    orderBy?: 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    const orderBy = params?.orderBy || 'createdAt';
    const order = params?.order || 'desc';

    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        skip,
        take: limit,
        orderBy: {
          [orderBy]: order,
        },
        include: {
          admin: {
            include: {
              user: {
                select: {
                  email: true,
                  id: true,
                },
              },
            },
          },
        },
      }),
      prisma.newsletter.count(),
    ]);

    return {
      newsletters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLatest(limit: number = 5) {
    const newsletters = await prisma.newsletter.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        admin: {
          include: {
            user: {
              select: {
                email: true,
                id: true,
              },
            },
          },
        },
      },
    });

    return newsletters;
  }
}

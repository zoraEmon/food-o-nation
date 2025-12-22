type Donor = {
  id: string;
  displayName: string;
  donorType: 'INDIVIDUAL' | 'ORGANIZATION' | 'BUSINESS';
  totalDonation?: number;
  points?: number;
  creditBalance: number;
  user?: { email: string };
};

type DonationCenter = {
  id: string;
  place?: { name?: string; address?: string };
  contactInfo?: string;
};

type DonationItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  donationId: string;
};

type ActivityLog = {
  id: string;
  action: string;
  details?: string;
  userId: string;
  createdAt: Date;
};

type Donation = {
  id: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: Date;
  donorId?: string;
  donationCenterId?: string;
  imageUrls: string[];
  qrCodeRef?: string | null;
  monetaryAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  paymentStatus?: 'PENDING' | 'VERIFIED' | 'FAILED';
  paymentProvider?: string;
  paymentVerifiedAt?: Date;
  donor?: Donor;
  donationCenter?: DonationCenter;
  items: DonationItem[];
};

type AppMetric = {
  id: string;
  totalMonetary: number;
  updatedAt: Date;
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class PrismaMock {
  donors: Donor[] = [];
  donationCenters: DonationCenter[] = [];
  donations: Donation[] = [];
  donationItems: DonationItem[] = [];
  activityLogs: ActivityLog[] = [];
  appMetricData: AppMetric | null = null;
  // Questions for survey tests
  questions: { id: string; text: string; type: string; createdAt: Date }[] = [];

  // Minimal user storage for auth-related tests
  users: any[] = [];
  beneficiaries: any[] = [];

  constructor() {
    // Seed basic donor + center so tests can run
    const donorId = '00000000-0000-0000-0000-000000000001';
    const centerId = '11111111-1111-4111-8111-111111111111';
    this.donors.push({ id: donorId, displayName: 'Test Donor', donorType: 'INDIVIDUAL', creditBalance: 0, user: { email: 'donor@test.local' } });
    this.donationCenters.push({ id: centerId, place: { name: 'Test Center', address: '123 Test St' }, contactInfo: '123-4567' });
    this.appMetricData = { id: 'app-metrics', totalMonetary: 0, updatedAt: new Date() };

    // Seed minimal survey questions so tests and services reading questions are fast
    this.questions.push(
      { id: 'q-1', text: 'How often do you eat fruits?', type: 'FOOD_FREQUENCY', createdAt: new Date(2020, 0, 1) },
      { id: 'q-2', text: 'How many meals per day?', type: 'MEAL_FREQUENCY', createdAt: new Date(2020, 0, 2) },
      { id: 'q-3', text: 'Do you worry about food running out?', type: 'FOOD_SECURITY_SEVERITY', createdAt: new Date(2020, 0, 3) }
    );
  }

  donor = {
    findUnique: async ({ where, include }: any) => {
      const donor = this.donors.find((d) => d.id === where.id) || null;
      if (!donor) return null;
      // Return with user relation if requested
      if (include?.user && donor.user) {
        return { ...donor, user: donor.user };
      }
      return donor;
    },
    update: async ({ where, data }: any) => {
      const d = this.donors.find((x) => x.id === where.id);
      if (!d) throw new Error('Donor not found');
      if (data.totalDonation?.increment) d.totalDonation = (d.totalDonation || 0) + data.totalDonation.increment;
      if (data.creditBalance?.increment) d.creditBalance = (d.creditBalance || 0) + data.creditBalance.increment;
      if (data.points?.increment) d.points = (d.points || 0) + data.points.increment;
      return d;
    },
  };

  donationCenter = {
    findUnique: async ({ where }: any) => this.donationCenters.find((c) => c.id === where.id) || null,
  };

  donation = {
    create: async ({ data, include }: any) => {
      const id = uuid();
      const donation: Donation = {
        id,
        status: data.status ?? 'SCHEDULED',
        scheduledDate: data.scheduledDate ?? new Date(),
        donorId: data.donor?.connect?.id,
        donationCenterId: data.donationCenter?.connect?.id,
        imageUrls: data.imageUrls ?? [],
        monetaryAmount: data.monetaryAmount,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        paymentProvider: data.paymentProvider,
        paymentStatus: data.paymentStatus ?? 'PENDING',
        paymentVerifiedAt: data.paymentVerifiedAt,
        donor: include?.donor ? this.donors.find((d) => d.id === data.donor?.connect?.id) || undefined : undefined,
        donationCenter: include?.donationCenter ? this.donationCenters.find((c) => c.id === data.donationCenter?.connect?.id) || undefined : undefined,
        items: [],
      };
      // Handle items.create (single item)
      if (data.items?.create) {
        const item: DonationItem = { id: uuid(), donationId: id, ...data.items.create };
        this.donationItems.push(item);
        donation.items.push(item);
      }
      // Handle items.createMany.data (multiple items)
      if (data.items?.createMany?.data) {
        for (const it of data.items.createMany.data) {
          const item: DonationItem = { id: uuid(), donationId: id, ...it };
          this.donationItems.push(item);
          donation.items.push(item);
        }
      }
      this.donations.push(donation);
      return donation;
    },
    update: async ({ where, data, include }: any) => {
      const d = this.donations.find((x) => x.id === where.id);
      if (!d) throw new Error('Donation not found');
      Object.assign(d, data);
      if (include?.donor) d.donor = d.donorId ? this.donors.find((z) => z.id === d.donorId) : undefined;
      if (include?.donationCenter) d.donationCenter = d.donationCenterId ? this.donationCenters.find((z) => z.id === d.donationCenterId) : undefined;
      if (include?.items) d.items = this.donationItems.filter((i) => i.donationId === d.id);
      return d;
    },
    findUnique: async ({ where, include }: any) => {
      const d = this.donations.find((x) => x.id === where.id) || null;
      if (!d) return null;
      if (include?.donor) d.donor = d.donorId ? this.donors.find((z) => z.id === d.donorId) : undefined;
      if (include?.donationCenter) d.donationCenter = d.donationCenterId ? this.donationCenters.find((z) => z.id === d.donationCenterId) : undefined;
      if (include?.items) d.items = this.donationItems.filter((i) => i.donationId === d.id);
      return d;
    },
    findMany: async ({ where, include, orderBy, take, skip }: any) => {
      let list = [...this.donations];
      if (where?.donorId) list = list.filter((d) => d.donorId === where.donorId);
      if (where?.status) list = list.filter((d) => d.status === where.status);
      list.sort((a, b) => (a.scheduledDate.getTime() > b.scheduledDate.getTime() ? -1 : 1));
      const sliced = list.slice(skip ?? 0, (skip ?? 0) + (take ?? list.length));
      if (include?.donor) sliced.forEach((d) => (d.donor = d.donorId ? this.donors.find((z) => z.id === d.donorId) : undefined));
      if (include?.donationCenter) sliced.forEach((d) => (d.donationCenter = d.donationCenterId ? this.donationCenters.find((z) => z.id === d.donationCenterId) : undefined));
      if (include?.items) sliced.forEach((d) => (d.items = this.donationItems.filter((i) => i.donationId === d.id)));
      return sliced;
    },
    count: async ({ where }: any) => {
      let list = [...this.donations];
      if (where?.donorId) list = list.filter((d) => d.donorId === where.donorId);
      if (where?.status) list = list.filter((d) => d.status === where.status);
      return list.length;
    },
    aggregate: async ({ where, _sum }: any) => {
      let list = [...this.donations];
      if (where?.monetaryAmount?.not === null) list = list.filter((d) => d.monetaryAmount != null);
      if (where?.paymentStatus) list = list.filter((d) => d.paymentStatus === where.paymentStatus);
      let monetarySum = 0;
      if (_sum?.monetaryAmount) {
        monetarySum = list.reduce((acc, d) => acc + (d.monetaryAmount || 0), 0);
      }
      return { _sum: { monetaryAmount: monetarySum } };
    },
  };

  // Minimal question model stub for tests
  question = {
    findMany: async ({ select, orderBy }: any) => {
      let list = [...this.questions];
      if (orderBy?.createdAt === 'asc') {
        list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      } else if (orderBy?.createdAt === 'desc') {
        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      // Apply select projection
      if (select) {
        return list.map(q => {
          const out: any = {};
          if (select.id) out.id = q.id;
          if (select.text) out.text = q.text;
          if (select.type) out.type = q.type;
          return out;
        });
      }
      return list;
    },
  };

  donationItem = {
    aggregate: async ({ where, _sum }: any) => {
      const items = this.donationItems.filter((i) => i.donationId === where.donationId);
      const sum = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
      return { _sum: { quantity: sum } };
    },
  };

  appMetric = {
    upsert: async ({ where, update, create }: any) => {
      const id = where.id;
      if (this.appMetricData && this.appMetricData.id === id) {
        if (update?.totalMonetary?.increment) {
          this.appMetricData.totalMonetary += update.totalMonetary.increment;
          this.appMetricData.updatedAt = new Date();
        }
        if (update?.totalMonetary) {
          this.appMetricData.totalMonetary = update.totalMonetary;
          this.appMetricData.updatedAt = new Date();
        }
        return this.appMetricData;
      }
      this.appMetricData = {
        id,
        totalMonetary: create?.totalMonetary ?? 0,
        updatedAt: new Date(),
      };
      return this.appMetricData;
    },
    findUnique: async ({ where }: any) => {
      if (this.appMetricData && this.appMetricData.id === where.id) return this.appMetricData;
      return null;
    },
  };

  activityLog = {
    create: async ({ data }: any) => {
      const log: ActivityLog = {
        id: uuid(),
        createdAt: new Date(),
        ...data,
      };
      this.activityLogs.push(log);
      return log;
    },
  };

  // Stub for programApplication - returns empty array to avoid crashes
  programApplication = {
    findMany: async () => [],
    updateMany: async () => ({ count: 0 }),
  };

  // Minimal user model functions used in auth controller tests
  user = {
    findUnique: async ({ where }: any) => {
      if (where?.email) return this.users.find(u => u.email === where.email) || null;
      if (where?.id) return this.users.find(u => u.id === where.id) || null;
      return null;
    },
    create: async ({ data, include }: any) => {
      const id = uuid();
      const user: any = {
        id,
        email: data.email,
        password: data.password,
        status: data.status,
        isVerified: data.isVerified,
        otpCode: data.otpCode,
        otpExpiresAt: data.otpExpiresAt,
        profileImage: data.profileImage,
        primaryPhone: data.primaryPhone,
        beneficiaryProfile: null,
        donorProfile: null,
        ...data
      };

      if (data.beneficiaryProfile?.create) {
        const bp = { id: uuid(), ...data.beneficiaryProfile.create };
        this.beneficiaries.push(bp);
        user.beneficiaryProfile = bp;
      }

      this.users.push(user);

      if (include?.beneficiaryProfile) user.beneficiaryProfile = user.beneficiaryProfile || null;

      return user;
    },
  };
}


export default PrismaMock;

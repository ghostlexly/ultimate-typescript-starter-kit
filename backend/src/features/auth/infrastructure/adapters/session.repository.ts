import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Session } from '../../domain/entities';
import { SessionRepositoryPort } from '../../domain/ports';

@Injectable()
export class SessionRepository implements SessionRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<Session | null> {
    const data = await this.db.prisma.session.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return Session.fromPersistence({
      id: data.id,
      accountId: data.accountId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      expiresAt: data.expiresAt,
    });
  }

  async findByAccountId(accountId: string): Promise<Session[]> {
    const data = await this.db.prisma.session.findMany({
      where: { accountId },
    });

    return data.map((session) =>
      Session.fromPersistence({
        id: session.id,
        accountId: session.accountId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        expiresAt: session.expiresAt,
      }),
    );
  }

  async save(session: Session): Promise<void> {
    const data = session.toPersistence();

    await this.db.prisma.session.upsert({
      where: { id: session.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.prisma.session.delete({
      where: { id },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}

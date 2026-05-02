import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService }        from '../../../infrastructure/database/prisma.service';
import { getPaginationMeta, getSkip } from '../../../utils/pagination.utils';
import { CreateAuditEntry }     from '../interfaces/create-audit-entry.interface';
import { AuditFiltersDto }      from '../dto/audit-filters.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  log(entry: CreateAuditEntry): void {
    this.prisma.auditLog
      .create({
        data: {
          userId:      entry.userId,
          module:      entry.module,
          action:      entry.action,
          entityId:    entry.entityId,
          entityName:  entry.entityName,
          description: entry.description,
          before:      entry.before    ?? undefined,
          after:       entry.after     ?? undefined,
          ipAddress:   entry.ipAddress ?? undefined,
        },
      })
      .catch((err) =>
        this.logger.error(`Error registrando auditoría: ${err}`),
      );
  }

  async findAll(filters: AuditFiltersDto) {
    const { page = 1, limit = 50, userId, module, action, startDate, endDate } = filters;

    const where: any = {
      ...(userId    && { userId }),
      ...(module    && { module }),
      ...(action    && { action }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate   && { lte: new Date(endDate) }),
        },
      }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip:    getSkip(page, limit),
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data:       logs,
      pagination: getPaginationMeta(total, { page, limit }),
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where:   { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!log) throw new NotFoundException('Log no encontrado');
    return log;
  }

  async findByUser(userId: string, page = 1, limit = 50) {
    const where = { userId };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip:    getSkip(page, limit),
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data:       logs,
      pagination: getPaginationMeta(total, { page, limit }),
    };
  }
}
import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService }          from '../../../infrastructure/database/prisma.service';
import { UpdateSettingsDto }      from '../dto/update-settings.dto';
import { CreateDiscountRuleDto }  from '../dto/create-discount-rule.dto';
import { UpdateDiscountRuleDto }  from '../dto/update-discount-rule.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.prisma.settings.findMany();
    return settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>,
    );
  }

  async getByKey(key: string): Promise<string | null> {
    const setting = await this.prisma.settings.findUnique({ where: { key } });
    return setting?.value ?? null;
  }

  async getByKeys(keys: string[]): Promise<Record<string, string>> {
    const settings = await this.prisma.settings.findMany({
      where: { key: { in: keys } },
    });
    return settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>,
    );
  }

  async updateMany(dto: UpdateSettingsDto) {
    const entries = Object.entries(dto.settings);

    await Promise.all(
      entries.map(([key, value]) =>
        this.prisma.settings.upsert({
          where:  { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    return this.getAll();
  }

  async getDiscountRules() {
    return this.prisma.discountRule.findMany({
      orderBy: { priority: 'desc' },
    });
  }

  async getActiveDiscountRules() {
    return this.prisma.discountRule.findMany({
      where:   { isActive: true },
      orderBy: { priority: 'desc' },
    });
  }

  async createDiscountRule(dto: CreateDiscountRuleDto) {
    const existing = await this.prisma.discountRule.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Ya existe una regla con ese nombre');

    return this.prisma.discountRule.create({ data: dto as any });
  }

  async updateDiscountRule(id: string, dto: UpdateDiscountRuleDto) {
    const rule = await this.prisma.discountRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regla de descuento no encontrada');

    return this.prisma.discountRule.update({
      where: { id },
      data:  dto as any,
    });
  }

  async deleteDiscountRule(id: string) {
    const rule = await this.prisma.discountRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regla de descuento no encontrada');

    await this.prisma.discountRule.delete({ where: { id } });
    return { message: 'Regla eliminada correctamente' };
  }
}
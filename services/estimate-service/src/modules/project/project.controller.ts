import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAll() {
    return this.prisma.project.findMany();
  }

  @Post()
  async create(@Body() data: { name: string; status?: string }) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        status: data.status?.toUpperCase() || 'ACTIVE',
      },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: { name?: string; status?: string }) {
    return this.prisma.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status.toUpperCase() }),
      },
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.prisma.project.delete({ where: { id } });
    return { id };
  }
}

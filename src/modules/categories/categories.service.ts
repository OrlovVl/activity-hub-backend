import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    // Получение всех основных категорий
    async findAllMain() {
        return this.prisma.mainCategory.findMany();
    }

    // Получение дерева (уже обсуждали, но на всякий случай)
    async getTree() {
        return this.prisma.mainCategory.findMany({
            include: {
                subcategories: {
                    where: { isApproved: true }
                }
            }
        });
    }

    // Поиск подкатегорий по родителю
    async findSubcategories(mainCategoryId?: number, showAll: boolean = false) {
        return this.prisma.subcategory.findMany({
            where: {
                ...(mainCategoryId ? { mainCategoryId } : {}),
                ...(showAll ? {} : { isApproved: true })
            }
        });
    }

    async createSubcategory(userId: number, data: { name: string; description: string; mainCategoryId: number }) {
        return this.prisma.subcategory.create({
            data: { ...data, createdByUserId: userId, isApproved: false }
        });
    }

    async approveSubcategory(id: number) {
        return this.prisma.subcategory.update({
            where: { id },
            data: { isApproved: true }
        });
    }

    async updateSubcategory(id: number, data: any) {
        return this.prisma.subcategory.update({ where: { id }, data });
    }

    async deleteSubcategory(id: number) {
        return this.prisma.subcategory.delete({ where: { id } });
    }
}
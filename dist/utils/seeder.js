"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const prisma_1 = require("../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const seedDatabase = async () => {
    try {
        const userCount = await prisma_1.prisma.user.count();
        if (userCount > 0) {
            return;
        }
        await prisma_1.prisma.category.createMany({
            data: [
                {
                    name: 'Technology',
                    slug: 'technology',
                    description: 'Breakthroughs in tech, networking, system architecture, and computational science.',
                    icon: 'Cpu',
                    color: '#a855f7',
                    sortOrder: 1
                },
                {
                    name: 'Healthcare & Medicine',
                    slug: 'healthcare',
                    description: 'Clinical research, pharmacological discoveries, immunology, and worldwide public health essays.',
                    icon: 'HeartPulse',
                    color: '#f43f5e',
                    sortOrder: 2
                },
                {
                    name: 'Environmental Science',
                    slug: 'environmental',
                    description: 'Ecology studies, biodiversity research, and analytical reports on global ecosystem trends.',
                    icon: 'Trees',
                    color: '#10b981',
                    sortOrder: 3
                },
                {
                    name: 'Humanities & Arts',
                    slug: 'humanities',
                    description: 'Philosophical inquiries, cultural critiques, history essays, and digital artistic reviews.',
                    icon: 'Palette',
                    color: '#f59e0b',
                    sortOrder: 4
                },
                {
                    name: 'Psychology & Mental Health',
                    slug: 'psychology',
                    description: 'Neuroscience-backed studies, cognitive frameworks, and evidence-based mental wellness articles.',
                    icon: 'Smile',
                    color: '#6366f1',
                    sortOrder: 5
                }
            ]
        });
        const passwordHash = await bcrypt_1.default.hash('Password123!', 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: 'sarah.chen@vyra.com',
                username: 'sarahchen',
                passwordHash,
                fullName: 'Dr. Sarah Chen',
                bio: 'Computational biologist at the BioTech Initiative. Researching quantum algorithms for chemical synthesis and molecular docking. Tech writer and digital advocate.',
                avatarUrl: 'https://picsum.photos/seed/sarahchen/200/200',
                bannerUrl: 'https://picsum.photos/seed/banner-sarah/1200/400',
                website: 'https://sarahchen.bio',
                location: 'San Francisco, CA',
                twitterHandle: '@sarahchen_bio',
                role: client_1.UserRole.ADMIN,
                isVerified: true
            }
        });
        const techCategory = await prisma_1.prisma.category.findFirst({ where: { slug: 'technology' } });
        await prisma_1.prisma.post.create({
            data: {
                userId: user.id,
                title: 'Quantum Biochemistry: The Next Frontier in Drug Discovery',
                slug: 'quantum-biochemistry-drug-discovery',
                excerpt: 'How quantum algorithms are accelerating molecular docking and protein folding models from decades to days.',
                content: `<h3>The Quantum Convergence</h3><p>For decades, the discovery of new life-saving medications has been a slow process...</p>`,
                contentFormat: 'rich-text',
                plainTextContent: 'For decades, the discovery of new life-saving medications has been a slow process...',
                coverImageUrl: 'https://picsum.photos/seed/quantum/800/450',
                categoryId: techCategory?.id,
                status: client_1.PostStatus.PUBLISHED,
                visibility: client_1.PostVisibility.PUBLIC,
                moderationStatus: client_1.ModerationStatus.APPROVED,
                isResearch: true,
                doi: '10.1038/s41587-026-1123-x',
                publishedAt: new Date(),
                viewCount: 1540,
                likeCount: 342,
                bookmarkCount: 88,
                readCount: 1200
            }
        });
    }
    catch (error) {
        console.error('Error seeding database', error);
    }
};
exports.seedDatabase = seedDatabase;

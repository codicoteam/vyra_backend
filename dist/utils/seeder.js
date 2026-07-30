"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const user_model_1 = require("../models/user.model");
const category_model_1 = require("../models/category.model");
const story_model_1 = require("../models/story.model");
const roles_1 = require("../constants/roles");
const seedDatabase = async () => {
    try {
        const userCount = await user_model_1.User.countDocuments();
        if (userCount > 0) {
            console.log('Database already seeded');
            return;
        }
        console.log('Seeding database...');
        // 1. Seed Categories
        const categoriesData = [
            {
                name: 'Technology',
                slug: 'technology',
                description: 'Breakthroughs in tech, networking, system architecture, and computational science.',
                icon: 'Cpu',
                color: '#a855f7', // purple
                sortOrder: 1
            },
            {
                name: 'Healthcare & Medicine',
                slug: 'healthcare',
                description: 'Clinical research, pharmacological discoveries, immunology, and worldwide public health essays.',
                icon: 'HeartPulse',
                color: '#f43f5e', // rose
                sortOrder: 2
            },
            {
                name: 'Environmental Science',
                slug: 'environmental',
                description: 'Ecology studies, biodiversity research, and analytical reports on global ecosystem trends.',
                icon: 'Trees',
                color: '#10b981', // emerald
                sortOrder: 3
            },
            {
                name: 'Humanities & Arts',
                slug: 'humanities',
                description: 'Philosophical inquiries, cultural critiques, history essays, and digital artistic reviews.',
                icon: 'Palette',
                color: '#f59e0b', // amber
                sortOrder: 4
            },
            {
                name: 'Psychology & Mental Health',
                slug: 'psychology',
                description: 'Neuroscience-backed studies, cognitive frameworks, and evidence-based mental wellness articles.',
                icon: 'Smile',
                color: '#6366f1', // indigo
                sortOrder: 5
            }
        ];
        const seededCategories = await category_model_1.Category.insertMany(categoriesData);
        // 2. Seed Users
        // Pre-save hook will hash passwords automatically
        const usersData = [
            {
                email: 'sarah.chen@vyra.com',
                username: 'sarahchen',
                passwordHash: 'Password123!', // pre-save hook will hash
                fullName: 'Dr. Sarah Chen',
                bio: 'Computational biologist at the BioTech Initiative. Researching quantum algorithms for chemical synthesis and molecular docking. Tech writer and digital advocate.',
                avatarUrl: 'https://picsum.photos/seed/sarahchen/200/200',
                bannerUrl: 'https://picsum.photos/seed/banner-sarah/1200/400',
                website: 'https://sarahchen.bio',
                location: 'San Francisco, CA',
                twitterHandle: '@sarahchen_bio',
                role: roles_1.UserRole.SUPER_ADMIN,
                isVerified: true
            },
            {
                email: 'alex.rivera@vyra.com',
                username: 'alexrivera',
                passwordHash: 'Password123!',
                fullName: 'Alex Rivera',
                bio: 'Climate journalist & environmental advocate. Writing about ocean reforestation, biodiversity preservation, and green urbanization solutions around the globe.',
                avatarUrl: 'https://picsum.photos/seed/alexrivera/200/200',
                bannerUrl: 'https://picsum.photos/seed/banner-alex/1200/400',
                website: 'https://riveraecojournal.org',
                location: 'Vancouver, BC',
                twitterHandle: '@alex_eco_rivera',
                role: roles_1.UserRole.ADMIN,
                isVerified: true
            }
        ];
        // We use User.create for triggering pre-save hooks
        const seededUsers = [];
        for (const u of usersData) {
            const user = new user_model_1.User(u);
            await user.save();
            seededUsers.push(user);
        }
        // 3. Seed Stories
        const storiesData = [
            {
                userId: seededUsers[0]._id,
                title: 'Quantum Biochemistry: The Next Frontier in Drug Discovery',
                excerpt: 'How quantum algorithms are accelerating molecular docking and protein folding models from decades to days.',
                content: `<h3>The Quantum Convergence</h3>
<p>For decades, the discovery of new life-saving medications has been a slow, expensive, and trial-and-error process. However, a silent revolution is brewing at the intersection of computational physics and biology: Quantum Biochemistry.</p>
<p>Conventional supercomputers simulate chemical structures by solving classical approximations of quantum physics. While effective, they hit a hard wall when simulating larger molecules with complex electron correlations. This is where quantum computers come in.</p>
<blockquote>
"By utilizing qubits that can represent multiple configurations simultaneously, quantum biochemistry allows us to simulate the actual quantum state of molecules, unlocking insights that were previously mathematically impossible."
</blockquote>
<p>We are already seeing early quantum algorithms, running on noisy intermediate-scale quantum (NISQ) systems, predicting protein folding structures with unprecedented accuracy. The future of medicine will be coded, simulated, and optimized at the atomic scale before it ever reaches a lab.</p>`,
                contentFormat: 'rich-text',
                plainTextContent: 'For decades, the discovery of new life-saving medications has been a slow, expensive, and trial-and-error process...',
                coverImageUrl: 'https://picsum.photos/seed/quantum/800/450',
                categoryId: seededCategories[0]._id,
                tags: ['quantum', 'biology', 'medicine', 'tech'],
                status: 'published',
                visibility: 'public',
                isAnonymous: false,
                isResearch: true,
                doi: '10.1038/s41587-026-1123-x',
                publishedAt: new Date(),
                viewCount: 1540,
                likeCount: 342,
                bookmarkCount: 88,
                readCount: 1200
            },
            {
                userId: seededUsers[1]._id,
                title: 'Ocean Reforestation: Restoring Kelp Forests at Scale',
                excerpt: 'A comprehensive review of biological carbon sequestration through coastal marine kelp restoration programs.',
                content: `<h3>Rebuilding the Blue Carbon Sinks</h3>
<p>While terrestrial forests capture the public's imagination, the oceans hold a far more powerful carbon capture tool: kelp forests. Growing up to two feet a day, kelp sequester carbon up to thirty times faster than land-based trees.</p>
<p>Unfortunately, marine heatwaves and unchecked sea urchin populations have decimated over 95% of California's historic kelp ecosystems. Our latest research charts a path forward through automated underwater restoration.</p>
<p>By seeding kelp spores on biodegradable tiles and deploying them using intelligent acoustic mapping, we can rebuild hundreds of hectares of underwater forests within months. This isn't just about carbon; it is about restoring the vital cradles of marine biodiversity.</p>`,
                contentFormat: 'rich-text',
                plainTextContent: 'While terrestrial forests capture the public imagination, the oceans hold a far more powerful carbon capture tool...',
                coverImageUrl: 'https://picsum.photos/seed/kelp/800/450',
                categoryId: seededCategories[2]._id,
                tags: ['climate', 'ocean', 'ecology', 'biodiversity'],
                status: 'published',
                visibility: 'public',
                isAnonymous: false,
                isResearch: false,
                publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                viewCount: 2890,
                likeCount: 788,
                bookmarkCount: 194,
                readCount: 2100
            }
        ];
        for (const s of storiesData) {
            const story = new story_model_1.Story(s);
            await story.save();
        }
        console.log('Database seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding database', error);
    }
};
exports.seedDatabase = seedDatabase;

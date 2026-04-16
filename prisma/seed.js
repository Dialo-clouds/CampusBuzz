const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Delete existing courses
  await prisma.course.deleteMany({});

  const courses = await prisma.course.createMany({
    data: [
      {
        title: "Advanced Web Development",
        code: "CS401",
        description: "Master modern web development with React, Next.js, and Tailwind CSS",
        credits: 3,
        instructor: "Dr. Sarah Johnson",
        capacity: 30,
        enrolled: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Database Design & Management",
        code: "CS402",
        description: "Learn SQL, Prisma ORM, and database architecture",
        credits: 3,
        instructor: "Prof. Michael Chen",
        capacity: 25,
        enrolled: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
      {
        title: "UI/UX Design Principles",
        code: "CS403",
        description: "Create beautiful and intuitive user interfaces",
        credits: 3,
        instructor: "Emma Davis",
        capacity: 20,
        enrolled: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Cloud Computing",
        code: "CS404",
        description: "Learn AWS, Azure, and cloud architecture",
        credits: 3,
        instructor: "Dr. James Wilson",
        capacity: 25,
        enrolled: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Machine Learning Fundamentals",
        code: "CS405",
        description: "Introduction to machine learning and AI",
        credits: 4,
        instructor: "Prof. Lisa Brown",
        capacity: 20,
        enrolled: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`✅ Created ${courses.count} courses`);
  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
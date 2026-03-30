import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const db = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL!,
    })
  ),
});

async function upsertUser(params: {
  email: string;
  role: Role;
  password: string;
}) {
  const passwordHash = await hash(params.password, 12);
  return db.user.upsert({
    where: { email: params.email },
    update: { passwordHash, role: params.role },
    create: { email: params.email, passwordHash, role: params.role },
  });
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Admin User
  const admin = await upsertUser({
    email: "admin@tasued.edu.ng",
    role: "ADMIN",
    password: "TasAdmin2026!",
  });
  console.log("✅ Admin user created");

  // Create Supervisor/Lecturer
  const supervisorUser = await upsertUser({
    email: "prof.owoade@tasued.edu.ng",
    role: "LECTURER",
    password: "ProfOwoade2026!",
  });

  const supervisor = await db.lecturer.upsert({
    where: { userId: supervisorUser.id },
    update: {},
    create: {
      userId: supervisorUser.id,
      staffId: "TAS/CIS/001",
      firstName: "A. A.",
      lastName: "Owoade",
      department: "Computer and Information Science",
      title: "Prof.",
    },
  });
  console.log("✅ Supervisor created");

  // Create Additional Lecturers
  const lecturer2User = await upsertUser({
    email: "dr.adebayo@tasued.edu.ng",
    role: "LECTURER",
    password: "DrAdebayo2026!",
  });

  const lecturer2 = await db.lecturer.upsert({
    where: { userId: lecturer2User.id },
    update: {},
    create: {
      userId: lecturer2User.id,
      staffId: "TAS/CIS/002",
      firstName: "Adebayo",
      lastName: "Ogunleye",
      department: "Computer and Information Science",
      title: "Dr.",
    },
  });

  const lecturer3User = await upsertUser({
    email: "mrs.johnson@tasued.edu.ng",
    role: "LECTURER",
    password: "MrsJohnson2026!",
  });

  const lecturer3 = await db.lecturer.upsert({
    where: { userId: lecturer3User.id },
    update: {},
    create: {
      userId: lecturer3User.id,
      staffId: "TAS/CIS/003",
      firstName: "Funmilayo",
      lastName: "Johnson",
      department: "Computer and Information Science",
      title: "Mrs.",
    },
  });
  console.log("✅ Additional lecturers created");

  // Create Project Team Students
  const projectTeamStudents = [
    {
      email: "erinfolami.mukaram@student.tasued.edu.ng",
      matricNumber: "20220294015",
      firstName: "Erinfolami Mukaram",
      lastName: "Adeolu",
      password: "Erinfolami2026!",
    },
    {
      email: "amabo.ogheneruona@student.tasued.edu.ng",
      matricNumber: "20220294003",
      firstName: "Amabo Ogheneruona",
      lastName: "David",
      password: "Amabo2026!",
    },
    {
      email: "aina.imaadudeen@student.tasued.edu.ng",
      matricNumber: "20220204001",
      firstName: "Aina Imaadudeen",
      lastName: "Abiodun",
      password: "Aina2026!",
    },
    {
      email: "abdulmalik.ibrahim@student.tasued.edu.ng",
      matricNumber: "20220294002",
      firstName: "Abdulmalik Ibrahim",
      lastName: "Opeyemi",
      password: "Abdulmalik2026!",
    },
    {
      email: "bello.kudirat@student.tasued.edu.ng",
      matricNumber: "20220294005",
      firstName: "Bello Kudirat",
      lastName: "Adunni",
      password: "Bello2026!",
    },
  ];

  const students = [];
  for (const studentData of projectTeamStudents) {
    const studentUser = await upsertUser({
      email: studentData.email,
      role: "STUDENT",
      password: studentData.password,
    });

    const student = await db.student.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: {
        userId: studentUser.id,
        matricNumber: studentData.matricNumber,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        department: "Computer and Information Science",
        level: "400",
      },
    });
    students.push(student);
  }
  console.log("✅ Project team students created");

  // Create Additional Test Students
  const additionalStudents = [
    {
      email: "adebola.smith@student.tasued.edu.ng",
      matricNumber: "20220294010",
      firstName: "Adebola",
      lastName: "Smith",
      password: "Adebola2026!",
    },
    {
      email: "chinedu.okoro@student.tasued.edu.ng",
      matricNumber: "20220294011",
      firstName: "Chinedu",
      lastName: "Okoro",
      password: "Chinedu2026!",
    },
    {
      email: "fatima.hassan@student.tasued.edu.ng",
      matricNumber: "20220294012",
      firstName: "Fatima",
      lastName: "Hassan",
      password: "Fatima2026!",
    },
    {
      email: "gabriel.okafor@student.tasued.edu.ng",
      matricNumber: "20220294013",
      firstName: "Gabriel",
      lastName: "Okafor",
      password: "Gabriel2026!",
    },
    {
      email: "halima.yusuf@student.tasued.edu.ng",
      matricNumber: "20220294014",
      firstName: "Halima",
      lastName: "Yusuf",
      password: "Halima2026!",
    },
  ];

  for (const studentData of additionalStudents) {
    const studentUser = await upsertUser({
      email: studentData.email,
      role: "STUDENT",
      password: studentData.password,
    });

    const student = await db.student.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: {
        userId: studentUser.id,
        matricNumber: studentData.matricNumber,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        department: "Computer and Information Science",
        level: "400",
      },
    });
    students.push(student);
  }
  console.log("✅ Additional test students created");

  // Create Courses
  const courses = [
    {
      courseCode: "CSC401",
      courseTitle: "Software Engineering Project",
      creditUnits: 3,
      department: "Computer and Information Science",
      semester: "Second",
      lecturerId: supervisor.id,
    },
    {
      courseCode: "CSC402",
      courseTitle: "Database Management Systems",
      creditUnits: 3,
      department: "Computer and Information Science",
      semester: "Second",
      lecturerId: lecturer2.id,
    },
    {
      courseCode: "CSC403",
      courseTitle: "Computer Networks",
      creditUnits: 3,
      department: "Computer and Information Science",
      semester: "Second",
      lecturerId: lecturer3.id,
    },
    {
      courseCode: "CSC404",
      courseTitle: "Artificial Intelligence",
      creditUnits: 3,
      department: "Computer and Information Science",
      semester: "Second",
      lecturerId: supervisor.id,
    },
    {
      courseCode: "CSC405",
      courseTitle: "Mobile Application Development",
      creditUnits: 2,
      department: "Computer and Information Science",
      semester: "Second",
      lecturerId: lecturer2.id,
    },
  ];

  const createdCourses = [];
  for (const courseData of courses) {
    const course = await db.course.upsert({
      where: { courseCode: courseData.courseCode },
      update: {},
      create: courseData,
    });
    createdCourses.push(course);
  }
  console.log("✅ Courses created");

  // Enroll all students in all courses
  for (const student of students) {
    for (const course of createdCourses) {
      await db.enrolment.upsert({
        where: {
          studentId_courseId_academicYear_semester: {
            studentId: student.id,
            courseId: course.id,
            academicYear: "2025/2026",
            semester: "Second",
          },
        },
        update: {},
        create: {
          studentId: student.id,
          courseId: course.id,
          academicYear: "2025/2026",
          semester: "Second",
        },
      });
    }
  }
  console.log("✅ Student enrolments created");

  console.log("🎉 Database seed completed successfully!");
  console.log("\n📋 Test Accounts Summary:");
  console.log("👨‍💼 Admin: admin@tasued.edu.ng | Password: TasAdmin2026!");
  console.log("👨‍🏫 Supervisor: prof.owoade@tasued.edu.ng | Password: ProfOwoade2026!");
  console.log("👨‍🏫 Lecturer 2: dr.adebayo@tasued.edu.ng | Password: DrAdebayo2026!");
  console.log("👩‍🏫 Lecturer 3: mrs.johnson@tasued.edu.ng | Password: MrsJohnson2026!");
  console.log("\n👨‍🎓 Project Team Students:");
  projectTeamStudents.forEach((student, index) => {
    console.log(`${index + 1}. ${student.firstName} ${student.lastName}: ${student.email} | Password: ${student.password}`);
  });
  console.log(`\n📊 Total: ${students.length} students, ${createdCourses.length} courses, ${students.length * createdCourses.length} enrolments`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });


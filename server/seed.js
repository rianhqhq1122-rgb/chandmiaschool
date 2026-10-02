require('dotenv').config();
const { connectDB, closeDB, collections, ObjectId } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/chandmia_school');
    console.log('Connected to MongoDB');

    const adminCount = await collections.adminUsers().countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await collections.adminUsers().insertOne({
        name: 'Administrator',
        email: 'admin@chandmiaschool.edu.bd',
        password: hashedPassword,
        createdAt: new Date()
      });
      console.log('Created default admin: admin@chandmiaschool.edu.bd / admin123');
    }

    const settingsCount = await collections.schoolSettings().countDocuments();
    if (settingsCount === 0) {
      await collections.schoolSettings().insertOne({
        key: 'main',
        schoolName: 'Chand Mia High School',
        schoolAddress: 'Nesarabad, Pirojpur, Bangladesh',
        schoolPhone: '+880 1XXXXXXXXX',
        schoolAltPhone: '',
        schoolEmail: 'info@chandmiaschool.edu.bd',
        admissionEmail: 'admission@chandmiaschool.edu.bd',
        principalName: '[Add Principal Name]',
        principalPhone: '[Add Principal Phone]',
        schoolDescription: 'Chand Mia High School is a secondary school in Nesarabad, Pirojpur. The school provides education for students in different grades and offers academic subjects along with sports and other activities.',
        aboutSchool: 'Chand Mia High School has been serving students in Nesarabad for many years. The school focuses on regular classes, examination preparation, sports, and other activities that help students develop outside the classroom.',
        mission: 'To provide quality education that prepares students for higher studies and responsible citizenship.',
        vision: 'To be a leading educational institution in the region known for academic excellence and character development.',
        schoolMotto: 'Learning. Growing. Moving Forward.',
        facebookUrl: '',
        youtubeUrl: '',
        instagramUrl: '',
        linkedinUrl: '',
        logo: '',
        favicon: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created default school settings');
    }

    const heroCount = await collections.heroSlides().countDocuments();
    if (heroCount === 0) {
      await collections.heroSlides().insertMany([
        {
          title: 'Chand Mia High School',
          subtitle: 'Nesarabad, Pirojpur',
          description: 'A school where students study, take part in activities, and prepare for the next stage of their education.',
          buttonText: 'Learn More',
          buttonLink: '/about.html',
          image: '',
          displayOrder: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Quality Education',
          subtitle: 'Since 1995',
          description: 'Dedicated teachers and a supportive learning environment for every student.',
          buttonText: 'Admissions',
          buttonLink: '/admissions.html',
          image: '',
          displayOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('Created demo hero slides');
    }

    const statsCount = await collections.statistics().countDocuments();
    if (statsCount === 0) {
      await collections.statistics().insertMany([
        { label: 'Established', value: '1995', displayOrder: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { label: 'Students', value: '500+', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { label: 'Teachers', value: '30+', displayOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { label: 'SSC Pass Rate', value: '90%', displayOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
      console.log('Created demo statistics');
    }

    const studentsCount = await collections.students().countDocuments();
    if (studentsCount === 0) {
      await collections.students().insertMany([
        {
          name: 'Rahim Ahmed',
          class: 'Grade 10',
          section: 'A',
          academicYear: '2026',
          role: 'Top Student',
          achievement: 'GPA 5.00 in SSC 2026',
          exam: 'SSC 2026',
          gpa: '5.00',
          description: 'Consistently top performer in all subjects.',
          photo: '',
          displayOnHomepage: true,
          displayOrder: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Fatima Khan',
          class: 'Grade 10',
          section: 'B',
          academicYear: '2026',
          role: 'Top Student',
          achievement: 'GPA 5.00 in SSC 2026',
          exam: 'SSC 2026',
          gpa: '5.00',
          description: 'Excellent in Mathematics and Science.',
          photo: '',
          displayOnHomepage: true,
          displayOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Karim Hassan',
          class: 'Grade 9',
          section: 'A',
          academicYear: '2026',
          role: 'Class Captain',
          achievement: 'First in Class 9 Annual Exam',
          exam: 'Annual Exam 2026',
          gpa: '4.90',
          description: 'Active in debate club and sports.',
          photo: '',
          displayOnHomepage: true,
          displayOrder: 2,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('Created demo students');
    }

    const teachersCount = await collections.teachers().countDocuments();
    if (teachersCount === 0) {
      await collections.teachers().insertMany([
        {
          name: 'Mohammad Ali',
          designation: 'Head Teacher',
          subject: 'Mathematics',
          qualification: 'M.Sc Mathematics',
          experience: '20 years',
          achievement: 'Best Teacher Award 2022',
          biography: 'Teaching mathematics for over 20 years. Helps students prepare for SSC examinations.',
          photo: '',
          displayOrder: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Ayesha Begum',
          designation: 'Assistant Teacher',
          subject: 'English',
          qualification: 'M.A English',
          experience: '12 years',
          achievement: 'English Olympiad Coordinator',
          biography: 'Passionate about English literature and language teaching.',
          photo: '',
          displayOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Abdul Karim',
          designation: 'Assistant Teacher',
          subject: 'Science',
          qualification: 'B.Sc Physics',
          experience: '8 years',
          achievement: 'Science Fair Organizer',
          biography: 'Makes science interesting with practical demonstrations.',
          photo: '',
          displayOrder: 2,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Rahima Khatun',
          designation: 'Assistant Teacher',
          subject: 'Bangla',
          qualification: 'M.A Bangla',
          experience: '15 years',
          achievement: 'Literary Competition Winner',
          biography: 'Teaches Bangla literature and grammar with dedication.',
          photo: '',
          displayOrder: 3,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('Created demo teachers');
    }

    const academicsCount = await collections.academics().countDocuments();
    if (academicsCount === 0) {
      await collections.academics().insertMany([
        { subject: 'Science', description: 'Physics, Chemistry, and Biology for grades 9-10', teacher: 'Abdul Karim', class: 'Grade 9-10', image: '', displayOrder: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { subject: 'Mathematics', description: 'Algebra, Geometry, Trigonometry, and Statistics', teacher: 'Mohammad Ali', class: 'Grade 6-10', image: '', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { subject: 'English', description: 'Grammar, Composition, and Literature', teacher: 'Ayesha Begum', class: 'Grade 6-10', image: '', displayOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { subject: 'Bangla', description: 'Sahitya, Byakaran, and Rachana', teacher: 'Rahima Khatun', class: 'Grade 6-10', image: '', displayOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { subject: 'ICT', description: 'Computer fundamentals and programming basics', teacher: 'Abdul Karim', class: 'Grade 9-10', image: '', displayOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { subject: 'Social Science', description: 'History, Geography, and Civics', teacher: 'Mohammad Ali', class: 'Grade 6-8', image: '', displayOrder: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
      console.log('Created demo academics');
    }

    const achievementsCount = await collections.achievements().countDocuments();
    if (achievementsCount === 0) {
      await collections.achievements().insertMany([
        { title: 'SSC Examination Results 2026', description: '90% pass rate with 15 students achieving GPA 5.00', year: 2026, category: 'Academic', image: '', displayOrder: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { title: 'District Football Championship', description: 'School team won first place in inter-school football tournament', year: 2025, category: 'Sports', image: '', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { title: 'National Debate Competition', description: 'Two students reached semi-finals at national level', year: 2025, category: 'Debate', image: '', displayOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { title: 'Science Fair Winner', description: 'First prize in district science exhibition for water purification project', year: 2024, category: 'Science', image: '', displayOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { title: 'Cultural Competition', description: 'Best school award in district cultural festival', year: 2024, category: 'Cultural', image: '', displayOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
      console.log('Created demo achievements');
    }

    const activitiesCount = await collections.activities().countDocuments();
    if (activitiesCount === 0) {
      await collections.activities().insertMany([
        { title: 'Football', description: 'Regular practice and inter-school matches', image: '', displayOrder: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { title: 'Debate Club', description: 'Weekly debate sessions and competitions', image: '', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { title: 'Science Club', description: 'Experiments, projects, and science fair participation', image: '', displayOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { title: 'Cultural Programs', description: 'Annual cultural week with music, dance, and drama', image: '', displayOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { title: 'Community Service', description: 'Tree plantation, cleanliness drives, and social awareness', image: '', displayOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
      console.log('Created demo activities');
    }

    const gradesCount = await collections.admissionGrades().countDocuments();
    if (gradesCount === 0) {
      await collections.admissionGrades().insertMany([
        { grade: 'Grade 6', displayOrder: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { grade: 'Grade 7', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { grade: 'Grade 8', displayOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { grade: 'Grade 9', displayOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
      console.log('Created demo admission grades');
    }

    console.log('\nSeeding completed successfully!');
    console.log('Default admin login: admin@chandmiaschool.edu.bd / admin123');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

seed();
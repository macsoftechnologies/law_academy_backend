import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Enrollment } from '../enrollments/schema/enrollment.schema';
import { Lecture } from '../lectures/schema/lecture.schema';
import { SubjectNotes } from '../subject_notes/schema/subject_notes.schema';
import { Notes } from '../notes/schema/notes.schema';
import { PrelimesTest } from '../prelimes_tests/schema/prelimes_tests.schema';
import { PrelimesResults } from '../prelimes_tests/schema/prelimes_results.schema';
import { MainsTest } from '../mains/schema/mains-test.schema';
import { MainsSubjectTest } from '../mains/schema/mains-subject-test.schema';
import { SubCategory } from '../categories/schema/subcategory.schema';
import { Subject } from '../subjects/schema/subject.schema';
import { Law } from '../laws/schema/laws.schema';
import { UserProgress } from './schema/user-progress.schema';
import { UserGoal } from './schema/user-goal.schema';
import { getDashboardDto, updateProgressDto, updateGoalDto } from './dto/marksdashboard.dto';
import { Mains } from '../mains/schema/mains.schema';
import { Prelimes } from '../prelimes/schema/prelimes.schema';
import { Combo } from '../combos/schema/combo.schema';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class MarksdashboardService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(Lecture.name) private readonly lectureModel: Model<Lecture>,
    @InjectModel(SubjectNotes.name) private readonly subjectNotesModel: Model<SubjectNotes>,
    @InjectModel(Notes.name) private readonly notesModel: Model<Notes>,
    @InjectModel(PrelimesTest.name) private readonly prelimsTestModel: Model<PrelimesTest>,
    @InjectModel(PrelimesResults.name) private readonly prelimsResultsModel: Model<PrelimesResults>,
    @InjectModel(MainsTest.name) private readonly mainsTestModel: Model<MainsTest>,
    @InjectModel(MainsSubjectTest.name) private readonly mainsSubjectTestModel: Model<MainsSubjectTest>,
    @InjectModel(SubCategory.name) private readonly subcategoryModel: Model<SubCategory>,
    @InjectModel(Subject.name) private readonly subjectModel: Model<Subject>,
    @InjectModel(Law.name) private readonly lawModel: Model<Law>,
    @InjectModel(UserProgress.name) private readonly userProgressModel: Model<UserProgress>,
    @InjectModel(UserGoal.name) private readonly userGoalModel: Model<UserGoal>,
    @InjectModel(Mains.name) private readonly mainsModel: Model<Mains>,
    @InjectModel(Prelimes.name) private readonly prelimesModel: Model<Prelimes>,
    @InjectModel(Combo.name) private readonly comboModel: Model<Combo>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Get all dashboard metrics for the student dashboard.
   */
  async getDashboardStats(dto: getDashboardDto) {
    try {
      const { userId } = dto;

      const user = await this.userModel.findOne({ userId });
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      // 1. Fetch user enrollments
      const enrollments = await this.enrollmentModel.find({ userId });
      const courseIds = Array.from(new Set(enrollments.map(e => e.course_id)));

      // 2. Overall Score (Average percentage of prelims tests attempted - user-wide)
      const testResults = await this.prelimsResultsModel.find({ userId });
      const overallScore = testResults.length > 0
        ? Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length)
        : 0;

      // 3. Goal Tracker (user-wide daily goal tracker)
      const todayStr = new Date().toISOString().split('T')[0];
      let goal = await this.userGoalModel.findOne({ userId, date: todayStr });
      if (!goal) {
        goal = await this.userGoalModel.create({
          userId,
          date: todayStr,
          studyTimeGoalMinutes: 120,
          studyTimeProgressMinutes: 0,
          mcqGoalCount: 20,
          mcqProgressCount: 0,
        });
      }

      const goalProgressStr = `${Math.floor(goal.studyTimeProgressMinutes / 60)}h ${goal.studyTimeProgressMinutes % 60} mins done`;
      const todayGoalStr = `${Math.floor(goal.studyTimeGoalMinutes / 60)}Hrs stud + ${goal.mcqGoalCount}MCQs`;

      // 4. Law Types mapping for Civil vs Criminal
      const laws = await this.lawModel.find();
      const civilLawIds = new Set(laws.filter(l => l.title?.toLowerCase().includes('civil')).map(l => l.lawId));
      const criminalLawIds = new Set(laws.filter(l => l.title?.toLowerCase().includes('criminal')).map(l => l.lawId));

      const completedTestIds = new Set(testResults.map(r => r.testId));
      const getProgress = (completed: number, total: number) => {
        return total > 0 ? Math.round((completed / total) * 100) : 0;
      };

      const coursesStats: any[] = [];

      // 5. Calculate stats for each enrolled course
      for (const courseId of courseIds) {
        const enrollment = enrollments.find(e => e.course_id === courseId);
        let courseName = 'Unknown Course';
        let joinedOn = 'N/A';
        if (enrollment) {
          joinedOn = new Date(enrollment.enroll_date).toLocaleDateString();
          // Resolve course name
          const subCat = await this.subcategoryModel.findOne({ subcategory_id: courseId });
          if (subCat) {
            courseName = subCat.title;
          } else {
            const sub = await this.subjectModel.findOne({ subjectId: courseId });
            if (sub) {
              courseName = sub.title;
            } else {
              const law = await this.lawModel.findOne({ lawId: courseId });
              if (law) {
                courseName = law.title;
              } else {
                const note = await this.notesModel.findOne({ notes_id: courseId });
                if (note) {
                  courseName = note.title;
                } else {
                  const mains = await this.mainsModel.findOne({ mains_id: courseId });
                  if (mains) {
                    courseName = mains.title;
                  } else {
                    const prelimes = await this.prelimesModel.findOne({ prelimes_id: courseId });
                    if (prelimes) {
                      courseName = prelimes.title;
                    } else {
                      const combo = await this.comboModel.findOne({ combo_id: courseId });
                      if (combo) {
                        courseName = combo.title;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Last Activity Log for this course
        const lastProgress = await this.userProgressModel.findOne({ userId, courseId }).sort({ updatedAt: -1 });
        let lastActivity = 'Never';
        if (lastProgress) {
          const diffMs = new Date().getTime() - new Date((lastProgress as any).updatedAt).getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHours < 1) {
            lastActivity = 'Just now';
          } else if (diffHours === 1) {
            lastActivity = '1 hour ago';
          } else {
            lastActivity = `${diffHours} hours ago`;
          }
        }

        // Fetch all completed items for this course
        const completedProgress = await this.userProgressModel.find({ userId, courseId, isCompleted: true });
        const completedItemIds = new Set(completedProgress.map(p => p.itemId));

        // Video lessons analysis
        const lectures = await this.lectureModel.find({
          $or: [{ subcategory_id: courseId }, { subjectId: courseId }, { lawId: courseId }],
        });

        const civilLectures = lectures.filter(l => civilLawIds.has(l.lawId));
        const criminalLectures = lectures.filter(l => criminalLawIds.has(l.lawId));
        const otherLectures = lectures.filter(l => !civilLawIds.has(l.lawId) && !criminalLawIds.has(l.lawId));

        const civilVideosCompleted = civilLectures.filter(l => completedItemIds.has(l.lectureId)).length;
        const criminalVideosCompleted = criminalLectures.filter(l => completedItemIds.has(l.lectureId)).length;
        const otherVideosCompleted = otherLectures.filter(l => completedItemIds.has(l.lectureId)).length;

        // Short Notes analysis
        const notesList = await this.notesModel.find({ subcategory_id: courseId });
        const notesIds = notesList.map(n => n.notes_id);
        const subjectNotes = await this.subjectNotesModel.find({
          $or: [{ notes_id: { $in: notesIds } }, { subjectId: courseId }, { lawId: courseId }],
        });

        const civilNotes = subjectNotes.filter(n => civilLawIds.has(n.lawId));
        const criminalNotes = subjectNotes.filter(n => criminalLawIds.has(n.lawId));
        const otherNotes = subjectNotes.filter(n => !civilLawIds.has(n.lawId) && !criminalLawIds.has(n.lawId));

        const civilNotesCompleted = civilNotes.filter(n => completedItemIds.has(n.subject_notes_id)).length;
        const criminalNotesCompleted = criminalNotes.filter(n => completedItemIds.has(n.subject_notes_id)).length;
        const otherNotesCompleted = otherNotes.filter(n => completedItemIds.has(n.subject_notes_id)).length;

        // Prelims Prep analysis
        const prelimsTests = await this.prelimsTestModel.find({
          $or: [{ prelimes_id: courseId }, { mocktest_subject_id: courseId }],
        });

        const pyqs = prelimsTests.filter(t => t.test_type === 'QZ');
        const grandTests = prelimsTests.filter(t => t.test_type === 'GT');
        const mockTests = prelimsTests.filter(t => t.test_type === 'SMT');

        const pyqsCompleted = pyqs.filter(t => completedTestIds.has(t.prelimes_test_id)).length;
        const grandTestsCompleted = grandTests.filter(t => completedTestIds.has(t.prelimes_test_id)).length;

        // Group subject mock tests by Civil vs Criminal
        const civilMocksList: PrelimesTest[] = [];
        const criminalMocksList: PrelimesTest[] = [];
        for (const mock of mockTests) {
          const sub = await this.subjectModel.findOne({ subjectId: mock.mocktest_subject_id });
          if (sub && civilLawIds.has(sub.law_id)) {
            civilMocksList.push(mock);
          } else if (sub && criminalLawIds.has(sub.law_id)) {
            criminalMocksList.push(mock);
          } else {
            civilMocksList.push(mock);
          }
        }

        const civilMocksCompleted = civilMocksList.filter(t => completedTestIds.has(t.prelimes_test_id)).length;
        const criminalMocksCompleted = criminalMocksList.filter(t => completedTestIds.has(t.prelimes_test_id)).length;

        // Mains Prep analysis
        const mainsTests = await this.mainsTestModel.find({ mains_id: courseId });
        const mainsTestIds = mainsTests.map(t => t.mains_test_id);
        const mainsSubjectTests = await this.mainsSubjectTestModel.find({ mains_test_id: { $in: mainsTestIds } });

        const mainsTestsCompletedCount = mainsSubjectTests.filter(t => completedItemIds.has(t.mains_subject_test_id)).length;

        // Calculate progress percentages
        const jcjCourseProgress = getProgress(
          civilVideosCompleted + criminalVideosCompleted + otherVideosCompleted + civilNotesCompleted + criminalNotesCompleted + otherNotesCompleted,
          lectures.length + subjectNotes.length
        );

        const totalPrelims = prelimsTests.length;
        const completedPrelims = pyqsCompleted + grandTestsCompleted + civilMocksCompleted + criminalMocksCompleted;
        const prelimsProgress = getProgress(completedPrelims, totalPrelims);

        const totalMains = mainsSubjectTests.length;
        const completedMains = mainsTestsCompletedCount;
        const mainsProgress = getProgress(completedMains, totalMains);

        // Subject Completed Fraction
        const totalSubjectsCount = await this.subjectModel.countDocuments({ subcategory_id: courseId });
        let completedSubjectsCount = 0;
        if (totalSubjectsCount > 0) {
          const subjects = await this.subjectModel.find({ subcategory_id: courseId });
          for (const sub of subjects) {
            const subLectures = lectures.filter(l => l.subjectId === sub.subjectId);
            const subNotes = subjectNotes.filter(n => n.subjectId === sub.subjectId);
            const subLecturesDone = subLectures.every(l => completedItemIds.has(l.lectureId));
            const subNotesDone = subNotes.every(n => completedItemIds.has(n.subject_notes_id));
            if (subLecturesDone && subNotesDone && (subLectures.length > 0 || subNotes.length > 0)) {
              completedSubjectsCount++;
            }
          }
        }

        coursesStats.push({
          courseId,
          courseOverview: {
            courseName,
            joinedOn,
            subjectsCompleted: `${completedSubjectsCount}/${totalSubjectsCount}`,
            lastActivity,
          },
          subjectProgress: {
            jcjCourseProgress,
            prelimsProgress,
            mainsProgress,
          },
          studyAnalysis: {
            videoLessons: {
              total: lectures.length,
              civil: {
                completed: civilVideosCompleted,
                pending: civilLectures.length - civilVideosCompleted,
                progress: getProgress(civilVideosCompleted, civilLectures.length),
              },
              criminal: {
                completed: criminalVideosCompleted,
                pending: criminalLectures.length - criminalVideosCompleted,
                progress: getProgress(criminalVideosCompleted, criminalLectures.length),
              },
            },
            shortNotes: {
              total: subjectNotes.length,
              civil: {
                completed: civilNotesCompleted,
                pending: civilNotes.length - civilNotesCompleted,
                progress: getProgress(civilNotesCompleted, civilNotes.length),
              },
              criminal: {
                completed: criminalNotesCompleted,
                pending: criminalNotes.length - criminalNotesCompleted,
                progress: getProgress(criminalNotesCompleted, criminalNotes.length),
              },
            },
          },
          prelimsPrep: {
            pyqs: {
              completed: pyqsCompleted,
              pending: pyqs.length - pyqsCompleted,
              progress: getProgress(pyqsCompleted, pyqs.length),
            },
            grandTest: {
              completed: grandTestsCompleted,
              pending: grandTests.length - grandTestsCompleted,
              progress: getProgress(grandTestsCompleted, grandTests.length),
            },
            subjectMocks: {
              total: mockTests.length,
              civil: {
                completed: civilMocksCompleted,
                pending: civilMocksList.length - civilMocksCompleted,
                progress: getProgress(civilMocksCompleted, civilMocksList.length),
              },
              criminal: {
                completed: criminalMocksCompleted,
                pending: criminalMocksList.length - criminalMocksCompleted,
                progress: getProgress(criminalMocksCompleted, criminalMocksList.length),
              },
            },
          },
          mainsPrep: {
            mainsQA: {
              pdf: {
                completed: completedProgress.filter(p => p.activityType === 'mains_qa_pdf').length,
                pending: 0,
                progress: 0,
              },
              video: {
                completed: completedProgress.filter(p => p.activityType === 'mains_qa_video').length,
                pending: 0,
                progress: 0,
              },
            },
            essayTranslation: {
              pdf: {
                completed: completedProgress.filter(p => p.activityType === 'essay_pdf').length,
                pending: 0,
                progress: 0,
              },
              video: {
                completed: completedProgress.filter(p => p.activityType === 'essay_video').length,
                pending: 0,
                progress: 0,
              },
            },
            mainsTestSeries: {
              completed: completedMains,
              pending: totalMains - completedMains,
              progress: getProgress(completedMains, totalMains),
            },
          },
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Dashboard stats fetched successfully',
        data: {
          overallScore,
          goalTracker: {
            progress: goalProgressStr,
            goal: todayGoalStr,
            studyTimeGoalMinutes: goal.studyTimeGoalMinutes,
            studyTimeProgressMinutes: goal.studyTimeProgressMinutes,
            mcqGoalCount: goal.mcqGoalCount,
            mcqProgressCount: goal.mcqProgressCount,
          },
          courses: coursesStats,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  /**
   * Update student completion progress for an item.
   */
  async updateProgress(dto: updateProgressDto) {
    try {
      const existing = await this.userProgressModel.findOne({
        userId: dto.userId,
        courseId: dto.courseId,
        itemId: dto.itemId,
      });

      if (existing) {
        existing.isCompleted = dto.isCompleted;
        await existing.save();
        return {
          statusCode: HttpStatus.OK,
          message: 'Progress updated successfully',
          data: existing,
        };
      }

      const newProgress = await this.userProgressModel.create(dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Progress created successfully',
        data: newProgress,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }

  async updateGoal(dto: updateGoalDto) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      let goal = await this.userGoalModel.findOne({ userId: dto.userId, date: todayStr });

      // Keep track of pre-update goal status
      const wasStudyGoalMet = goal ? (goal.studyTimeProgressMinutes >= goal.studyTimeGoalMinutes) : false;
      const wasMcqGoalMet = goal ? (goal.mcqProgressCount >= goal.mcqGoalCount) : false;

      if (!goal) {
        goal = await this.userGoalModel.create({
          userId: dto.userId,
          date: todayStr,
          studyTimeGoalMinutes: dto.studyTimeGoal ?? 120,
          studyTimeProgressMinutes: dto.studyTimeIncrement ?? 0,
          mcqGoalCount: dto.mcqGoal ?? 20,
          mcqProgressCount: dto.mcqIncrement ?? 0,
        });
      } else {
        if (dto.studyTimeIncrement !== undefined) {
          goal.studyTimeProgressMinutes += dto.studyTimeIncrement;
        }
        if (dto.mcqIncrement !== undefined) {
          goal.mcqProgressCount += dto.mcqIncrement;
        }
        if (dto.studyTimeGoal !== undefined) {
          goal.studyTimeGoalMinutes = dto.studyTimeGoal;
        }
        if (dto.mcqGoal !== undefined) {
          goal.mcqGoalCount = dto.mcqGoal;
        }
        await goal.save();
      }

      // Check if goals are met now, but were not met before
      const isStudyGoalMetNow = goal.studyTimeProgressMinutes >= goal.studyTimeGoalMinutes;
      const isMcqGoalMetNow = goal.mcqProgressCount >= goal.mcqGoalCount;

      if (isStudyGoalMetNow && !wasStudyGoalMet) {
        try {
          await this.notificationsService.create(
            dto.userId,
            'Daily Study Goal Met! 🏆',
            `Fantastic! You have reached your daily study goal of ${Math.floor(goal.studyTimeGoalMinutes / 60)} hours today!`,
            'goal_reached',
            { studyTime: goal.studyTimeProgressMinutes }
          );
        } catch (notiErr) {
          console.error('Failed to send study goal notification:', notiErr);
        }
      }

      if (isMcqGoalMetNow && !wasMcqGoalMet) {
        try {
          await this.notificationsService.create(
            dto.userId,
            'Daily MCQ Goal Met! 🎯',
            `Excellent! You completed your daily goal of answering ${goal.mcqGoalCount} MCQs today!`,
            'goal_reached',
            { mcqCount: goal.mcqProgressCount }
          );
        } catch (notiErr) {
          console.error('Failed to send MCQ goal notification:', notiErr);
        }
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Goal tracker updated successfully',
        data: goal,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || error,
      };
    }
  }
}

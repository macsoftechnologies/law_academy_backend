import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Combo } from './schema/combo.schema';
import { comboDto } from './dtos/combo.dto';
import { Enrollment } from 'src/enrollments/schema/enrollment.schema';
import { Plan } from 'src/plans/schema/plans.schema';
import { Lecture } from 'src/lectures/schema/lecture.schema';
import { Notes } from 'src/notes/schema/notes.schema';
import { Subject } from 'src/subjects/schema/subject.schema';
import { Mains } from 'src/mains/schema/mains.schema';
import { Prelimes } from 'src/prelimes/schema/prelimes.schema';
import { enrollmentStatus } from 'src/auth/guards/roles.enum';
import { SubjectNotes } from 'src/subject_notes/schema/subject_notes.schema';
import { Law } from 'src/laws/schema/laws.schema';

@Injectable()
export class CombosService {
    constructor(
        @InjectModel(Combo.name) private readonly comboModel: Model<Combo>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<Enrollment>,
        @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
        @InjectModel(Lecture.name) private readonly lectureModel: Model<Lecture>,
        @InjectModel(Notes.name) private readonly notesModel: Model<Notes>,
        @InjectModel(Subject.name) private readonly subjectModel: Model<Subject>,
        @InjectModel(Mains.name) private readonly mainsModel: Model<Mains>,
        @InjectModel(Prelimes.name) private readonly prelimesModel: Model<Prelimes>,
        @InjectModel(SubjectNotes.name) private readonly subjectNotesModel: Model<SubjectNotes>,
        @InjectModel(Law.name) private readonly lawModel: Model<Law>,
    ) { }

    private async buildLawHierarchy(
        lawId: string,
        includesLectures: boolean,
        includesNotes: boolean
    ) {
        const lawDetails = await this.lawModel
            .findOne({ lawId })
            .select('lawId title law_image subcategory_id categoryId');

        const subjects = await this.subjectModel
            .find({ law_id: lawId })
            .select('subjectId title subject_image');

        const subjectsWithContent = await Promise.all(
            subjects.map(async (s) => {
                const lectures = includesLectures
                    ? await this.lectureModel
                        .find({ subjectId: s.subjectId })
                        .select('lecture_id title description video_url duration presentation_image')
                    : [];

                const notes = includesNotes
                    ? await this.subjectNotesModel
                        .find({ lawId, subjectId: s.subjectId })
                        .select('subject_notes_id title pdf_url isLocked presentation_image')
                    : [];

                return {
                    ...s.toObject(),
                    lectures,
                    notes,
                };
            })
        );

        return {
            ...lawDetails?.toObject(),
            subjects_count: subjectsWithContent.length,
            subjects: subjectsWithContent,
        };
    }

    // ADMIN: Create Combo
    async createCombo(req: comboDto, image) {
        try {
            if (image) {
                const reqDoc = image.map((doc, index) => {
                    let IsPrimary = false;
                    if (index == 0) {
                        IsPrimary = true;
                    }
                    const randomNumber = Math.floor(Math.random() * 1000000 + 1);
                    return doc.filename;
                });

                req.presentation_image = reqDoc.toString();
            }
            if (typeof req.lecture_config === 'string') req.lecture_config = JSON.parse(req.lecture_config);
            if (typeof req.notes_config === 'string') req.notes_config = JSON.parse(req.notes_config);
            if (typeof req.mains_ids === 'string') req.mains_ids = JSON.parse(req.mains_ids);
            if (typeof req.prelimes_ids === 'string') req.prelimes_ids = JSON.parse(req.prelimes_ids);

            const combo = await this.comboModel.create(req);
            return combo
                ? { statusCode: HttpStatus.OK, message: 'Combo created successfully', data: combo }
                : { statusCode: HttpStatus.EXPECTATION_FAILED, message: 'Failed to create combo' };
        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }

    // ADMIN: Get all combos (paginated)
    async getCombos(page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;
            const totalCount = await this.comboModel.countDocuments();

            const data = await this.comboModel.aggregate([
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: 'categoryId',
                        as: 'category',
                    },
                },
                { $addFields: { category: { $arrayElemAt: ['$category', 0] } } },
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: 'subcategory_id',
                        foreignField: 'subcategory_id',
                        as: 'subcategory',
                    },
                },
                { $addFields: { subcategory: { $arrayElemAt: ['$subcategory', 0] } } },
                {
                    $lookup: {
                        from: 'mains',
                        localField: 'mains_ids',
                        foreignField: 'mains_id',
                        as: 'mains_details',
                    },
                },
                {
                    $lookup: {
                        from: 'prelimes',
                        localField: 'prelimes_ids',
                        foreignField: 'prelimes_id',
                        as: 'prelimes_details',
                    },
                },
            ]);

            return {
                statusCode: HttpStatus.OK,
                message: 'List of Combos',
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                limit,
                data,
            };
        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }

    // ADMIN: Get combo by ID (full detail)
    async getComboById(req: comboDto) {
        try {
            const combo = await this.comboModel.findOne({ combo_id: req.combo_id });
            if (!combo) return { statusCode: HttpStatus.NOT_FOUND, message: 'Combo not found' };

            const lectureLawId = combo.lecture_config?.law_id;
            const notesLawId = combo.notes_config?.law_id;

            // Build laws array
            let laws: any = [];

            // Case: both configs point to the same law → single object with both
            if (lectureLawId && notesLawId && lectureLawId === notesLawId) {
                const law = await this.buildLawHierarchy(
                    lectureLawId,
                    combo.includes_lectures,
                    combo.includes_notes
                );
                laws = [law];
            } else {
                // Case: different law ids → build each with only its relevant flag
                const lawPromises: Promise<any>[] = [];

                if (lectureLawId) {
                    lawPromises.push(
                        this.buildLawHierarchy(lectureLawId, combo.includes_lectures, false)
                    );
                }

                if (notesLawId) {
                    lawPromises.push(
                        this.buildLawHierarchy(notesLawId, false, combo.includes_notes)
                    );
                }

                laws = await Promise.all(lawPromises);
            }

            // Fetch mains details if included and IDs exist
            let mains_details = [];
            if (combo.includes_mains && combo.mains_ids?.length) {
                mains_details = await this.mainsModel
                    .find({ mains_id: { $in: combo.mains_ids } })
                    .select('mains_id title sub_title about_course course_points terms_conditions presentation_image subcategory_id');
            }

            // Fetch prelimes details if included and IDs exist
            let prelimes_details = [];
            if (combo.includes_prelimes && combo.prelimes_ids?.length) {
                prelimes_details = await this.prelimesModel
                    .find({ prelimes_id: { $in: combo.prelimes_ids } })
                    .select('prelimes_id title sub_title about_course course_points terms_conditions presentation_image subcategory_id');
            }

            return {
                statusCode: HttpStatus.OK,
                message: 'Combo Details',
                data: {
                    ...combo.toObject(),
                    laws,
                    mains_details,
                    prelimes_details,
                },
            };

        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }


    // ADMIN: Edit combo
    async editCombo(req: comboDto, image?) {
        try {
            if (image) {
                const reqDoc = image.map((doc, index) => {
                    let IsPrimary = false;
                    if (index == 0) {
                        IsPrimary = true;
                    }
                    const randomNumber = Math.floor(Math.random() * 1000000 + 1);
                    return doc.filename;
                });

                req.presentation_image = reqDoc.toString();
            }
            if (typeof req.lecture_config === 'string') req.lecture_config = JSON.parse(req.lecture_config);
            if (typeof req.notes_config === 'string') req.notes_config = JSON.parse(req.notes_config);
            if (typeof req.mains_ids === 'string') req.mains_ids = JSON.parse(req.mains_ids);
            if (typeof req.prelimes_ids === 'string') req.prelimes_ids = JSON.parse(req.prelimes_ids);

            const setFields: any = {
                title: req.title,
                description: req.description,
                categoryId: req.categoryId,
                subcategory_id: req.subcategory_id,
                includes_lectures: req.includes_lectures,
                includes_notes: req.includes_notes,
                includes_prelimes: req.includes_prelimes,
                includes_mains: req.includes_mains,
                mains_ids: req.mains_ids,
                prelimes_ids: req.prelimes_ids,
                lecture_config: req.lecture_config,
                notes_config: req.notes_config,
                isActive: req.isActive,
            };

            if (req.presentation_image) setFields.presentation_image = req.presentation_image;

            const update = await this.comboModel.updateOne({ combo_id: req.combo_id }, { $set: setFields });

            if (update.modifiedCount > 0) {
                return { statusCode: HttpStatus.OK, message: 'Combo updated successfully' };
            }
            return { statusCode: HttpStatus.EXPECTATION_FAILED, message: 'Failed to update' };
        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }

    // ADMIN: Delete combo
    async deleteCombo(req: comboDto) {
        try {
            const remove = await this.comboModel.deleteOne({ combo_id: req.combo_id });
            if (remove) {
                return { statusCode: HttpStatus.OK, message: 'Combo removed successfully' };
            }
            return { statusCode: HttpStatus.EXPECTATION_FAILED, message: 'Failed to delete' };
        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }

    async previewComboContent(req: comboDto) {
        try {
            const findCombo = await this.comboModel.findOne({ combo_id: req.combo_id });
            if (!findCombo) {
                return { statusCode: HttpStatus.NOT_FOUND, message: 'Combo not found' };
            }

            const lawIds: string[] = [];
            if (findCombo.lecture_config?.law_id) lawIds.push(findCombo.lecture_config.law_id);
            if (findCombo.notes_config?.law_id) lawIds.push(findCombo.notes_config.law_id);

            const uniqueLawIds = [...new Set(lawIds)];

            const laws = await Promise.all(
                uniqueLawIds.map((lawId) =>
                    this.buildLawHierarchy(lawId, findCombo.includes_lectures, findCombo.includes_notes)
                )
            );

            const result: any = { laws };

            if (findCombo.includes_mains && findCombo.mains_ids?.length) {
                const mains = await this.mainsModel.find({ mains_id: { $in: findCombo.mains_ids } }).select('mains_id title');
                result.mains = { selected: mains };
            }

            if (findCombo.includes_prelimes && findCombo.prelimes_ids?.length) {
                const prelimes = await this.prelimesModel.find({ prelimes_id: { $in: findCombo.prelimes_ids } }).select('prelimes_id title');
                result.prelimes = { selected: prelimes };
            }

            return { statusCode: HttpStatus.OK, message: 'Combo Preview', data: result };
        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }

    // USER: Get all combos with enrollment status (paginated)
    async getCombosForUser(page: number, limit: number, userId: string) {
        try {
            const skip = (page - 1) * limit;
            const today = new Date();

            const data = await this.comboModel.aggregate([
                { $match: { isActive: true } },
                { $skip: skip },
                { $limit: limit },

                {
                    $lookup: {
                        from: 'enrollments',
                        let: { comboId: '$combo_id', subcategoryId: '$subcategory_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userId', userId] },
                                            { $eq: ['$status', 'active'] },
                                            {
                                                $or: [
                                                    {
                                                        $and: [
                                                            { $eq: ['$course_id', '$$comboId'] },
                                                            { $eq: ['$enroll_type', 'combination'] }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            { $eq: ['$course_id', '$$subcategoryId'] },
                                                            { $eq: ['$enroll_type', 'full-course'] }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'enrollment'
                    }
                },
                { $addFields: { enrollment: { $arrayElemAt: ['$enrollment', 0] } } },

                {
                    $addFields: {
                        isEnrolled: { $cond: [{ $ifNull: ['$enrollment', false] }, true, false] }
                    }
                },

                {
                    $lookup: {
                        from: 'plans',
                        localField: 'combo_id',
                        foreignField: 'course_id',
                        as: 'plans'
                    }
                },
                {
                    $addFields: {
                        availablePlans: {
                            $cond: [
                                { $ifNull: ['$enrollment', false] },
                                [],
                                '$plans'
                            ]
                        }
                    }
                },

                // ✅ Step 1: Strip the timezone label from the string (same as notes function)
                {
                    $addFields: {
                        expiryDateClean: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$enrollment.enroll_type', 'combination'] },
                                        { $ifNull: ['$enrollment.expiry_date', false] }
                                    ]
                                },
                                {
                                    $replaceAll: {
                                        input: '$enrollment.expiry_date',
                                        find: ' (Coordinated Universal Time)',
                                        replacement: ''
                                    }
                                },
                                null
                            ]
                        }
                    }
                },

                // ✅ Step 2: Parse the cleaned string into a Date object
                {
                    $addFields: {
                        expiryDateObj: {
                            $cond: [
                                { $ifNull: ['$expiryDateClean', false] },
                                {
                                    $dateFromString: {
                                        dateString: '$expiryDateClean',
                                        onError: null
                                    }
                                },
                                null
                            ]
                        }
                    }
                },

                // ✅ Step 3: Calculate remaining_duration from parsed Date
                {
                    $addFields: {
                        remaining_duration: {
                            $cond: [
                                {
                                    $and: [
                                        { $ifNull: ['$expiryDateObj', false] },
                                        { $gt: ['$expiryDateObj', today] }
                                    ]
                                },
                                {
                                    $ceil: {
                                        $divide: [
                                            { $subtract: ['$expiryDateObj', today] },
                                            1000 * 60 * 60 * 24
                                        ]
                                    }
                                },
                                null
                            ]
                        }
                    }
                },

                {
                    $project: {
                        combo_id: 1,
                        title: 1,
                        description: 1,
                        presentation_image: 1,
                        subcategory_id: 1,
                        includes_lectures: 1,
                        includes_notes: 1,
                        includes_prelimes: 1,
                        includes_mains: 1,
                        isEnrolled: 1,
                        enroll_date: {
                            $cond: [
                                { $eq: ['$enrollment.enroll_type', 'combination'] },
                                '$enrollment.enroll_date',
                                null
                            ]
                        },
                        expiry_date: {
                            $cond: [
                                { $eq: ['$enrollment.enroll_type', 'combination'] },
                                '$expiryDateObj',
                                null
                            ]
                        },
                        remaining_duration: 1,
                        availablePlans: 1
                    }
                }
            ]);

            const totalCount = await this.comboModel.countDocuments({ isActive: true });

            return {
                statusCode: HttpStatus.OK,
                message: 'List of Combos',
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                limit,
                data
            };
        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }

    async getComboContent(comboId: string, userId: string) {
        try {
            // First check for combination enrollment
            let enrollment = await this.enrollmentModel.findOne({
                course_id: comboId,
                userId,
                enroll_type: 'combination',
                status: 'active'
            });

            // Fetch combo details
            const combo = await this.comboModel.findOne({ combo_id: comboId });
            if (!combo) return { statusCode: HttpStatus.NOT_FOUND, message: 'Combo not found' };

            // If no combination enrollment, check for full-course enrollment in same subcategory
            if (!enrollment) {
                enrollment = await this.enrollmentModel.findOne({
                    course_id: combo.subcategory_id,
                    userId,
                    enroll_type: 'full-course',
                    status: 'active'
                });

                if (!enrollment) {
                    return { statusCode: HttpStatus.FORBIDDEN, message: 'User not enrolled in this combo or full course' };
                }
            }

            const result: any = {
                combo_id: combo.combo_id,
                title: combo.title,
                description: combo.description,
                enroll_date: enrollment.enroll_date,
                expiry_date: enrollment.expiry_date,
            };

            // Deduplicate lawIds
            const lawIds: string[] = [];
            if (combo.lecture_config?.law_id) lawIds.push(combo.lecture_config.law_id);
            if (combo.notes_config?.law_id) lawIds.push(combo.notes_config.law_id);
            const uniqueLawIds = [...new Set(lawIds)];

            result.laws = await Promise.all(
                uniqueLawIds.map((lawId) =>
                    this.buildLawHierarchy(lawId, combo.includes_lectures, combo.includes_notes)
                )
            );

            if (combo.includes_mains && combo.mains_ids?.length) {
                const mains = await this.mainsModel.find({ mains_id: { $in: combo.mains_ids } }).select('mains_id title');
                result.mains = { selected: mains };
            }

            if (combo.includes_prelimes && combo.prelimes_ids?.length) {
                const prelimes = await this.prelimesModel.find({ prelimes_id: { $in: combo.prelimes_ids } }).select('prelimes_id title');
                result.prelimes = { selected: prelimes };
            }

            return { statusCode: HttpStatus.OK, message: 'Combo Content', data: result };
        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }

    // USER: Get lectures for a specific subject (within combo)
    async getComboLecturesBySubject(comboId: string, subjectId: string, userId: string) {
        try {
            const enrollment = await this.enrollmentModel.findOne({
                course_id: comboId,
                userId,
                status: enrollmentStatus.ACTIVE,
                enroll_type: 'combination',
            });
            if (!enrollment) return { statusCode: HttpStatus.FORBIDDEN, message: 'Not enrolled in this combo' };

            const combo = await this.comboModel.findOne({ combo_id: comboId });
            if (!combo || !combo.includes_lectures || !combo.lecture_config) {
                return { statusCode: HttpStatus.NOT_FOUND, message: 'Combo lecture config not found' };
            }

            const { access_type, law_id, subject_ids } = combo.lecture_config;

            let isAllowed = false;
            if (access_type === 'law-based' && law_id) {
                const subject = await this.subjectModel.findOne({ subjectId, law_id });
                isAllowed = !!subject;
            } else if (access_type === 'subject-based' && subject_ids) {
                isAllowed = subject_ids.includes(subjectId);
            }

            if (!isAllowed) {
                return { statusCode: HttpStatus.FORBIDDEN, message: 'This subject is not part of your combo' };
            }

            const lectures = await this.lectureModel.find({ subjectId }).sort({ lecture_no: 1 }).select('-__v');

            return { statusCode: HttpStatus.OK, message: 'Lectures for subject', data: lectures };
        } catch (error) {
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message };
        }
    }
}
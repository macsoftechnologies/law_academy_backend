import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import * as puppeteer from 'puppeteer';
import { Billing } from './schema/billing.schema';
import { Enrollment } from '../enrollments/schema/enrollment.schema';
import { BillingDto } from './dto/billing.dto';
import { generateInvoiceHtml, InvoiceData } from './invoice.template';

@Injectable()
export class BillingsService {
    constructor(
        @InjectModel(Billing.name)
        private readonly billingModel: Model<Billing>,
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<Enrollment>,
    ) { }

    async createBilling(payload: {
        userId: string;
        enroll_id: string;
        planId: string;
        course_id: string;
        enroll_type: string;
        payment_id: string;
        amount: number;          
        currency?: string;
        billing_cycle: string;
        valid_till: string;
        transaction_date: string;
        gst_percent?: number;
    }) {
        try {
            const gst = payload.gst_percent ?? 0;
            const totalPaise = Math.round(payload.amount * 100);
            const basePaise = Math.round(totalPaise / (1 + gst / 100));
            const gstPaise = totalPaise - basePaise;

            const billing = await this.billingModel.create({
                userId: payload.userId,
                enroll_id: payload.enroll_id,
                planId: payload.planId,
                course_id: payload.course_id,
                enroll_type: payload.enroll_type,
                payment_id: payload.payment_id,
                amount_paise: totalPaise,
                base_amount_paise: basePaise,
                gst_amount_paise: gstPaise,
                gst_percent: gst,
                currency: payload.currency ?? 'INR',
                billing_cycle: payload.billing_cycle,
                valid_till: payload.valid_till,
                transaction_date: payload.transaction_date,
            });

            return {
                statusCode: HttpStatus.OK,
                message: 'Billing record created',
                data: billing,
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }

    private courseDetailsPipeline(): PipelineStage[] {
        return [
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'course_id',
                    foreignField: 'subcategory_id',
                    as: '_fullCourse',
                },
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'course_id',
                    foreignField: 'subjectId',
                    as: '_subject',
                },
            },
            {
                $lookup: {
                    from: 'mains',
                    localField: 'course_id',
                    foreignField: 'mains_id',
                    as: '_mains',
                },
            },
            {
                $lookup: {
                    from: 'notes',
                    localField: 'course_id',
                    foreignField: 'notes_id',
                    as: '_notes',
                },
            },
            {
                $lookup: {
                    from: 'prelimes',
                    localField: 'course_id',
                    foreignField: 'prelimes_id',
                    as: '_prelimes',
                },
            },
            {
                $lookup: {
                    from: 'combos',
                    localField: 'course_id',
                    foreignField: 'combo_id',
                    as: '_combo',
                },
            },

            {
                $addFields: {
                    _fullCourseDoc: { $arrayElemAt: ['$_fullCourse', 0] },
                    _subjectDoc: { $arrayElemAt: ['$_subject', 0] },
                    _mainsDoc: { $arrayElemAt: ['$_mains', 0] },
                    _notesDoc: { $arrayElemAt: ['$_notes', 0] },
                    _prelimesDoc: { $arrayElemAt: ['$_prelimes', 0] },
                    _comboDoc: { $arrayElemAt: ['$_combo', 0] },
                },
            },

            {
                $lookup: {
                    from: 'categories',
                    localField: '_fullCourseDoc.categoryId',
                    foreignField: 'categoryId',
                    as: '_fcCategory',
                },
            },

            {
                $lookup: {
                    from: 'laws',
                    localField: '_subjectDoc.law_id',
                    foreignField: 'lawId',
                    as: '_subjectLaw',
                },
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_subjectDoc.subcategory_id',
                    foreignField: 'subcategory_id',
                    as: '_subjectSubcategory',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_subjectDoc.categoryId',
                    foreignField: 'categoryId',
                    as: '_subjectCategory',
                },
            },

            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_mainsDoc.subcategory_id',
                    foreignField: 'subcategory_id',
                    as: '_mainsSubcategory',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_mainsDoc.subcategory_id',   // resolved via subcategory below
                    foreignField: 'subcategory_id',
                    as: '_mainsSubcategoryForCategory',
                },
            },

            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_notesDoc.subcategory_id',
                    foreignField: 'subcategory_id',
                    as: '_notesSubcategory',
                },
            },

            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_prelimesDoc.subcategory_id',
                    foreignField: 'subcategory_id',
                    as: '_prelimesSubcategory',
                },
            },

            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_comboDoc.subcategory_id',
                    foreignField: 'subcategory_id',
                    as: '_comboSubcategory',
                },
            },

            {
                $addFields: {
                    _mainsSubcategoryDoc: { $arrayElemAt: ['$_mainsSubcategory', 0] },
                    _notesSubcategoryDoc: { $arrayElemAt: ['$_notesSubcategory', 0] },
                    _prelimesSubcategoryDoc: { $arrayElemAt: ['$_prelimesSubcategory', 0] },
                    _comboSubcategoryDoc: { $arrayElemAt: ['$_comboSubcategory', 0] },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_mainsSubcategoryDoc.categoryId',
                    foreignField: 'categoryId',
                    as: '_mainsCategory',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_notesSubcategoryDoc.categoryId',
                    foreignField: 'categoryId',
                    as: '_notesCategory',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_prelimesSubcategoryDoc.categoryId',
                    foreignField: 'categoryId',
                    as: '_prelimesCategory',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_comboSubcategoryDoc.categoryId',
                    foreignField: 'categoryId',
                    as: '_comboCategory',
                },
            },

            {
                $addFields: {
                    courseDetails: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$enroll_type', 'full-course'] },
                                    then: {
                                        type: 'full-course',
                                        subcategory_id: '$_fullCourseDoc.subcategory_id',
                                        title: '$_fullCourseDoc.title',
                                        about_course: '$_fullCourseDoc.about_course',
                                        presentation_image: '$_fullCourseDoc.presentation_image',
                                        terms_conditions: '$_fullCourseDoc.terms_conditions',
                                        category: {
                                            categoryId: { $arrayElemAt: ['$_fcCategory.categoryId', 0] },
                                            category_name: { $arrayElemAt: ['$_fcCategory.category_name', 0] },
                                            tag_text: { $arrayElemAt: ['$_fcCategory.tag_text', 0] },
                                        },
                                    },
                                },

                                {
                                    case: { $eq: ['$enroll_type', 'subject-wise'] },
                                    then: {
                                        type: 'subject-wise',
                                        subjectId: '$_subjectDoc.subjectId',
                                        title: '$_subjectDoc.title',
                                        subject_image: '$_subjectDoc.subject_image',
                                        law: {
                                            lawId: { $arrayElemAt: ['$_subjectLaw.lawId', 0] },
                                            title: { $arrayElemAt: ['$_subjectLaw.title', 0] },
                                            law_image: { $arrayElemAt: ['$_subjectLaw.law_image', 0] },
                                        },
                                        subcategory: {
                                            subcategory_id: { $arrayElemAt: ['$_subjectSubcategory.subcategory_id', 0] },
                                            title: { $arrayElemAt: ['$_subjectSubcategory.title', 0] },
                                            presentation_image: { $arrayElemAt: ['$_subjectSubcategory.presentation_image', 0] },
                                        },
                                        category: {
                                            categoryId: { $arrayElemAt: ['$_subjectCategory.categoryId', 0] },
                                            category_name: { $arrayElemAt: ['$_subjectCategory.category_name', 0] },
                                            tag_text: { $arrayElemAt: ['$_subjectCategory.tag_text', 0] },
                                        },
                                    },
                                },

                                {
                                    case: { $eq: ['$enroll_type', 'mains'] },
                                    then: {
                                        type: 'mains',
                                        mains_id: '$_mainsDoc.mains_id',
                                        title: '$_mainsDoc.title',
                                        sub_title: '$_mainsDoc.sub_title',
                                        about_course: '$_mainsDoc.about_course',
                                        course_points: '$_mainsDoc.course_points',
                                        terms_conditions: '$_mainsDoc.terms_conditions',
                                        presentation_image: '$_mainsDoc.presentation_image',
                                        subcategory: {
                                            subcategory_id: '$_mainsSubcategoryDoc.subcategory_id',
                                            title: '$_mainsSubcategoryDoc.title',
                                            presentation_image: '$_mainsSubcategoryDoc.presentation_image',
                                            about_course: '$_mainsSubcategoryDoc.about_course',
                                        },
                                        category: {
                                            categoryId: { $arrayElemAt: ['$_mainsCategory.categoryId', 0] },
                                            category_name: { $arrayElemAt: ['$_mainsCategory.category_name', 0] },
                                            tag_text: { $arrayElemAt: ['$_mainsCategory.tag_text', 0] },
                                        },
                                    },
                                },

                                {
                                    case: { $eq: ['$enroll_type', 'notes'] },
                                    then: {
                                        type: 'notes',
                                        notes_id: '$_notesDoc.notes_id',
                                        title: '$_notesDoc.title',
                                        sub_title: '$_notesDoc.sub_title',
                                        about_book: '$_notesDoc.about_book',
                                        presentation_image: '$_notesDoc.presentation_image',
                                        isPrintAvail: '$_notesDoc.isPrintAvail',
                                        printNotes_image: '$_notesDoc.printNotes_image',
                                        terms_conditions: '$_notesDoc.terms_conditions',
                                        subcategory: {
                                            subcategory_id: '$_notesSubcategoryDoc.subcategory_id',
                                            title: '$_notesSubcategoryDoc.title',
                                            presentation_image: '$_notesSubcategoryDoc.presentation_image',
                                        },
                                        category: {
                                            categoryId: { $arrayElemAt: ['$_notesCategory.categoryId', 0] },
                                            category_name: { $arrayElemAt: ['$_notesCategory.category_name', 0] },
                                            tag_text: { $arrayElemAt: ['$_notesCategory.tag_text', 0] },
                                        },
                                    },
                                },

                                {
                                    case: { $eq: ['$enroll_type', 'prelimes'] },
                                    then: {
                                        type: 'prelimes',
                                        prelimes_id: '$_prelimesDoc.prelimes_id',
                                        title: '$_prelimesDoc.title',
                                        sub_title: '$_prelimesDoc.sub_title',
                                        about_course: '$_prelimesDoc.about_course',
                                        course_points: '$_prelimesDoc.course_points',
                                        terms_conditions: '$_prelimesDoc.terms_conditions',
                                        presentation_image: '$_prelimesDoc.presentation_image',
                                        subcategory: {
                                            subcategory_id: '$_prelimesSubcategoryDoc.subcategory_id',
                                            title: '$_prelimesSubcategoryDoc.title',
                                            presentation_image: '$_prelimesSubcategoryDoc.presentation_image',
                                            about_course: '$_prelimesSubcategoryDoc.about_course',
                                        },
                                        category: {
                                            categoryId: { $arrayElemAt: ['$_prelimesCategory.categoryId', 0] },
                                            category_name: { $arrayElemAt: ['$_prelimesCategory.category_name', 0] },
                                            tag_text: { $arrayElemAt: ['$_prelimesCategory.tag_text', 0] },
                                        },
                                    },
                                },

                                {
                                    case: { $eq: ['$enroll_type', 'combination'] },
                                    then: {
                                        type: 'combination',
                                        combo_id: '$_comboDoc.combo_id',
                                        title: '$_comboDoc.title',
                                        description: '$_comboDoc.description',
                                        presentation_image: '$_comboDoc.presentation_image',
                                        includes_lectures: '$_comboDoc.includes_lectures',
                                        includes_notes: '$_comboDoc.includes_notes',
                                        includes_prelimes: '$_comboDoc.includes_prelimes',
                                        includes_mains: '$_comboDoc.includes_mains',
                                        lecture_config: '$_comboDoc.lecture_config',
                                        notes_config: '$_comboDoc.notes_config',
                                        subcategory: {
                                            subcategory_id: '$_comboSubcategoryDoc.subcategory_id',
                                            title: '$_comboSubcategoryDoc.title',
                                            presentation_image: '$_comboSubcategoryDoc.presentation_image',
                                        },
                                        category: {
                                            categoryId: { $arrayElemAt: ['$_comboCategory.categoryId', 0] },
                                            category_name: { $arrayElemAt: ['$_comboCategory.category_name', 0] },
                                            tag_text: { $arrayElemAt: ['$_comboCategory.tag_text', 0] },
                                        },
                                    },
                                },
                            ],
                            default: null,
                        },
                    },
                },
            },
            {
                $project: {
                    _fullCourse: 0, _fullCourseDoc: 0, _fcCategory: 0,
                    _subject: 0, _subjectDoc: 0, _subjectLaw: 0,
                    _subjectSubcategory: 0, _subjectCategory: 0,
                    _mains: 0, _mainsDoc: 0, _mainsSubcategory: 0,
                    _mainsSubcategoryDoc: 0, _mainsSubcategoryForCategory: 0, _mainsCategory: 0,
                    _notes: 0, _notesDoc: 0, _notesSubcategory: 0,
                    _notesSubcategoryDoc: 0, _notesCategory: 0,
                    _prelimes: 0, _prelimesDoc: 0, _prelimesSubcategory: 0,
                    _prelimesSubcategoryDoc: 0, _prelimesCategory: 0,
                    _combo: 0, _comboDoc: 0, _comboSubcategory: 0,
                    _comboSubcategoryDoc: 0, _comboCategory: 0,
                },
            },
        ] as PipelineStage[];
    }

    async getUserBillings(req: BillingDto) {
        try {
            const billings = await this.billingModel.aggregate([
                { $match: { userId: req.userId } },
                { $sort: { createdAt: -1 } },

                {
                    $lookup: {
                        from: 'enrollments',
                        localField: 'enroll_id',
                        foreignField: 'enroll_id',
                        as: 'enrollment',
                    },
                },
                { $addFields: { enrollment: { $arrayElemAt: ['$enrollment', 0] } } },

                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: 'userId',
                        as: 'user',
                    },
                },
                { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },

                {
                    $lookup: {
                        from: 'plans',
                        localField: 'planId',
                        foreignField: 'planId',
                        as: 'plan',
                    },
                },
                { $addFields: { plan: { $arrayElemAt: ['$plan', 0] } } },

                ...this.courseDetailsPipeline(),
            ]);

            if (!billings.length) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'No billing records found',
                };
            }

            const formatted = billings.map((b) => ({
                ...b,
                amount: b.amount_paise / 100,
                base_amount: b.base_amount_paise / 100,
                gst_amount: b.gst_amount_paise / 100,
                billing_status: new Date(b.valid_till) > new Date() ? 'active' : 'inactive',
            }));

            return {
                statusCode: HttpStatus.OK,
                message: 'User billing records',
                data: formatted,
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }

    async getBillingDetails(req: BillingDto) {
        try {
            const result = await this.billingModel.aggregate([
                { $match: { billing_id: req.billing_id } },

                {
                    $lookup: {
                        from: 'plans',
                        localField: 'planId',
                        foreignField: 'planId',
                        as: 'plan',
                    },
                },
                { $addFields: { plan: { $arrayElemAt: ['$plan', 0] } } },

                {
                    $lookup: {
                        from: 'enrollments',
                        localField: 'enroll_id',
                        foreignField: 'enroll_id',
                        as: 'enrollment',
                    },
                },
                { $addFields: { enrollment: { $arrayElemAt: ['$enrollment', 0] } } },

                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: 'userId',
                        as: 'user',
                    },
                },
                { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },

                ...this.courseDetailsPipeline(),
            ]);

            if (!result.length) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Billing record not found',
                };
            }

            const b = result[0];
            return {
                statusCode: HttpStatus.OK,
                message: 'Billing details',
                data: {
                    ...b,
                    amount: b.amount_paise / 100,
                    base_amount: b.base_amount_paise / 100,
                    gst_amount: b.gst_amount_paise / 100,
                    billing_status: new Date(b.valid_till) > new Date() ? 'active' : 'inactive',
                },
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }

    async generateInvoicePdf(billing_id: string): Promise<{
        buffer?: Buffer;
        filename?: string;
        error?: { statusCode: number; message: string };
    }> {
        const detailResult = await this.getBillingDetails({ billing_id });

        if (detailResult.statusCode !== HttpStatus.OK) {
            return { error: { statusCode: detailResult.statusCode, message: detailResult.message } };
        }

        const b = detailResult.data as any;

        const cd = b.courseDetails;
        const courseName: string = cd?.title ?? cd?.subcategory?.title ?? 'Course';

        const invoiceData: InvoiceData = {
            billing_id: b.billing_id,
            payment_id: b.payment_id,
            transaction_date: b.transaction_date,
            billing_cycle: b.billing_cycle,
            valid_till: b.valid_till,
            billing_status: 'paid',
            currency: b.currency,
            amount_paise: b.amount_paise,
            base_amount_paise: b.base_amount_paise,
            gst_amount_paise: b.gst_amount_paise,
            gst_percent: b.gst_percent,
            courseName,
            enroll_type: b.enroll_type,
            planName: b.plan?.plan_name ?? b.billing_cycle,
            userName: b.user?.name ?? b.user?.fullName ?? b.user?.userName ?? 'Student',
            userEmail: b.user?.email ?? b.enrollment?.email,
        };

        const html = generateInvoiceHtml(invoiceData);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'domcontentloaded' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
            });

            return {
                buffer: Buffer.from(pdfBuffer),
                filename: `LawEdge_Invoice_${billing_id}.pdf`,
            };
        } finally {
            await browser.close();
        }
    }
}
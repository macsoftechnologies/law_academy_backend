import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Enrollment } from './schema/enrollment.schema';
import { Model } from 'mongoose';

@Injectable()
export class EnrollmentsService {
    constructor(@InjectModel(Enrollment.name) private readonly enrollmentModel: Model<Enrollment>) {}
}

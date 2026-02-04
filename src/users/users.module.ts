import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './schemas/user.schema';
import {
  EducationalCertificates,
  educationalCertificatesSchema,
} from './schemas/educational_certificates.schema';
import { IdProof, idProofsSchema } from './schemas/idproofs.schema';
import { DetailsUpdateRequest, detailsUpdateRequestSchema } from './schemas/detailsUpdateRequest.schema';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ShippingAddress, shippingaddressSchema } from './schemas/shipping_address.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      {
        name: EducationalCertificates.name,
        schema: educationalCertificatesSchema,
      },
      { name: IdProof.name, schema: idProofsSchema },
      { name: DetailsUpdateRequest.name, schema: detailsUpdateRequestSchema },
      { name: ShippingAddress.name, schema: shippingaddressSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService, JwtService],
})
export class UsersModule {}

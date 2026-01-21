import { ApiProperty } from "@nestjs/swagger";

export class educationalCertificatesDto{
    @ApiProperty()
    certificate_id: string
    @ApiProperty()
    certificate_standard: string
    @ApiProperty()
    marks_cgpa: string
    @ApiProperty()
    institute_name: string
    @ApiProperty()
    certificate_file: string
    @ApiProperty()
    userId: string
}
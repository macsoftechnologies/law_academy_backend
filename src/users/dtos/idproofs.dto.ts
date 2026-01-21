import { ApiProperty } from "@nestjs/swagger";

export class idProofDto{
    @ApiProperty()
    proof_id: string
    @ApiProperty()
    idType: string
    @ApiProperty()
    id_number: string
    @ApiProperty()
    proof_file: string
    @ApiProperty()
    userId: string
}
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { BillingsService } from './billing.service';
import { BillingDto } from './dto/billing.dto';

@Controller('billings')
export class BillingsController {
  constructor(private readonly billingsService: BillingsService) {}

  @Post('/user_billings')
  async getUserBillings(@Body() req: BillingDto) {
    try {
      return await this.billingsService.getUserBillings(req);
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('/details')
  async getBillingDetails(@Body() req: BillingDto) {
    try {
      return await this.billingsService.getBillingDetails(req);
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Get('/invoice/:billing_id')
  async downloadInvoice(
    @Param('billing_id') billing_id: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.billingsService.generateInvoicePdf(billing_id);

      if (result.error) {
        return res.status(result.error.statusCode).json({
          statusCode: result.error.statusCode,
          message: result.error.message,
        });
      }

      if (!result.buffer || !result.filename) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to generate invoice',
        });
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.buffer.length,
      });

      return res.end(result.buffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRentalPaymentDto {
  @ApiProperty({
    example: 'RENTAL_AGREEMENT_ID_123',
    description: 'Rental Agreement ID',
  })
  @IsNotEmpty()
  @IsUUID()
  rentalAgreementId: string;

  @ApiProperty({ example: 1200.5, description: 'Amount to be paid' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: '2025-04-01',
    description: 'Due date for payment',
  })
  @IsNotEmpty()
  @IsString()
  dueDate: string;

  @ApiProperty({
    example: '2025-04-01',
    description: 'Date for payment',
  })
  @IsNotEmpty()
  @IsString()
  paymentDate: string;

  @ApiProperty({ example: 'Credit Card', description: 'Payment Method' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({
    example: 'TXN_ABC123',
    description: 'Transaction ID (if paid)',
  })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({
    example: 'Payment for April rent',
    description: 'Notes on the payment',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the payment is paid (true) or unpaid (false)',
  })
  @IsNotEmpty()
  @IsBoolean()
  isPaid: boolean;
}

import { OmitType, PartialType } from "@nestjs/mapped-types";
import { TransactionsDto } from "./transactions.dto";

// Si, en sintesis solo cambia el status.
export class UpdateTransactionsDto extends PartialType(
    OmitType(TransactionsDto, ['amount', 'buyerId', 'sellerId' ,'postId', 'reason', 'value'] as const)){}
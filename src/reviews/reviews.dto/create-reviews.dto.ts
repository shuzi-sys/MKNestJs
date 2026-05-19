import { OmitType, PartialType } from "@nestjs/mapped-types";
import { ReviewsDto } from "./reviews.dto";

export class CreateReviewsDto extends PartialType(
    OmitType(ReviewsDto, ['role', 'reviewedId', 'reviewerId', 'transactionId'])){}
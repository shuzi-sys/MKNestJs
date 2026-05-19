import { PartialType, OmitType } from "@nestjs/mapped-types"
import { PostDto } from "./post.dto"

export class UpdatePostDto extends PartialType(OmitType(PostDto, ['ownerId'])){}

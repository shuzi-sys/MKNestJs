import { OmitType, PartialType } from "@nestjs/mapped-types";
import { PostDto } from "./post.dto";

/*el status no va en la creacion porque la DB lo defaultea a activo
igual idealmente deberia haber una opcion para crear posts ocultos / solo por link / etc y ahi si 
estaria expuesto */
export class CreatePostDto extends PartialType(OmitType(PostDto, ['status'])){}

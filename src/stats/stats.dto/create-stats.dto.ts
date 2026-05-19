import { OmitType, PartialType } from "@nestjs/mapped-types";
import { StatsDto } from "./stats.dto";

export class CreateStatsDto extends PartialType(OmitType(StatsDto, ['userId'])){}

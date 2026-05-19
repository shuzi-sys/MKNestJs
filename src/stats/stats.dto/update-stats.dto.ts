import { PartialType, OmitType } from "@nestjs/mapped-types";
import { StatsDto } from "./stats.dto";

export class UpdateStatsDto extends PartialType(OmitType(StatsDto, ['userId'])){}

import { PartialType, OmitType } from "@nestjs/mapped-types";
import { TransactionsDto } from "./transactions.dto";


// Status es inicializada en la DB como PENDING automaticamente, por ello no se inicializa aca
// El resto de campos vienen de interacciones previas o JWT para el buyerid.
export class CreateTransactionsDto extends PartialType(
    OmitType(TransactionsDto, ['status', 'buyerId', 'sellerId', 'postId', 'value', 'reason'
    ])) {}

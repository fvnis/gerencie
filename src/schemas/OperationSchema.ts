import { z } from "zod";

export const OperationSchema = z.object({
  clienteId: z.string().min(1),
  tipoDaOperacao: z.string().min(1),
  statusDaOperacao: z.string().min(1),
  dataDaOperacao: z.date(),
  banco: z.string().min(1),
  valorLiberado: z.number().min(1),
  comissao: z.number().min(1),
});

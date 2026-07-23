export interface Imovel {
  id: string;
  tipo: string;
  endereco: string;
  valor: string;
  quartos?: string;
  banheiros?: string;
  vagas?: string;
  observacao?: string;
}

export type TipoCliente = "Locador" | "Locatário" | "Comprador" | "Vendedor";

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  tipo: TipoCliente;
  interesse?: string;
}

export type StatusVisita = "Agendada" | "Confirmada" | "Realizada" | "Fechada";

export interface Visita {
  id: string;
  cliente: string;
  imovel: string;
  data: string;
  horario: string;
  status: StatusVisita;
  observacao?: string;
}

export interface Contrato {
  id: string;
  cliente: string;
  imovel: string;
  valorAluguel: string;
  dataInicio: string;
  dataVencimento: string;
  observacao?: string;
}

export type NivelAlerta = "urgente" | "atencao" | "ok";

export interface Alerta {
  texto: string;
  cor: string;
  nivel: NivelAlerta;
}

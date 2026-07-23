import type { ColorPalette } from "../theme";
import type { Alerta } from "../types";

/** Converte "DD/MM/AAAA" em Date. */
export function parseData(dataStr: string): Date {
  const [dia, mes, ano] = dataStr.split("/");
  return new Date(+ano, +mes - 1, +dia);
}

/** Dias entre hoje (00:00) e a data informada (negativo = passado). */
export function diasDiferenca(data: Date): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Gera os alertas de um contrato (vencimento/renovação e reajuste anual).
 * Compartilhado entre a tela de Contratos e o dashboard. Recebe a paleta
 * de cores ativa (`useTheme().colors`) para os alertas respeitarem o tema;
 * o `nivel` é a chave estável usada para filtrar/ordenar (a cor pode ficar
 * desatualizada se o tema mudar, o nível nunca fica).
 */
export function calcularAlertas(dataInicioStr: string, dataVencStr: string, colors: ColorPalette): Alerta[] {
  const alertas: Alerta[] = [];

  if (dataVencStr && dataVencStr.length === 10) {
    const vencimento = parseData(dataVencStr);
    const diasVenc = diasDiferenca(vencimento);
    if (diasVenc < 0) {
      alertas.push({ texto: "⛔ Contrato vencido", cor: colors.danger, nivel: "urgente" });
    } else if (diasVenc <= 30) {
      alertas.push({ texto: `⚠️ Renovação em ${diasVenc} dias`, cor: colors.danger, nivel: "urgente" });
    } else if (diasVenc <= 90) {
      alertas.push({ texto: `🔔 Renovação em ${diasVenc} dias`, cor: colors.orange, nivel: "atencao" });
    } else {
      alertas.push({ texto: `✅ Vence em ${diasVenc} dias`, cor: colors.success, nivel: "ok" });
    }
  }

  if (dataInicioStr && dataInicioStr.length === 10) {
    const inicio = parseData(dataInicioStr);
    const hoje = new Date();
    const mesesAtivos =
      (hoje.getFullYear() - inicio.getFullYear()) * 12 +
      (hoje.getMonth() - inicio.getMonth());
    const proximoReajuste = new Date(inicio);
    proximoReajuste.setMonth(inicio.getMonth() + (Math.floor(mesesAtivos / 12) + 1) * 12);
    const diasReajuste = diasDiferenca(proximoReajuste);
    if (diasReajuste <= 30) {
      alertas.push({ texto: `💰 Reajuste em ${diasReajuste} dias`, cor: colors.danger, nivel: "urgente" });
    } else if (diasReajuste <= 60) {
      alertas.push({ texto: `💰 Reajuste em ${diasReajuste} dias`, cor: colors.orange, nivel: "atencao" });
    }
  }

  return alertas;
}

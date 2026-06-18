function formatarData(texto) {
  const n = texto.replace(/\D/g, "");
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`;
}

function calcularDiasParaVencer(dataVencimento) {
  const [dia, mes, ano] = dataVencimento.split("/");
  const vencimento = new Date(+ano, +mes - 1, +dia);
  const hoje = new Date();
  return Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
}

describe("Funções de Visitas", () => {
  test("formata data parcial corretamente", () => {
    expect(formatarData("20")).toBe("20");
    expect(formatarData("2006")).toBe("20/06");
  });

  test("formata data completa corretamente", () => {
    expect(formatarData("20062026")).toBe("20/06/2026");
  });
});

describe("Funções de Contratos", () => {
  test("calcula dias restantes para vencimento futuro", () => {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 10);
    const dia = String(dataFutura.getDate()).padStart(2, "0");
    const mes = String(dataFutura.getMonth() + 1).padStart(2, "0");
    const ano = dataFutura.getFullYear();
    const dias = calcularDiasParaVencer(`${dia}/${mes}/${ano}`);
    expect(dias).toBeGreaterThanOrEqual(9);
    expect(dias).toBeLessThanOrEqual(10);
  });

  test("detecta contrato vencido", () => {
    const dias = calcularDiasParaVencer("01/01/2020");
    expect(dias).toBeLessThan(0);
  });
});

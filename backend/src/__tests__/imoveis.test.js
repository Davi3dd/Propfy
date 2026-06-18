function formatarValor(valor) {
  const numero = valor.replace(/\D/g, "");
  const formatado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatado ? `R$ ${formatado}` : "";
}

function validarImovel(imovel) {
  return !!(imovel.endereco && imovel.valor && imovel.tipo);
}

describe("Funções de Imóveis", () => {
  test("formata valor corretamente", () => {
    expect(formatarValor("350000")).toBe("R$ 350.000");
  });

  test("formata valor vazio", () => {
    expect(formatarValor("")).toBe("");
  });

  test("valida imóvel completo", () => {
    const imovel = {
      endereco: "Rua A, 123",
      valor: "R$ 350.000",
      tipo: "Casa",
    };
    expect(validarImovel(imovel)).toBe(true);
  });

  test("invalida imóvel sem endereço", () => {
    const imovel = { endereco: "", valor: "R$ 350.000", tipo: "Casa" };
    expect(validarImovel(imovel)).toBe(false);
  });
});

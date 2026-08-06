export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>UC Brasil — catálogo informativo de Unidades de Conservação do Brasil.</p>
        <p className="mt-1">
          Dados oficiais do{" "}
          <a
            href="https://dados.mma.gov.br/dataset/unidadesdeconservacao"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-700 underline-offset-2 hover:underline"
          >
            CNUC (dados.mma.gov.br)
          </a>
          . Projeto de código aberto.
        </p>
      </div>
    </footer>
  );
}

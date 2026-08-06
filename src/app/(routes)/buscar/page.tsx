import { listarOpcoes } from "@/lib/ucs";
import { BuscarCliente } from "./BuscarCliente";

export const metadata = {
  title: "Buscar Unidades de Conservação",
  description:
    "Busque e filtre as Unidades de Conservação do Brasil por nome, estado, categoria, bioma e esfera administrativa.",
};

export const revalidate = 86400;

export default function BuscarPage() {
  const opcoes = listarOpcoes();

  return <BuscarCliente opcoes={opcoes} />;
}

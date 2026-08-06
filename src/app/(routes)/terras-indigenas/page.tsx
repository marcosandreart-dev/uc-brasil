import { listarOpcoesTI } from "@/lib/tis";
import { TIBuscaCliente } from "./TIBuscaCliente";

export const metadata = {
  title: "Terras Indígenas do Brasil",
  description:
    "Busque e filtre as Terras Indígenas do Brasil por nome, etnia, município, situação demarcatória e unidade da federação.",
};

export const revalidate = 86400;

export default function TerrasIndigenasPage() {
  const opcoes = listarOpcoesTI();

  return <TIBuscaCliente opcoes={opcoes} />;
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { OrcamentoFormal, ItemOrcamento } from "../../types";
import { Config } from "../../hooks/useConfig";

// ─── cores da marca ───────────────────────────────────────────────────────────
const BRAND = {
  navy: "#0b0f2e", // fundo escuro do logo
  blue: "#1a2fa0", // azul médio do gradiente
  yellow: "#f5c400", // amarelo do logo
  yellowDark: "#c49a00",
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray300: "#d1d5db",
  gray500: "#6b7280",
  gray700: "#374151",
  gray900: "#111827",
};

const defaultConfig: Config = {
  nome_empresa: "Eletro Link Manutenções",
  telefone: "(11) 94764-1802",
  whatsapp: "5511947641802",
  email: "eletrolink220@gmail.com",
  endereco: "São Paulo - SP e Grande São Paulo",
  horario: "Seg-Sex 8h-18h · Sáb 8h-12h",
  instagram: "",
  facebook: "",
};

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatDate(s: string) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("pt-BR");
}
function formatNumero(n: number) {
  return String(n).padStart(4, "0");
}

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
  executado: "Executado",
  faturado: "Faturado",
};
const STATUS_COLOR: Record<string, string> = {
  rascunho: "#6b7280",
  enviado: "#2563eb",
  aprovado: "#16a34a",
  recusado: "#dc2626",
  executado: "#7c3aed",
  faturado: "#d97706",
};

// ─── sub-componentes ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 700,
        color: BRAND.blue,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 6,
        borderLeft: `3px solid ${BRAND.yellow}`,
        paddingLeft: 6,
      }}
    >
      {children}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: BRAND.gray50,
        border: `1px solid ${BRAND.gray100}`,
        borderRadius: 6,
        padding: "12px 16px",
      }}
    >
      {children}
    </div>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────

export default function AdminOrcamentoPrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orc, setOrc] = useState<OrcamentoFormal | null>(null);
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [fotos, setFotos] = useState<
    { id: string; url: string; legenda: string }[]
  >([]);
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: orcData }, { data: configData }] = await Promise.all([
        supabase.from("orcamentos_formais").select("*").eq("id", id).single(),
        supabase.from("configuracoes").select("*").eq("id", 1).single(),
      ]);
      if (!orcData) {
        navigate("/admin/orcamentos");
        return;
      }

      const [{ data: itensData }, { data: fotosData }] = await Promise.all([
        supabase
          .from("orcamento_itens")
          .select("*")
          .eq("orcamento_id", id)
          .order("ordem", { ascending: true }),
        supabase
          .from("orcamento_fotos")
          .select("*")
          .eq("orcamento_id", id)
          .order("created_at"),
      ]);

      setOrc(orcData as OrcamentoFormal);
      setItens((itensData || []) as ItemOrcamento[]);
      setFotos(
        (fotosData || []) as { id: string; url: string; legenda: string }[],
      );
      if (configData) setConfig(configData as Config);
      setLoading(false);
    }
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: BRAND.navy }}
      >
        <p style={{ color: BRAND.yellow, fontFamily: "sans-serif" }}>
          Carregando orçamento...
        </p>
      </div>
    );
  }
  if (!orc) return null;

  const statusColor = STATUS_COLOR[orc.status] || BRAND.gray500;

  return (
    <>
      {/* ── Barra de ações (não imprime) ──────────────────────────────────── */}
      <div
        className="print:hidden sticky top-0 z-10 flex items-center gap-4 px-6 py-3"
        style={{
          background: BRAND.navy,
          borderBottom: `2px solid ${BRAND.yellow}`,
        }}
      >
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: BRAND.gray300, fontFamily: "sans-serif" }}
        >
          <ArrowLeft size={15} /> Voltar
        </button>
        <span style={{ color: BRAND.gray500 }}>|</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm px-4 py-1.5 rounded transition-colors"
          style={{
            background: BRAND.yellow,
            color: BRAND.navy,
            fontFamily: "sans-serif",
            fontWeight: 700,
          }}
        >
          <Printer size={15} /> Imprimir / Salvar como PDF
        </button>
        <span
          style={{
            color: BRAND.gray500,
            fontSize: 12,
            fontFamily: "sans-serif",
          }}
        >
          No diálogo de impressão, escolha "Salvar como PDF".
        </span>
      </div>

      {/* ── DOCUMENTO ─────────────────────────────────────────────────────── */}
      <div
        id="doc"
        style={{
          background: BRAND.white,
          maxWidth: 820,
          margin: "0 auto",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          color: BRAND.gray900,
          minHeight: "100vh",
        }}
      >
        {/* ══ CABEÇALHO com identidade da marca ══════════════════════════════ */}
        <div
          style={{
            background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 100%)`,
            padding: "28px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo + info empresa */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img
              src="/logo.png"
              alt="Eletro Link"
              style={{ height: 72, width: "auto", objectFit: "contain" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: BRAND.yellow,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Eletrolink Manutenções
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.8,
                }}
              >
                {config.endereco && <div>{config.endereco}</div>}
                {config.telefone && <div>Tel: {config.telefone}</div>}
                {config.email && <div>{config.email}</div>}
                {config.horario && <div>{config.horario}</div>}
              </div>
            </div>
          </div>

          {/* Número e datas do orçamento */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: BRAND.yellow,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Orçamento
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: BRAND.white,
                lineHeight: 1,
              }}
            >
              #{formatNumero(orc.numero)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
                marginTop: 8,
                lineHeight: 1.9,
              }}
            >
              <div>
                Emissão:{" "}
                <strong style={{ color: BRAND.white }}>
                  {formatDate(orc.data_emissao)}
                </strong>
              </div>
              {orc.data_validade && (
                <div>
                  Validade:{" "}
                  <strong style={{ color: BRAND.white }}>
                    {formatDate(orc.data_validade)}
                  </strong>
                </div>
              )}
            </div>
            <div style={{ marginTop: 10 }}>
              <span
                style={{
                  background: statusColor,
                  color: BRAND.white,
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {STATUS_LABEL[orc.status] || orc.status}
              </span>
            </div>
          </div>
        </div>

        {/* Faixa amarela decorativa */}
        <div
          style={{
            height: 4,
            background: `linear-gradient(90deg, ${BRAND.yellow}, ${BRAND.yellowDark})`,
          }}
        />

        {/* ── Conteúdo ──────────────────────────────────────────────────────── */}
        <div style={{ padding: "32px 40px" }}>
          {/* DADOS DO CLIENTE */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <InfoBox>
              <SectionLabel>Cliente / Tomador</SectionLabel>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: BRAND.gray900,
                  marginBottom: 4,
                }}
              >
                {orc.cliente_nome}
              </div>
              {orc.cliente_cpf_cnpj && (
                <div style={{ fontSize: 12, color: BRAND.gray700 }}>
                  CPF/CNPJ: {orc.cliente_cpf_cnpj}
                </div>
              )}
              {orc.cliente_telefone && (
                <div style={{ fontSize: 12, color: BRAND.gray700 }}>
                  Tel: {orc.cliente_telefone}
                </div>
              )}
              {orc.cliente_email && (
                <div style={{ fontSize: 12, color: BRAND.gray700 }}>
                  {orc.cliente_email}
                </div>
              )}
            </InfoBox>

            <InfoBox>
              <SectionLabel>Endereço / Local do Serviço</SectionLabel>
              {orc.local_servico || orc.cliente_endereco ? (
                <>
                  <div
                    style={{
                      fontSize: 12,
                      color: BRAND.gray700,
                      marginBottom: 2,
                    }}
                  >
                    {orc.local_servico || orc.cliente_endereco}
                  </div>
                  {orc.cliente_cidade && (
                    <div style={{ fontSize: 12, color: BRAND.gray700 }}>
                      {orc.cliente_cidade}
                      {orc.cliente_estado ? ` - ${orc.cliente_estado}` : ""}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 12, color: BRAND.gray500 }}>
                  Não informado
                </div>
              )}
            </InfoBox>
          </div>

          {/* TIPO E DESCRIÇÃO DO SERVIÇO */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>Tipo de Serviço</SectionLabel>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: BRAND.blue,
                marginBottom: 6,
              }}
            >
              {orc.tipo_servico}
            </div>
            {orc.descricao_servico && (
              <div
                style={{
                  fontSize: 12,
                  color: BRAND.gray700,
                  lineHeight: 1.6,
                  background: BRAND.gray50,
                  border: `1px solid ${BRAND.gray100}`,
                  borderRadius: 4,
                  padding: "10px 14px",
                }}
              >
                {orc.descricao_servico}
              </div>
            )}
          </div>

          {/* ITENS */}
          {itens.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>Itens / Serviços</SectionLabel>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ background: BRAND.navy, color: BRAND.white }}>
                    <th
                      style={{
                        padding: "9px 12px",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      Descrição
                    </th>
                    <th
                      style={{
                        padding: "9px 12px",
                        textAlign: "center",
                        fontWeight: 600,
                        width: 60,
                      }}
                    >
                      Qtd
                    </th>
                    <th
                      style={{
                        padding: "9px 12px",
                        textAlign: "center",
                        fontWeight: 600,
                        width: 50,
                      }}
                    >
                      Un.
                    </th>
                    <th
                      style={{
                        padding: "9px 12px",
                        textAlign: "right",
                        fontWeight: 600,
                        width: 110,
                      }}
                    >
                      Valor Unit.
                    </th>
                    <th
                      style={{
                        padding: "9px 12px",
                        textAlign: "right",
                        fontWeight: 600,
                        width: 110,
                        borderLeft: `2px solid ${BRAND.yellow}`,
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{
                        background: idx % 2 === 0 ? BRAND.white : BRAND.gray50,
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          borderBottom: `1px solid ${BRAND.gray100}`,
                          color: BRAND.gray900,
                        }}
                      >
                        {item.descricao}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          borderBottom: `1px solid ${BRAND.gray100}`,
                          textAlign: "center",
                          color: BRAND.gray700,
                        }}
                      >
                        {Number(item.quantidade) % 1 === 0
                          ? Number(item.quantidade)
                          : Number(item.quantidade).toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          borderBottom: `1px solid ${BRAND.gray100}`,
                          textAlign: "center",
                          color: BRAND.gray700,
                        }}
                      >
                        {item.unidade}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          borderBottom: `1px solid ${BRAND.gray100}`,
                          textAlign: "right",
                          color: BRAND.gray700,
                        }}
                      >
                        {formatBRL(item.valor_unitario)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          borderBottom: `1px solid ${BRAND.gray100}`,
                          textAlign: "right",
                          fontWeight: 700,
                          color: BRAND.navy,
                          borderLeft: `2px solid ${BRAND.yellow}`,
                        }}
                      >
                        {formatBRL(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TOTAIS */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 28,
            }}
          >
            <div style={{ width: 280 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: `1px solid ${BRAND.gray100}`,
                  fontSize: 13,
                }}
              >
                <span style={{ color: BRAND.gray500 }}>Subtotal</span>
                <span style={{ color: BRAND.gray900 }}>
                  {formatBRL(orc.subtotal)}
                </span>
              </div>
              {orc.desconto > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: `1px solid ${BRAND.gray100}`,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: BRAND.gray500 }}>Desconto</span>
                  <span style={{ color: "#dc2626" }}>
                    - {formatBRL(orc.desconto)}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 4,
                  padding: "10px 14px",
                  background: BRAND.navy,
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: BRAND.yellow,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Total
                </span>
                <span
                  style={{ fontSize: 20, fontWeight: 900, color: BRAND.white }}
                >
                  {formatBRL(orc.total)}
                </span>
              </div>
            </div>
          </div>

          {/* CONDIÇÕES / PRAZO */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: orc.prazo_execucao ? "1fr 1fr" : "1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <InfoBox>
              <SectionLabel>Condições de Pagamento</SectionLabel>
              <div
                style={{ fontSize: 13, color: BRAND.gray900, fontWeight: 600 }}
              >
                {orc.condicoes_pagamento}
              </div>
            </InfoBox>
            {orc.prazo_execucao && (
              <InfoBox>
                <SectionLabel>Prazo de Execução</SectionLabel>
                <div
                  style={{
                    fontSize: 13,
                    color: BRAND.gray900,
                    fontWeight: 600,
                  }}
                >
                  {orc.prazo_execucao}
                </div>
              </InfoBox>
            )}
          </div>

          {/* OBSERVAÇÕES */}
          {orc.observacoes && (
            <div
              style={{
                marginBottom: 28,
                padding: "12px 16px",
                borderRadius: 6,
                background: "#fefce8",
                border: `1px solid ${BRAND.yellow}`,
                borderLeft: `4px solid ${BRAND.yellow}`,
              }}
            >
              <SectionLabel>Observações</SectionLabel>
              <div
                style={{
                  fontSize: 12,
                  color: BRAND.gray700,
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                }}
              >
                {orc.observacoes}
              </div>
            </div>
          )}

          {/* FOTOS */}
          {fotos.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionLabel>Registro Fotográfico</SectionLabel>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    style={{
                      borderRadius: 6,
                      overflow: "hidden",
                      border: `1px solid ${BRAND.gray100}`,
                    }}
                  >
                    <img
                      src={foto.url}
                      alt={foto.legenda || "Foto do serviço"}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {foto.legenda && (
                      <div
                        style={{
                          padding: "4px 8px",
                          fontSize: 10,
                          color: BRAND.gray500,
                          background: BRAND.gray50,
                        }}
                      >
                        {foto.legenda}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSINATURAS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
              marginTop: 56,
              marginBottom: 16,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{ borderTop: `2px solid ${BRAND.navy}`, paddingTop: 10 }}
              >
                <div
                  style={{ fontSize: 12, fontWeight: 700, color: BRAND.navy }}
                >
                  {config.nome_empresa}
                </div>
                <div
                  style={{ fontSize: 10, color: BRAND.gray500, marginTop: 2 }}
                >
                  Responsável Técnico
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ borderTop: `2px solid ${BRAND.navy}`, paddingTop: 10 }}
              >
                <div
                  style={{ fontSize: 12, fontWeight: 700, color: BRAND.navy }}
                >
                  {orc.cliente_nome}
                </div>
                <div
                  style={{ fontSize: 10, color: BRAND.gray500, marginTop: 2 }}
                >
                  Cliente / Contratante
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RODAPÉ com identidade da marca ════════════════════════════════ */}
        <div
          style={{
            background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.blue} 100%)`,
            padding: "14px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            {config.nome_empresa} · {config.telefone} · {config.email}
          </div>
          <div style={{ fontSize: 10, color: BRAND.yellow, fontWeight: 700 }}>
            Orçamento #{formatNumero(orc.numero)}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          #doc { max-width: 100% !important; }
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      `}</style>
    </>
  );
}

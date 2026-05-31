import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Sparkles, Table, Calendar, DollarSign, Award, ThumbsUp, Printer, Check, Info } from 'lucide-react';
import { UserProfile, Appointment } from '../types';

interface ReportHubProps {
  userProfile: UserProfile;
}

export default function ReportHub({ userProfile }: ReportHubProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Retrieve appointments from localStorage
  const appointments: Appointment[] = useMemo(() => {
    const saved = localStorage.getItem('next_lady_appointments');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Retrieve purchases from localStorage
  const purchases = useMemo(() => {
    const saved = localStorage.getItem('next_lady_purchases');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Calculate report metrics
  const totalSpent = useMemo(() => {
    return purchases.reduce((acc: number, purchase: any) => acc + (purchase.total || 0), 0);
  }, [purchases]);

  const totalServicesSpent = useMemo(() => {
    return appointments
      .filter(a => a.status === 'CONCLUÍDO' || a.status === 'CONFIRMADO')
      .length * 150; // Average cost estimated
  }, [appointments]);

  // Handle Download HTML/PDF report simulation
  const handleDownloadReport = () => {
    const reportHtmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Ata de Atividades - Next Lady</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 40px;
      background-color: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #eae1e3;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .logo-symbol {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #d4af37, #b88c97);
      border-radius: 8px;
    }
    .logo-title {
      font-size: 24px;
      font-weight: bold;
      color: #1a0f12;
      letter-spacing: 1px;
    }
    .logo-subtitle {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #b88c97;
    }
    .user-info {
      margin-bottom: 30px;
      background-color: #faf6f7;
      border: 1px solid #f0e6e8;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 15px;
    }
    .user-info div {
      min-width: 150px;
    }
    .user-info strong {
      color: #1a0f12;
    }
    h2 {
      font-size: 16px;
      text-transform: uppercase;
      color: #55333f;
      border-left: 4px solid #b88c97;
      padding-left: 10px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    th, td {
      border: 1px solid #eae1e3;
      padding: 10px 12px;
      text-align: left;
      font-size: 13px;
    }
    th {
      background-color: #f7f3f4;
      font-weight: bold;
      color: #1a0f12;
    }
    .total-row {
      font-weight: bold;
      background-color: #faf6f7;
    }
    .footer {
      margin-top: 60px;
      text-align: center;
      font-size: 11px;
      color: #999;
      border-top: 1px solid #eae1e3;
      padding-top: 20px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: bold;
      border-radius: 10px;
      text-transform: uppercase;
    }
    .badge-confirm { background-color: #e6f7ed; color: #1f8a4d; }
    .badge-pending { background-color: #fef3c7; color: #d97706; }
    .badge-purple { background-color: #f3e8ff; color: #7e22ce; }
  </style>
</head>
<body>

  <div class="header">
    <div class="logo-container">
      <div class="logo-symbol"></div>
      <div>
        <div class="logo-title">Next Lady</div>
        <div class="logo-subtitle">Aesthetics & Wellness Protocol</div>
      </div>
    </div>
    <p style="font-size: 12px; color: #666; margin-top: 5px;">Relatório de Atividades e Transações do Usuário — Documento Oficial</p>
  </div>

  <div class="user-info">
    <div>
      <span style="font-size: 11px; color: #888; display: block;">LADY CLIENTE</span>
      <strong>${userProfile.name}</strong> (${userProfile.age} anos)
    </div>
    <div>
      <span style="font-size: 11px; color: #888; display: block;">LOYALTY POINTS</span>
      <strong style="color: #c9963e;">${userProfile.points} pontos acumulados</strong>
    </div>
    <div>
      <span style="font-size: 11px; color: #888; display: block;">DATA DE EMISSÃO</span>
      <strong>${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
    </div>
  </div>

  <h2>1. Histórico de Cuidados & Procedimentos</h2>
  ${
    appointments.length === 0
      ? '<p style="font-size: 12px; color: #777;">Nenhum agendamento registrado até o momento.</p>'
      : `
      <table>
        <thead>
          <tr>
            <th>ID Serviço</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Pontos Creditados</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${appointments
            .map(
              app => `
            <tr>
              <td style="font-family: monospace;">${app.serviceId}</td>
              <td>${new Date(app.date).toLocaleDateString('pt-BR')}</td>
              <td>${app.time}</td>
              <td>+${app.pointsGranted} pts</td>
              <td><span class="badge ${app.status === 'CONFIRMADO' ? 'badge-confirm' : 'badge-pending'}">${app.status}</span></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
  }

  <h2>2. Compras Realizadas (E-commerce)</h2>
  ${
    purchases.length === 0
      ? '<p style="font-size: 12px; color: #777;">Nenhuma transação comercial efetuada.</p>'
      : `
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Data da Transação</th>
            <th>Itens</th>
            <th>Pontos Ganhos</th>
            <th>Total Solicitado</th>
          </tr>
        </thead>
        <tbody>
          ${purchases
            .map(
              (p: any) => `
            <tr>
              <td style="font-family: monospace; font-weight: bold;">${p.orderId}</td>
              <td>${p.date}</td>
              <td style="font-size: 12px;">${p.items.map((i: any) => `${i.name} (x${i.qty})`).join(', ')}</td>
              <td style="color:#b45309; font-weight: bold;">+${p.pointsEarned} pts</td>
              <td style="font-weight: bold; font-family: monospace;">R$ ${p.total.toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
  }

  <h2>3. Encontros, Workshops & Eventos</h2>
  <p style="font-size: 12px; color: #555;">
    Estatística de Engajamento em Cursos Next Lady: 
    <strong>${userProfile.rsvpEvents?.length || 0} workshops agendados / com check-in realizado</strong>.
  </p>

  <div class="footer">
    <p>© 2026 Next Lady S/A. Documentação gerada em canal privado criptografado.</p>
    <p>Tecnologia em Inteligência de Beleza e Visagismo Integrativo Feminino.</p>
  </div>

</body>
</html>
    `;

    // Trigger download of this HTML report blob cleanly
    const blob = new Blob([reportHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Atividades_NextLady_${userProfile.name.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4500);
  };

  return (
    <div className="space-y-8" id="report-hub-root">
      
      {/* Report Info Banner */}
      <div className="bg-white border border-rose-100/55 rounded-3xl p-6.5 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-[#3d232e] shrink-0">
          <FileText className="w-7 h-7" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="font-display font-semibold text-gray-800 text-sm md:text-base">Geração de Ata Consolidada Lady</h3>
          <p className="text-xs text-gray-500 font-sans leading-relaxed font-light">
            Monitore suas transações, acúmulos de pontos e agendamentos. Nosso motor compila uma planilha oficial de atividades e emite um documento pronto para impressão ou arquivamento em PDF.
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="bg-[#29171e] hover:bg-[#150c0f] text-amber-200 font-sans text-xs font-bold px-6 py-3.5 rounded-2xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-98 select-none shrink-0"
        >
          <Download className="w-4 h-4" />
          Baixar Relatório PDF
        </button>
      </div>

      {/* Confirmation State alert */}
      {downloadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3.5"
        >
          <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-sans font-bold text-emerald-800">Relatório exportado com sucesso!</p>
            <p className="text-emerald-700 font-sans font-light">
              O arquivo HTML formatado foi baixado em seu aparelho. Ao abri-lo, você pode teclar <strong>Ctrl+P (ou Cmd+P)</strong> e selecionar "Salvar como PDF" para arquivá-lo como vetor oficial!
            </p>
          </div>
        </motion.div>
      )}

      {/* Visual Report Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1 */}
        <div className="bg-white border border-rose-50 p-6.5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-sans bg-rose-50 px-2.5 py-0.5 rounded-full">Financeiro Estimado</span>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <span className="text-2xl font-mono font-bold text-gray-800 block">
              R$ {(totalSpent + totalServicesSpent).toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-500 font-sans block pt-0.5">Movido em comércios e autocuidado</span>
          </div>

          <div className="text-[10px] text-stone-500 font-sans space-y-1 pt-3.5 border-t border-stone-50">
            <div className="flex justify-between">
              <span>Compras na Loja</span>
              <strong className="font-mono">R$ {totalSpent.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Serviços / Manutenção</span>
              <strong className="font-mono">R$ {totalServicesSpent.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white border border-rose-50 p-6.5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-sans bg-rose-50 px-2.5 py-0.5 rounded-full">Fidelidade Extrato</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-mono font-bold text-gray-800 block">
              {userProfile.points} pts
            </span>
            <span className="text-[10px] text-gray-500 font-sans block pt-0.5">Disponíveis no saldo de prêmios</span>
          </div>

          <div className="text-[10px] text-stone-500 font-sans space-y-1 pt-3.5 border-t border-stone-50">
            <div className="flex justify-between">
              <span>Brindes resgatados</span>
              <strong className="font-semibold">{userProfile.redeemedRewards?.length || 0} prêmios</strong>
            </div>
            <div className="flex justify-between">
              <span>Próximo nível sugerido</span>
              <strong className="font-sans text-rose-500 font-medium">500 pts VIP</strong>
            </div>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white border border-rose-50 p-6.5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-sans bg-rose-50 px-2.5 py-0.5 rounded-full">Engajamento Social</span>
            <ThumbsUp className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <span className="text-2xl font-mono font-bold text-gray-800 block">
              {userProfile.rsvpEvents?.length || 0} check-ins
            </span>
            <span className="text-[10px] text-gray-500 font-sans block pt-0.5">Em painéis e cursos mentorados</span>
          </div>

          <div className="text-[10px] text-stone-500 font-sans space-y-1 pt-3.5 border-t border-stone-50">
            <div className="flex justify-between">
              <span>Total de Agendamentos</span>
              <strong className="font-semibold">{appointments.length} horas marcadas</strong>
            </div>
            <div className="flex justify-between">
              <span>Fórum Comentários</span>
              <strong className="font-semibold">Ativo em comunidade</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Activity Live Overview logs in layout */}
      <div className="bg-white border border-rose-50 rounded-3xl p-6.5 space-y-4 shadow-sm">
        <h4 className="font-display font-semibold text-stone-850 text-xs uppercase tracking-wide">Amostra de Atividades Ativas</h4>

        {/* Dynamic preview log of purchases */}
        {purchases.length === 0 && appointments.length === 0 ? (
          <div className="text-center py-6 text-stone-500 text-xs font-sans font-light flex items-center justify-center gap-1.5">
            <Info className="w-4 h-4 text-stone-400" /> Nenhum registro efetuado em sua sessão local até agora. Reserve tratamentos e verifique o painel!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 font-sans border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Referência</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Ganho Fidelidade</th>
                  <th className="py-2.5 px-3 text-right">Estatísticas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-rose-50/10">
                    <td className="py-2.5 px-3 font-semibold text-[#b88c97]">💇‍♀️ Serviços</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-mono">{a.serviceId}</td>
                    <td className="py-2.5 px-3">{new Date(a.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">+{a.pointsGranted} pts</td>
                    <td className="py-2.5 px-3 text-right text-stone-500 font-mono italic">{a.status}</td>
                  </tr>
                ))}
                {purchases.map((p: any) => (
                  <tr key={p.orderId} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-semibold text-rose-500">🛍️ Loja Online</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-800">{p.orderId}</td>
                    <td className="py-2.5 px-3">{p.date}</td>
                    <td className="py-2.5 px-3 text-orange-600 font-bold">+{p.pointsEarned} pts</td>
                    <td className="py-2.5 px-3 text-right text-stone-800 font-bold">R$ {p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

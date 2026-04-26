import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [faqOpen, setFaqOpen] = useState(null);
  const [contato, setContato] = useState({ nome: '', email: '', telefone: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isExtraSmall, setIsExtraSmall] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsExtraSmall(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (user) {
    navigate('/app/dashboard');
    return null;
  }

  return (
    <div style={{ background: 'var(--dark)', color: 'var(--text)' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(230, 57, 70, 0.3); }
          50% { box-shadow: 0 0 30px rgba(230, 57, 70, 0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes rotateIn {
          from { opacity: 0; transform: rotate(-10deg) scale(0.9); }
          to { opacity: 1; transform: rotate(0) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slide-left { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-slide-right { animation: slideInRight 0.8s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 3s linear infinite; }
        .animate-bounce { animation: bounce 2s ease-in-out infinite; }
        .animate-rotate-in { animation: rotateIn 0.7s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }

        /* Scroll smooth anchor */
        html { scroll-behavior: smooth; }

        /* Cards com hover criativo */
        .card-hover {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
          position: relative;
        }
        .card-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent 30%, rgba(230, 57, 70, 0.1) 50%, transparent 70%);
          opacity: 0;
          transition: all 0.5s;
        }
        .card-hover:hover::before {
          opacity: 1;
          animation: shimmer 0.6s;
        }

        /* Responsiveness */
        @media (max-width: 768px) {
          /* Grid responsiveness */
          .benefits-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .features-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 20px !important; text-align: center !important; }

          /* Header */
          header { padding: 12px 16px !important; }
          header nav { display: none !important; }
          header div:first-child { font-size: 1.2rem !important; }
          header button { padding: 6px 12px !important; font-size: 0.8rem !important; }

          /* Hero section */
          #inicio { padding: 60px 16px !important; min-height: 450px !important; }
          #inicio h1 { font-size: 2rem !important; line-height: 1.3 !important; margin-bottom: 16px !important; }
          #inicio > div > p { font-size: 1rem !important; margin-bottom: 30px !important; }

          /* Contact */
          #contato { padding: 60px 16px !important; }
          #contato h2 { font-size: 1.8rem !important; }

          /* Footer */
          footer { padding: 40px 16px 30px !important; }
          .footer-grid a { display: block; margin: 8px 0; }
        }

        @media (max-width: 480px) {
          /* Extra small devices */
          header { padding: 10px 12px !important; }
          header div:first-child { font-size: 1rem !important; }
          header button { padding: 6px 10px !important; font-size: 0.75rem !important; }

          /* Hero */
          #inicio { padding: 40px 12px !important; min-height: 350px !important; }
          #inicio h1 { font-size: 1.5rem !important; margin-bottom: 12px !important; }
          #inicio > div > p { font-size: 0.9rem !important; margin-bottom: 20px !important; }
          #inicio button { padding: 10px 20px !important; font-size: 0.85rem !important; }
        }
      `}</style>

      {/* HEADER FIXO */}
      <header style={{
        background: 'var(--dark2)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          Motor<span style={{ color: 'var(--red)' }}>Hub</span>
        </div>

        <nav style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <a href="#inicio" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color .2s' }}
             onMouseEnter={e => e.target.style.color = 'var(--red)'}
             onMouseLeave={e => e.target.style.color = 'var(--text)'}>
            Início
          </a>
          <a href="#planos" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color .2s' }}
             onMouseEnter={e => e.target.style.color = 'var(--red)'}
             onMouseLeave={e => e.target.style.color = 'var(--text)'}>
            Planos
          </a>
          <a href="#faq" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color .2s' }}
             onMouseEnter={e => e.target.style.color = 'var(--red)'}
             onMouseLeave={e => e.target.style.color = 'var(--text)'}>
            FAQ
          </a>
          <a href="#contato" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color .2s' }}
             onMouseEnter={e => e.target.style.color = 'var(--red)'}
             onMouseLeave={e => e.target.style.color = 'var(--text)'}>
            Contato
          </a>
        </nav>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', color: 'var(--red)', border: '2px solid var(--red)', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all .2s' }}
            onMouseEnter={e => { e.target.style.background = 'var(--red)'; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--red)'; }}>
            Entrar
          </button>
          <button onClick={() => navigate('/register')}
            style={{ background: 'var(--red)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all .2s' }}
            onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.target.style.filter = 'brightness(1)'}>
            Teste Grátis
          </button>
        </div>
      </header>

      {/* HERO */}
      <section id="inicio" style={{
        padding: isMobile ? (isExtraSmall ? '40px 12px' : '60px 16px') : '100px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--dark) 0%, var(--dark2) 100%)',
        minHeight: isMobile ? (isExtraSmall ? '350px' : '450px') : '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: 900, animation: 'fadeInUp 0.8s ease-out' }}>
          <h1 style={{
            fontSize: isExtraSmall ? '1.5rem' : isMobile ? '2rem' : '4rem',
            fontWeight: 800,
            marginBottom: isExtraSmall ? 12 : isMobile ? 16 : 20,
            lineHeight: 1.2
          }}>
            Facilite a rotina do seu negócio
          </h1>
          <p style={{
            fontSize: isExtraSmall ? '0.9rem' : isMobile ? '1rem' : '1.3rem',
            color: 'var(--muted)',
            marginBottom: isExtraSmall ? 20 : isMobile ? 30 : 40
          }}>
            Sistema para Gestão de Oficinas Mecânicas - Controle total em um só lugar
          </p>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 12 : 16,
            justifyContent: 'center',
            marginBottom: isExtraSmall ? 20 : isMobile ? 30 : 60
          }}>
            <button onClick={() => navigate('/register')}
              style={{ background: 'var(--red)', color: 'white', border: 'none', padding: isExtraSmall ? '10px 20px' : isMobile ? '12px 24px' : '16px 40px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: isExtraSmall ? '0.85rem' : isMobile ? '0.9rem' : '1rem', transition: 'all .3s', animation: 'bounce 2s infinite' }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-5px) scale(1.05)'; e.target.style.boxShadow = '0 15px 40px rgba(230, 57, 70, 0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = 'none'; }}>
              Teste Grátis por 30 Dias
            </button>
            <button onClick={() => document.getElementById('contato').scrollIntoView()}
              style={{ background: 'transparent', color: 'var(--red)', border: '2px solid var(--red)', padding: isExtraSmall ? '10px 20px' : isMobile ? '12px 24px' : '14px 38px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: isExtraSmall ? '0.85rem' : isMobile ? '0.9rem' : '1rem', transition: 'all .3s' }}
              onMouseEnter={e => { e.target.style.background = 'var(--red)'; e.target.style.color = 'white'; e.target.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--red)'; e.target.style.transform = 'scale(1)'; }}>
              Pedir Demonstração
            </button>
          </div>

          <div style={{
            display: isMobile ? 'flex' : 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'center',
            gap: isMobile ? 12 : 30,
            fontSize: isExtraSmall ? '0.75rem' : isMobile ? '0.8rem' : '0.9rem',
            color: 'var(--muted)'
          }}>
            <span>✓ Teste gratuito - sem cartão de crédito</span>
            <span>✓ Setup em minutos</span>
            <span>✓ Suporte 24/7</span>
          </div>
        </div>
      </section>

{/* BENEFÍCIOS */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 24px', background: 'var(--dark)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: isMobile ? 40 : 60 }}>
            Por que escolher MotorHub?
          </h2>

          <div className="benefits-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24 }}>
            {[
              { icon: '🌐', titulo: 'Acesso Onde Quiser', descricao: 'Desktop, tablet ou smartphone - mesma experiência' },
              { icon: '❌', titulo: 'Sem Multa', descricao: 'Cancele quando quiser, sem penalidades' },
              { icon: '🎧', titulo: 'Suporte Fácil', descricao: 'Equipe dedicada pronta para ajudar' }
            ].map((benefit, i) => (
              <div key={i} style={{
                background: 'var(--dark2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 32,
                textAlign: 'center',
                animation: `rotateIn 0.7s ease-out ${i * 0.15}s both`,
                transition: 'all .3s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--red)';
                e.currentTarget.style.transform = 'translateY(-12px) rotateZ(2deg)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(230, 57, 70, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0) rotateZ(0deg)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>{benefit.icon}</div>
                <h3 style={{ color: 'var(--white)', fontWeight: 700, marginBottom: 12 }}>
                  {benefit.titulo}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                  {benefit.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES TEMÁTICAS */}
      <section style={{ padding: isMobile ? '60px 16px' : '80px 24px', background: 'var(--dark2)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Ordens de Serviço */}
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 60, alignItems: 'center', marginBottom: isMobile ? 60 : 100 }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>
                📋 Ordens de Serviço Simplificadas
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: 24, lineHeight: 1.6 }}>
                Crie e gerencie ordens em segundos. Acompanhe cada detalhe do serviço em tempo real.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Criar rapidamente', 'Status em tempo real', 'Histórico completo'].map((item, i) => (
                  <li key={i} style={{ padding: '12px 0', display: 'flex', gap: 12, color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'var(--dark)', borderRadius: 12, padding: 40, textAlign: 'center', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '4rem', opacity: 0.5 }}>📋</div>
            </div>
          </div>

          {/* Gestão Financeira */}
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 60, alignItems: 'center', marginBottom: isMobile ? 60 : 100 }}>
            <div style={{ background: 'var(--dark)', borderRadius: 12, padding: 40, textAlign: 'center', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '4rem', opacity: 0.5 }}>💰</div>
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>
                💰 Gestão Financeira Completa
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: 24, lineHeight: 1.6 }}>
                Controle entradas, saídas, contas a receber e a pagar. NF-e e faturamento automático.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['NF-e eletrônica', 'Fluxo de caixa', 'Relatórios financeiros'].map((item, i) => (
                  <li key={i} style={{ padding: '12px 0', display: 'flex', gap: 12, color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Operacional */}
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 60, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>
                🔧 Controle Operacional
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: 24, lineHeight: 1.6 }}>
                Estoque, manutenção preventiva, alertas automáticos e integração com WhatsApp.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Gestão de estoque', 'Manutenção preventiva', 'Avisos no WhatsApp'].map((item, i) => (
                  <li key={i} style={{ padding: '12px 0', display: 'flex', gap: 12, color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'var(--dark)', borderRadius: 12, padding: 40, textAlign: 'center', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '4rem', opacity: 0.5 }}>🔧</div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" style={{
        padding: isMobile ? '60px 16px' : '80px 24px',
        background: 'var(--dark)',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: isMobile ? 40 : 60 }}>
            Planos que Crescem com Você
          </h2>

          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 20 : 40, maxWidth: 900, margin: '0 auto' }}>
            {[
              {
                nome: 'Acelera',
                preco: 'R$ 250',
                descricao: 'Por mês',
                features: ['Até 2 usuários', 'Dashboard completo', 'Ordens e clientes', 'Estoque básico', 'Relatórios simples', 'Suporte por email'],
                cta: 'Começar Agora',
                destaque: false
              },
              {
                nome: 'Turbo',
                preco: 'R$ 479,99',
                descricao: 'Por mês',
                features: ['Até 8 usuários', 'Tudo do Acelera', 'Manutenções preventivas', 'Relatórios avançados', 'Integrações (WhatsApp, etc)', 'NF-e eletrônica', 'Suporte prioritário', 'Backups automáticos'],
                cta: 'Começar Agora',
                destaque: true
              }
            ].map((plano, i) => (
              <div key={i} style={{
                background: 'var(--dark2)',
                border: plano.destaque ? '2px solid var(--red)' : '1px solid var(--border)',
                borderRadius: 16,
                padding: 48,
                position: 'relative',
                transform: plano.destaque ? 'scale(1.05)' : 'scale(1)',
                transition: 'all .3s'
              }}
              onMouseEnter={e => {
                if (!plano.destaque) {
                  e.currentTarget.style.borderColor = 'var(--red)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={e => {
                if (!plano.destaque) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}>
                {plano.destaque && (
                  <div style={{
                    position: 'absolute',
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--red)',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: 24,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    boxShadow: '0 10px 30px rgba(230, 57, 70, 0.3)'
                  }}>
                    MAIS POPULAR ⭐
                  </div>
                )}

                <h3 style={{ color: 'var(--white)', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>
                  {plano.nome}
                </h3>

                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--red)' }}>
                    {plano.preco}
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.95rem', marginLeft: 8 }}>
                    {plano.descricao}
                  </span>
                </div>

                <div style={{ background: 'rgba(230, 57, 70, 0.1)', border: '1px solid rgba(230, 57, 70, 0.3)', color: 'var(--red)', padding: 12, borderRadius: 8, marginBottom: 32, fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
                  Teste grátis por 30 dias - sem cartão de crédito
                </div>

                <button
                  onClick={() => navigate('/register')}
                  style={{
                    width: '100%',
                    background: plano.destaque ? 'var(--red)' : 'transparent',
                    color: plano.destaque ? 'white' : 'var(--red)',
                    border: plano.destaque ? 'none' : '2px solid var(--red)',
                    padding: '14px 24px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginBottom: 32,
                    transition: 'all .3s'
                  }}
                  onMouseEnter={e => {
                    if (plano.destaque) {
                      e.target.style.background = '#c91c22';
                      e.target.style.transform = 'translateY(-3px)';
                    } else {
                      e.target.style.background = 'var(--red)';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-3px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (plano.destaque) {
                      e.target.style.background = 'var(--red)';
                      e.target.style.transform = 'translateY(0)';
                    } else {
                      e.target.style.background = 'transparent';
                      e.target.style.color = 'var(--red)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {plano.cta}
                </button>

                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {plano.features.map((feature, j) => (
                    <li key={j} style={{
                      padding: '12px 0',
                      borderBottom: j < plano.features.length - 1 ? '1px solid var(--border)' : 'none',
                      color: 'var(--muted)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}>
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{
        padding: '80px 24px',
        background: 'var(--dark2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: 60 }}>
            Perguntas Frequentes
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { pergunta: 'Posso testar gratuitamente?', resposta: 'Sim! Todos os planos incluem 30 dias de teste grátis. Sem cartão de crédito necessário. Se cancelar antes de 30 dias, não cobra nada.' },
              { pergunta: 'Como funciona a troca de plano?', resposta: 'Você pode trocar de plano a qualquer momento. A cobrança é ajustada proporcionalmente no próximo ciclo.' },
              { pergunta: 'Posso cancelar a qualquer momento?', resposta: 'Sim, sem multas ou penalidades. Basta acessar as configurações e cancelar quando quiser.' },
              { pergunta: 'Os meus dados ficam seguros?', resposta: 'Utilizamos encriptação de dados, backups automáticos e conformidade com LGPD. Seus dados estão 100% seguros.' },
              { pergunta: 'Vocês oferecem suporte?', resposta: 'Sim! Oferecemos suporte 24/7 por email, WhatsApp e telefone. Os planos Turbo têm prioridade.' },
              { pergunta: 'Qual a melhor forma de começar?', resposta: 'Clique em "Teste Grátis" e crie sua conta. Você terá acesso completo por 30 dias para explorar todas as funcionalidades.' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--dark)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '20px',
                    textAlign: 'left',
                    color: 'var(--white)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1rem',
                    transition: 'all .2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(230, 57, 70, 0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {item.pergunta}
                  <span style={{ color: 'var(--red)', transition: 'transform .3s', transform: faqOpen === i ? 'rotate(180deg)' : 'rotate(0)' }}>
                    ▼
                  </span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: '0 20px 20px 20px', color: 'var(--muted)', lineHeight: 1.6 }}>
                    {item.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" style={{
        padding: isMobile ? '60px 16px' : '80px 24px',
        background: 'var(--dark)',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>
            Pronto para crescer?
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '1.1rem', marginBottom: 50 }}>
            Pedir uma demonstração com nossa equipe ou começar o teste grátis agora mesmo
          </p>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <input
              type="text"
              placeholder="Seu nome"
              value={contato.nome}
              onChange={e => setContato({ ...contato, nome: e.target.value })}
              style={{
                background: 'var(--dark2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                color: 'var(--text)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                transition: 'border-color .2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--red)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <input
              type="email"
              placeholder="Seu email"
              value={contato.email}
              onChange={e => setContato({ ...contato, email: e.target.value })}
              style={{
                background: 'var(--dark2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                color: 'var(--text)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                transition: 'border-color .2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--red)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <input
              type="tel"
              placeholder="Seu telefone"
              value={contato.telefone}
              onChange={e => setContato({ ...contato, telefone: e.target.value })}
              style={{
                background: 'var(--dark2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                color: 'var(--text)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                transition: 'border-color .2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--red)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              type="button"
              onClick={() => alert('Contato enviado! Entraremos em contato em breve.')}
              style={{
                background: 'var(--red)',
                color: 'white',
                border: 'none',
                padding: '14px 24px',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all .3s'
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 10px 30px rgba(230, 57, 70, 0.4)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
            >
              Pedir Demonstração
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: 16 }}>
              Ou comece agora mesmo sem aguardar
            </p>
            <button onClick={() => navigate('/register')}
              style={{
                background: 'transparent',
                color: 'var(--red)',
                border: '2px solid var(--red)',
                padding: '12px 40px',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all .3s'
              }}
              onMouseEnter={e => { e.target.style.background = 'var(--red)'; e.target.style.color = 'white'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--red)'; }}>
              Teste Grátis por 30 Dias
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: isMobile ? '40px 16px 30px' : '60px 24px 40px',
        background: 'var(--dark2)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: '0.9rem'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 40 }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 20 : 40, marginBottom: 40, textAlign: isMobile ? 'center' : 'left' }}>
            <div>
              <h4 style={{ color: 'var(--white)', fontWeight: 700, marginBottom: 12 }}>Produto</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Funcionalidades</a></li>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Preços</a></li>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Segurança</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--white)', fontWeight: 700, marginBottom: 12 }}>Empresa</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Sobre</a></li>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</a></li>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--white)', fontWeight: 700, marginBottom: 12 }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacidade</a></li>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Termos</a></li>
                <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>LGPD</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 30 }}>
          <p style={{ marginBottom: 16 }}>© 2024 MotorHub. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Facebook</a>
            <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Instagram</a>
            <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>LinkedIn</a>
            <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MotorHub — Gestão Inteligente para Oficinas</title>
  <link rel="stylesheet" href="css/style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>

<!-- NAVBAR -->
<header class="navbar">
  <div class="container nav-inner">
    <a href="#" class="logo">Motor<span>Hub</span></a>
    <nav class="nav-links">
      <a href="#funcionalidades">Funcionalidades</a>
      <a href="#planos">Planos</a>
      <a href="#contato">Contato</a>
    </nav>
    <a href="#form" class="btn btn-outline">Começar grátis</a>
    <button class="menu-toggle" id="menuToggle"><i class="fas fa-bars"></i></button>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="#funcionalidades">Funcionalidades</a>
    <a href="#planos">Planos</a>
    <a href="#contato">Contato</a>
    <a href="#form" class="btn btn-primary">Começar grátis</a>
  </div>
</header>

<!-- HERO -->
<section class="hero">
  <div class="container hero-inner">
    <div class="hero-text">
      <span class="badge">🚗 Sistema para oficinas mecânicas</span>
      <h1>Gerencie sua oficina com <span>inteligência e velocidade</span></h1>
      <p>Ordens de serviço, estoque, financeiro, NF-e e muito mais. Tudo em um só lugar, na nuvem, no seu celular.</p>
      <div class="hero-actions">
        <a href="#form" class="btn btn-primary btn-lg">Testar grátis por 7 dias</a>
        <a href="#funcionalidades" class="btn btn-ghost btn-lg">Ver funcionalidades <i class="fas fa-arrow-down"></i></a>
      </div>
      <p class="hero-note"><i class="fas fa-check-circle"></i> Sem cartão de crédito &nbsp;|&nbsp; <i class="fas fa-check-circle"></i> Cancele quando quiser</p>
    </div>
    <div class="hero-img">
      <div class="dashboard-mock">
        <div class="mock-header">
          <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
          <span class="mock-title">MotorHub — Dashboard</span>
        </div>
        <div class="mock-body">
          <div class="mock-stat"><i class="fas fa-file-alt"></i><div><strong>38</strong><small>Ordens abertas</small></div></div>
          <div class="mock-stat"><i class="fas fa-boxes"></i><div><strong>R$ 12.400</strong><small>Estoque</small></div></div>
          <div class="mock-stat green"><i class="fas fa-dollar-sign"></i><div><strong>R$ 8.730</strong><small>Receita do mês</small></div></div>
          <div class="mock-stat"><i class="fas fa-car"></i><div><strong>14</strong><small>Veículos hoje</small></div></div>
          <div class="mock-bar-row">
            <span>Jan</span><div class="bar" style="width:40%"></div>
            <span>Fev</span><div class="bar" style="width:65%"></div>
            <span>Mar</span><div class="bar" style="width:50%"></div>
            <span>Abr</span><div class="bar accent" style="width:80%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- NÚMEROS -->
<section class="stats">
  <div class="container stats-grid">
    <div class="stat-item"><strong>+2.000</strong><span>Oficinas ativas</span></div>
    <div class="stat-item"><strong>+180.000</strong><span>Ordens emitidas</span></div>
    <div class="stat-item"><strong>7 dias</strong><span>Trial gratuito</span></div>
    <div class="stat-item"><strong>99,9%</strong><span>Uptime garantido</span></div>
  </div>
</section>

<!-- FUNCIONALIDADES -->
<section class="features" id="funcionalidades">
  <div class="container">
    <div class="section-header">
      <h2>Tudo que sua oficina precisa</h2>
      <p>Do atendimento ao financeiro, o MotorHub cobre cada etapa da sua operação.</p>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-file-invoice"></i></div>
        <h3>Ordem de Serviço</h3>
        <p>Crie OS em menos de 30 segundos. Histórico completo por veículo e cliente.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-boxes"></i></div>
        <h3>Controle de Estoque</h3>
        <p>Baixa automática de peças ao fechar OS. Alertas de reposição.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
        <h3>Financeiro Completo</h3>
        <p>Contas a receber, a pagar, fluxo de caixa e relatórios em tempo real.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-file-invoice-dollar"></i></div>
        <h3>Emissão de NF-e / NFS-e</h3>
        <p>Emita notas fiscais diretamente pelo sistema, sem sair da tela.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="fab fa-whatsapp"></i></div>
        <h3>WhatsApp Automatizado</h3>
        <p>Avise clientes sobre status da OS, vencimentos e retornos automáticos.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-mobile-alt"></i></div>
        <h3>App Mobile</h3>
        <p>Acesse tudo pelo celular. App exclusivo para a oficina e para o cliente.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-tools"></i></div>
        <h3>Manutenção Preventiva</h3>
        <p>Alertas automáticos para revisões e troca de peças por km ou data.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-cloud-upload-alt"></i></div>
        <h3>Backup Automático</h3>
        <p>Seus dados sempre seguros na nuvem. Acesse de qualquer lugar.</p>
      </div>
    </div>
  </div>
</section>

<!-- PLANOS -->
<section class="pricing" id="planos">
  <div class="container">
    <div class="section-header">
      <h2>Planos e Preços</h2>
      <p>Escolha o plano ideal para o tamanho da sua oficina. 7 dias grátis em qualquer plano.</p>
    </div>
    <div class="pricing-grid">

      <!-- ACELERA -->
      <div class="pricing-card">
        <div class="plan-name">Acelera</div>
        <div class="plan-tagline">Ganhe velocidade no negócio</div>
        <div class="plan-price"><span class="currency">R$</span>287<span class="period">/mês</span></div>
        <a href="#form" class="btn btn-outline btn-block">Começar grátis</a>
        <ul class="plan-features">
          <li><i class="fas fa-check"></i> Controle de caixa</li>
          <li><i class="fas fa-check"></i> Backup automático</li>
          <li><i class="fas fa-check"></i> Controle de estoque</li>
          <li><i class="fas fa-check"></i> Controle de ordem de serviço</li>
          <li><i class="fas fa-check"></i> Controle financeiro</li>
          <li><i class="fas fa-check"></i> Suporte online</li>
          <li><i class="fas fa-check"></i> Envio automático de emails</li>
          <li><i class="fas fa-check"></i> Treinamento online</li>
          <li><i class="fas fa-check"></i> <strong>5 Usuários</strong></li>
          <li><i class="fas fa-check"></i> Venda loja/balcão</li>
          <li><i class="fas fa-check"></i> Motorok (app para oficina e cliente)</li>
          <li><i class="fas fa-check"></i> Relatórios</li>
          <li><i class="fas fa-check"></i> Remanufatura (exclusivo)</li>
          <li><i class="fas fa-check"></i> Emissão de NF-e</li>
          <li><i class="fas fa-check"></i> Emissão de NFS-e</li>
          <li><i class="fas fa-check"></i> Emissão de NFC-e</li>
          <li class="disabled"><i class="fas fa-times"></i> WhatsApp Automatizado</li>
          <li class="disabled"><i class="fas fa-times"></i> Manutenção preventiva</li>
          <li class="disabled"><i class="fas fa-times"></i> Anexo de Imagens/Documentos</li>
        </ul>
      </div>

      <!-- TURBO -->
      <div class="pricing-card featured">
        <div class="plan-badge">Mais popular</div>
        <div class="plan-name">Turbo</div>
        <div class="plan-tagline">Plano pensado para atender seu negócio</div>
        <div class="plan-price"><span class="currency">R$</span>487<span class="period">/mês</span></div>
        <a href="#form" class="btn btn-primary btn-block">Começar grátis</a>
        <ul class="plan-features">
          <li><i class="fas fa-check"></i> Controle de caixa</li>
          <li><i class="fas fa-check"></i> Backup automático</li>
          <li><i class="fas fa-check"></i> Controle de estoque</li>
          <li><i class="fas fa-check"></i> Controle de ordem de serviço</li>
          <li><i class="fas fa-check"></i> Controle financeiro</li>
          <li><i class="fas fa-check"></i> Suporte online</li>
          <li><i class="fas fa-check"></i> Envio automático de emails</li>
          <li><i class="fas fa-check"></i> Treinamento online</li>
          <li><i class="fas fa-check"></i> <strong>10 Usuários</strong></li>
          <li><i class="fas fa-check"></i> Venda loja/balcão</li>
          <li><i class="fas fa-check"></i> Motorok (app para oficina e cliente)</li>
          <li><i class="fas fa-check"></i> Relatórios</li>
          <li><i class="fas fa-check"></i> Remanufatura (exclusivo)</li>
          <li><i class="fas fa-check"></i> Emissão de NF-e</li>
          <li><i class="fas fa-check"></i> Emissão de NFS-e</li>
          <li><i class="fas fa-check"></i> Emissão de NFC-e</li>
          <li><i class="fas fa-check"></i> <strong>WhatsApp Automatizado</strong></li>
          <li><i class="fas fa-check"></i> <strong>Manutenção preventiva</strong></li>
          <li><i class="fas fa-check"></i> <strong>Anexo de Imagens/Documentos</strong></li>
        </ul>
      </div>

    </div>
    <p class="pricing-note"><i class="fas fa-shield-alt"></i> Sem taxa de adesão &nbsp;|&nbsp; Cancele quando quiser &nbsp;|&nbsp; Suporte incluso</p>
  </div>
</section>

<!-- DEPOIMENTOS -->
<section class="testimonials">
  <div class="container">
    <div class="section-header">
      <h2>O que dizem nossos clientes</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial-card">
        <p>"O MotorHub transformou minha oficina. Antes eu perdia ordens, hoje tudo fica registrado. Recomendo muito!"</p>
        <div class="testimonial-author">
          <div class="author-avatar">MR</div>
          <div><strong>Marcos Rodrigues</strong><small>Oficina MR — São Paulo, SP</small></div>
        </div>
      </div>
      <div class="testimonial-card">
        <p>"O WhatsApp automático foi o que me convenceu. Os clientes adoram receber o status da OS pelo celular."</p>
        <div class="testimonial-author">
          <div class="author-avatar">JF</div>
          <div><strong>João Ferreira</strong><small>Auto Center JF — Curitiba, PR</small></div>
        </div>
      </div>
      <div class="testimonial-card">
        <p>"Controle financeiro nunca foi tão fácil. Hoje sei exatamente quanto entrou e saiu da minha oficina."</p>
        <div class="testimonial-author">
          <div class="author-avatar">AS</div>
          <div><strong>Ana Silva</strong><small>Silva Mecânica — Belo Horizonte, MG</small></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FORMULÁRIO -->
<section class="cta-form" id="form">
  <div class="container form-inner">
    <div class="form-text">
      <h2>Comece agora, grátis por 7 dias</h2>
      <p>Sem cartão de crédito. Sem complicação. Configure em minutos e comece a gestão da sua oficina hoje.</p>
      <ul class="form-benefits">
        <li><i class="fas fa-check-circle"></i> Acesso completo ao plano escolhido</li>
        <li><i class="fas fa-check-circle"></i> Suporte durante o trial</li>
        <li><i class="fas fa-check-circle"></i> Dados protegidos e na nuvem</li>
      </ul>
    </div>
    <div class="form-box" id="contato">
      <h3>Fale com um especialista</h3>
      <?php
        $success = false;
        $error = '';
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
          $name  = htmlspecialchars(trim($_POST['name'] ?? ''));
          $phone = htmlspecialchars(trim($_POST['phone'] ?? ''));
          $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
          $specialist = isset($_POST['specialist']);
          if (!$name || !$phone || !$email) {
            $error = 'Por favor, preencha todos os campos corretamente.';
          } else {
            $success = true;
          }
        }
      ?>
      <?php if ($success): ?>
        <div class="form-success">
          <i class="fas fa-check-circle"></i>
          <h4>Recebemos seu contato!</h4>
          <p>Nossa equipe vai entrar em contato em breve. Fique de olho no seu WhatsApp e e-mail.</p>
        </div>
      <?php else: ?>
        <?php if ($error): ?>
          <div class="form-error"><i class="fas fa-exclamation-circle"></i> <?= $error ?></div>
        <?php endif; ?>
        <form method="POST" action="#form">
          <div class="form-group">
            <label for="name">Nome completo</label>
            <input type="text" id="name" name="name" placeholder="Seu nome" value="<?= htmlspecialchars($_POST['name'] ?? '') ?>" required />
          </div>
          <div class="form-group">
            <label for="phone">WhatsApp / Telefone</label>
            <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000" value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>" required />
          </div>
          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" placeholder="seu@email.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required />
          </div>
          <div class="form-check">
            <input type="checkbox" id="specialist" name="specialist" checked />
            <label for="specialist">Quero falar com um especialista</label>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Quero testar grátis</button>
        </form>
      <?php endif; ?>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <a href="#" class="logo">Motor<span>Hub</span></a>
      <p>Sistema de gestão para oficinas mecânicas. Na nuvem, no celular, no seu controle.</p>
    </div>
    <div class="footer-links">
      <div>
        <strong>Produto</strong>
        <a href="#funcionalidades">Funcionalidades</a>
        <a href="#planos">Planos</a>
      </div>
      <div>
        <strong>Empresa</strong>
        <a href="#">Sobre nós</a>
        <a href="#contato">Contato</a>
      </div>
      <div>
        <strong>Legal</strong>
        <a href="#">Privacidade</a>
        <a href="#">Termos de uso</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© <?= date('Y') ?> MotorHub. Todos os direitos reservados.</p>
  </div>
</footer>

<script>
  const toggle = document.getElementById('menuToggle');
  const menu   = document.getElementById('mobileMenu');
  toggle.addEventListener('click', () => menu.classList.toggle('open'));

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); menu.classList.remove('open'); }
    });
  });
</script>

</body>
</html>

<?php
/**
 * Processa o lead do formulário da landing page.
 * Salva em CSV local + envia email de notificação.
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Método não permitido']));
}

$name       = htmlspecialchars(trim($_POST['name'] ?? ''));
$phone      = htmlspecialchars(trim($_POST['phone'] ?? ''));
$email      = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$specialist = isset($_POST['specialist']) ? 'Sim' : 'Não';

if (!$name || !$phone || !$email) {
    http_response_code(422);
    exit(json_encode(['error' => 'Campos obrigatórios não preenchidos']));
}

// Salva lead em CSV
$csv_file = __DIR__ . '/leads.csv';
$is_new   = !file_exists($csv_file);
$fh       = fopen($csv_file, 'a');
if ($is_new) {
    fputcsv($fh, ['Data', 'Nome', 'Telefone', 'Email', 'Quer especialista']);
}
fputcsv($fh, [date('d/m/Y H:i'), $name, $phone, $email, $specialist]);
fclose($fh);

// Envia notificação por email (configure o email abaixo)
$to      = 'seuemail@motohub.com.br';
$subject = "Novo lead: $name";
$message = "Nome: $name\nTelefone: $phone\nEmail: $email\nEspecialista: $specialist\nData: " . date('d/m/Y H:i');
$headers = "From: noreply@motorhub.com.br\r\nReply-To: $email";

mail($to, $subject, $message, $headers);

exit(json_encode(['success' => true]));

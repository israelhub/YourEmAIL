
import { MockEmail } from '../types';

export const MOCK_EMAILS: MockEmail[] = [
    {
        id: 1,
        sender: 'support@techcorp.com',
        subject: 'RE: Ticket #12345 - Status da sua solicitação',
        snippet: 'Prezado cliente, seu ticket foi atualizado. Gostaríamos de informar que nossa equipe técnica está investigando o problema...',
        body: 'Prezado cliente,\n\nSeu ticket #12345 foi atualizado. Gostaríamos de informar que nossa equipe técnica está investigando o problema de conectividade que você relatou. Esperamos ter uma solução dentro de 24 horas.\n\nAtenciosamente,\nEquipe de Suporte TechCorp'
    },
    {
        id: 2,
        sender: 'Ana Costa',
        subject: 'Feliz Natal e um próspero Ano Novo!',
        snippet: 'Olá equipe! Passando para desejar a todos um Feliz Natal e um excelente 2025! Que seja um ano de muitas conquistas para todos nós...',
        body: 'Olá equipe!\n\nPassando para desejar a todos um Feliz Natal e um excelente 2025! Que seja um ano de muitas conquistas para todos nós. Boas festas!\n\nAbraços,\nAna Costa'
    },
    {
        id: 3,
        sender: 'financeiro@comercial.com',
        subject: 'Fwd: Fatura 05/2024',
        snippet: 'Segue em anexo a fatura referente aos serviços prestados no mês de maio. Por favor, confirmar o recebimento.',
        body: 'Prezados,\n\nSegue em anexo a fatura #FAT5-2024 referente aos serviços prestados no mês de maio.\n\nPor favor, confirmar o recebimento.\n\nObrigado,\nDepartamento Financeiro'
    },
    {
        id: 4,
        sender: 'marketing@evento.com',
        subject: 'Obrigado por se inscrever no nosso webinar!',
        snippet: 'Olá! Agradecemos seu interesse no webinar "O Futuro da IA". O evento acontecerá amanhã às 15h. Não perca!',
        body: 'Olá!\n\nAgradecemos seu interesse no webinar "O Futuro da IA". O evento acontecerá amanhã às 15h. Não perca!\n\nAté lá,\nEquipe de Marketing'
    }
];
